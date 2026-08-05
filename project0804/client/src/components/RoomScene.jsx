import React, { Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GltfErrorBoundary from './GltfErrorBoundary';
import GltfRoom from './GltfRoom';
import PlaceholderRoom from './PlaceholderRoom';
import PersonFigure from './PersonFigure';
import DangerZoneMarkers from './DangerZoneMarkers';
import CameraMount from './CameraMount';
import { ROOM_MODEL_PATH, CAMERA_MOUNT } from '../config';

// 俯瞰3D: 斜め上から部屋全体を見渡すアイソメトリック風カメラ
const OVERVIEW_CAMERA = { position: [3.6, 3.2, 3.6], fov: 45 };
// カメラの視点: 実際に取り付けている見守りカメラ(壁・高さ約1m・部屋の短辺中央)の
// POVを再現する。位置はconfig.jsのCAMERA_MOUNTと連動しているため、
// 部屋のサイズを変えれば自動的に追従する。
const POV_CAMERA = { position: [CAMERA_MOUNT.x, CAMERA_MOUNT.y, CAMERA_MOUNT.z], fov: 68 };

function CameraRig({ viewMode }) {
  const { camera } = useThree();
  const controls = useRef();
  const target = viewMode === 'overview' ? OVERVIEW_CAMERA : POV_CAMERA;

  React.useEffect(() => {
    camera.position.set(...target.position);
    camera.fov = target.fov;
    camera.updateProjectionMatrix();
    if (controls.current) {
      controls.current.target.set(0, 0.6, 0);
      controls.current.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  return <OrbitControls ref={controls} enableDamping dampingFactor={0.1} minDistance={0.8} maxDistance={12} />;
}

// people: [{ id, floor: {x,z}, fallen, colorState }, ...] 検出された全員分
export default function RoomScene({ viewMode, people, modelPath }) {
  const path = modelPath || ROOM_MODEL_PATH;
  const list = Array.isArray(people) ? people : [];

  return (
    <Canvas shadows camera={{ position: OVERVIEW_CAMERA.position, fov: OVERVIEW_CAMERA.fov }}>
      <color attach="background" args={['#090b11']} />
      <fog attach="fog" args={['#090b11', 6, 14]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color={'#3366ff'} />

      <GltfErrorBoundary resetKey={path} fallback={<PlaceholderRoom />}>
        <Suspense fallback={<PlaceholderRoom />}>
          <GltfRoom path={path} />
        </Suspense>
      </GltfErrorBoundary>

      <CameraMount />

      <DangerZoneMarkers peopleFloors={list.map((p) => p.floor)} />
      {list.map((p) => (
        <PersonFigure key={p.id} floor={p.floor} fallen={p.fallen} colorState={p.colorState} />
      ))}

      <gridHelper args={[10, 20, '#1f2937', '#141a24']} position={[0, 0.001, 0]} />

      <CameraRig viewMode={viewMode} />
    </Canvas>
  );
}
