import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlitchCoreProps {
  isGlitching: boolean;
  intensity: number;
  memoryLevel?: number; // 0, 1, 2
}

export const GlitchCore: React.FC<GlitchCoreProps> = ({ isGlitching, intensity, memoryLevel = 0 }) => {
  const mesh = useRef<THREE.Points>(null!);
  
  // Audio Analyzer Setup
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);

  useEffect(() => {
    // Initialize Audio
    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.current.createMediaStreamSource(stream);
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 64;
        source.connect(analyser.current);
        dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);
      } catch (err) {
        console.warn("Microphone access denied", err);
      }
    };
    setupAudio();
    return () => {
        audioContext.current?.close();
    }
  }, []);

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
      // Get Audio Data
      let audioLevel = 0;
      if (analyser.current && dataArray.current) {
        analyser.current.getByteFrequencyData(dataArray.current);
        audioLevel = dataArray.current.reduce((a, b) => a + b, 0) / dataArray.current.length;
        audioLevel = audioLevel / 128; // Normalize 0-2 (approx)
      }

      // Base rotation + Audio reaction
      const baseSpeed = memoryLevel === 0 ? 0.1 : memoryLevel === 1 ? 0.3 : 0.8;
      mesh.current.rotation.x += delta * (baseSpeed + audioLevel * 0.5);
      mesh.current.rotation.y += delta * ((baseSpeed * 1.5) + audioLevel * 0.5);

      const positionsAttribute = mesh.current.geometry.attributes.position;
      
      // Animate particles
      for (let i = 0; i < count; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          if (isGlitching || audioLevel > 0.5) { // Glitch OR Loud noise triggers scatter
              const scatter = isGlitching ? intensity : audioLevel * 2;
              // Scatter randomly
              positionsAttribute.setX(i, originalPositions[ix] + (Math.random() - 0.5) * scatter);
              positionsAttribute.setY(i, originalPositions[iy] + (Math.random() - 0.5) * scatter);
              positionsAttribute.setZ(i, originalPositions[iz] + (Math.random() - 0.5) * scatter);
          } else {
              // Smoothly return to sphere shape (with memory level shape distortion)
              const noise = memoryLevel * 0.2; // Higher level = more unstable shape
              const targetX = originalPositions[ix] + (Math.random() - 0.5) * noise;
              const targetY = originalPositions[iy] + (Math.random() - 0.5) * noise;
              const targetZ = originalPositions[iz] + (Math.random() - 0.5) * noise;

              const currentX = positionsAttribute.getX(i);
              const currentY = positionsAttribute.getY(i);
              const currentZ = positionsAttribute.getZ(i);

              positionsAttribute.setX(i, THREE.MathUtils.lerp(currentX, targetX, 0.1));
              positionsAttribute.setY(i, THREE.MathUtils.lerp(currentY, targetY, 0.1));
              positionsAttribute.setZ(i, THREE.MathUtils.lerp(currentZ, targetZ, 0.1));
          }
      }
      positionsAttribute.needsUpdate = true;
    }
  });

  // Color Evolution
  const baseColor = memoryLevel === 0 ? "#05d9e8" : memoryLevel === 1 ? "#bd00ff" : "#ff0000";
  const activeColor = isGlitching ? "#ffffff" : baseColor;

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
        size={memoryLevel === 2 ? 0.05 : 0.03} // Bigger particles at max level
        color={activeColor}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
