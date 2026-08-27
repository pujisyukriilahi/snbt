/* Tutorin — Lead capture for SNBT Readiness Check
 * Collects the lead before the assessment is revealed.
 */
(function () {
  const LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwrG0PhrkT-efxX29yb_nxuGFSx9pR1z5UlWMW17jUYLDCj-J5FLfb2UrYqCSyrRmhO2Q/exec';
  let submitted = false;
  let sending = false;

  const $ = (id) => document.getElementById(id);

  function addStyles() {
    if ($('readinessLeadStyles')) return;
    const s = document.createElement('style');
    s.id = 'readinessLeadStyles';
    s.textContent = `
      #readinessLead{background:#f8fbf9;border:1px solid #d9e7df;border-radius:16px;padding:18px;margin:18px 0}
      #readinessLead h3{margin:0 0 6px;color:#07583f}
      #readinessLead p{margin:0 0 14px;color:#64766e;font-size:12px;line-height:1.5}
      #readinessLead .leadGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      #readinessLead input[type="text"],#readinessLead input[type="tel"]{width:100%;padding:11px;border:1px solid #d3e1d9;border-radius:9px;font:inherit;box-sizing:border-box}
      #readinessLead .leadFull{grid-column:1/-1}
      #readinessLead .consent{display:flex;gap:8px;align-items:flex-start;font-size:11px;color:#64766e;line-height:1.4;margin-top:10px}
      #readinessLead .consent input{margin-top:2px}
      #readinessLead button{border:0;border-radius:10px;padding:12px 17px;background:#07583f;color:#fff;font-weight:900;cursor:pointer;margin-top:12px}
      #readinessLead button:disabled{opacity:.65;cursor:not-allowed}
      #readinessLead .leadMsg{font-size:11px;margin-top:9px;color:#b42318}
      @media(max-width:600px){#readinessLead .leadGrid{grid-template-columns:1fr}#readinessLead .leadFull{grid-column:auto!important}}
    `;
    document.head.appendChild(s);
  }

  function findAssessmentSections() {
    const main = document.querySelector('main.wrap');
    if (!main) return [];
    return Array.from(main.children).filter((el) =>
      el.matches('section.card') && (
        el.querySelector('h2')?.textContent.trim() === '1. Kondisi & Target' ||
        el.querySelector('h2')?.textContent.trim() === '2. Kesiapan Belajar'
      )
    );
  }

  function addForm() {
    if ($('readinessLead')) return;
    const main = document.querySelector('main.wrap');
    const firstAssessment = findAssessmentSections()[0];
    if (!main || !firstAssessment) return;

    const box = document.createElement('section');
    box.id = 'readinessLead';
    box.className = 'card';
    box.innerHTML = `
      <h3>Mulai SNBT Readiness Check</h3>
      <p>Isi data berikut terlebih dahulu untuk melanjutkan ke assessment.</p>
      <div class="leadGrid">
        <div><input id="readinessLeadName" type="text" maxlength="100" placeholder="Nama"></div>
        <div><input id="readinessLeadWa" type="tel" maxlength="20" inputmode="tel" placeholder="WhatsApp (08xx / 628xx)"></div>
        <label class="consent leadFull"><input id="readinessLeadConsent" type="checkbox"> <span>Saya bersedia dihubungi Tutorin</span></label>
      </div>
      <button id="readinessLeadSubmit" type="button">Mulai SNBT Readiness Check</button>
      <div class="leadMsg" id="readinessLeadMsg"></div>
    `;
    main.insertBefore(box, firstAssessment);
    $('readinessLeadSubmit').addEventListener('click', submitLead);
  }

  function normalizeWa(value) {
    let x = String(value || '').replace(/[^0-9+]/g, '');
    if (x.indexOf('+62') === 0) x = '62' + x.slice(3);
    else if (x.indexOf('08') === 0) x = '62' + x.slice(1);
    return x;
  }

  function setGate(locked) {
    findAssessmentSections().forEach((section) => {
      section.style.display = locked ? 'none' : '';
      section.setAttribute('aria-hidden', locked ? 'true' : 'false');
    });
  }

  async function submitLead() {
    if (submitted || sending) return;

    const name = $('readinessLeadName').value.trim();
    const wa = normalizeWa($('readinessLeadWa').value);
    const consent = $('readinessLeadConsent').checked;
    const msg = $('readinessLeadMsg');

    if (name.length < 2) { msg.textContent = 'Mohon isi nama.'; return; }
    if (!/^62[0-9]{8,15}$/.test(wa)) { msg.textContent = 'Nomor WhatsApp belum valid. Gunakan 08xx atau 628xx.'; return; }
    if (!consent) { msg.textContent = 'Centang persetujuan agar dapat melanjutkan.'; return; }

    const btn = $('readinessLeadSubmit');
    sending = true;
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';
    msg.textContent = '';

    try {
      await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          nama: name,
          whatsapp: wa,
          consent,
          form: 'SNBT READINESS CHECK'
        })
      });

      submitted = true;
      localStorage.setItem('tutorin_snbt_readiness_lead', JSON.stringify({ nama: name, whatsapp: wa, savedAt: new Date().toISOString() }));
      const lead = $('readinessLead');
      if (lead) lead.remove();
      setGate(false);
    } catch (e) {
      msg.textContent = 'Data belum dapat dikirim. Silakan coba lagi.';
      btn.disabled = false;
      btn.textContent = 'Mulai SNBT Readiness Check';
    } finally {
      sending = false;
    }
  }

  function init() {
    addStyles();
    addForm();
    setGate(!submitted);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
