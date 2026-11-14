/* =====================================================================
   EL CLAN · Landing de captación · main.js
   Sin dependencias. Todo vanilla JS.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURACIÓN · edita aquí antes de publicar
     ------------------------------------------------------------------ */
  const CONFIG = {
    // Número de WhatsApp en formato internacional sin "+", ej: '51987654321'
    whatsappNumber: '51999999999',
    whatsappMessage: 'Hola El Clan 👋 Quiero información para adquirir mi auto nuevo sin cuota inicial.',
    // Endpoint para recibir los leads (Formspree, Getform, tu backend, etc.).
    // Si se deja vacío, el formulario abre WhatsApp con los datos ya escritos.
    formEndpoint: '',
    // Tipo de cambio referencial para mostrar la cuota en soles
    tipoCambio: 3.72,
    // Plan 80 meses: cuota mensual = valor del certificado × factor
    cuotaFactor: 0.0147125,
    // Inscripción única: 4% + IGV
    inscripcionFactor: 0.0472,
    plazoMeses: 80
  };
  window.ELCLAN_CONFIG = CONFIG;

  /* ------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------ */
  const doc = document.documentElement;
  doc.classList.add('js');

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmtUSD = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = n => Math.round(n).toLocaleString('en-US');
  const waBase = 'https://wa.me/' + String(CONFIG.whatsappNumber).replace(/\D/g, '');
  const waLink = msg => waBase + '?text=' + encodeURIComponent(msg);
  const run = (name, fn) => { try { fn(); } catch (e) { console.warn('[El Clan] módulo "' + name + '" falló:', e); } };

  /* ------------------------------------------------------------------
     Enlaces de WhatsApp
     ------------------------------------------------------------------ */
  run('whatsapp', () => {
    $$('[data-wa]').forEach(a => {
      if (a.hasAttribute('data-wa-sim')) return;
      a.href = waLink(CONFIG.whatsappMessage);
      a.target = '_blank';
      a.rel = 'noopener';
    });
  });

  /* ------------------------------------------------------------------
     Split de palabras para el titular (animación letra a letra)
     ------------------------------------------------------------------ */
  run('split', () => {
    $$('[data-split]').forEach(el => {
      let i = 0;
      const walk = node => {
        Array.prototype.slice.call(node.childNodes).forEach(child => {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span'); w.className = 'w';
              const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part;
              wi.style.setProperty('--i', i++);
              w.appendChild(wi); frag.appendChild(w);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && child.tagName !== 'BR') {
            walk(child);
          }
        });
      };
      walk(el);
    });
  });

  /* ------------------------------------------------------------------
     Preloader → dispara la entrada del hero
     ------------------------------------------------------------------ */
  run('preloader', () => {
    const pre = $('#preloader');
    const hero = $('#inicio');
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      if (pre) pre.classList.add('done');
      if (hero) hero.classList.add('is-in');
      document.body.classList.remove('is-loading');
      setTimeout(() => pre && pre.parentNode && pre.parentNode.removeChild(pre), 900);
    };
    document.body.classList.add('is-loading');
    if (document.readyState === 'complete') setTimeout(finish, 900);
    else window.addEventListener('load', () => setTimeout(finish, 650));
    setTimeout(finish, 2800); // red de seguridad
  });

  /* ------------------------------------------------------------------
     Navegación: scroll, barra de progreso, link activo, menú móvil
     ------------------------------------------------------------------ */
  run('nav', () => {
    const nav = $('#nav');
    const toggle = $('#menuToggle');
    const mnav = $('#mnav');
    const progress = $('#scrollProgress');
    const links = $$('.nav-links a[href^="#"], .mnav a[href^="#"]');
    const sections = $$('main section[id]');
    let open = false;

    const setOpen = v => {
      open = v;
      if (mnav) mnav.classList.toggle('open', v);
      if (toggle) { toggle.classList.toggle('open', v); toggle.setAttribute('aria-expanded', String(v)); toggle.setAttribute('aria-label', v ? 'Cerrar menú' : 'Abrir menú'); }
      document.body.classList.toggle('menu-open', v);
    };
    if (toggle) toggle.addEventListener('click', () => setOpen(!open));
    if (mnav) $$('a', mnav).forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) setOpen(false); });

    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle('is-scrolled', y > 24);
      const max = doc.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
      let current = '';
      const line = window.innerHeight * 0.45;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) current = sections[i].id;
      }
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  });

  /* ------------------------------------------------------------------
     Cursor personalizado (solo escritorio)
     ------------------------------------------------------------------ */
  run('cursor', () => {
    if (!finePointer || reduced) return;
    const dot = $('#cursor'), ring = $('#cursorRing');
    if (!dot || !ring) return;
    doc.classList.add('has-cursor');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, shown = false;
    const hoverSel = 'a, button, [role="button"], input[type="range"], .tilt, .veh, label.check, summary';

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; dot.style.opacity = '1'; ring.style.opacity = '1'; }
    }, { passive: true });
    document.addEventListener('mouseleave', () => { shown = false; dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseover', e => { if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add('is-hover'); });
    document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest(hoverSel)) ring.classList.remove('is-hover'); });

    (function loop() {
      rx = lerp(rx, mx, .18); ry = lerp(ry, my, .18);
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
  });

  /* ------------------------------------------------------------------
     Hero: partículas, parallax con mouse y con scroll
     ------------------------------------------------------------------ */
  run('hero', () => {
    const hero = $('#inicio');
    if (!hero) return;
    const canvas = $('#particles');
    const glow = $('.hero-glow', hero);
    const bg = $('.hero-bg img', hero);

    if (finePointer && !reduced) {
      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        if (glow) glow.style.transform = 'translate(' + (x * 90) + 'px,' + (y * 90) + 'px)';
        if (bg) { bg.style.setProperty('--px', (x * -16) + 'px'); bg.style.setProperty('--py', (y * -10) + 'px'); }
      }, { passive: true });
    }

    if (!reduced) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return; ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const y = window.scrollY || window.pageYOffset;
          if (bg && y < window.innerHeight * 1.2) bg.style.setProperty('--sy', (y * .22) + 'px');
        });
      }, { passive: true });
    }

    if (canvas && !reduced) {
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = 0, h = 0, parts = [], raf = 0, active = true;

      const resize = () => {
        w = canvas.width = Math.floor(hero.offsetWidth * dpr);
        h = canvas.height = Math.floor(hero.offsetHeight * dpr);
        canvas.style.width = hero.offsetWidth + 'px';
        canvas.style.height = hero.offsetHeight + 'px';
      };
      const make = () => {
        const n = Math.round(clamp(hero.offsetWidth / 16, 36, 110));
        parts = [];
        for (let i = 0; i < n; i++) {
          parts.push({
            x: Math.random() * w, y: Math.random() * h,
            r: (Math.random() * 1.5 + .5) * dpr,
            vx: (Math.random() - .5) * .18 * dpr,
            vy: (-Math.random() * .28 - .08) * dpr,
            a: Math.random() * Math.PI * 2,
            red: Math.random() < .32
          });
        }
      };
      const draw = () => {
        if (!active) return;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          p.x += p.vx; p.y += p.vy; p.a += .025;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
          const o = .3 + Math.sin(p.a) * .28;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.red ? 'rgba(255,70,80,' + o + ')' : 'rgba(255,255,255,' + (o * .75) + ')';
          ctx.fill();
        }
        raf = requestAnimationFrame(draw);
      };
      resize(); make(); draw();
      let rt;
      window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); make(); }, 150); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          const vis = entries[0].isIntersecting;
          if (vis && !active) { active = true; draw(); }
          else if (!vis && active) { active = false; cancelAnimationFrame(raf); }
        }).observe(hero);
      }
    }
  });

  /* ------------------------------------------------------------------
     Reveal al hacer scroll (con escalonado automático entre hermanos)
     ------------------------------------------------------------------ */
  run('reveal', () => {
    const els = $$('[data-reveal]');
    if (!els.length) return;
    els.forEach(el => {
      if (el.style.getPropertyValue('--i')) return;
      const sib = Array.prototype.filter.call(el.parentElement.children, c => c.hasAttribute('data-reveal'));
      if (sib.length > 1) el.style.setProperty('--i', sib.indexOf(el));
    });
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  });

  /* ------------------------------------------------------------------
     Contadores animados
     ------------------------------------------------------------------ */
  run('counters', () => {
    const els = $$('[data-count]');
    if (!els.length) return;
    const render = (el, v, dec) => { el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: !el.hasAttribute('data-plain') }); };
    const animate = el => {
      const to = parseFloat(el.getAttribute('data-count'));
      const from = parseFloat(el.getAttribute('data-from') || '0');
      const dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      if (reduced) { render(el, to, dec); return; }
      const dur = 2000, t0 = performance.now();
      const step = now => {
        const p = clamp((now - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 4);
        render(el, from + (to - from) * e, dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(animate); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
    }, { threshold: .5 });
    els.forEach(el => io.observe(el));
  });

  /* ------------------------------------------------------------------
     Tilt 3D + foco de luz que sigue al mouse (.tilt y .spot)
     ------------------------------------------------------------------ */
  run('tilt', () => {
    if (!finePointer || reduced) return;
    $$('.tilt, .spot').forEach(card => {
      const isTilt = card.classList.contains('tilt');
      let raf = 0;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        if (!isTilt) return;
        const rx = ((y / r.height) - .5) * -7;
        const ry = ((x / r.width) - .5) * 9;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
        });
      }, { passive: true });
      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        if (isTilt) card.style.transform = '';
      });
    });
  });

  /* ------------------------------------------------------------------
     Botones magnéticos
     ------------------------------------------------------------------ */
  run('magnetic', () => {
    if (!finePointer || reduced) return;
    $$('.btn-primary, .btn-wa, .nav-wa').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transition = 'transform .15s ease-out, box-shadow .4s, filter .3s';
        btn.style.transform = 'translate(' + (x * .22) + 'px,' + (y * .3) + 'px)';
      }, { passive: true });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1), box-shadow .4s, filter .3s';
        btn.style.transform = '';
      });
    });
  });

  /* ------------------------------------------------------------------
     Línea de progreso de "Cómo funciona"
     ------------------------------------------------------------------ */
  run('steps', () => {
    const steps = $('#steps');
    if (!steps) return;
    const fill = $('.steps-fill', steps);
    const items = $$('.step', steps);
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = steps.getBoundingClientRect();
      const vh = window.innerHeight;
      // p = 0 cuando el bloque entra por el 85% del viewport; p = 1 cuando su base llega al 55%
      const start = vh * .85, end = vh * .55;
      const total = Math.max(1, r.height + (start - end));
      const p = clamp((start - r.top) / total, 0, 1);
      if (fill) fill.style.setProperty('--p', p);
      items.forEach((it, i) => it.classList.toggle('active', p >= (i / items.length) + .04));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  });

  /* ------------------------------------------------------------------
     Simulador de cuota
     ------------------------------------------------------------------ */
  run('simulador', () => {
    const range = $('#simRange');
    if (!range) return;
    const out = { value: $('#simValue'), cuota: $('#simCuota'), soles: $('#simSoles'), insc: $('#simInsc'), primer: $('#simPrimer'), tc: $('#simTC') };
    const chips = $$('.sim-chips button');
    const cta = $('#simCta');
    const waSim = $('[data-wa-sim]');
    const certSelect = $('#certificado');
    const state = { cuota: 0, insc: 0, primer: 0, soles: 0 };
    let raf = 0;

    if (out.tc) out.tc.textContent = CONFIG.tipoCambio.toFixed(2);

    const render = () => {
      if (out.cuota) out.cuota.textContent = fmtUSD(state.cuota);
      if (out.soles) out.soles.textContent = fmtUSD(state.soles);
      if (out.insc) out.insc.textContent = fmtUSD(state.insc);
      if (out.primer) out.primer.textContent = fmtUSD(state.primer);
    };
    const tween = target => {
      cancelAnimationFrame(raf);
      const from = Object.assign({}, state);
      const t0 = performance.now(), dur = 550;
      const step = now => {
        const p = clamp((now - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 3);
        for (const k in target) state[k] = from[k] + (target[k] - from[k]) * e;
        render();
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const update = animate => {
      const v = Number(range.value);
      const min = Number(range.min), max = Number(range.max);
      range.style.setProperty('--p', ((v - min) / (max - min) * 100) + '%');
      range.setAttribute('aria-valuetext', 'US$ ' + fmtInt(v));
      if (out.value) out.value.textContent = fmtInt(v);

      const cuota = v * CONFIG.cuotaFactor;
      const insc = v * CONFIG.inscripcionFactor;
      const target = { cuota: cuota, insc: insc, primer: cuota + insc, soles: cuota * CONFIG.tipoCambio };
      if (animate && !reduced) tween(target); else { Object.assign(state, target); render(); }

      chips.forEach(c => c.classList.toggle('active', Number(c.getAttribute('data-v')) === v));
      if (waSim) {
        waSim.href = waLink('Hola El Clan 👋 Simulé un certificado de US$ ' + fmtInt(v) + ' con una cuota mensual de US$ ' + fmtUSD(cuota) + ' a ' + CONFIG.plazoMeses + ' meses. Quiero más información.');
        waSim.target = '_blank'; waSim.rel = 'noopener';
      }
    };

    range.addEventListener('input', () => update(true));
    chips.forEach(c => c.addEventListener('click', () => { range.value = c.getAttribute('data-v'); update(true); }));
    if (cta) cta.addEventListener('click', () => { if (certSelect) certSelect.value = range.value; });
    update(false);
  });

  /* ------------------------------------------------------------------
     Tarjetas de vehículos → preseleccionan el tipo en el formulario
     ------------------------------------------------------------------ */
  run('vehiculos', () => {
    const sel = $('#vehiculo');
    if (!sel) return;
    $$('[data-vehiculo]').forEach(a => a.addEventListener('click', () => { sel.value = a.getAttribute('data-vehiculo'); }));
  });

  /* ------------------------------------------------------------------
     FAQ acordeón
     ------------------------------------------------------------------ */
  run('faq', () => {
    const items = $$('.faq-item');
    if (!items.length) return;
    const setOpen = (item, v) => { item.classList.toggle('open', v); const q = $('.faq-q', item); if (q) q.setAttribute('aria-expanded', String(v)); };
    items.forEach(item => {
      const q = $('.faq-q', item);
      if (!q) return;
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => setOpen(i, false));
        if (!isOpen) setOpen(item, true);
      });
    });
    setOpen(items[0], true);
  });

  /* ------------------------------------------------------------------
     Formulario de leads
     ------------------------------------------------------------------ */
  run('form', () => {
    const form = $('#leadForm');
    if (!form) return;
    const btn = $('#submitBtn');
    const success = $('#formSuccess');
    const successWa = $('#successWa');
    const errorBox = $('#formError');

    const validators = {
      nombres: v => v.trim().length >= 2 || 'Ingresa tu nombre',
      apellidos: v => v.trim().length >= 2 || 'Ingresa tus apellidos',
      celular: v => /^9\d{8}$/.test(v.replace(/\D/g, '')) || 'Ingresa un celular válido de 9 dígitos',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Ingresa un correo válido',
      ciudad: v => !!v || 'Selecciona tu ciudad',
      vehiculo: v => !!v || 'Selecciona el tipo de vehículo',
      certificado: v => !!v || 'Selecciona un valor de certificado',
      acepto: (v, el) => el.checked || 'Debes autorizar el tratamiento de tus datos'
    };

    const fieldOf = el => el.closest('.field');
    const validate = name => {
      const el = form.elements[name];
      if (!el) return true;
      const res = validators[name](el.value || '', el);
      const ok = res === true;
      const field = fieldOf(el);
      if (field) {
        field.classList.toggle('invalid', !ok);
        const err = $('.err', field);
        if (err) err.textContent = ok ? '' : res;
      }
      return ok;
    };

    Object.keys(validators).forEach(name => {
      const el = form.elements[name];
      if (!el) return;
      const evt = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'blur';
      el.addEventListener(evt, () => validate(name));
      el.addEventListener('input', () => { const f = fieldOf(el); if (f && f.classList.contains('invalid')) validate(name); });
    });

    const buildMsg = d => {
      const lines = [
        'Hola El Clan 👋 Quiero una cotización para mi auto nuevo.',
        '',
        '• Nombre: ' + d.nombres + ' ' + d.apellidos,
        '• Celular: ' + d.celular,
        '• Correo: ' + d.email,
        '• Ciudad: ' + d.ciudad,
        '• Vehículo: ' + d.vehiculo,
        '• Certificado: US$ ' + fmtInt(Number(d.certificado))
      ];
      if (d.comentario && d.comentario.trim()) lines.push('• Comentario: ' + d.comentario.trim());
      return lines.join('\n');
    };

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // honeypot
      if (errorBox) errorBox.hidden = true;

      const results = Object.keys(validators).map(validate);
      if (results.indexOf(false) !== -1) {
        const first = $('.invalid', form);
        if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); const inp = first.querySelector('input,select,textarea'); if (inp) setTimeout(() => inp.focus({ preventScroll: true }), 400); }
        return;
      }

      const data = {};
      new FormData(form).forEach((v, k) => { data[k] = typeof v === 'string' ? v.trim() : v; });
      delete data.website;
      data.celular = data.celular.replace(/\D/g, '');
      const msg = buildMsg(data);
      const href = waLink(msg);

      const showSuccess = () => {
        form.hidden = true;
        if (success) { success.hidden = false; success.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        if (successWa) successWa.href = href;
      };

      if (!CONFIG.formEndpoint) {
        // Sin backend: abrimos WhatsApp con el mensaje armado (dentro del gesto del usuario)
        window.open(href, '_blank', 'noopener');
        showSuccess();
        return;
      }

      if (btn) { btn.classList.add('loading'); btn.disabled = true; }
      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.assign({}, data, { origen: 'landing-elclan', fecha: new Date().toISOString(), pagina: location.href }))
      })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); showSuccess(); })
        .catch(err => { console.warn('[El Clan] envío falló:', err); if (errorBox) errorBox.hidden = false; })
        .then(() => { if (btn) { btn.classList.remove('loading'); btn.disabled = false; } });
    });
  });

  /* ------------------------------------------------------------------
     Parallax del banner
     ------------------------------------------------------------------ */
  run('parallax', () => {
    if (reduced) return;
    const els = $$('[data-parallax]');
    if (!els.length) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      els.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
        el.style.transform = 'translate3d(0,' + (p * -90) + 'px,0)';
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  });

  /* ------------------------------------------------------------------
     WhatsApp flotante + año en footer
     ------------------------------------------------------------------ */
  run('wafloat', () => {
    const f = $('#waFloat');
    if (!f) return;
    setTimeout(() => f.classList.add('show'), 1800);
    setTimeout(() => { f.classList.add('tip'); setTimeout(() => f.classList.remove('tip'), 4500); }, 5200);
  });
  run('year', () => { const y = $('#year'); if (y) y.textContent = String(new Date().getFullYear()); });
})();
