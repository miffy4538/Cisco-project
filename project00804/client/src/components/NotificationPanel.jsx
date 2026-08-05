import React from 'react';

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function NotificationPanel({ notifications, onAck, onDismiss, onClearAll }) {
  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>危険通知</span>
        <span style={styles.count}>{notifications.length}</span>
        <button style={styles.clearBtn} onClick={onClearAll}>すべてクリア</button>
      </div>

      <div style={styles.list}>
        {notifications.length === 0 && (
          <div style={styles.empty}>現在、通知はありません。</div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              ...styles.item,
              borderLeftColor: n.level === 'danger' ? '#f43f5e' : '#f59e0b',
              opacity: n.acknowledged ? 0.55 : 1,
            }}
          >
            <div style={styles.itemHead}>
              <span style={{ ...styles.icon, color: n.level === 'danger' ? '#f43f5e' : '#f59e0b' }}>
                {n.level === 'danger' ? '●' : '⚠'}
              </span>
              <span style={styles.itemTitle}>{n.title}</span>
              <span style={styles.itemTime}>{formatTime(n.time)}</span>
            </div>
            <div style={styles.itemMsg}>{n.message}</div>
            <div style={styles.itemActions}>
              <button style={styles.actionBtn} onClick={() => onAck(n.id)} title="確認済みにする">✓</button>
              <button style={styles.actionBtn} onClick={() => onDismiss(n.id)} title="削除">✕</button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

const styles = {
  panel: {
    width: 320,
    flexShrink: 0,
    borderLeft: '1px solid #1a2130',
    background: '#0b0e15',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 16px',
    borderBottom: '1px solid #1a2130',
  },
  headerTitle: { color: '#f8fafc', fontWeight: 700, fontSize: 14 },
  count: {
    background: '#f43f5e',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 999,
    padding: '1px 8px',
  },
  clearBtn: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#64748b',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  list: { flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 },
  empty: { color: '#475569', fontSize: 12, padding: 16, textAlign: 'center' },
  item: {
    background: 'rgba(255,255,255,0.03)',
    borderLeft: '3px solid',
    borderRadius: 6,
    padding: '10px 12px',
  },
  itemHead: { display: 'flex', alignItems: 'center', gap: 6 },
  icon: { fontSize: 10 },
  itemTitle: { color: '#e2e8f0', fontSize: 13, fontWeight: 600, flex: 1 },
  itemTime: { color: '#475569', fontSize: 11 },
  itemMsg: { color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 1.4 },
  itemActions: { display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' },
  actionBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: '1px solid #263042',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 11,
  },
};
