/* Tutorin — Lead capture for SNBT TO Gap Check
 * Set the endpoint to the deployed Google Apps Script Web App /exec URL.
 */
(function () {
  const LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwrG0PhrkT-efxX29yb_nxuGFSx9pR1z5UlWMW17jUYLDCj-J5FLfb2UrYqCSyrRmhO2Q/exec';
  let submitted = false;
  let sending = false;

  const $ = (id) => document.getElementById(id);
  const checked = (id) => Number($('d_' + id)?.value || 0);

  function addStyles() {
    if ($('leadCaptureStyles')) return;
    const s = document.createElement('style');
    s.id = 'leadCaptureStyles';
    s.textContent = `
      #leadCapture{background:#f8fbf9;border:1px solid #d9e7df;border-radius:16px;padding:18px;margin:18px 0}
      #leadCapture h3{margin:0 0 6px;color:#07583f}
      #leadCapture p{margin:0 0 14px;color:#64766e;font-size:12px;line-height:1.5}
      #leadCapture .leadGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      #leadCapture input{width:100%;padding:11px;border:1px solid #d3e1d9;border-radius:9px;font:inherit;box-sizing:border-box}
      #leadCapture .leadFull{grid-column:1/-1}
      #leadCapture .consent{display:flex;gap:8px;align-items:flex-start;font-size:11px;color:#64766e;line-height:1.4;margin-top:10px}
      #leadCapture .consent input{width:auto;margin-top:2px}
      #leadCapture button{border:0;border-radius:10px;padding:12px 17px;background:#07583f;color:#fff;font-weight:900;cursor:pointer;margin-top:12px}
      #leadCapture .leadMsg{font-size:11px;margin-top:9px}
      @media(max-width:600px){#leadCapture .leadGrid{grid-template-columns:1fr}.leadFull{grid-column:auto!important}}
    `;
    document.head.appendChild(s);
  }

  function findTargetSection() {
    return Array.from(document.querySelectorAll('main .card')).find((section) =>
      section.querySelector('h2')?.textContent.trim() === '1. Target & Nilai TO'
    );
  }

  function findDiagnosisSection() {
    return Array.from(document.querySelectorAll('main .card')).find((section) =>
      section.querySelector('h2')?.textContent.trim() === '2. Diagnosis TO Terakhir'
    );
  }

  function addForm() {
    if ($('leadCapture')) return;
    const main = document.querySelector('main.wrap');
    const targetSection = findTargetSection();
    if (!main || !targetSection) return;

    const box = document.createElement('section');
    box.id = 'leadCapture';
    box.className = 'card';
    box.innerHTML = `
      <h3>Mulai TO Gap Check</h3>
      <p>Isi data berikut untuk melanjutkan ke Target & Nilai TO.</p>
      <div class="leadGrid">
        <div><input id="leadName" type="text" maxlength="100" placeholder="Nama lengkap"></div>
        <div><input id="leadWa" type="tel" maxlength="20" inputmode="tel" placeholder="Nomor WhatsApp (08xx / 628xx)"></div>
        <label class="consent leadFull"><input id="leadConsent" type="checkbox"> <span>Saya bersedia dihubungi Tutorin</span></label>
      </div>
      <button id="leadSubmit" type="button">Mulai TO Gap Check</button>
      <div class="leadMsg" id="leadMsg"></div>
    `;
    main.insertBefore(box, targetSection);
    $('leadSubmit').addEventListener('click', submitLead);
  }

  function buildPayload() {
    const scores = {};
    Object.keys(window.SUB || {}).forEach((id) => {
      scores[id] = Number($('v_' + id)?.value || 0);
    });
    const diagnosis = {};
    Object.keys(window.SUB || {}).forEach((id) => {
      diagnosis[id] = { materi: checked(id + '_0'), strategi: checked(id + '_1'), kecepatan: checked(id + '_2') };
    });
    const target = $('target')?.value || '';
    const targetParts = target.split(' · ');
    return {
      nama: $('leadName').value.trim(),
      whatsapp: normalizeWa($('leadWa').value),
      consent: $('leadConsent').checked,
      kampus: targetParts[0] || '',
      jurusan: targetParts[1] || target,
      target_score: Number((window.selected && window.selected()?.baseline) || 0),
      avg_to: Number($('avg')?.textContent || 0),
      gap: Number($('gap')?.textContent || 0),
      total_sessions: parseInt(($('total')?.textContent || '0').replace(/\D/g, ''), 10) || 0,
      focus_subtests: Array.from(document.querySelectorAll('#rows tr')).slice(0, 3).map(tr => tr.cells[0]?.textContent.trim()).filter(Boolean).join(', '),
      scores,
      diagnosis,
      user_agent: navigator.userAgent
    };
  }

  function normalizeWa(v) {
    let x = String(v || '').replace(/[^0-9+]/g, '');
    if (x.indexOf('+62') === 0) x = '62' + x.slice(3);
    else if (x.indexOf('08') === 0) x = '62' + x.slice(1);
    return x;
  }

  function setGate(locked) {
    const targetSection = findTargetSection();
    const diagnosisSection = findDiagnosisSection();
    if (targetSection) targetSection.style.display = locked ? 'none' : '';
    if (diagnosisSection) diagnosisSection.style.display = locked ? 'none' : '';
  }

  async function submitLead() {
    if (submitted || sending) return;
    const name = $('leadName').value.trim();
    const wa = normalizeWa($('leadWa').value);
    const consent = $('leadConsent').checked;
    const msg = $('leadMsg');
    if (name.length < 2) { msg.textContent = 'Mohon isi nama lengkap.'; return; }
    if (!/^62[0-9]{8,15}$/.test(wa)) { msg.textContent = 'Nomor WhatsApp belum valid. Gunakan 08xx atau 628xx.'; return; }
    if (!consent) { msg.textContent = 'Centang persetujuan agar dapat melanjutkan.'; return; }

    const btn = $('leadSubmit');
    sending = true;
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
    msg.textContent = '';

    const payload = buildPayload();
    payload.whatsapp = wa;
    try {
      await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      submitted = true;
      localStorage.setItem('tutorin_snbt_gap_lead', JSON.stringify({ nama: name, whatsapp: wa, savedAt: new Date().toISOString() }));
      const lead = $('leadCapture');
      if (lead) lead.remove();
      setGate(false);
    } catch (e) {
      msg.textContent = 'Data belum dapat dikirim. Silakan coba lagi.';
      btn.disabled = false;
      btn.textContent = 'Mulai TO Gap Check';
    } finally {
      sending = false;
    }
  }

  function init() {
    addStyles();
    addForm();
    setGate(!submitted);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
