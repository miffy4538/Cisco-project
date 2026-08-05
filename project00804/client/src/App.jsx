import React, { useState } from 'react';
import HamburgerMenu from './components/HamburgerMenu';
import MonitoringDashboard from './components/MonitoringDashboard';
import YoloCheckPage from './components/YoloCheckPage';
import PolycamCheckPage from './components/PolycamCheckPage';
import { useDetectionPipeline } from './hooks/useDetectionPipeline';

// ===================================================================
// アプリ全体のシェル。
// ・検出パイプライン(Webカメラ/動画 → YOLO → pose-data)はここで一元管理し、
//   どのページを表示していても止まらないようにする。
// ・左上のハンバーガーメニューで3ページを切り替える:
//     1. 見守りダッシュボード  … 3Dルーム + 危険通知(本命の画面)
//     2. YOLOの起動・動作確認  … Webカメラ/動画・2Dオーバーレイ・生データ確認
//     3. Polycamの動作確認     … スキャンしたGLTF/GLBの読み込み確認
// ===================================================================
export default function App() {
  const [page, setPage] = useState('dashboard');

  const {
    videoRef,
    fileInputRef,
    inputMode,
    setInputMode,
    handleFileChange,
    connected,
    poseData,
    lastPoseAt,
    shouldCapture,
    cameraError,
    requestWebcam,
  } = useDetectionPipeline();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#090b11' }}>
      <HamburgerMenu currentPage={page} onNavigate={setPage} connected={connected} />

      <div style={{ display: page === 'dashboard' ? 'block' : 'none', height: '100%' }}>
        <MonitoringDashboard
          connected={connected}
          poseData={poseData}
          lastPoseAt={lastPoseAt}
          inputMode={inputMode}
          shouldCapture={shouldCapture}
          cameraError={cameraError}
          requestWebcam={requestWebcam}
        />
      </div>

      <div style={{ display: page === 'yolo' ? 'block' : 'none' }}>
        <YoloCheckPage
          videoRef={videoRef}
          fileInputRef={fileInputRef}
          inputMode={inputMode}
          handleFileChange={handleFileChange}
          connected={connected}
          poseData={poseData}
          lastPoseAt={lastPoseAt}
          shouldCapture={shouldCapture}
          cameraError={cameraError}
          requestWebcam={requestWebcam}
        />
      </div>

      <div style={{ display: page === 'polycam' ? 'block' : 'none' }}>
        <PolycamCheckPage />
      </div>
    </div>
  );
}
