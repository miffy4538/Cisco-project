import React, { useState } from 'react';
import StatusBar from './StatusBar';
import NotificationPanel from './NotificationPanel';
import RoomScene from './RoomScene';
import { useMonitoringAlerts } from '../hooks/useMonitoringAlerts';
import { THRESHOLDS } from '../config';

export default function MonitoringDashboard({
  connected,
  poseData,
  lastPoseAt,
  inputMode,
  shouldCapture,
  cameraError,
  requestWebcam,
}) {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'pov'

  const {
    notifications,
    dismissNotification,
    acknowledgeNotification,
    clearAll,
    statusText,
    primaryPerson,
    isLost,
    personCount,
    allPersons,
  } = useMonitoringAlerts(poseData, lastPoseAt, connected);

  const hasPerson = !!primaryPerson && !isLost;
  const confidencePct = hasPerson ? Math.round(primaryPerson.avgConf * 100) : 0;
  const fallen = hasPerson && primaryPerson.aspectRatio < THRESHOLDS.FALL_ASPECT_RATIO;
  const colorState = fallen ? 'danger' : notifications.some((n) => n.level === 'danger' && Date.now() - n.time < 4000) ? 'warning' : 'normal';

  // 見守りシーンに表示する人物一覧(検出された全員分)。主対象(先頭の1人)には
  // 通知と連動した色を、それ以外には控えめな標準色を割り当てる。
  const people = isLost
    ? []
    : allPersons.map((p, idx) => ({
        id: idx,
        floor: p.floor,
        fallen: p.aspectRatio < THRESHOLDS.FALL_ASPECT_RATIO,
        colorState: idx === 0 ? colorState : 'normal',
      }));

  return (
    <div style={styles.page}>
      <StatusBar
        connected={connected}
        hasPerson={hasPerson}
        confidencePct={confidencePct}
        personCount={personCount}
        statusText={isLost ? '検出待ち' : statusText}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        inputMode={inputMode}
        shouldCapture={shouldCapture}
        cameraError={cameraError}
        requestWebcam={requestWebcam}
      />
      <div style={styles.body}>
        <div style={styles.sceneWrap}>
          <RoomScene viewMode={viewMode} people={people} />
        </div>
        <NotificationPanel
          notifications={notifications}
          onAck={acknowledgeNotification}
          onDismiss={dismissNotification}
          onClearAll={clearAll}
        />
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#090b11' },
  body: { flex: 1, display: 'flex', minHeight: 0 },
  sceneWrap: { flex: 1, position: 'relative' },
};
