import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';

function TruckContainer() {
  return (
    <mesh position={[0, 2, 0]}>
      <boxGeometry args={[6, 4, 8]} />
      <meshBasicMaterial transparent opacity={0.1} color="white" />
      <Edges color="black" />
    </mesh>
  );
}

function PackedBox({ data }) {
  return (
    <mesh position={[data.x, data.y, data.z]}>
      <boxGeometry args={[data.width, data.height, data.depth]} />
      <meshStandardMaterial color={data.color} />
      <Edges color="black" />
    </mesh>
  );
}

const createBoxType = (id, length = 1, width = 1, height = 1, quantity = 1) => ({
  id,
  length,
  width,
  height,
  quantity,
});

export default function App() {
  const [boxes, setBoxes] = useState([]);
  const [boxTypes, setBoxTypes] = useState([
    createBoxType(1, 1, 1, 1, 12),
    createBoxType(2, 2, 2, 2, 4),
    createBoxType(3, 1.5, 1.5, 1.5, 8),
  ]);
  const [nextBoxId, setNextBoxId] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const updateBoxType = (id, key, rawValue) => {
    const value = Number(rawValue);
    setBoxTypes((current) =>
      current.map((boxType) => {
        if (boxType.id !== id) {
          return boxType;
        }
        return {
          ...boxType,
          [key]: Number.isFinite(value) ? value : 0,
        };
      }),
    );
  };

  const handleAddBoxType = () => {
    setBoxTypes((current) => [...current, createBoxType(nextBoxId)]);
    setNextBoxId((current) => current + 1);
  };

  const handleRemoveBoxType = (id) => {
    setBoxTypes((current) => current.filter((boxType) => boxType.id !== id));
  };

  const handleSimulate = async () => {
    setIsLoading(true);

    try {
      const payloadBoxTypes = boxTypes
        .map((boxType) => ({
          p: Math.max(0, Number(boxType.length) || 0),
          l: Math.max(0, Number(boxType.width) || 0),
          t: Math.max(0, Number(boxType.height) || 0),
          quantity: Math.max(0, Math.floor(Number(boxType.quantity) || 0)),
        }))
        .filter((boxType) => boxType.p > 0 && boxType.l > 0 && boxType.t > 0 && boxType.quantity > 0);

      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ box_types: payloadBoxTypes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const packedBoxes = Array.isArray(result) ? result : (result.boxes || []);
      const truckVolume = 6 * 4 * 8;
      const packedVolume = packedBoxes.reduce(
        (total, box) => total + (Number(box.width) || 0) * (Number(box.height) || 0) * (Number(box.depth) || 0),
        0,
      );
      const utilizationFallback = truckVolume > 0 ? Number(((packedVolume / truckVolume) * 100).toFixed(1)) : 0;

      setStats({
        utilization: typeof result.utilization === 'number' ? result.utilization : utilizationFallback,
        packed: typeof result.packed_count === 'number' ? result.packed_count : packedBoxes.length,
        unplaced: typeof result.unplaced_count === 'number' ? result.unplaced_count : 0,
      });

      const correctedBoxes = packedBoxes.map((box) => ({
        ...box,
        x: box.x + (box.width / 2) - 3,
        y: box.y + (box.height / 2),
        z: box.z + (box.depth / 2) - 4,
      }));

      setBoxes(correctedBoxes);
    } catch (error) {
      console.error("Could not reach the backend:", error);
      alert("Failed to connect to backend. Is Flask running on port 5000?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setBoxes([]);
    setStats(null);
  };

  const inputStyle = {
    width: '100%',
    marginTop: '4px',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    boxSizing: 'border-box',
    background: '#fff',
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '300px', padding: '20px', backgroundColor: '#f4f4f4', borderRight: '1px solid #ccc' }}>
        <h2>Truck Packer</h2>
        <p style={{ marginTop: '6px', marginBottom: '14px', color: '#4b5563', fontSize: '14px' }}>
          Enter custom box dimensions and quantity.
        </p>

        {boxTypes.map((boxType, index) => (
          <div
            key={boxType.id}
            style={{
              marginBottom: '12px',
              background: '#fff',
              border: '1px solid #dbe0e6',
              borderRadius: '10px',
              padding: '12px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 600, fontSize: '14px' }}>
              <span>Type {index + 1}</span>
              {boxTypes.length > 1 && (
                <button
                  onClick={() => handleRemoveBoxType(boxType.id)}
                  style={{
                    border: 'none',
                    background: '#fee2e2',
                    color: '#991b1b',
                    cursor: 'pointer',
                    fontSize: '11px',
                    borderRadius: '999px',
                    padding: '3px 8px',
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                P
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={boxType.length}
                  onChange={(e) => updateBoxType(boxType.id, 'length', e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                L
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={boxType.width}
                  onChange={(e) => updateBoxType(boxType.id, 'width', e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                T
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={boxType.height}
                  onChange={(e) => updateBoxType(boxType.id, 'height', e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                Quantity
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={boxType.quantity}
                  onChange={(e) => updateBoxType(boxType.id, 'quantity', e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddBoxType}
          style={{
            padding: '8px',
            background: '#e2e8f0',
            color: '#111827',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
          }}
        >
          Add Box Type
        </button>

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

        {stats && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ margin: '0 0 12px' }}>Results</h3>
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
