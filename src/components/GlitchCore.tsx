import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlitchCoreProps {
  isGlitching: boolean;
  intensity: number;
}

export const GlitchCore: React.FC<GlitchCoreProps> = ({ isGlitching, intensity }) => {
  const mesh = useRef<THREE.Points>(null!);
  
  const count = 10000; // Particle count
  const { positions, originalPositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random point on sphere surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 2.5; // Radius
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return { positions: pos, originalPositions: pos.slice() };
  }, []);

  useFrame((state, delta) => {
    if (mesh.current) {
      // Rotate the core
      mesh.current.rotation.x += delta * 0.1;
      mesh.current.rotation.y += delta * 0.15;

      const positionsAttribute = mesh.current.geometry.attributes.position;
      
      // Animate particles
      for (let i = 0; i < count; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          if (isGlitching) {
              // Scatter randomly
              positionsAttribute.setX(i, originalPositions[ix] + (Math.random() - 0.5) * intensity);
              positionsAttribute.setY(i, originalPositions[iy] + (Math.random() - 0.5) * intensity);
              positionsAttribute.setZ(i, originalPositions[iz] + (Math.random() - 0.5) * intensity);
          } else {
              // Smoothly return to sphere shape
              const currentX = positionsAttribute.getX(i);
              const currentY = positionsAttribute.getY(i);
              const currentZ = positionsAttribute.getZ(i);

              positionsAttribute.setX(i, THREE.MathUtils.lerp(currentX, originalPositions[ix], 0.1));
              positionsAttribute.setY(i, THREE.MathUtils.lerp(currentY, originalPositions[iy], 0.1));
              positionsAttribute.setZ(i, THREE.MathUtils.lerp(currentZ, originalPositions[iz], 0.1));
          }
      }
      positionsAttribute.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={isGlitching ? "#ff2a6d" : "#05d9e8"} // Cyberpunk colors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
