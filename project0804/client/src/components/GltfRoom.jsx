import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { ROOM_FIT_TARGET } from '../config';

// Polycamのスキャンモデルを読み込むコンポーネント。
// PolycamのGLTF/GLBはスケールや原点がまちまちなので、
// バウンディングボックスを計算して「床の中心が原点、最大辺がROOM_FIT_TARGET(m)」に
// 自動で正規化する。
export default function GltfRoom({ path }) {
  const { scene } = useGLTF(path);

  const { normalizedScene, fitScale } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const scale = ROOM_FIT_TARGET / maxDim;

    // 床(バウンディングボックス最下面)がY=0になるよう平行移動
    cloned.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );
    cloned.scale.setScalar(scale);

    cloned.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    return { normalizedScene: cloned, fitScale: scale };
  }, [scene]);

  return <primitive object={normalizedScene} />;
}

// 読み込み失敗時に何度もリトライさせないためのプリロード(存在すれば効く)
export function preloadRoomModel(path) {
  try {
    useGLTF.preload(path);
  } catch (e) {
    // ファイルが無い場合はここでは何もしない(ErrorBoundary側で処理)
  }
}
