# Laporan Ujian — Rekod Murid Lewat

**Tarikh ujian:** 29 Oktober 2026  
**Arahan ujian:** `node --test tests/*.test.js`

## Ringkasan

| Metrik | Keputusan |
|---|---:|
| Jumlah ujian | 13 |
| Lulus | 13 |
| Gagal | 0 |
| Dibatalkan | 0 |
| Dilangkau | 0 |
| Status | **LULUS** |

## Liputan Keperluan

- Masa tepat 07:30:00 tidak dikira lewat.
- Masa selepas 07:30:00 dikira lewat.
- Lewat kali ke-1 hingga ke-2 dikategorikan **Ringan**.
- Lewat kali ke-3 hingga ke-5 dikategorikan **Sederhana**.
- Lewat kali ke-6 hingga ke-8 dikategorikan **Sederhana 2**.
- Lewat kali ke-9 ke atas dikategorikan **Kesalahan Berat**.
- Kiraan lewat mengikut urutan tarikh dan tidak termasuk murid lain.
- Masa format tidak sah tidak dikira lewat.

## Senarai Ujian

1. Masa tepat 07:30 tidak lewat.
2. Satu saat selepas 07:30 lewat.
3. Masa lewat dan format tanpa saat dikenali.
4. Masa sebelum 07:30 tidak lewat.
5. Format masa tidak sah tidak lewat.
6. Lewat kali ke-1 dan ke-2 = Ringan.
7. Lewat kali ke-3 hingga ke-5 = Sederhana.
8. Lewat kali ke-6 hingga ke-8 = Sederhana 2.
9. Lewat kali ke-9 ke atas = Kesalahan Berat.
10. Nilai kiraan tidak sah tidak mempunyai kategori.
11. Kiraan lewat mengikut kronologi.
12. Masa tepat 07:30 tidak membilang sebagai lewat.
13. Rekod murid lain atau data kosong tidak mengubah kiraan.

## Nota

Ujian unit dijalankan terus melalui Node.js kerana dasar eksekusi PowerShell pada peranti ini menyekat arahan `npm.ps1`. Skrip `npm test` dalam `package.json` kekal tersedia, tetapi boleh dijalankan melalui `npm.cmd test` atau `node --test tests/*.test.js`.
