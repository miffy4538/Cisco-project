import React from 'react';
import { Html } from '@react-three/drei';
import { DANGER_ZONES } from '../config';
import { isInsideZone } from '../poseGeometry';

// 危険/注意エリアを床の色付き矩形＋動画と同じ雰囲気のピル型ラベルで表示する。
// peopleFloors: 検出された全員分のフロア座標の配列。誰か1人でもエリア内に
// いればそのエリアを「アクティブ」として強調表示する。
export default function DangerZoneMarkers({ peopleFloors }) {
  const floors = Array.isArray(peopleFloors) ? peopleFloors : [];
  return (
    <>
      {DANGER_ZONES.map((zone) => {
        const active = floors.some((floor) => isInsideZone(floor, zone));
        const color = zone.type === 'danger' ? '#f43f5e' : '#f59e0b';

        return (
          <group key={zone.id} position={[zone.x, 0, zone.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
              <planeGeometry args={[zone.width, zone.depth]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={active ? 0.45 : 0.22}
              />
            </mesh>
            <Html center distanceFactor={6} position={[0, 0.5, 0]} occlude={false}>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  color: zone.type === 'danger' ? '#fff' : '#3a2a06',
                  background: zone.type === 'danger' ? 'rgba(220,38,38,0.9)' : 'rgba(245,158,11,0.9)',
                  border: active ? '2px solid #fff' : '1px solid rgba(255,255,255,0.4)',
                  boxShadow: active ? '0 0 12px rgba(255,255,255,0.6)' : 'none',
                  transform: 'translateY(-50%)',
                }}
              >
                {zone.type === 'danger' ? '⚠ ' : '△ '}
                {zone.label}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}
