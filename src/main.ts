import '@fontsource/young-serif/latin-400.css';
import '@fontsource/instrument-sans/latin-400.css';
import '@fontsource/instrument-sans/latin-500.css';
import '@fontsource/instrument-sans/latin-600.css';
import '@fontsource/instrument-sans/latin-700.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './style.css';
import { gsap } from 'gsap';
import { CLINIC as C, CONCERNS, CONSULTS, FAQ } from './config';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- clinic details ---------- */
document.querySelectorAll<HTMLElement>('[data-c]').forEach((el) => {
  const v = (C as unknown as Record<string, unknown>)[el.dataset.c!];
  if (v != null) el.textContent = String(v);
});
($('#maps-link') as HTMLAnchorElement).href = C.maps;
$('#yr').textContent = String(new Date().getFullYear());

// IST clock, so "open now" is right wherever the page is opened.
const ist = () => { const d = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000); return d; };
(() => {
  const d = ist(), m = d.getHours() * 60 + d.getMinutes(), day = d.getDay();
  const open = day !== 0 && ((m >= 600 && m < 810) || (m >= 1050 && m < 1230));
  $('#open-now').textContent = day === 0 ? '· Online consults today' : open ? '· Open now' : m < 1050 && m >= 810 ? '· Opens 5:30 pm' : '· Book for the next slot';
  $('#hours').innerHTML = C.hours.map((h, i) => `<tr class="${(day === 0) === (i === C.hours.length - 1) ? 'today' : ''}"><td>${esc(h.days)}</td><td>${esc(h.time)}</td></tr>`).join('');
})();

/* ---------- globules drifting behind the hero ---------- */
(() => {
  const cv = $('#globules') as HTMLCanvasElement, ctx = cv.getContext('2d')!;
  const cols = ['#f2a516', '#37b27a', '#0f2a22', '#ffffff'];
  let W = 0, H = 0, dots: { x: number; y: number; r: number; vx: number; vy: number; c: string; a: number }[] = [];
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2), b = cv.getBoundingClientRect();
    W = b.width; H = b.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(26, W / 50));
    dots = Array.from({ length: n }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, r: 4 + Math.random() * (i % 5 === 0 ? 16 : 8), vx: (Math.random() - .5) * .25, vy: -.1 - Math.random() * .3, c: cols[i % cols.length], a: .18 + Math.random() * .3 }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.y < -30) { d.y = H + 30; d.x = Math.random() * W; }
      if (d.x < -30) d.x = W + 30; if (d.x > W + 30) d.x = -30;
      const g = ctx.createRadialGradient(d.x - d.r * .35, d.y - d.r * .35, d.r * .1, d.x, d.y, d.r);
      g.addColorStop(0, '#ffffff'); g.addColorStop(1, d.c);
      ctx.globalAlpha = d.c === '#ffffff' ? .7 : d.a; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      if (d.c === '#ffffff') { ctx.globalAlpha = .25; ctx.strokeStyle = '#0f2a22'; ctx.lineWidth = 1; ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(draw);
  };
  size(); draw(); addEventListener('resize', size);
})();

/* ---------- case-taking card: ticks off each question, then shows the remedy ---------- */
(() => {
  const card = $('.case'), items = [...document.querySelectorAll<HTMLLIElement>('#case-list li')], res = $('#case-result'), min = $('#case-min');
  if (reduce) { items.forEach((li) => li.classList.add('done')); res.classList.add('show'); min.textContent = '45'; return; }
  card.classList.add('running');
  let i = 0;
  const step = () => {
    items.forEach((li, k) => { li.classList.toggle('done', k < i); li.classList.toggle('now', k === i); });
    min.textContent = String(Math.min(45, Math.round((i / items.length) * 45))).padStart(2, '0');
    res.classList.toggle('show', i >= items.length);
    if (i >= items.length) { gsap.fromTo(res, { scale: .94 }, { scale: 1, duration: .6, ease: 'back.out(2)' }); setTimeout(() => { i = 0; step(); }, 4200); return; }
    i++; setTimeout(step, 900);
  };
  setTimeout(step, 1200);
})();

