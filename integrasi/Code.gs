/**
 * Tutorin — SNBT TO Gap Check Lead Collector
 *
 * 1. Buat Google Sheet baru untuk menyimpan lead.
 * 2. Extensions → Apps Script.
 * 3. Tempel file ini.
 * 4. Jalankan setupSheet() sekali dan izinkan akses.
 * 5. Deploy → New deployment → Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 6. Salin URL /exec ke LEAD_ENDPOINT di gap-plan.html.
 */
const SHEET_NAME = 'SNBT TO Gap Check Leads';

const HEADERS = [
  'timestamp','nama','whatsapp','consent',
  'kampus','jurusan','target_score','avg_to','gap',
  'total_sessions','focus_subtests','scores_json','diagnosis_json','user_agent'
];

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  return `Ready: ${sheet.getName()}`;
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ok:true, service:'tutorin-snbt-gap-check'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (!data.nama || !data.whatsapp || data.consent !== true) {
      return json_({ok:false,error:'Nama, WhatsApp, dan persetujuan wajib diisi.'});
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) { setupSheet(); sheet = ss.getSheetByName(SHEET_NAME); }

    const safeWa = String(data.whatsapp).replace(/[^0-9+]/g, '');
    const row = [
      new Date(), String(data.nama).trim(), safeWa, true,
      String(data.kampus || ''), String(data.jurusan || ''),
      Number(data.target_score || 0), Number(data.avg_to || 0),
      Number(data.gap || 0), Number(data.total_sessions || 0),
      String(data.focus_subtests || ''),
      JSON.stringify(data.scores || {}),
      JSON.stringify(data.diagnosis || {}),
      String(data.user_agent || '')
    ];
    sheet.appendRow(row);
    return json_({ok:true});
  } catch (err) {
    return json_({ok:false,error:String(err)});
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
