// ===================================================================
// システム全体の設定値をまとめたファイル。
// 部屋のサイズ・危険エリア・GLTFモデルのパスなどはここを編集すれば調整できます。
// ===================================================================

// Node.js(YOLO中継サーバー)の接続先。
// ・ビルド時に環境変数 VITE_SOCKET_URL が設定されていればそれを使う
//   (Docker/Caddy経由で公開する場合は空文字にして同一オリジン接続にするのが既定)
// ・未設定時(これまで通り `npm run dev` でローカル起動する場合)は
//   従来通り http://localhost:3001 にフォールバックする
export const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL !== undefined
    ? import.meta.env.VITE_SOCKET_URL
    : 'http://localhost:3001';

// YOLOv8-Poseの17キーポイントの接続順（COCO形式）
export const SKELETON_CONNECTIONS = [
  [5, 6],   // 肩
  [5, 7], [7, 9],   // 左腕
  [6, 8], [8, 10],  // 右腕
  [5, 11], [6, 12], // 体幹〜腰
  [11, 12], // 腰
  [11, 13], [13, 15], // 左脚
  [12, 14], [14, 16], // 右脚
  [0, 1], [1, 3], [0, 2], [2, 4], // 顔
];

// キーポイントのインデックス名（COCO形式）
export const KEYPOINT_NAMES = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
];

// カメラ映像(640x480)からYOLOで検出できる最大人数
export const MAX_PERSONS = 5;

// キーポイントの信頼度しきい値
export const CONF_THRESHOLD = 0.3;

// -------------------------------------------------------------------
// Polycamで自室をスキャンしたGLTF/GLBモデルの配置場所。
// public/models/ 配下に置いたファイルは、そのまま "/models/ファイル名" で読み込めます。
//
// 使い方:
//   1. Polycamアプリで自室をスキャン
//   2. GLTF(.gltf + .bin + texture一式) または GLB(単一ファイル)形式でエクスポート
//   3. client/public/models/ に room.glb (またはフォルダごと)を配置
//   4. 下記 ROOM_MODEL_PATH のファイル名を実際のファイル名に合わせる
//
// ファイルが無い場合は自動的にプレースホルダーの部屋(箱の集合)が表示されます。
// -------------------------------------------------------------------
export const ROOM_MODEL_PATH = '/models/room.glb';

// 部屋の想定サイズ（メートル換算・プレースホルダー部屋やフロア座標マッピングの基準）
export const ROOM_SIZE = { width: 4.2, depth: 3.6, height: 2.6 };

// GLTF読み込み後に自動フィットさせる目標サイズ（Polycamの出力スケールはバラバラなため正規化する）
export const ROOM_FIT_TARGET = Math.max(ROOM_SIZE.width, ROOM_SIZE.depth);

// -------------------------------------------------------------------
// 実際の見守りカメラの設置位置（部屋のフロア座標系, メートル / 原点は部屋中心）。
// 「地上から約1mの高さ」「長方形の部屋の短い辺(壁)の中央」に設置している実機の
// 配置に合わせている。ROOM_SIZE.width / ROOM_SIZE.depth のうち短い方の辺を持つ壁の
// 中央へ自動的に配置されるため、部屋のサイズ(ROOM_SIZE)を変えても計算し直される。
// カメラは大まかに部屋の奥へ向いているものとして扱う(CAMERA_FACING_AXIS＝見ている軸)。
// この値はpose座標→フロア座標への変換(poseGeometry.js)と、3Dシーンの
// 「カメラの視点」表示(RoomScene.jsx)の両方で使われる。
// -------------------------------------------------------------------
const SHORT_SIDE_IS_WIDTH = ROOM_SIZE.width <= ROOM_SIZE.depth;
export const CAMERA_HEIGHT_M = 1.0;
export const CAMERA_MOUNT = SHORT_SIDE_IS_WIDTH
  ? { x: 0, y: CAMERA_HEIGHT_M, z: -ROOM_SIZE.depth / 2 }
  : { x: -ROOM_SIZE.width / 2, y: CAMERA_HEIGHT_M, z: 0 };
// カメラが向いている軸('x' または 'z')。奥行きの推定に使う。
export const CAMERA_FACING_AXIS = SHORT_SIDE_IS_WIDTH ? 'z' : 'x';

// -------------------------------------------------------------------
// 危険エリア／注意エリアの定義（部屋のフロア座標系 x, z はメートル、原点は部屋中心）
// type: 'danger' (赤) | 'warning' (橙)
// 実際のスキャンモデルに合わせて座標は適宜キャリブレーションしてください。
// -------------------------------------------------------------------
export const DANGER_ZONES = [
  {
    id: 'stairs',
    label: '危険・階段入口',
    type: 'danger',
    x: 0.9, z: -0.6, width: 0.9, depth: 0.9,
  },
  {
    id: 'heater',
    label: '注意/暖房器具エリア',
    type: 'warning',
    x: -1.3, z: 0.7, width: 1.0, depth: 0.9,
  },
];

// -------------------------------------------------------------------
// 見守りロジックのしきい値
// -------------------------------------------------------------------
export const THRESHOLDS = {
  // この時間(ms)以上、人物が検出されないと「カメラの範囲からの消失」
  LOST_TIMEOUT_MS: 4000,
  // この時間(ms)以上、ほぼ動きが無いと「長時間静止」
  STATIONARY_TIME_MS: 5000,
  // 静止とみなす移動量のしきい値（フロア座標・メートル）
  STATIONARY_DISTANCE_M: 0.15,
  // 転倒とみなす姿勢比（バウンディングボックスの 高さ/幅 がこれを下回ると「横たわっている」とみなす）
  FALL_ASPECT_RATIO: 0.9,
  // 同じ種類の通知を再送するまでの最短間隔(ms)（通知のスパム防止）
  NOTIFY_COOLDOWN_MS: 8000,
};

// 見守り対象の表示名（複数カメラ/複数部屋を想定した場合はここを配列化して拡張可能）
export const ROOM_LABEL = 'こども部屋(1F)';
export const CAMERA_LABEL = '見守りカメラ(壁掛け・高さ約1m/短辺中央)';