/* ---------- hero entrance ---------- */
if (!reduce) {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.hero-title .line', { yPercent: 60, opacity: 0, duration: 1.1, stagger: .12 })
    .from('.hero-title .swash', { scale: 0, duration: .6, ease: 'back.out(3)' }, '-=.5')
    .from(['.hero-sub', '.hero-ctas', '.hero-facts'], { y: 20, opacity: 0, duration: .8, stagger: .08 }, '-=.6')
    .from('.case', { y: 40, rotate: 2, opacity: 0, duration: 1.1 }, '-=1.1');
}

/* ---------- marquee ---------- */
(() => {
  const words = CONCERNS.flatMap((c) => c.items.slice(0, 2));
  const html = words.map((w) => `<span>${esc(w)}</span>`).join('');
  $('#marquee').innerHTML = html + html;
})();

/* ---------- concern explorer ---------- */
(() => {
  const tabs = $('#concern-tabs'), card = $('#concern-card');
  tabs.innerHTML = CONCERNS.map((c, i) => `<button class="concern-tab" role="tab" id="tab-${c.id}" aria-selected="${i === 0}" data-id="${c.id}"><span class="g">${c.glyph}</span>${esc(c.label)}</button>`).join('');
  const show = (id: string) => {
    const c = CONCERNS.find((x) => x.id === id)!;
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.id === id)));
    card.innerHTML = `<div class="anim" style="display:flex;flex-direction:column;gap:22px">
      <p class="eyebrow">Often seen at the clinic</p>
      <h3 class="cc-title">${esc(c.label)}</h3>
      <ul class="cc-items">${c.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <div class="cc-meta"><p>${esc(c.approach)}</p><div class="cc-follow"><span>Follow-ups</span><b>${esc(c.follow)}</b></div></div>
      <div class="cc-actions"><a class="btn btn-saffron" href="#book" data-book="${c.id}">Book for ${esc(c.label.toLowerCase())}</a></div>
    </div>`;
  };
  tabs.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest('button'); if (b) show(b.dataset.id!); });
  card.addEventListener('click', (e) => { const a = (e.target as HTMLElement).closest<HTMLElement>('[data-book]'); if (a) ($('#f-area') as HTMLSelectElement).value = a.dataset.book!; });
  show(CONCERNS[0].id);
})();

/* ---------- consultations ---------- */
$('#consult-grid').innerHTML = CONSULTS.map((c) => `<article class="consult reveal"><span class="k">${esc(c.k)}</span><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p></article>`).join('');

