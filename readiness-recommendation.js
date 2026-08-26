/* SNBT Readiness Check recommendation rules
 * Product principle: <8 sessions should not be framed as a forced private-tutoring package.
 * This helper is intentionally standalone so the recommendation copy can be reused by the UI.
 */
window.SNBT_READINESS_RECOMMENDATION = function(range, noGap) {
  if (noGap || !range || range[1] === 0) {
    return {
      type: 'self-study',
      title: 'Belum perlu tutoring privat',
      summary: 'Mulai dengan belajar mandiri menggunakan Ebook Soal Tutorin dan lakukan baseline TO untuk memvalidasi kemampuan aktual.',
      detail: 'Tidak ada gap yang cukup untuk membenarkan sesi privat. Ebook digunakan untuk latihan terarah; jika baseline TO kemudian menunjukkan gap, gunakan SNBT TO GAP CHECK.',
      ebook: true,
      tutoring: false
    };
  }

  if (range[1] < 8) {
    return {
      type: 'self-study-first',
      title: 'Belajar Mandiri + Ebook Soal Tutorin',
      summary: 'Prioritaskan latihan mandiri menggunakan Ebook Soal Tutorin pada subtest yang menjadi prioritas.',
      detail: 'Karena kebutuhan intervensi masih di bawah 8 sesi, tutoring privat tidak perlu menjadi pilihan utama. Gunakan Ebook untuk latihan terarah, evaluasi kesalahan, lalu pertimbangkan sesi privat bila masih ada kesulitan.',
      ebook: true,
      tutoring: 'optional'
    };
  }

  if (range[0] < 8 && range[1] === 8) {
    return {
      type: 'hybrid',
      title: 'Ebook + Targeted Tutoring',
      summary: 'Gunakan Ebook Soal Tutorin untuk latihan mandiri dan beberapa sesi tutor untuk membahas bottleneck.',
      detail: 'Ebook tetap menjadi bagian dari study plan. Sesi tutor digunakan secara targeted untuk konsep atau pola kesalahan yang sulit diperbaiki secara mandiri.',
      ebook: true,
      tutoring: 'targeted'
    };
  }

  return {
    type: 'tutoring',
    title: 'Targeted Tutoring + Ebook',
    summary: 'Gunakan tutoring terstruktur dengan Ebook Soal Tutorin sebagai latihan di antara sesi.',
    detail: 'Jumlah sesi menunjukkan gap yang sudah cukup jelas. Ebook tetap digunakan untuk deliberate practice dan review kesalahan.',
    ebook: true,
    tutoring: true
  };
};
