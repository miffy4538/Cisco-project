import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import GltfErrorBoundary from './GltfErrorBoundary';
import { ROOM_MODEL_PATH } from '../config';

function LoadedModel({ url, onStats }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    let meshCount = 0;
    let triCount = 0;
    scene.traverse((obj) => {
      if (obj.isMesh) {
        meshCount += 1;
        const geo = obj.geometry;
        if (geo && geo.index) triCount += geo.index.count / 3;
        else if (geo && geo.attributes && geo.attributes.position) triCount += geo.attributes.position.count / 3;
      }
    });
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    onStats({
      status: 'ok',
      meshCount,
      triCount: Math.round(triCount),
      size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return <primitive object={scene} />;
}

function LoadFailNotice({ onStats, message }) {
  useEffect(() => {
    onStats({ status: 'error', message });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <mesh>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color={'#f43f5e'} wireframe />
    </mesh>
  );
}

export default function PolycamCheckPage() {
  const [localUrl, setLocalUrl] = useState(null);
  const [localFileName, setLocalFileName] = useState(null);
  const [localStats, setLocalStats] = useState(null);

  const [publicStats, setPublicStats] = useState(null);
  const [tryPublicPath, setTryPublicPath] = useState(false);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (localUrl) URL.revokeObjectURL(localUrl);
    setLocalFileName(file.name);
    setLocalStats(null);
    setLocalUrl(URL.createObjectURL(file));
  };

  return (
    <div style={{ padding: '24px 24px 24px 76px', background: '#0a0a0a', color: '#eee', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Polycamの動作確認</h2>
      <p style={{ color: '#94a3b8', maxWidth: 760, lineHeight: 1.6, fontSize: 13.5 }}>
        Polycamでスキャンした自室のGLTF/GLBを読み込めるか確認するページです。
        まずはこの場でファイルを選択して見た目を確認し、問題なければ
        <code style={{ margin: '0 4px' }}>client/public/models/</code>
        に配置してください（本番の見守りダッシュボードは
        <code style={{ margin: '0 4px' }}>{ROOM_MODEL_PATH}</code>
        を読み込みます）。
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 20 }}>
        {/* ローカルファイルでのその場プレビュー */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>① ローカルファイルでプレビュー</h3>
          <p style={styles.cardDesc}>
            .glb（単一バイナリファイル）を選択してください。.gltf + .bin + テクスチャ一式の場合は
            相対パス参照の都合上このプレビューでは正しく表示できないことがあるため、
            その場合は下の②の手順でpublicフォルダに配置してから確認してください。
          </p>
          <input type="file" accept=".glb,.gltf" onChange={onFileChange} style={{ color: '#94a3b8', fontSize: 12 }} />

          <div style={styles.viewer}>
            {localUrl ? (
              <Canvas camera={{ position: [2.2, 1.8, 2.2], fov: 45 }} shadows>
                <color attach="background" args={['#0d1117']} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 4, 2]} intensity={1} castShadow />
                <Grid args={[10, 10]} cellColor="#1f2937" sectionColor="#334155" position={[0, 0, 0]} />
                <GltfErrorBoundary
                  resetKey={localUrl}
                  fallback={<LoadFailNotice onStats={setLocalStats} message="読み込みに失敗しました(形式/破損の可能性)" />}
                >
                  <Suspense fallback={null}>
                    <Center>
                      <LoadedModel url={localUrl} onStats={setLocalStats} />
                    </Center>
                  </Suspense>
                </GltfErrorBoundary>
                <OrbitControls enableDamping />
              </Canvas>
            ) : (
              <div style={styles.emptyViewer}>ファイル未選択</div>
            )}
          </div>

          {localFileName && <div style={styles.statLine}>ファイル名: {localFileName}</div>}
          {localStats && localStats.status === 'ok' && (
            <div style={styles.statLine}>
              メッシュ数: {localStats.meshCount} / 三角形数: {localStats.triCount.toLocaleString()} /
              サイズ(m): {localStats.size.x} × {localStats.size.y} × {localStats.size.z}
            </div>
          )}
          {localStats && localStats.status === 'error' && (
            <div style={{ ...styles.statLine, color: '#f43f5e' }}>{localStats.message}</div>
          )}
        </section>

        {/* public/models配下の本番パス確認 */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>② 配置後の本番パスを確認</h3>
          <p style={styles.cardDesc}>
            <code>client/public/models/</code> にファイルを配置したら、下のボタンで
            見守りダッシュボードと同じパス（<code>{ROOM_MODEL_PATH}</code>）から読み込めるか確認できます。
          </p>
          <button style={styles.tryBtn} onClick={() => setTryPublicPath(true)}>
            {ROOM_MODEL_PATH} を読み込んでみる
          </button>

          <div style={styles.viewer}>
            {tryPublicPath ? (
              <Canvas camera={{ position: [2.2, 1.8, 2.2], fov: 45 }} shadows>
                <color attach="background" args={['#0d1117']} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 4, 2]} intensity={1} castShadow />
                <Grid args={[10, 10]} cellColor="#1f2937" sectionColor="#334155" position={[0, 0, 0]} />
                <GltfErrorBoundary
                  resetKey={ROOM_MODEL_PATH}
                  fallback={<LoadFailNotice onStats={setPublicStats} message={`${ROOM_MODEL_PATH} が見つかりません。client/public/models/ に配置されているか確認してください。`} />}
                >
                  <Suspense fallback={null}>
                    <Center>
                      <LoadedModel url={ROOM_MODEL_PATH} onStats={setPublicStats} />
                    </Center>
                  </Suspense>
                </GltfErrorBoundary>
                <OrbitControls enableDamping />
              </Canvas>
            ) : (
              <div style={styles.emptyViewer}>未確認</div>
            )}
          </div>

          {publicStats && publicStats.status === 'ok' && (
            <div style={styles.statLine}>
              読み込み成功 / メッシュ数: {publicStats.meshCount} / サイズ(m): {publicStats.size.x} × {publicStats.size.y} × {publicStats.size.z}
            </div>
          )}
          {publicStats && publicStats.status === 'error' && (
            <div style={{ ...styles.statLine, color: '#f43f5e' }}>{publicStats.message}</div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: 420,
    background: '#0d111a',
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: { margin: '0 0 8px', fontSize: 14, color: '#f8fafc' },
  cardDesc: { fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 },
  viewer: {
    width: '100%',
    height: 280,
    background: '#0d1117',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
  },
  emptyViewer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#334155',
    fontSize: 12,
  },
  statLine: { marginTop: 10, fontSize: 11.5, color: '#67e8f9' },
  tryBtn: {
    padding: '8px 14px',
    fontSize: 12,
    background: '#164e63',
    color: '#67e8f9',
    border: '1px solid #22d3ee55',
    borderRadius: 6,
    cursor: 'pointer',
  },
};
