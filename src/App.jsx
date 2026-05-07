import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';

// 1. THE TRUCK CONTAINER COMPONENT
function TruckContainer() {
  return (
    // The truck is 6 wide, 4 high, 8 deep. We move it up by 2 (half its height) 
    // so it sits on the floor rather than sinking into it.
    <mesh position={[0, 2, 0]}>
      <boxGeometry args={[6, 4, 8]} />
      <meshBasicMaterial transparent opacity={0.1} color="white" />
      <Edges color="black" />
    </mesh>
  );
}

// 2. THE PACKED BOX COMPONENT
function PackedBox({ data }) {
  return (
    <mesh position={[data.x, data.y, data.z]}>
      <boxGeometry args={[data.width, data.height, data.depth]} />
      <meshStandardMaterial color={data.color} />
      <Edges color="black" /> 
    </mesh>
  );
}

// 3. MAIN APP LAYOUT
export default function App() {
  const [boxes, setBoxes] = useState([]);
  const [smallCount, setSmallCount] = useState(12);
  const [largeCount, setLargeCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false); // Helps with Vercel cold-starts

  // Call the Vercel Serverless API
  const handleSimulate = async () => {
    setIsLoading(true);
    
    try {
      // Notice the URL! It now points to the relative /api/ route for Vercel
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ small: smallCount, large: largeCount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const packedBoxes = await response.json();
      
      // THE MATH GOTCHA FIX:
      // Offset the coordinates by half the box's size so Three.js renders from the corner.
      // We also center the whole pack job inside the truck (shifting X by -3 and Z by -4)
      const correctedBoxes = packedBoxes.map((box) => ({
        ...box,
        x: box.x + (box.width / 2) - 3,
        y: box.y + (box.height / 2),
        z: box.z + (box.depth / 2) - 4
      }));

      setBoxes(correctedBoxes);
    } catch (error) {
      console.error("Could not reach the backend:", error);
      alert("Failed to connect to backend. Check Vercel logs if deployed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setBoxes([]);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* LEFT SIDEBAR: THE FORM */}
      <div style={{ width: '300px', padding: '20px', backgroundColor: '#f4f4f4', borderRight: '1px solid #ccc' }}>
        <h2>Truck Packer</h2>
        <p>Enter boxes to pack:</p>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Small Boxes: </label>
          <input 
            type="number" 
            value={smallCount} 
            onChange={(e) => setSmallCount(Number(e.target.value))}
            style={{ width: '50px' }} 
            min="0"
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Large Boxes: </label>
          <input 
            type="number" 
            value={largeCount} 
            onChange={(e) => setLargeCount(Number(e.target.value))}
            style={{ width: '50px' }} 
            min="0"
          />
        </div>

        <button 
          onClick={handleSimulate} 
          disabled={isLoading}
          style={{ 
            padding: '10px', 
            background: isLoading ? '#666' : '#000', 
            color: '#fff', 
            cursor: isLoading ? 'not-allowed' : 'pointer', 
            width: '100%', 
            marginTop: '20px' 
          }}>
          {isLoading ? 'Calculating...' : 'Simulate Packing'}
        </button>
        <button 
          onClick={handleClear} 
          style={{ padding: '10px', background: '#ccc', color: '#000', cursor: 'pointer', width: '100%', marginTop: '10px' }}>
          Clear Truck
        </button>
      </div>

      {/* RIGHT SIDE: THE 3D CANVAS */}
      <div style={{ flex: 1, backgroundColor: '#e9ecef' }}>
        <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls />
          
          <TruckContainer />

          {boxes.map((box) => (
             <PackedBox key={box.id} data={box} />
          ))}

          <gridHelper args={[20, 20]} />
        </Canvas>
      </div>
    </div>
  );
}