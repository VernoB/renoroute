/* app.js — language toggle, price test, form submission. No dependencies. */
(function () {
  'use strict';
  var C = window.RR_CONFIG, I = window.RR_I18N;
  var q = new URLSearchParams(location.search);
  var vars = { appName: C.brand.name, contactEmail: C.contactEmail, legalEntity: C.brand.legalEntity };

  function interp(s) { return String(s).replace(/\{\{(\w+)\}\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; }); }
  function t(key) { var d = I[lang] || I.fr; return interp(d[key] != null ? d[key] : (I.fr[key] || key)); }

  // ---- Language: ?lang= > saved choice > browser > default
  var saved = null; try { saved = localStorage.getItem('rr_lang'); } catch (e) {}
  var nav = (navigator.language || '').toLowerCase();
  var lang = (q.get('lang') === 'en' || q.get('lang') === 'fr') ? q.get('lang')
    : (saved === 'en' || saved === 'fr') ? saved
    : nav.indexOf('fr') === 0 ? 'fr' : nav.indexOf('en') === 0 ? 'en' : C.defaultLocale;

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l === 'fr' ? 'fr-CA' : 'en-CA';
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); el.setAttribute(p[0], t(p[1]));
      });
    });
    document.querySelectorAll('.segmented button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l));
    });
    renderPrice();
    try { localStorage.setItem('rr_lang', l); } catch (e) {}
  }
  document.querySelectorAll('.segmented button').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
  });

  // ---- Price test (?p=49 | ?p=99)
  var price = C.prices.indexOf(q.get('p')) >= 0 ? q.get('p') : C.defaultPrice;
  function fmt(n, kind) {
    var loc = lang === 'fr' ? 'fr-CA' : 'en-CA';
    return kind === 'cad'
      ? new Intl.NumberFormat(loc, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(n)
      : new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(n);
  }
  function renderPrice() {
    document.querySelectorAll('#priceAmt, .priceAmt').forEach(function (el) { el.textContent = fmt(Number(price), 'cad'); });
    // counters: show final formatted values (motion.js animates from 0 when allowed)
    document.querySelectorAll('[data-to]').forEach(function (el) { el.textContent = fmt(Number(el.getAttribute('data-to')), el.getAttribute('data-format')); });
  }
  window.RR = { fmt: fmt, getLang: function () { return lang; } };
  var fp = document.getElementById('f_price'); if (fp) fp.value = price;

  applyLang(lang);

  // ---- FAQ accordion (works without GSAP; motion.js adds easing if loaded)
  document.querySelectorAll('.faq-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', String(!open));
      if (open) { panel.hidden = true; return; }
      panel.hidden = false;
      if (window.gsap && document.documentElement.classList.contains('motion')) {
        window.gsap.fromTo(panel, { height: 0, autoAlpha: 0 }, { height: 'auto', autoAlpha: 1, duration: 0.45, ease: 'power3.out', clearProps: 'height' });
      }
    });
  });

  // ---- Form
  var form = document.getElementById('leadForm');
  if (!form) return;
  var statusBox = document.getElementById('formStatus'), statusText = document.getElementById('formStatusText');
  var btn = document.getElementById('submitBtn');

  function showStatus(kind, key) {
    statusBox.className = 'status show ' + (kind === 'ok' ? 'success' : 'error');
    statusText.setAttribute('data-i18n', key); statusText.innerHTML = t(key);
  }
  function setError(inputId, errId, on) {
    document.getElementById(inputId).setAttribute('aria-invalid', on ? 'true' : 'false');
    document.getElementById(errId).hidden = !on;
  }
  function resolveMode() {
    var f = C.form, m = f.mode;
    if (m !== 'auto') return m;
    if (f.supabaseUrl && f.supabaseAnonKey) return 'supabase';
    if (f.postUrl) return 'post';
    if (C.contactEmail && !/@example\.com$/i.test(C.contactEmail)) return 'mailto';
    return 'none';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    if (fd.get('website')) { showStatus('ok', 'thanks'); return; } // honeypot: silently drop bots
    var email = String(fd.get('email') || '').trim();
    var badEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254;
    var noConsent = !document.getElementById('consent').checked;
    setError('email', 'emailErr', badEmail); setError('consent', 'consentErr', noConsent);
    if (badEmail) { document.getElementById('email').focus(); return; }
    if (noConsent) { document.getElementById('consent').focus(); return; }

    var payload = {
      email: email,
      town: String(fd.get('town') || '').trim().slice(0, 80) || null,
      heat: fd.get('heat') || null,
      intent: fd.get('intent') === 'waitlist' ? 'waitlist' : 'reserve',
      locale: lang,
      price_variant: Number(price),
      utm_source: (q.get('utm_source') || '').slice(0, 100) || null,
      utm_campaign: (q.get('utm_campaign') || '').slice(0, 100) || null,
      utm_content: (q.get('utm_content') || '').slice(0, 100) || null,
      consent_marketing: true,
      consent_text_version: 'landing-2026-10-19',
    };
    var mode = resolveMode();
    if (mode === 'none') { showStatus('err', 'notOpen'); return; }
    if (mode === 'mailto') {
      var body = Object.keys(payload).map(function (k) { return k + ': ' + (payload[k] == null ? '' : payload[k]); }).join('\n');
      location.href = 'mailto:' + C.contactEmail + '?subject=' + encodeURIComponent(C.brand.name + ' — ' + payload.intent + ' ' + price) +
        '&body=' + encodeURIComponent(body);
      showStatus('ok', 'thanksMailto'); return;
    }

    btn.disabled = true; btn.innerHTML = t('sending');
    var req;
    if (mode === 'supabase') {
      req = fetch(C.form.supabaseUrl.replace(/\/$/, '') + '/rest/v1/waitlist', {
        method: 'POST',
        headers: { apikey: C.form.supabaseAnonKey, Authorization: 'Bearer ' + C.form.supabaseAnonKey,
          'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(payload),
      });
    } else {
      var body2 = new URLSearchParams(); Object.keys(payload).forEach(function (k) { if (payload[k] != null) body2.append(k, payload[k]); });
      req = fetch(C.form.postUrl, { method: 'POST', headers: { Accept: 'application/json' }, body: body2 });
    }
    req.then(function (r) {
      // 409 = email already on the list (unique index) -> treat as success, reveal nothing else
      if (r.ok || r.status === 409) {
        showStatus('ok', 'thanks'); form.reset();
        if (typeof C.onLead === 'function') { try { C.onLead({ price: price, lang: lang, intent: payload.intent }); } catch (e) {} }
      } else { showStatus('err', 'errSend'); }
    }).catch(function () { showStatus('err', 'errSend'); })
      .then(function () { btn.disabled = false; btn.innerHTML = t('submit'); });
  });
})();
