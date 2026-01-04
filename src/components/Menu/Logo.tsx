'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

export const Logo = ({ onClick, scale = 1, shouldSpin, spinDirection }: { 
  isExpanded?: boolean; 
  onClick: () => void; 
  scale?: number;
  shouldSpin?: number;
  spinDirection?: 'open' | 'close';
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/Menu/Logo_MenuBtn.glb');
  const isSpinning = useRef(false);
  const lastSpin = useRef(0);
  const baseRotationY = useRef(0);
  const currentScale = useRef(scale);
  const initialMount = useRef(true);
  
  // Calculate bounding box of the model for hitbox
  const boundingBox = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return { size, center };
  }, [scene]);
  
  // Mouse tracking with global mouse coordinates
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate scale changes (skip animation on initial mount)
  useEffect(() => {
    if (groupRef.current) {
      if (initialMount.current) {
        // Set initial scale immediately without animation
        groupRef.current.scale.set(scale, scale, scale);
        currentScale.current = scale;
        initialMount.current = false;
      } else if (currentScale.current !== scale) {
        gsap.to(groupRef.current.scale, {
          x: scale,
          y: scale,
          z: scale,
          duration: 0.4,
          ease: 'power2.out'
        });
        currentScale.current = scale;
      }
    }
  }, [scale]);

  useFrame(() => {
    if (!groupRef.current || isSpinning.current) return;
    
    const { x, y } = mouse.current;
    // Max tilt 35 degrees = 0.611 radians
    const maxTilt = 0.611;
    const targetRotationX = -y * maxTilt;
    const targetRotationY = baseRotationY.current + x * maxTilt;
    
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.1);
  });

  // Spin when shouldSpin prop changes
  useEffect(() => {
    if (shouldSpin && shouldSpin !== lastSpin.current && groupRef.current && !isSpinning.current) {
      lastSpin.current = shouldSpin;
      isSpinning.current = true;
      const direction = spinDirection === 'close' ? -1 : 1;
      const targetRotation = baseRotationY.current + (Math.PI * 2 * direction);
      
      gsap.to(groupRef.current.rotation, {
        y: targetRotation,
        duration: 0.5,
        ease: 'back.out(1.2)',
        onComplete: () => {
          baseRotationY.current = targetRotation;
          isSpinning.current = false;
        }
      });
    }
  }, [shouldSpin, spinDirection]);

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={1}
      />
      {/* Invisible hitbox matching the model's bounding box */}
      <mesh
        position={[boundingBox.center.x, boundingBox.center.y, boundingBox.center.z]}
        onClick={onClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[boundingBox.size.x, boundingBox.size.y, boundingBox.size.z]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};




