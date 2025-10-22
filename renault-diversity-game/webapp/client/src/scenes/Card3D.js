import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

const SUIT_COLORS = {
  hearts: '#E74C3C',
  diamonds: '#E67E22',
  clubs: '#2C3E50',
  spades: '#34495E'
};

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

function Card3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  card,
  faceUp = false,
  onClick,
  isSelectable = false,
  isSelected = false,
  scale = 1
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      if (isSelected) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.3;
      }
      // Hover effect
      if (hovered && isSelectable) {
        meshRef.current.scale.setScalar(scale * 1.1);
      } else {
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick && isSelectable) {
      onClick();
    }
  };

  const cardValue = card ? (card.value === 1 ? 'A' :
                           card.value === 11 ? 'J' :
                           card.value === 12 ? 'Q' :
                           card.value === 13 ? 'K' :
                           card.value.toString()) : '';
  const suitSymbol = card ? SUIT_SYMBOLS[card.suit] : '';
  const suitColor = card ? SUIT_COLORS[card.suit] : '#FFFFFF';

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => isSelectable && setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card Body */}
      <RoundedBox
        args={[0.8, 0.05, 1.2]}
        radius={0.05}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={faceUp ? '#FFFFFF' : '#1a1a1a'}
          roughness={0.3}
          metalness={0.1}
          emissive={isSelected ? '#FFCC00' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </RoundedBox>

      {/* Card Face (if face up) */}
      {faceUp && card && (
        <>
          {/* Main Value - Larger and more prominent with outline */}
          <Text
            position={[0, 0.03, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            font="https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.woff"
            fontSize={0.5}
            color={suitColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {cardValue}
          </Text>

          {/* Suit Symbol - Larger with outline */}
          <Text
            position={[0, 0.03, -0.3]}
            rotation={[-Math.PI / 2, 0, 0]}
            font="https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.woff"
            fontSize={0.35}
            color={suitColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#000000"
          >
            {suitSymbol}
          </Text>

          {/* Corner Values - Enhanced visibility */}
          <Text
            position={[-0.3, 0.03, -0.5]}
            rotation={[-Math.PI / 2, 0, 0]}
            font="https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.woff"
            fontSize={0.15}
            color={suitColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {cardValue}
          </Text>

          <Text
            position={[-0.3, 0.03, -0.35]}
            rotation={[-Math.PI / 2, 0, 0]}
            font="https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.woff"
            fontSize={0.12}
            color={suitColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            {suitSymbol}
          </Text>

          {/* Border accent */}
          <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.76, 1.16]} />
            <meshBasicMaterial
              color={suitColor}
              transparent
              opacity={0.1}
            />
          </mesh>
        </>
      )}

      {/* Card Back (if face down) */}
      {!faceUp && (
        <>
          {/* Renault pattern on back */}
          <Text
              position={[0, 0.03, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
           
            font="https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.woff" fontSize={0.3}
            color="#FFCC00"
            anchorX="center"
            anchorY="middle"
          >
            RENAULT
          </Text>

          <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.7, 1.1]} />
            <meshBasicMaterial
              color="#FFCC00"
              transparent
              opacity={0.2}
            />
          </mesh>
        </>
      )}

      {/* Glow effect when selected */}
      {isSelected && (
        <pointLight
          position={[0, 0.5, 0]}
          intensity={1}
          distance={3}
          color="#FFCC00"
        />
      )}
    </group>
  );
}

export default Card3D;