/* ---------- faq ---------- */
$('#faq').innerHTML = FAQ.map((f, i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');

/* ---------- booking ---------- */
(() => {
  const form = $('#book-form') as HTMLFormElement, daysEl = $('#days'), slotsEl = $('#slots');
  const area = $('#f-area') as HTMLSelectElement;
  area.innerHTML = CONCERNS.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('') + '<option value="other">Something else</option>';
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = ist(); today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 10 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
  let day = -1, slot = '';
  const mode = () => (form.querySelector('input[name=mode]:checked') as HTMLInputElement).value;
  const times = (d: Date) => {
    if (d.getDay() === 0) return mode() === 'Online video' ? [['Online', ['11:00', '11:30', '12:00', '12:30']]] as const : [];
    return [['Morning', ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '1:00']], ['Evening', ['5:30', '6:00', '6:30', '7:00', '7:30', '8:00']]] as const;
  };
  const fmt = (t: string, g: string) => { const h = parseInt(t); return `${t} ${g !== 'Evening' && h >= 9 && h < 12 ? 'am' : 'pm'}`; };
  // Same pseudo-random "booked" slots each time, so the demo looks lived-in.
  const taken = (d: Date, t: string) => ((d.getDate() * 7 + t.length * 13 + parseInt(t)) % 5) === 0;
  const renderDays = () => {
    daysEl.innerHTML = days.map((d, i) => `<button type="button" class="day" data-i="${i}" aria-pressed="${i === day}" ${times(d).length ? '' : 'disabled'}><small>${i === 0 ? 'Today' : DOW[d.getDay()]}</small><b>${d.getDate()}</b><small>${d.toLocaleString('en-IN', { month: 'short' })}</small></button>`).join('');
  };
  const renderSlots = () => {
    if (day < 0) { slotsEl.innerHTML = '<p class="slot-group">Pick a day first</p>'; return; }
    const d = days[day], now = ist(), nowMin = now.getHours() * 60 + now.getMinutes();
    slotsEl.innerHTML = times(d).map(([g, ts]) => `<p class="slot-group">${g}</p>` + ts.map((t) => {
      const label = fmt(t, g); const [h, m] = t.split(':').map(Number); const h24 = label.endsWith('pm') && h !== 12 ? h + 12 : h;
      const past = day === 0 && h24 * 60 + m <= nowMin + 60;
      const off = past || taken(d, t);
      return `<button type="button" class="slot" data-t="${label}" aria-pressed="${slot === label}" ${off ? 'disabled' : ''}>${label}</button>`;
    }).join('')).join('');
  };
  const pickFirst = () => { day = days.findIndex((d, i) => times(d).length && (i > 0 || ist().getHours() < 19)); renderDays(); renderSlots(); };
  daysEl.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.day'); if (!b || b.disabled) return; day = +b.dataset.i!; slot = ''; renderDays(); renderSlots(); });
  slotsEl.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.slot'); if (!b || b.disabled) return; slot = b.dataset.t!; renderSlots(); });
  form.addEventListener('change', (e) => { if ((e.target as HTMLInputElement).name === 'mode') { if (day >= 0 && !times(days[day]).length) day = -1; slot = ''; renderDays(); renderSlots(); } });
  const phone = $('#f-phone') as HTMLInputElement;
  phone.addEventListener('input', () => { const d = phone.value.replace(/\D/g, '').slice(0, 10); phone.value = d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('#form-error'), pv = $('#preview');
    const name = ($('#f-name') as HTMLInputElement).value.trim(), mob = phone.value.replace(/\D/g, '');
    const problem = !slot ? 'Choose a day and a time.' : !name ? 'Enter the patient’s name.' : !/^[6-9]\d{9}$/.test(mob) ? 'Enter a 10-digit mobile number.' : '';
    err.hidden = !problem; err.textContent = problem; if (problem) return;
    const d = days[day];
    const concern = area.options[area.selectedIndex].text, note = ($('#f-note') as HTMLTextAreaElement).value.trim();
    const msg = `Hello ${C.dr}, I'd like to book an appointment.\n\nName: ${name}\nMobile: ${mob}\nType: ${mode()} · ${($('#f-visit') as HTMLSelectElement).value}\nWhen: ${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}, ${slot}\nConcern: ${concern}${note ? `\nNote: ${note}` : ''}`;
    if (C.phone) { window.open(`https://wa.me/91${C.phone}?text=${encodeURIComponent(msg)}`, '_blank'); return; }
    pv.hidden = false;
    pv.innerHTML = `<p class="pv-head">✓ This is what the clinic receives on WhatsApp</p><div class="bubble">${esc(msg)}</div><p class="pv-note">On the live site this opens WhatsApp with the message ready, sent to the clinic’s number.</p>`;
    pv.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  });
  pickFirst();
})();

/* ---------- reveal on scroll, nav border, mobile button ---------- */
(() => {
  document.querySelectorAll('.section-head, .journey li, .doc-card, .concern-wrap, .book-form, .visit-card, .faq').forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  const nav = $('#nav'); addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });
  const mb = $('#m-book'), bk = $('#book');
  new IntersectionObserver(([e]) => mb.classList.toggle('hide', e.isIntersecting), { threshold: .1 }).observe(bk);
})();
