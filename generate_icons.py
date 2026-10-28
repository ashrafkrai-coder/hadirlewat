#!/usr/bin/env python3
"""Jana ikon PWA Hadir Wajah (muka + tanda semak) tanpa kebergantungan luar.

Guna:  python3 generate_icons.py
Hasil: icons/icon-192.png, icons/icon-512.png,
       icons/icon-maskable-512.png, icons/apple-touch-icon.png
"""
import math
import os
import struct
import zlib

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")


def lerp(a, b, t):
    return a + (b - a) * t


def sample(u, v, maskable):
    """Warna (r,g,b,a) pada koordinat ternormal u,v dalam [0,1]."""
    # Latar belakang gradien
    t = (u + v) / 2
    bg = (lerp(15, 108, t), lerp(18, 80, t), lerp(40, 255, t))

    # Penuh kanvas untuk maskable; sudut bulat untuk ikon biasa
    if not maskable:
        r = 0.22
        x = min(u, 1 - u)
        y = min(v, 1 - v)
        if x < r and y < r:
            if math.hypot(r - x, r - y) > r:
                return (0, 0, 0, 0)

    scale = 0.78 if maskable else 1.0  # zon selamat untuk maskable
    cx, cy = 0.5, 0.5
    du = (u - cx) / scale
    dv = (v - cy) / scale

    col = bg

    # Muka
    face_r = 0.36
    d = math.hypot(du, dv)
    if d < face_r:
        col = (255, 214, 102)
        # Kilauan lembut
        if d > face_r - 0.02:
            col = (240, 190, 80)

        # Mata
        for ex in (-0.13, 0.13):
            if math.hypot((du - ex) / 0.045, (dv + 0.07) / 0.065) < 1:
                col = (30, 30, 50)

        # Senyuman (lengkok)
        sx, sy = du, dv - 0.02
        rr = math.hypot(sx, sy)
        if 0.17 < rr < 0.215 and sy > 0.04 and abs(sx) < 0.2:
            col = (30, 30, 50)

    # Lencana tanda semak (hijau) di sudut kanan bawah
    bx, by, br = 0.30, 0.30, 0.19
    db = math.hypot(du - bx, dv - by)
    if db < br:
        col = (34, 197, 120)
        if db > br - 0.012:
            col = (255, 255, 255)
        # Tanda semak: dua tembereng garis
        def seg(px, py, ax, ay, cx_, cy_):
            vx, vy = cx_ - ax, cy_ - ay
            t = max(0, min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)))
            return math.hypot(px - (ax + t * vx), py - (ay + t * vy))
        if min(seg(du, dv, bx - 0.09, by + 0.0, bx - 0.03, by + 0.07),
               seg(du, dv, bx - 0.03, by + 0.07, bx + 0.10, by - 0.07)) < 0.022:
            col = (255, 255, 255)

    # Cincin imbasan di sekeliling muka
    ring = abs(d - 0.43)
    if ring < 0.008 and d > face_r:
        col = (56, 225, 194)

    return (col[0], col[1], col[2], 255)


def render(size, maskable=False, ss=2):
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    u = (px + (sx + 0.5) / ss) / size
                    v = (py + (sy + 0.5) / ss) / size
                    r, g, b, a = sample(u, v, maskable)
                    acc[0] += r * a
                    acc[1] += g * a
                    acc[2] += b * a
                    acc[3] += a
            n = ss * ss
            if acc[3] == 0:
                row += bytes((0, 0, 0, 0))
            else:
                row += bytes(
                    (
                        int(acc[0] / acc[3]),
                        int(acc[1] / acc[3]),
                        int(acc[2] / acc[3]),
                        int(acc[3] / n),
                    )
                )
        rows.append(bytes(row))
    return rows


def write_png(path, size, rows):
    raw = b"".join(b"\x00" + r for r in rows)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    print("Dijana:", path)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    jobs = [
        ("icon-192.png", 192, False),
        ("icon-512.png", 512, False),
        ("icon-maskable-512.png", 512, True),
        ("apple-touch-icon.png", 180, True),  # iOS membulatkan sendiri, jadi penuh
    ]
    for name, size, maskable in jobs:
        write_png(os.path.join(OUT_DIR, name), size, render(size, maskable))


if __name__ == "__main__":
    main()
