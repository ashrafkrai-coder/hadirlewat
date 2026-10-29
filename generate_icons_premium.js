import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'icons');
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const inside = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) <= r;
const seg = (px, py, ax, ay, bx, by) => {
  const vx = bx - ax, vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
};

function pixel(u, v, maskable) {
  if (!maskable) {
    const x = Math.min(u, 1-u), y = Math.min(v, 1-v);
    if (x < .105 && y < .105 && Math.hypot(.105-x, .105-y) > .105) return [0,0,0,0];
  }
  const scale = maskable ? .78 : 1;
  const x = (u-.5)/scale+.5, y = (v-.5)/scale+.5;
  let col = mix([8,18,42], [16,120,132], Math.max(0, 1-Math.hypot(x-.35,y-.30)*1.65)*.38);
  const teal=[72,211,198], white=[238,250,255];

  const edges = [[.14,.14,.31,.14],[.14,.14,.14,.31],[.86,.14,.69,.14],[.86,.14,.86,.31],[.14,.86,.31,.86],[.14,.86,.14,.69],[.86,.86,.69,.86],[.86,.86,.86,.69]];
  if (edges.some(e => seg(x,y,...e) < .012)) col=mix(teal,white,.45);

  // Simbol kamera premium di tengah bingkai imbasan
  const inCamera = x >= .31 && x <= .65 && y >= .39 && y <= .62;
  const inCameraTop = x >= .39 && x <= .49 && y >= .34 && y <= .405;
  if (inCamera || inCameraTop) {
    col=[238,248,252];
    // sudut badan kamera dan pemegang atas
    if ((y < .41 && x < .34) || (y > .60 && x > .62)) col=[30,76,105];
  }
  if (x >= .34 && x <= .62 && y >= .42 && y <= .44) col=[72,211,198];
  if (inside(x,y,.48,.51,.105)) col=[18,44,68];
  if (inside(x,y,.48,.51,.072)) col=[238,248,252];
  if (inside(x,y,.48,.51,.044)) col=[72,211,198];
  if (inside(x,y,.48,.51,.024)) col=[18,44,68];
  if (inside(x,y,.38,.465,.018)) col=[255,176,64];

  const cx=.765, cy=.315, r=.145;
  if (inside(x,y,cx,cy,r+.012)) col=[255,255,255];
  if (inside(x,y,cx,cy,r)) col=[255,176,64];
  if (inside(x,y,cx,cy,r-.018)) col=[248,250,252];
  if (seg(x,y,cx,cy,cx,cy-.074)<.012 || seg(x,y,cx,cy,cx+.047,cy+.026)<.012 || inside(x,y,cx,cy,.016)) col=[18,44,68];
  return [...col,255];
}

function render(size, maskable) {
  const rows=[];
  for(let py=0; py<size; py++) {
    const row=[];
    for(let px=0; px<size; px++) {
      const rgba=pixel((px+.5)/size,(py+.5)/size,maskable);
      row.push(rgba[0],rgba[1],rgba[2],rgba[3]);
    }
    rows.push(Buffer.from([0,...row]));
  }
  return Buffer.concat(rows);
}

function crc32(buf) {
  let c=-1;
  for(const byte of buf) { c ^= byte; for(let i=0;i<8;i++) c=(c>>>1)^((c&1)?0xedb88320:0); }
  return (c^-1)>>>0;
}
function chunk(type,data) {
  const len=Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeBuffer=Buffer.from(type); const crc=Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer,data])));
  return Buffer.concat([len,typeBuffer,data,crc]);
}
function png(size, data) {
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(size,0); ihdr.writeUInt32BE(size,4); ihdr[8]=8; ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(data,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
mkdirSync(out,{recursive:true});
for(const [name,size,maskable] of [['icon-192.png',192,false],['icon-512.png',512,false],['icon-maskable-512.png',512,true],['apple-touch-icon.png',180,true]]) {
  writeFileSync(join(out,name),png(size,render(size,maskable)));
  console.log('Dijana:',join(out,name));
}
