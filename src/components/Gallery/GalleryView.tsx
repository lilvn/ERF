'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Third person camera controller
const ThirdPersonController = () => {
  const { camera, gl } = useThree();
  const characterRef = useRef<THREE.Group>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  
  // Camera orbit state
  const orbitRef = useRef({
    theta: 0, // Horizontal rotation
    phi: Math.PI / 6, // Vertical angle (looking down slightly)
    distance: 5, // Distance from character
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });

  // Handle mouse events for camera rotation
  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (e: MouseEvent) => {
      orbitRef.current.isDragging = true;
      orbitRef.current.lastMouseX = e.clientX;
      orbitRef.current.lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      orbitRef.current.isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!orbitRef.current.isDragging) return;

      const deltaX = e.clientX - orbitRef.current.lastMouseX;
      const deltaY = e.clientY - orbitRef.current.lastMouseY;

      orbitRef.current.theta -= deltaX * 0.005;
      orbitRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, orbitRef.current.phi + deltaY * 0.005));

      orbitRef.current.lastMouseX = e.clientX;
      orbitRef.current.lastMouseY = e.clientY;
    };

    const onWheel = (e: WheelEvent) => {
      orbitRef.current.distance = Math.max(2, Math.min(15, orbitRef.current.distance + e.deltaY * 0.01));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!characterRef.current) return;

    const keys = keysRef.current;
    const orbit = orbitRef.current;
    const speed = 0.08;

    // Calculate movement direction based on camera angle
    const forward = new THREE.Vector3(
      -Math.sin(orbit.theta),
      0,
      -Math.cos(orbit.theta)
    );
    const right = new THREE.Vector3(
      Math.cos(orbit.theta),
      0,
      -Math.sin(orbit.theta)
    );

    // Move character relative to camera facing direction
    if (keys['w']) {
      characterRef.current.position.add(forward.clone().multiplyScalar(speed));
    }
    if (keys['s']) {
      characterRef.current.position.add(forward.clone().multiplyScalar(-speed));
    }
    if (keys['a']) {
      characterRef.current.position.add(right.clone().multiplyScalar(-speed));
    }
    if (keys['d']) {
      characterRef.current.position.add(right.clone().multiplyScalar(speed));
    }

    // Rotate character to face movement direction
    if (keys['w'] || keys['s'] || keys['a'] || keys['d']) {
      characterRef.current.rotation.y = orbit.theta + Math.PI;
    }

    // Update camera position to follow character
    const characterPos = characterRef.current.position;
    const cameraOffset = new THREE.Vector3(
      Math.sin(orbit.theta) * Math.cos(orbit.phi) * orbit.distance,
      Math.sin(orbit.phi) * orbit.distance,
      Math.cos(orbit.theta) * Math.cos(orbit.phi) * orbit.distance
    );

    camera.position.copy(characterPos).add(cameraOffset);
    camera.lookAt(characterPos.x, characterPos.y + 1, characterPos.z);
  });

  // Spawn position inside the gallery room (adjusted for 5x scale)
  // Moved forward (-Z) and left (-X) to be inside the room
  return (
    <group ref={characterRef} position={[-48, 0, -38]}>
      {/* Placeholder Character: A simple capsule */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Head indicator for facing direction */}
      <mesh position={[0, 0.9, -0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
};

const GalleryModel = ({ modelPath }: { modelPath: string }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={5} />;
};

export const GalleryView = ({ modelPath }: { modelPath: string }) => {
  return (
    <div className="w-full h-screen bg-white">
      <Canvas shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} castShadow />
          <GalleryModel modelPath={modelPath} />
          <ThirdPersonController />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-10 left-10 text-black bg-white/80 p-4 rounded">
        <p className="font-bold mb-2">Controls:</p>
        <p>WASD - Move character</p>
        <p>Click + Drag - Rotate camera</p>
        <p>Scroll - Zoom in/out</p>
      </div>
    </div>
  );
};

