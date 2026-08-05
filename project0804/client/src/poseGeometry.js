import { CONF_THRESHOLD, ROOM_SIZE, CAMERA_MOUNT, CAMERA_FACING_AXIS } from './config';

// ===================================================================
// YOLOv8-Poseの2Dキーポイント(画像座標: 640x480, カメラ映像基準)から、
// 部屋のフロア座標(メートル, 部屋中心が原点)への簡易マッピングを行うユーティリティ。
// ===================================================================

const IMG_W = 640;
const IMG_H = 480;

function isValidKpt(k) {
  return Array.isArray(k) && k.length >= 3 && k[2] > CONF_THRESHOLD;
}

/**
 * 1人分の生キーポイント配列から、扱いやすい特徴量にまとめる。
 * @param {Array} keypoints - 17個の[x,y,conf]配列
 */
export function analyzePerson(keypoints) {
  if (!Array.isArray(keypoints) || keypoints.length === 0) return null;

  const visible = keypoints.filter(isValidKpt);
  if (visible.length === 0) return null;

  const avgConf = visible.reduce((sum, k) => sum + k[2], 0) / visible.length;

  const xs = visible.map((k) => k[0]);
  const ys = visible.map((k) => k[1]);
  const bbox = {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
  };
  const bboxW = Math.max(bbox.maxX - bbox.minX, 1);
  const bboxH = Math.max(bbox.maxY - bbox.minY, 1);
  const aspectRatio = bboxH / bboxW; // 小さいほど「横たわっている」

  // 腰(11,12)があればそれを、無ければ肩(5,6)、それも無ければ全体平均を使う
  const hipL = keypoints[11];
  const hipR = keypoints[12];
  const shL = keypoints[5];
  const shR = keypoints[6];

  let refX, refY;
  if (isValidKpt(hipL) && isValidKpt(hipR)) {
    refX = (hipL[0] + hipR[0]) / 2;
    refY = (hipL[1] + hipR[1]) / 2;
  } else if (isValidKpt(shL) && isValidKpt(shR)) {
    refX = (shL[0] + shR[0]) / 2;
    refY = (shL[1] + shR[1]) / 2;
  } else {
    refX = (bbox.minX + bbox.maxX) / 2;
    refY = (bbox.minY + bbox.maxY) / 2;
  }

  return {
    avgConf,
    bbox,
    aspectRatio,
    floor: imageToFloor(refX, refY),
    visibleCount: visible.length,
    keypoints,
  };
}

// -------------------------------------------------------------------
// 画像座標(640x480) → 部屋のフロア座標(メートル, 部屋中心が原点) への変換。
//
// 【実際のカメラの設置条件】
// カメラは「地上から約1mの高さ」で「長方形の部屋の短い辺(壁)の中央」に設置し、
// 部屋の奥へ向けて水平気味に見ている想定(config.jsのCAMERA_MOUNT/
// CAMERA_FACING_AXIS)。天井の真下を見下ろす配置ではないため、
//   ・画像内の左右位置(X)                    → カメラの視線に対して「左右」＝短い辺方向
//   ・画像内の上下位置(Y, 下ほど画面手前＝カメラに近い) → カメラからの「奥行き」
// という近似でフロア座標を推定する。
//
// YOLOv8-Poseは単眼2Dのため本来「奥行き」の情報は得られない点は変わらず、
// あくまで簡易的な近似(パースによる遠近の歪みなどは考慮していない)。
// より正確な位置が必要な場合は、深度カメラや複数カメラでの三角測量への
// 置き換えを推奨します（TODO）。
// -------------------------------------------------------------------
function imageToFloor(imgX, imgY) {
  const lateral = (imgX / IMG_W) - 0.5; // -0.5(画面左端)〜+0.5(画面右端)
  const depthFrac = 1 - (imgY / IMG_H); // 0(画面下＝カメラの手前)〜1(画面上＝部屋の奥)

  if (CAMERA_FACING_AXIS === 'x') {
    const forwardSign = CAMERA_MOUNT.x <= 0 ? 1 : -1;
    return {
      x: CAMERA_MOUNT.x + forwardSign * depthFrac * ROOM_SIZE.width,
      z: CAMERA_MOUNT.z + lateral * ROOM_SIZE.depth,
    };
  }
  const forwardSign = CAMERA_MOUNT.z <= 0 ? 1 : -1;
  return {
    x: CAMERA_MOUNT.x + lateral * ROOM_SIZE.width,
    z: CAMERA_MOUNT.z + forwardSign * depthFrac * ROOM_SIZE.depth,
  };
}

/** 2つのフロア座標間の距離(メートル) */
export function floorDistance(a, b) {
  if (!a || !b) return Infinity;
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/** 指定した矩形の危険エリアに座標が入っているか判定 */
export function isInsideZone(floor, zone) {
  if (!floor) return false;
  return (
    Math.abs(floor.x - zone.x) <= zone.width / 2 &&
    Math.abs(floor.z - zone.z) <= zone.depth / 2
  );
}
