// src/WeatherIcon3D.js
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

function Rain() {
  const drops = Array.from({ length: 100 }).map((_, i) => ({
    position: [(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 2],
    speed: Math.random() * 0.1 + 0.05,
  }));

  const ref = useRef();
  useFrame(() => {
    ref.current.children.forEach((drop, i) => {
      drop.position.y -= drops[i].speed;
      if (drop.position.y < -2.5) {
        drop.position.y = 2.5;
      }
    });
  });

  return (
    <group ref={ref}>
      {drops.map((d, i) => (
        <mesh key={i} position={d.position}>
          <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} />
          <meshBasicMaterial color="#5e72e4" />
        </mesh>
      ))}
    </group>
  );
}

function Cloud() {
    const group = useRef();
    useFrame(({ clock }) => {
        group.current.rotation.y = clock.getElapsedTime() * 0.1;
    });
    return (
        <group ref={group}>
            <mesh position={[-0.5, 0, 0]}><sphereGeometry args={[0.8, 32, 32]} /><meshStandardMaterial color="#cccccc" transparent opacity={0.8} /></mesh>
            <mesh position={[0.5, 0.2, -0.2]}><sphereGeometry args={[0.6, 32, 32]} /><meshStandardMaterial color="#f0f0f0" transparent opacity={0.9} /></mesh>
            <mesh position={[0.2, -0.3, 0.3]}><sphereGeometry args={[0.7, 32, 32]} /><meshStandardMaterial color="#e0e0e0" transparent opacity={0.85} /></mesh>
        </group>
    );
}

function Sun() {
    const ref = useRef();
    useFrame(({ clock }) => {
        ref.current.rotation.y = clock.getElapsedTime() * 0.2;
    });
    return (
        <group ref={ref}>
            <mesh>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#ffdd00" />
            </mesh>
            <Sparkles count={50} scale={2.5} size={6} speed={0.4} color="#ffd700" />
        </group>
    );
}

function WeatherIcon3D({ type }) {
  let weatherComponent;
  switch (type) {
    case 'sunny':
      weatherComponent = <Sun />;
      break;
    case 'rainy':
      weatherComponent = <><Cloud /><Rain /></>;
      break;
    default: // Average/Cloudy day
      weatherComponent = <Cloud />;
      break;
  }

  return (
    <div className="weather-icon-3d-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        {weatherComponent}
      </Canvas>
    </div>
  );
}

export default WeatherIcon3D;