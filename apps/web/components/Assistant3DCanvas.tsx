'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Assistant3DCanvasProps {
  audioTrack?: MediaStreamTrack;
  agentState: 'idle' | 'listening' | 'thinking' | 'speaking';
}

const colors = {
  idle: '#708090',      // slate
  listening: '#50C878', // emerald
  thinking: '#FFBF00',  // amber
  speaking: '#00FFFF'   // cyan
};

function AssistantMesh({ audioTrack, agentState }: Assistant3DCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const [targetColor, setTargetColor] = useState(new THREE.Color(colors[agentState]));

  useEffect(() => {
    setTargetColor(new THREE.Color(colors[agentState]));
  }, [agentState]);

  useEffect(() => {
    if (!audioTrack) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const stream = new MediaStream([audioTrack]);
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    
    analyser.fftSize = 256;
    source.connect(analyser);
    
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    return () => {
      source.disconnect();
      audioCtx.close();
    };
  }, [audioTrack]);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // Smooth color interpolation
    materialRef.current.color.lerp(targetColor, 0.1);

    let audioLevel = 0;
    if (analyserRef.current && dataArrayRef.current && agentState === 'speaking') {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
      const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
      audioLevel = sum / dataArrayRef.current.length / 255.0; // Normalized 0-1
    }

    // Interpolate scale and distortion based on audio level
    const targetScale = 1 + audioLevel * 0.5;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    const targetDistort = 0.2 + audioLevel * 0.6;
    materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.1);
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        ref={materialRef}
        color={colors.idle}
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0}
        metalness={0.1}
        roughness={0.5}
        speed={2}
      />
    </Sphere>
  );
}

export default function Assistant3DCanvas(props: Assistant3DCanvasProps) {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AssistantMesh {...props} />
      </Canvas>
    </div>
  );
}
