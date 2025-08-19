// ====== Flappy Indomie - game.js ======
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

canvas.width = 400;
canvas.height = 600;

// ---- Hình ảnh
const goiMi = new Image();
goiMi.src = "images/noodle.png";

const doiDua = new Image();
doiDua.src = "images/box.png";

const diaMi = new Image();
diaMi.src = "images/plate.png";

const background = new Image();
background.src = "images/background.png";

const NUT_CHOI_LAI = document.getElementById("restartBtn");
NUT_CHOI_LAI.textContent = "Chơi lại";
NUT_CHOI_LAI.style.backgroundColor = "#FFD700";
NUT_CHOI_LAI.style.color = "#ffffff";

// ---- Âm thanh
const nhacNen = new Audio("sounds/bgm.mp3");
nhacNen.loop = true;
nhacNen.volume = 0.4;

const amThanhFlap = new Audio("sounds/flap.wav");
amThanhFlap.volume = 0.6;

// ---- Tham số game
const TOC_DO_COT = 2.2;
const KHOANG_CACH_HO = 220;
const KHOANG_CACH_COT = 220;
const TILE_NV = 0.4;
const DUA_RONG_PX = Math.round(canvas.width * 0.04);

let nhanVat = { x: 50, y: 150, vy: 0, trongLuc: 0.6, lucNhay: -10 };
let cot = [];
let items = [];
let diem = 0;
let thua = false;
let hinhDaTai = 0;

// ---- Điều khiển
function bamPhimHoacChuot() {
  if (!thua) {
    nhanVat.vy = nhanVat.lucNhay;

    // phát tiếng flap
    amThanhFlap.currentTime = 0;
    amThanhFlap.play();

    // nếu nhạc chưa phát thì bật nhạc nền
    if (nhacNen.paused) {
      nhacNen.play().catch(err => console.log("Không phát được nhạc:", err));
    }
  }
}
document.addEventListener("keydown", bamPhimHoacChuot);
document.addEventListener("click", bamPhimHoacChuot);

NUT_CHOI_LAI.addEventListener("click", () => location.reload());

// Chờ ảnh load xong
[goiMi, doiDua, diaMi, background].forEach(img => {
  img.onload = () => {
    hinhDaTai++;
    if (hinhDaTai === 4) batDauGame();
  };
});

// ---- Sinh cột
function taoCot() {
  const minTop = 10;
  const maxTop = canvas.height - KHOANG_CACH_HO - 10;
  const caoTren = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

  const w = DUA_RONG_PX;
  const x = canvas.width;

  cot.push({
    x,
    caoTren,
    khoangHo: KHOANG_CACH_HO,
    w,
    quaChua: false
  });

  if (Math.random() < 0.4) {
    const nvW = goiMi.width * TILE_NV;
    const size = Math.max(26, Math.round(nvW * 0.9));
    const y = caoTren + KHOANG_CACH_HO / 2 - size / 2;
    items.push({ x: x + w + 12, y, w: size, h: size, taken: false });
  }
}

// ---- Vẽ đũa
function veDua(x, y, chieuCao, rong) {
  ctx.drawImage(doiDua, x, y, rong, chieuCao);
  return rong;
}

// ---- Cập nhật
function capNhat(nvW, nvH) {
  if (thua) return;

  nhanVat.vy += nhanVat.trongLuc;
  nhanVat.y += nhanVat.vy;

  if (nhanVat.y + nvH >= canvas.height || nhanVat.y <= 0) {
    ketThucGame();
  }

  if (cot.length === 0 || (canvas.width - cot[cot.length - 1].x) >= KHOANG_CACH_COT) {
    taoCot();
  }

  for (let i = 0; i < cot.length; i++) {
    const c = cot[i];
    c.x -= TOC_DO_COT;

    if (!c.quaChua && c.x + c.w < nhanVat.x) {
      c.quaChua = true;
      diem += 1;
    }

    const nvRect = { x: nhanVat.x, y: nhanVat.y, w: nvW, h: nvH };
    const margin = 8;

    if (nvRect.x + nvRect.w > c.x && nvRect.x < c.x + c.w) {
      if (nvRect.y < c.caoTren - margin || nvRect.y + nvRect.h > c.caoTren + c.khoangHo + margin) {
        ketThucGame();
      }
    }
  }

  for (let it of items) {
    it.x -= TOC_DO_COT;
    if (
      !it.taken &&
      nhanVat.x < it.x + it.w &&
      nhanVat.x + nvW > it.x &&
      nhanVat.y < it.y + it.h &&
      nhanVat.y + nvH > it.y
    ) {
      diem += 2;
      it.taken = true;
    }
  }

  cot = cot.filter(c => c.x + c.w > 0);
  items = items.filter(it => it.x + it.w > 0);
}

// ---- Vẽ game
function ve(nvW, nvH) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  let goc = Math.min(Math.max(nhanVat.vy * 3, -20), 60);
  ctx.save();
  ctx.translate(nhanVat.x + nvW / 2, nhanVat.y + nvH / 2);
  ctx.rotate((goc * Math.PI) / 180);
  ctx.drawImage(goiMi, -nvW / 2, -nvH / 2, nvW, nvH);
  ctx.restore();

  for (let i = 0; i < cot.length; i++) {
    const c = cot[i];
    veDua(c.x, 0, c.caoTren, c.w);
    const chieuCaoDuoi = canvas.height - (c.caoTren + c.khoangHo);
    veDua(c.x, c.caoTren + c.khoangHo, chieuCaoDuoi, c.w);
  }

  for (let it of items) {
    if (!it.taken) ctx.drawImage(diaMi, it.x, it.y, it.w, it.h);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "24px Arial";
  ctx.fillText("Điểm: " + diem, 12, 32);
}

// ---- Kết thúc
function ketThucGame() {
  if (thua) return;
  thua = true;
  NUT_CHOI_LAI.style.display = "block";

  nhacNen.pause();
  nhacNen.currentTime = 0;
}

// ---- Vòng lặp
function vongLap() {
  const nvW = goiMi.width * TILE_NV;
  const nvH = goiMi.height * TILE_NV;

  capNhat(nvW, nvH);
  ve(nvW, nvH);

  if (!thua) requestAnimationFrame(vongLap);
}

// ---- Start
function batDauGame() {
  nhanVat.y = canvas.height / 2 - (goiMi.height * TILE_NV) / 2;
  nhanVat.vy = 0;
  diem = 0;
  cot = [];
  items = [];
  thua = false;
  NUT_CHOI_LAI.style.display = "none";

  requestAnimationFrame(vongLap);
}
