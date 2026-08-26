# Database Estimasi Skor SNBT

Folder ini menjadi sumber data terpusat untuk baseline **SNBT TO Gap Check**.

## Struktur

Setiap kampus memiliki file data sendiri:

- `itb.json`
- `ui.json`
- `ugm.json`
- `ipb.json`
- `unpad.json`
- dan kampus lain yang akan ditambahkan.

## Format data

```json
{
  "kampus": "ITB",
  "tahun": 2027,
  "sumber": "Estimasi Skor SNBT Tutorin",
  "program_studi": [
    {
      "kode": "STEI-K",
      "nama": "Sekolah Teknik Elektro dan Informatika - Komputasi",
      "fakultas": "STEI",
      "baseline": 765
    }
  ]
}
```

`baseline` adalah **Estimasi Skor Kompetitif** yang dipakai engine untuk menghitung gap. Nilai baseline tidak ditampilkan pada dropdown user.

## Prinsip pengelolaan

1. Tambah/update data cukup pada file kampus terkait.
2. Jangan menaruh database skor langsung di `gap-plan.html` jika memungkinkan.
3. `gap-plan.html` nantinya membaca seluruh database dari folder ini.
4. Saat tahun estimasi berubah, buat versi tahun baru atau update field `tahun` dan `sumber` secara jelas.
5. Data harus memiliki sumber dan tanggal/periode pembaruan agar mudah diaudit.

Folder ini disiapkan agar tahap berikutnya dapat dibuat **database loader otomatis**, sehingga penambahan kampus tidak membutuhkan perubahan logic utama TO GAP Check.
