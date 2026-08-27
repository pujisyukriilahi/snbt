# Integrasi Lead — SNBT TO Gap Check

## Tujuan
Menyimpan lead setelah user menyelesaikan SNBT TO Gap Check, minimal:
- nama
- nomor WhatsApp
- persetujuan dihubungi
- timestamp
- target kampus/jurusan
- skor TO per subtest
- rata-rata TO
- target skor
- gap
- rekomendasi jumlah sesi
- subtest fokus

## Arsitektur yang disarankan
GitHub Pages → Google Apps Script Web App → Google Sheets.

Jangan menaruh API key atau credential Google di `gap-plan.html`.

## Langkah setelah backend dibuat
1. Buat Google Sheet untuk lead.
2. Buka Extensions → Apps Script.
3. Salin isi `Code.gs` ke Apps Script.
4. Deploy sebagai Web App dengan akses yang sesuai.
5. Salin URL Web App.
6. Masukkan URL tersebut sebagai `LEAD_ENDPOINT` pada integrasi `gap-plan.html`.

Frontend sebaiknya meminta nama + WhatsApp + persetujuan sebelum mengirim hasil ke endpoint.
