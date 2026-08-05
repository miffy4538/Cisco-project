import React, { useState } from 'react';

const PAGES = [
  { id: 'dashboard', label: '見守りダッシュボード', desc: '3Dルームでの見守りモニター' },
  { id: 'yolo', label: 'YOLOの起動・動作確認', desc: 'Webカメラ/動画とYOLOv8-Poseの疎通確認' },
  { id: 'polycam', label: 'Polycamの動作確認', desc: 'スキャンしたGLTF/GLBの読み込み確認' },
];

export default function HamburgerMenu({ currentPage, onNavigate, connected }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="メニューを開く"
        onClick={() => setOpen((v) => !v)}
        style={styles.hamburgerButton}
      >
        <span style={styles.barWrap}>
          <span style={{ ...styles.bar, transform: open ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ ...styles.bar, opacity: open ? 0 : 1 }} />
          <span style={{ ...styles.bar, transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </span>
      </button>

      {open && <div style={styles.backdrop} onClick={() => setOpen(false)} />}

      <nav style={{ ...styles.drawer, transform: open ? 'translateX(0)' : 'translateX(-105%)' }}>
        <div style={styles.drawerHeader}>
          <div style={styles.drawerTitle}>子供見守りシステム</div>
          <div style={styles.drawerSubtitle}>YOLOv8-Pose × Three.js × Polycam</div>
        </div>

        <div style={styles.connState}>
          <span style={{ ...styles.dot, background: connected ? '#22d3ee' : '#64748b' }} />
          {connected ? 'サーバー接続中' : 'サーバー未接続'}
        </div>

        <ul style={styles.list}>
          {PAGES.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  onNavigate(p.id);
                  setOpen(false);
                }}
                style={{
                  ...styles.navItem,
                  ...(currentPage === p.id ? styles.navItemActive : {}),
                }}
              >
                <div style={styles.navItemLabel}>{p.label}</div>
                <div style={styles.navItemDesc}>{p.desc}</div>
              </button>
            </li>
          ))}
        </ul>

        <div style={styles.footer}>ダミーデータ版から実データ連携へ移行中</div>
      </nav>
    </>
  );
}

const styles = {
  hamburgerButton: {
    position: 'fixed',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 10,
    border: '1px solid #263042',
    background: 'rgba(15,18,26,0.9)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1000,
  },
  barWrap: {
    width: 20,
    height: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  bar: {
    display: 'block',
    height: 2,
    width: '100%',
    background: '#22d3ee',
    borderRadius: 2,
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 998,
  },
  drawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    background: '#0d111a',
    borderRight: '1px solid #1f2836',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    padding: '76px 18px 18px',
    transition: 'transform 0.22s ease',
    boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
  },
  drawerHeader: { marginBottom: 18 },
  drawerTitle: { color: '#f8fafc', fontWeight: 700, fontSize: 17 },
  drawerSubtitle: { color: '#64748b', fontSize: 12, marginTop: 4 },
  connState: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#94a3b8',
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    marginBottom: 16,
  },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  navItem: {
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 10,
    padding: '10px 12px',
    cursor: 'pointer',
  },
  navItemActive: {
    background: 'rgba(34,211,238,0.1)',
    border: '1px solid rgba(34,211,238,0.35)',
  },
  navItemLabel: { color: '#e2e8f0', fontSize: 14, fontWeight: 600 },
  navItemDesc: { color: '#64748b', fontSize: 11.5, marginTop: 2 },
  footer: { marginTop: 'auto', color: '#334155', fontSize: 11, textAlign: 'center' },
};
