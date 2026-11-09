// 3D 全息体素扫描投影台（参考 polyfork holo-pad + lijiejoy/dsh-skill-image2threejs 采样算法）
// 改造原版逐像素 new Mesh 的写法：将全部采样点收进单个 THREE.InstancedMesh（1 draw call，≤1800 实例）。
// 仅对 50 个 AGT 数字员工渲染全息肖像点阵；3 个 MGT 仅显示 T4 规则几何环，不渲染人形。

import * as THREE from './vendor/three.module.min.js';

const HOLO_PALETTE = [
  new THREE.Color(0x1b3042),
  new THREE.Color(0x396397),
  new THREE.Color(0x74bfe8),
  new THREE.Color(0xaec8e2),
  new THREE.Color(0xf4f7fb),
];

export function createHoloEmitterStage(cx, cz) {
  const root = new THREE.Group();
  root.position.set(cx, 2, cz);

  // 1) Polyfork 风格八角全息发射底座（Holo-Pad）
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x142033, roughness: 0.35, metalness: 0.78, flatShading: true,
  });
  const glowRingMat = new THREE.MeshBasicMaterial({
    color: 0x74bfe8, transparent: true, opacity: 0.72,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });

  let avatarTone = 'dark';
  const padOuter = new THREE.Mesh(new THREE.CylinderGeometry(72, 84, 8, 8), baseMat);
  padOuter.position.y = 4;
  padOuter.receiveShadow = true;
  const padInner = new THREE.Mesh(new THREE.CylinderGeometry(52, 56, 4, 8), baseMat);
  padInner.position.y = 9;
  const emitterRing = new THREE.Mesh(new THREE.RingGeometry(44, 50, 32), glowRingMat);
  emitterRing.rotation.x = -Math.PI / 2;
  emitterRing.position.y = 11.5;

  // 2) 扫描光环（上下往复移动）
  const scanRing = new THREE.Mesh(
    new THREE.RingGeometry(40, 48, 32),
    new THREE.MeshBasicMaterial({
      color: 0xaec8e2, transparent: true, opacity: 0.42,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    })
  );
  scanRing.rotation.x = -Math.PI / 2;
  scanRing.position.y = 40;

  root.add(padOuter, padInner, emitterRing, scanRing);

  // 3) 单一 InstancedMesh 承载 image2threejs 采样体素（最多 1764 个 42×42 采样网格）
  const GRID = 42;
  const MAX_CELLS = GRID * GRID;
  const cellGeo = new THREE.BoxGeometry(2.1, 2.1, 2.1);
  const cellMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const voxMesh = new THREE.InstancedMesh(cellGeo, cellMat, MAX_CELLS);
  voxMesh.count = 0;
  voxMesh.position.set(0, 18, 0);
  voxMesh.frustumCulled = false;
  root.add(voxMesh);

  const offCanvas = document.createElement('canvas');
  offCanvas.width = GRID;
  offCanvas.height = GRID;
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
  const dummy = new THREE.Object3D();
  let buildToken = 0;
  let currentSeatId = null;
  let phase = 0;

  function renderMgtRuleCore() {
    let idx = 0;
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r = 34;
      dummy.position.set(Math.cos(a) * r, 46 + Math.sin(a * 3) * 8, Math.sin(a) * r * 0.4);
      dummy.scale.set(1.2, 1.2, 1.2);
      dummy.updateMatrix();
      voxMesh.setMatrixAt(idx, dummy.matrix);
      voxMesh.setColorAt(idx, HOLO_PALETTE[3]);
      idx++;
    }
    voxMesh.count = idx;
    voxMesh.instanceMatrix.needsUpdate = true;
    if (voxMesh.instanceColor) voxMesh.instanceColor.needsUpdate = true;
  }

  function updateSeatHologram(seatId) {
    if (!seatId || seatId === currentSeatId) return;
    currentSeatId = seatId;
    const myToken = ++buildToken;
    if (String(seatId).startsWith('MGT-')) {
      renderMgtRuleCore();
      return;
    }
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (myToken !== buildToken) return;
      offCtx.clearRect(0, 0, GRID, GRID);
      offCtx.drawImage(img, 0, 0, GRID, GRID);
      const data = offCtx.getImageData(0, 0, GRID, GRID).data;
      // 采样四角背景色，跳过低对比背景像素
      const bgR = data[0], bgG = data[1], bgB = data[2];
      let idx = 0;
      const stepCm = 2.25;
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const p = (y * GRID + x) * 4;
          const r = data[p], g = data[p + 1], b = data[p + 2], a = data[p + 3];
          if (a < 32) continue;
          // 圆形裁剪 + 背景色差过滤
          const nx = (x - GRID / 2) / (GRID / 2);
          const ny = (y - GRID / 2) / (GRID / 2);
          if (nx * nx + ny * ny > 0.92) continue;
          const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          if (diff < 26 && lum < 0.22) continue;

          const wx = (x - GRID / 2) * stepCm;
          const wy = (GRID - 1 - y) * stepCm;
          const wz = (lum - 0.35) * 18;
          dummy.position.set(wx, wy, wz);
          const sc = 0.72 + lum * 0.45;
          dummy.scale.set(sc, sc, 1.0 + lum * 2.2);
          dummy.updateMatrix();
          voxMesh.setMatrixAt(idx, dummy.matrix);

          const qIdx = Math.min(HOLO_PALETTE.length - 1, Math.floor(lum * HOLO_PALETTE.length));
          voxMesh.setColorAt(idx, HOLO_PALETTE[qIdx]);
          idx++;
        }
      }
      voxMesh.count = idx;
      voxMesh.instanceMatrix.needsUpdate = true;
      if (voxMesh.instanceColor) voxMesh.instanceColor.needsUpdate = true;
    };
    img.src = `./assets/avatars/${avatarTone}/256/${seatId}.webp`;
  }

  function update(dt) {
    phase += dt;
    scanRing.position.y = 22 + ((Math.sin(phase * 1.8) * 0.5 + 0.5) * 86);
    voxMesh.rotation.y = Math.sin(phase * 0.65) * 0.22;
  }

  // 默认展示 FLOW-02 试点主责席位 AGT-008 的 3D 体素全息分身
  updateSeatHologram('AGT-008');

  // 深色：加法发光体素；浅色：常规混合 + 深海蓝色阶，并改采样浅色头像（背景过滤靠四角色差，与明暗无关）
  function setTheme(palette) {
    const blend = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    palette.holo.palette.forEach((hex, i) => HOLO_PALETTE[i].set(hex));
    glowRingMat.color.set(palette.holo.ring);
    scanRing.material.color.set(palette.holo.scan);
    baseMat.color.set(palette.holo.base);
    for (const m of [glowRingMat, scanRing.material, cellMat]) { m.blending = blend; m.needsUpdate = true; }
    cellMat.opacity = palette.additive ? 0.78 : 0.92;
    const toneChanged = avatarTone !== palette.avatarTone;
    avatarTone = palette.avatarTone;
    const sid = currentSeatId;
    if (sid) { currentSeatId = null; updateSeatHologram(sid); }
    else if (!toneChanged && voxMesh.instanceColor) voxMesh.instanceColor.needsUpdate = true;
  }

  return {
    group: root,
    updateSeatHologram,
    update,
    setTheme,
    getActiveCount: () => voxMesh.count,
    getCurrentSeatId: () => currentSeatId,
  };
}
