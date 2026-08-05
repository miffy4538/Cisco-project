import React from 'react';
import { Edges } from '@react-three/drei';
import { ROOM_SIZE } from '../config';

// Polycamの実スキャンモデルがまだ配置されていない時に表示する簡易的な部屋。
// 動画のダミー版と同じく「箱の集合」で部屋の雰囲気を再現する。
export default function PlaceholderRoom() {
  const { width: w, depth: d, height: h } = ROOM_SIZE;

  return (
    <group>
      {/* 床 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={'#c9bfa8'} roughness={0.9} />
      </mesh>

      {/* 半透明の部屋の枠(壁の代わり) + 輪郭線 */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={'#1f2937'} transparent opacity={0.08} side={2} />
        <Edges color={'#334155'} />
      </mesh>

      {/* 家具っぽい箱をいくつか配置(ダミー) */}
      <Furniture position={[-w * 0.28, 0.35, -d * 0.22]} size={[0.9, 0.7, 0.55]} color={'#c9a876'} />
      <Furniture position={[w * 0.3, 0.55, -d * 0.05]} size={[0.5, 1.1, 0.5]} color={'#a87f4f'} />
      <Furniture position={[0.15, 0.25, d * 0.28]} size={[0.7, 0.5, 0.45]} color={'#8b6b47'} />
      <Furniture position={[-w * 0.32, 0.2, d * 0.3]} size={[1.1, 0.4, 0.7]} color={'#6b83a3'} />
    </group>
  );
}

function Furniture({ position, size, color }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}
