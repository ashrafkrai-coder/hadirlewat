#!/usr/bin/env python3
"""Penjana ikon premium PWA Hadir Lewat: wajah, imbasan dan jam lewat."""
import math, os, struct, zlib

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")

def mix(a, b, t): return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))
def dist_seg(px, py, ax, ay, bx, by):
    vx, vy = bx-ax, by-ay
    t = max(0, min(1, ((px-ax)*vx + (py-ay)*vy)/(vx*vx + vy*vy)))
    return math.hypot(px-(ax+t*vx), py-(ay+t*vy))
def inside_circle(x,y,cx,cy,r): return math.hypot(x-cx,y-cy) <= r

def sample(u,v,maskable=False):
    if not maskable:
        x=min(u,1-u); y=min(v,1-v)
        if x < .105 and y < .105 and math.hypot(.105-x,.105-y) > .105: return 0,0,0,0

    scale=.78 if maskable else 1
    x=(u-.5)/scale+.5; y=(v-.5)/scale+.5
    # Latar biru navy premium dengan cahaya lembut
    c1=(8,18,42); c2=(12,58,92); c3=(16,120,132)
    radial=max(0,min(1,1-math.hypot(x-.35,y-.30)*1.65))
    col=mix(c1,c3,radial*.38)
    rim=min(1,max(0,math.hypot(x-.5,y-.5)*2))
    col=mix(col,c2,0.22*(1-rim))

    # Bingkai pengimbasan dengan empat sudut
    white=(238,250,255)
    teal=(72,211,198)
    border=.14; inner=.31
    width=.012
    for px1,py1,px2,py2 in [
      (border,border,inner,border),(border,border,border,inner),
      (1-border,border,1-inner,border),(1-border,border,1-border,inner),
      (border,1-border,inner,1-border),(border,1-border,border,1-inner),
      (1-border,1-border,1-inner,1-border),(1-border,1-border,1-border,1-inner)]:
        d=dist_seg(x,y,px1,py1,px2,py2)
        if d < width: col=mix(teal,white,.45)

    # Simbol kamera premium di tengah bingkai imbasan
    in_camera = .31 <= x <= .65 and .39 <= y <= .62
    in_camera_top = .39 <= x <= .49 and .34 <= y <= .405
    if in_camera or in_camera_top:
        col=(238,248,252)
        if (y < .41 and x < .34) or (y > .60 and x > .62):
            col=(30,76,105)
    if .34 <= x <= .62 and .42 <= y <= .44:
        col=(72,211,198)
    if inside_circle(x,y,.48,.51,.105): col=(18,44,68)
    if inside_circle(x,y,.48,.51,.072): col=(238,248,252)
    if inside_circle(x,y,.48,.51,.044): col=(72,211,198)
    if inside_circle(x,y,.48,.51,.024): col=(18,44,68)
    if inside_circle(x,y,.38,.465,.018): col=(255,176,64)

    # Jam lewat premium di sudut kanan atas
    cx,cy,r=.765,.315,.145
    if inside_circle(x,y,cx,cy,r+.012): col=(255,255,255)
    if inside_circle(x,y,cx,cy,r): col=(255,176,64)
    if inside_circle(x,y,cx,cy,r-.018): col=(248,250,252)
    # jarum jam
    if dist_seg(x,y,cx,cy,cx,cy-.074)<.012: col=(18,44,68)
    if dist_seg(x,y,cx,cy,cx+.047,cy+.026)<.012: col=(18,44,68)
    # titik tengah
    if inside_circle(x,y,cx,cy,.016): col=(18,44,68)

    return int(col[0]),int(col[1]),int(col[2]),255

def render(size,maskable=False,ss=2):
    rows=[]
    for py in range(size):
        row=bytearray()
        for px in range(size):
            acc=[0,0,0,0]
            for sy in range(ss):
                for sx in range(ss):
                    rgba=sample((px+(sx+.5)/ss)/size,(py+(sy+.5)/ss)/size,maskable)
                    for i in range(4): acc[i]+=rgba[i]*rgba[3]/255
            n=ss*ss; row += bytes((int(acc[0]/n),int(acc[1]/n),int(acc[2]/n),int(acc[3]/n)))
        rows.append(bytes(row))
    return rows

def write_png(path,size,rows):
    raw=b''.join(b'\0'+r for r in rows)
    def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
    os.makedirs(os.path.dirname(path),exist_ok=True)
    with open(path,'wb') as f:f.write(png)
    print('Dijana:',path)

def main():
    for name,size,maskable in [('icon-192.png',192,False),('icon-512.png',512,False),('icon-maskable-512.png',512,True),('apple-touch-icon.png',180,True)]:
        write_png(os.path.join(OUT_DIR,name),size,render(size,maskable))
if __name__=='__main__':main()
