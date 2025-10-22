import React from 'react';
import { Circle } from '@react-three/drei';

function GameTable() {
  return (
    <group>
      {/* Main table surface */}
      <Circle
        args={[5, 64]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#1a472a"
          roughness={0.8}
          metalness={0.1}
        />
      </Circle>

      {/* Table border - Renault yellow */}
      <Circle
        args={[5.2, 64]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
      >
        <meshStandardMaterial
          color="#FFCC00"
          roughness={0.5}
          metalness={0.3}
        />
      </Circle>

      {/* Center circle marker */}
      <Circle
        args={[2.5, 64]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <meshStandardMaterial
          color="#0f2f1a"
          transparent
          opacity={0.3}
          roughness={0.8}
        />
      </Circle>

      {/* Subtle grid pattern */}
      <gridHelper
        args={[10, 20, '#FFCC00', '#2a2a2a']}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}

export default GameTable;
