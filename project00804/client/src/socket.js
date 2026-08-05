import io from 'socket.io-client';
import { SOCKET_SERVER_URL } from './config';

// アプリ全体で単一のsocket接続を共有する。
// ページ(ダッシュボード/YOLO確認/Polycam確認)を切り替えても
// 接続が張り直されないようにモジュールスコープで1つだけ生成する。
// SOCKET_SERVER_URLが空文字の場合はundefinedにして、
// socket.ioクライアントに「現在のページと同一オリジンへ接続」させる
// (Docker/Caddy経由でCORSなしに動かすための挙動)
const socket = io(SOCKET_SERVER_URL || undefined, {
  autoConnect: true,
  reconnection: true,
});

export default socket;
