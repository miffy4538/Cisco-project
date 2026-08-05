import React from 'react';
import { ROOM_LABEL, CAMERA_LABEL } from '../config';
import CameraControls from './CameraControls';

export default function StatusBar({
  connected,
  hasPerson,
  confidencePct,
  personCount,
  statusText,
  viewMode,
  onViewModeChange,
  inputMode,
  shouldCapture,
  cameraError,
  requestWebcam,
}) {
  const pillColor = !connected ? '#64748b' : hasPerson ? '#22d3ee' : '#f59e0b';
  const pillText = !connected
    ? 'サーバー未接続'
    : hasPerson
      ? `検出中 (信頼度${confidencePct}%)`
      : '検出待ち';

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.title}>見守りモニター</span>
        <span style={styles.sep}>・</span>
        <span style={styles.crumb}>{ROOM_LABEL}</span>
        <span style={styles.sep}>・</span>
        <span style={styles.crumb}>{CAMERA_LABEL}</span>
      </div>

      <div style={styles.center}>
        <span style={{ ...styles.pill, color: pillColor, borderColor: pillColor }}>
          <span style={{ ...styles.dot, background: pillColor }} />
          {pillText}
        </span>
        <span style={styles.stateText}>{statusText}</span>
        <span style={styles.countChip}>
          <span style={{ ...styles.countDot, background: personCount > 0 ? '#22d3ee' : '#334155' }} />
          検出人数: {personCount || 0}人
        </span>
      </div>

      <div style={styles.right}>
        <CameraControls
          inputMode={inputMode}
          requestWebcam={requestWebcam}
          shouldCapture={shouldCapture}
          cameraError={cameraError}
        />
        <span style={styles.rightSep} />
        <button
          onClick={() => onViewModeChange('overview')}
          style={{ ...styles.toggleBtn, ...(viewMode === 'overview' ? styles.toggleBtnActive : {}) }}
        >
          俯瞰3D
        </button>
        <button
          onClick={() => onViewModeChange('pov')}
          style={{ ...styles.toggleBtn, ...(viewMode === 'pov' ? styles.toggleBtnActive : {}) }}
        >
          カメラの視点
        </button>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px 14px 68px',
    borderBottom: '1px solid #1a2130',
    background: '#0b0e15',
    flexWrap: 'wrap',
    gap: 10,
  },
  left: { display: 'flex', alignItems: 'baseline', gap: 6, color: '#cbd5e1', fontSize: 13 },
  title: { color: '#f8fafc', fontWeight: 700, fontSize: 15 },
  sep: { color: '#334155' },
  crumb: { color: '#94a3b8' },
  center: { display: 'flex', alignItems: 'center', gap: 12 },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 12px',
    borderRadius: 999,
    border: '1px solid',
    background: 'rgba(255,255,255,0.03)',
  },
  dot: { width: 7, height: 7, borderRadius: '50%' },
  stateText: { fontSize: 12, color: '#64748b', background: 'rgba(255,255,255,0.03)', padding: '5px 12px', borderRadius: 999 },
  countChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#cbd5e1',
    background: 'rgba(255,255,255,0.03)',
    padding: '5px 12px',
    borderRadius: 999,
  },
  countDot: { width: 6, height: 6, borderRadius: '50%' },
  right: { display: 'flex', alignItems: 'center', gap: 6 },
  rightSep: { width: 1, alignSelf: 'stretch', background: '#1a2130', margin: '0 4px' },
  toggleBtn: {
    fontSize: 12,
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid #263042',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  toggleBtnActive: {
    background: 'rgba(34,211,238,0.12)',
    color: '#22d3ee',
    borderColor: 'rgba(34,211,238,0.4)',
  },
};
