import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// フロア座標上に人物を表すシンプルな人型マーカーを描画する。
// YOLOv8-Poseは単眼2Dのため関節ごとの正確な3D位置は再現できないので、
// ここでは「立位のカプセル型アバター」を検出したフロア座標に配置し、
// 転倒時は横倒しにする、という分かりやすい表現にしている。
export default function PersonFigure({ floor, fallen, colorState }) {
  const group = useRef();

  const color = colorState === 'danger' ? '#f43f5e' : colorState === 'warning' ? '#f59e0b' : '#67e8f9';

  useFrame(() => {
    if (!group.current || !floor) return;
    // 目標位置へ滑らかに追従(急なワープを避ける)
    const target = new THREE.Vector3(floor.x, 0, floor.z);
    group.current.position.lerp(target, 0.25);

    const targetRotX = fallen ? Math.PI / 2 : 0;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.25);
  });

  if (!floor) return null;

  return (
    <group ref={group} position={[floor.x, 0, floor.z]}>
      {/* 胴体 */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.55, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {/* 頭 */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={'#f8fafc'} roughness={0.5} />
      </mesh>
      {/* 足元のマーカーリング */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.28, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
