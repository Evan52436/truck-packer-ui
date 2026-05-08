import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';

// 1. THE TRUCK CONTAINER COMPONENT
function TruckContainer() {
  return (
<<<<<<< HEAD
=======
    // The truck is 6 wide, 4 high, 8 deep. We move it up by 2 (half its height) 
    // so it sits on the floor rather than sinking into it.
>>>>>>> upstream/master
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
<<<<<<< HEAD
      <Edges color="black" />
=======
      <Edges color="black" /> 
>>>>>>> upstream/master
    </mesh>
  );
}

<<<<<<< HEAD
// 3. MAIN APP
=======
// 3. MAIN APP LAYOUT
>>>>>>> upstream/master
export default function App() {
  const [boxes, setBoxes] = useState([]);
  const [smallCount, setSmallCount] = useState(12);
  const [largeCount, setLargeCount] = useState(4);
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(false);

  // NEW: state to store the stats returned by the API
  const [stats, setStats] = useState(null);

  const handleSimulate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
=======
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
>>>>>>> upstream/master
        body: JSON.stringify({ small: smallCount, large: largeCount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

<<<<<<< HEAD
      // FIX: API now returns an object { boxes, utilization, packed_count, unplaced_count }
      // Old code did: const packedBoxes = await response.json()  ← this broke silently
      const result = await response.json();
      const packedBoxes = result.boxes;

      // Save stats so we can show them in the sidebar
      setStats({
        utilization: result.utilization,
        packed: result.packed_count,
        unplaced: result.unplaced_count,
      });

      // Offset coordinates so Three.js renders from the corner and centers in the truck
=======
      const packedBoxes = await response.json();
      
      // THE MATH GOTCHA FIX:
      // Offset the coordinates by half the box's size so Three.js renders from the corner.
      // We also center the whole pack job inside the truck (shifting X by -3 and Z by -4)
>>>>>>> upstream/master
      const correctedBoxes = packedBoxes.map((box) => ({
        ...box,
        x: box.x + (box.width / 2) - 3,
        y: box.y + (box.height / 2),
<<<<<<< HEAD
        z: box.z + (box.depth / 2) - 4,
=======
        z: box.z + (box.depth / 2) - 4
>>>>>>> upstream/master
      }));

      setBoxes(correctedBoxes);
    } catch (error) {
      console.error("Could not reach the backend:", error);
<<<<<<< HEAD
      alert("Failed to connect to backend. Is Flask running on port 5000?");
=======
      alert("Failed to connect to backend. Check Vercel logs if deployed.");
>>>>>>> upstream/master
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setBoxes([]);
<<<<<<< HEAD
    setStats(null);
=======
>>>>>>> upstream/master
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'sans-serif' }}>
<<<<<<< HEAD

      {/* LEFT SIDEBAR */}
      <div style={{ width: '300px', padding: '20px', backgroundColor: '#f4f4f4', borderRight: '1px solid #ccc' }}>
        <h2>🚛 Truck Packer</h2>
        <p>Enter boxes to pack:</p>

        <div style={{ marginBottom: '10px' }}>
          <label>Small Boxes (1×1×1): </label>
          <input
            type="number"
            value={smallCount}
            onChange={(e) => setSmallCount(Number(e.target.value))}
            style={{ width: '50px', marginLeft: '8px' }}
=======
      
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
>>>>>>> upstream/master
            min="0"
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
<<<<<<< HEAD
          <label>Large Boxes (2×2×2): </label>
          <input
            type="number"
            value={largeCount}
            onChange={(e) => setLargeCount(Number(e.target.value))}
            style={{ width: '50px', marginLeft: '8px' }}
=======
          <label>Large Boxes: </label>
          <input 
            type="number" 
            value={largeCount} 
            onChange={(e) => setLargeCount(Number(e.target.value))}
            style={{ width: '50px' }} 
>>>>>>> upstream/master
            min="0"
          />
        </div>

<<<<<<< HEAD
        <button
          onClick={handleSimulate}
          disabled={isLoading}
          style={{
            padding: '10px',
            background: isLoading ? '#666' : '#000',
            color: '#fff',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '100%',
            marginTop: '20px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '15px',
          }}>
          {isLoading ? 'Calculating...' : 'Simulate Packing'}
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: '10px',
            background: '#ccc',
            color: '#000',
            cursor: 'pointer',
            width: '100%',
            marginTop: '10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '15px',
          }}>
          Clear Truck
        </button>

        {/* STATS PANEL — only shows after a simulation */}
        {stats && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ margin: '0 0 12px' }}>📊 Results</h3>
            <div style={{ marginBottom: '8px' }}>
              <strong>Space Utilization</strong>
              <div style={{
                background: '#e0e0e0',
                borderRadius: '4px',
                height: '20px',
                marginTop: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${stats.utilization}%`,
                  background: stats.utilization > 75 ? '#22c55e' : stats.utilization > 40 ? '#f59e0b' : '#ef4444',
                  height: '100%',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.utilization}%</span>
            </div>
            <p style={{ margin: '4px 0' }}>✅ Packed: <strong>{stats.packed}</strong> boxes</p>
            <p style={{ margin: '4px 0' }}>❌ Unplaced: <strong>{stats.unplaced}</strong> boxes</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: 3D CANVAS */}
=======
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
>>>>>>> upstream/master
      <div style={{ flex: 1, backgroundColor: '#e9ecef' }}>
        <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls />
<<<<<<< HEAD
          <TruckContainer />
          {boxes.map((box) => (
            <PackedBox key={box.id} data={box} />
          ))}
=======
          
          <TruckContainer />

          {boxes.map((box) => (
             <PackedBox key={box.id} data={box} />
          ))}

>>>>>>> upstream/master
          <gridHelper args={[20, 20]} />
        </Canvas>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> upstream/master
