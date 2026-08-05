import React from 'react';
import { Html } from '@react-three/drei';
import { CAMERA_MOUNT, CAMERA_FACING_AXIS, CAMERA_LABEL } from '../config';

// 実際に取り付けている見守りカメラの位置(壁・地上から約1m・部屋の短辺中央)を
// 3Dシーン上にも小さなマーカーとして表示する。「俯瞰3D」でひと目で
// カメラの設置場所と向きが分かるようにするための表示用オブジェクトで、
// 検出ロジックには影響しない。
export default function CameraMount() {
  const { x, y, z } = CAMERA_MOUNT;

  // グループのローカル+Z軸が実際にカメラの見ている方向(部屋の奥)を
  // 向くように、Y軸まわりの回転角を求める。
  let rotationY = 0;
  if (CAMERA_FACING_AXIS === 'x') {
    const forwardSign = CAMERA_MOUNT.x <= 0 ? 1 : -1;
    rotationY = forwardSign > 0 ? Math.PI / 2 : -Math.PI / 2;
  } else {
    const forwardSign = CAMERA_MOUNT.z <= 0 ? 1 : -1;
    rotationY = forwardSign > 0 ? 0 : Math.PI;
  }

  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      {/* カメラ筐体(壁から突き出た小さな箱) */}
      <mesh castShadow>
        <boxGeometry args={[0.16, 0.11, 0.16]} />
        <meshStandardMaterial color={'#1e293b'} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* レンズ(正面＝見ている方向を示す発光する点) */}
      <mesh position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color={'#22d3ee'} emissive={'#22d3ee'} emissiveIntensity={0.9} />
      </mesh>

      <Html center distanceFactor={8} position={[0, 0.2, 0]} occlude={false}>
        <div style={styles.label}>📷 {CAMERA_LABEL}</div>
      </Html>
    </group>
  );
}

const styles = {
  label: {
    padding: '3px 9px',
    borderRadius: 999,
    fontSize: 10.5,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: '#0f172a',
    background: 'rgba(34,211,238,0.9)',
    border: '1px solid rgba(255,255,255,0.5)',
  },
};
