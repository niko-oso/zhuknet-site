(function(){
  var DATA = {
    flat:  { name:'Безлимитный', foot:'Для многоквартирных домов. Абонентская плата списывается 1-го числа месяца. Реальный IP-адрес — 200 ₽/мес.',
             plans:[{s:100,p:600},{s:200,p:850,n:'При технической возможности'},{s:300,p:1050,n:'При технической возможности'}] },
    house: { name:'Дачный', foot:'Для частного сектора. Абонентская плата списывается 1-го числа месяца. Реальный IP-адрес — 200 ₽/мес.',
             plans:[{s:100,p:750},{s:200,p:950},{s:300,p:1200},{s:500,p:1600}] },
    daily: { name:'На каждый день', foot:'Абонентская плата списывается ежедневно — удобно, если не хотите платить за месяц вперёд.',
             plans:[{s:60,p:650,n:'Списание ежедневно'}] }
  };
  var MAX = 500;
  var plansEl = document.getElementById('plans');
  var footEl = document.getElementById('plans-foot');
  var planSel = document.getElementById('c-plan');

  function render(key){
    var d = DATA[key];
    var featuredIdx = d.plans.length > 1 ? 1 : -1;
    plansEl.style.setProperty('--cols', Math.min(d.plans.length, 4) === 1 ? 2 : d.plans.length);
    plansEl.dataset.plans = d.plans.length;
    plansEl.innerHTML = d.plans.map(function(p,i){
      var f = i === featuredIdx;
      var high = p.s > 100;
      return '<article class="plan'+(f?' featured':'')+'">' +
        '<div class="plan-top"><div><div class="plan-name">«'+d.name+'»</div><div class="plan-speed">до <span class="count" data-to="'+p.s+'">'+p.s+'</span>&nbsp;Мбит/&#8288;с</div></div>' +
        '</div>' +
        '<div class="meter" aria-hidden="true"><div class="meter-track"><div class="meter-fill" data-w="'+(p.s/MAX*100)+'%"></div></div><div class="meter-scale"><span>0</span><span>500 Мбит/с</span></div></div>' +
        '<div class="plan-price"><b class="count" data-to="'+p.p+'">'+p.p.toLocaleString('ru-RU')+'</b><span>₽ / мес</span></div>' +
        '<p class="plan-note">'+(p.n||'Подключение бесплатно')+'</p>' +
        '<button class="btn '+(f?'btn-blue':'btn-white')+'" type="button" data-open="'+(high?'speed':'connect')+'" data-plan="'+d.name+', до '+p.s+' Мбит/с">Подключить</button>' +
      '</article>';
    }).join('');
    footEl.textContent = d.foot + ' Тарифы для физических лиц.';
    countUp(plansEl);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      plansEl.querySelectorAll('.meter-fill').forEach(function(m){ m.style.setProperty('--w', m.dataset.w); });
    });});
  }

  // список тарифов в форме подключения
  Object.keys(DATA).forEach(function(k){
    DATA[k].plans.forEach(function(p){
      var o = document.createElement('option');
      o.textContent = DATA[k].name + ', до ' + p.s + ' Мбит/с — ' + p.p + ' ₽/мес';
      o.value = DATA[k].name + ', до ' + p.s + ' Мбит/с';
      planSel.appendChild(o);
    });
  });

  document.querySelectorAll('.tab').forEach(function(t){
    t.addEventListener('click', function(){
      document.querySelectorAll('.tab').forEach(function(x){ x.setAttribute('aria-selected', x===t ? 'true':'false'); });
      render(t.dataset.tab);
    });
  });
  // Анимация цифр в тарифах: запускается, когда блок попадает в экран, и при смене вкладки
  var seen = false;
  var noMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fmt(n){ return n.toLocaleString('ru-RU'); }
  function countUp(root){
    if (noMotion) return;
    var els = root.querySelectorAll('.count');
    if (!seen) return; // до первого показа держим реальные цифры, чтобы никто не увидел «0 ₽»
    els.forEach(function(el, i){
      var to = +el.dataset.to, start = null, dur = 1300, delay = i * 60;
      el.textContent = '0';
      setTimeout(function(){
        requestAnimationFrame(function step(ts){
          if (!start) start = ts;
          var k = Math.min((ts - start) / dur, 1);
          el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 4))));
          if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
        });
      }, delay);
    });
  }
  render('flat');
  // Кнопка «наверх»: появляется после прокрутки
  (function(){
    var b = document.querySelector('.to-top'); if (!b) return;
    function upd(){ b.classList.toggle('show', window.scrollY > 600); }
    window.addEventListener('scroll', upd, {passive:true}); upd();
    b.addEventListener('click', function(){ window.scrollTo({top:0, behavior: noMotion ? 'auto' : 'smooth'}); });
  })();
  // Подарок в «Акциях» открывается, пока блок на экране
  (function(){
    var g = document.querySelector('.gx');
    if (!g || noMotion) return;
    if (!('IntersectionObserver' in window)){ g.classList.add('play'); return; }
    new IntersectionObserver(function(en){ g.classList.toggle('play', en[0].isIntersecting); }, {threshold: 0.4}).observe(g);
  })();
  // Анимация шагов «Как подключиться» при появлении блока
  (function(){
    var s = document.querySelector('.steps');
    if (!s || noMotion || !('IntersectionObserver' in window)) return;
    s.classList.add('anim');
    var ob = new IntersectionObserver(function(en){
      if (!en[0].isIntersecting) return; ob.disconnect();
      requestAnimationFrame(function(){ s.classList.add('in'); });
    }, {threshold: 0.35});
    ob.observe(s);
  })();
  // Анимация большой цифры «20» при появлении блока
  (function(){
    var el = document.querySelector('.big-num');
    if (!el || noMotion || !('IntersectionObserver' in window)) return;
    var to = +el.dataset.to; el.textContent = '0';
    var ob = new IntersectionObserver(function(en){
      if (!en[0].isIntersecting) return; ob.disconnect();
      var start = null, dur = 1600;
      requestAnimationFrame(function step(ts){
        if (!start) start = ts;
        var k = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4)));
        if (k < 1) requestAnimationFrame(step);
      });
    }, {threshold: 0.4});
    ob.observe(el);
  })();
  if (!noMotion && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      if (entries[0].isIntersecting){ seen = true; countUp(plansEl); io.disconnect(); }
    }, {threshold: 0, rootMargin: '0px 0px -30% 0px'}); // процентный порог не срабатывает на высоких блоках и низких экранах
    io.observe(plansEl);
  } else { seen = true; plansEl.querySelectorAll('.count').forEach(function(el){ el.textContent = fmt(+el.dataset.to); }); }

  // Меню: выпадающие разделы и мобильное меню
  (function(){
    var header = document.querySelector('.header'), nav = document.getElementById('site-nav'), burger = document.querySelector('.burger');
    if (!header || !nav) return;
    var mobile = matchMedia('(max-width:1080px)');
    function closeSubs(except){
      nav.querySelectorAll('.has-sub.open').forEach(function(li){
        if (li === except) return;
        li.classList.remove('open'); li.querySelector('.nav-trigger').setAttribute('aria-expanded','false');
      });
    }
    function setMenu(on){
      header.classList.toggle('menu-open', on);
      document.body.classList.toggle('menu-lock', on);
      if (burger){ burger.setAttribute('aria-expanded', on ? 'true' : 'false'); burger.setAttribute('aria-label', on ? 'Закрыть меню' : 'Открыть меню'); }
      if (on) header.style.setProperty('--hb', Math.round(header.getBoundingClientRect().bottom) + 'px'); else closeSubs();
    }
    nav.querySelectorAll('.nav-trigger').forEach(function(t){
      t.addEventListener('click', function(){
        var li = t.parentElement, on = !li.classList.contains('open');
        if (!mobile.matches) closeSubs(li);
        li.classList.toggle('open', on); t.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    });
    if (burger) burger.addEventListener('click', function(){ setMenu(!header.classList.contains('menu-open')); });
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', function(e){ if (!mobile.matches && !e.target.closest('.has-sub')) closeSubs(); });
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Escape') return;
      if (header.classList.contains('menu-open')){ setMenu(false); burger.focus(); } else closeSubs();
    });
    mobile.addEventListener('change', function(){ setMenu(false); });
  })();

  // Пошаговая форма (онлайн-договор): показываем шаг n, остальные прячем
  function goStep(f, n){
    var steps = f.querySelectorAll('.fstep');
    steps.forEach(function(s, i){ s.hidden = i !== n; });
    f.querySelectorAll('.fsteps li').forEach(function(li, i){
      li.classList.toggle('on', i <= n);
      if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    f.dataset.step = n;
  }
  function curStep(f){ return +(f.dataset.step || 0); }

  // попапы
  function open(id, opts){
    var d = document.getElementById('dlg-'+id);
    var f = d.querySelector('form'); if (f) f.classList.remove('sent');
    if (f && f.hasAttribute('data-steps')) goStep(f, 0);
    if (opts && opts.plan && id==='connect') planSel.value = opts.plan;
    if (opts && opts.plan && id==='speed') {
      var sp = d.querySelector('#s-speed');
      var m = opts.plan.match(/до (\d+)/); if (m) [].forEach.call(sp.options, function(o){ if (o.text.indexOf('до '+m[1]+' ')===0) sp.value=o.value; });
    }
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open','');
  }
  document.addEventListener('click', function(e){
    var o = e.target.closest('[data-open]');
    if (o){
      var od = o.closest('dialog'); if (od) od.close(); // переход из попапа в попап — без наложения
      open(o.dataset.open, {plan:o.dataset.plan}); return;
    }
    var c = e.target.closest('[data-close]');
    if (c){ c.closest('dialog').close(); return; }
    var s = e.target.closest('[data-sum]');
    if (s){ document.getElementById('p-sum').value = s.dataset.sum; return; }
    if (e.target.tagName === 'DIALOG') e.target.close(); // клик по фону
  });
  document.querySelectorAll('dialog form').forEach(function(f){
    var stepped = f.hasAttribute('data-steps');
    f.addEventListener('submit', function(e){
      e.preventDefault();
      // в пошаговой форме проверяем только видимый шаг
      var scope = stepped ? f.querySelectorAll('.fstep')[curStep(f)] : f;
      var bad = [].filter.call(scope.querySelectorAll('input,select,textarea'), function(i){
        if (i.disabled || i.closest('[hidden]')) return false;
        if (i.type === 'checkbox') return i.required && !i.checked;
        var v = i.value.trim();
        if (!v) return i.required;
        return i.pattern && !new RegExp('^(?:' + i.pattern + ')$').test(v);
      });
      f.querySelectorAll('input,select,textarea').forEach(function(i){ i.style.borderColor=''; });
      if (bad.length){ bad.forEach(function(i){ i.style.borderColor='#D93636'; }); bad[0].focus(); return; }
      if (stepped && curStep(f) < f.querySelectorAll('.fstep').length - 1){
        goStep(f, curStep(f) + 1);
        var first = f.querySelectorAll('.fstep')[curStep(f)].querySelector('input:not([type=checkbox])');
        if (first) first.focus();
        return;
      }
      f.classList.add('sent'); // здесь — отправка в CRM заказчика
    });
    if (stepped) f.addEventListener('click', function(e){
      if (e.target.closest('[data-step-back]')) goStep(f, Math.max(curStep(f) - 1, 0));
    });
  });

  // Онлайн-договор: квартира не нужна для частного дома, адрес регистрации — только если отличается
  (function(){
    var type = document.getElementById('c-type'), flatF = document.getElementById('c-flat-f');
    var same = document.getElementById('c-same'), regF = document.getElementById('c-reg-f');
    if (!type || !same) return;
    function syncFlat(){
      var house = type.value === 'Частный дом';
      flatF.hidden = house; flatF.querySelector('input').required = !house;
    }
    function syncReg(){ regF.hidden = same.checked; regF.querySelector('input').required = !same.checked; }
    type.addEventListener('change', syncFlat); same.addEventListener('change', syncReg);
    syncFlat(); syncReg();
  })();

  // Маски: даты ДД.ММ.ГГГГ и только цифры (серия, номер паспорта)
  document.querySelectorAll('[data-mask]').forEach(function(i){
    i.addEventListener('input', function(){
      var d = i.value.replace(/\D/g, '');
      if (i.dataset.mask === 'date'){
        d = d.slice(0, 8);
        i.value = d.length > 4 ? d.slice(0,2)+'.'+d.slice(2,4)+'.'+d.slice(4) : d.length > 2 ? d.slice(0,2)+'.'+d.slice(2) : d;
      } else i.value = d;
    });
  });

  // Новости: новые — сверху массива. dt — дата для <time>, s — анонс на карточке, b — полный текст в попапе
  var NEWS = [
    {dt:'2026-06-11', d:'11 июня 2026', t:'График работы в День России', s:'Абонентский отдел и техподдержка в праздничные дни работают по особому графику.', b:'Уважаемые абоненты! Абонентский отдел Zhukovsky.Net в праздничные дни работает по следующему графику:\n12 июня — выходной.\n13 июня — с 09:00 до 15:00.\nС 14 июня — по обычному графику.\n\nТехническая поддержка:\n12 июня — с 09:00 до 18:00.\n13 июня — с 09:00 до 20:00.\nС 14 июня — по обычному графику.'},
    {dt:'2026-05-27', d:'27 мая 2026', t:'Обновление тарифных планов', s:'С 1 июля 2026 года проводится индексация базовых тарифов для физических лиц.', b:'Уважаемые абоненты!\nОператор связи ZHUKNET (ООО «Телесервис») уведомляет, что с 1 июля 2026 года для физических лиц проводится индексация всех базовых тарифных планов на интернет-услуги, включая действующие и архивные.\n\nАктуальные тарифы — в разделе «Тарифы».'},
    {dt:'2026-04-29', d:'29 апреля 2026', t:'Работа в майские праздники', s:'График абонентского отдела и техподдержки с 30 апреля по 11 мая.', b:'Абонентский отдел:\n30 апреля — с 09:00 до 16:00.\n1 мая — выходной.\n2–7 мая — по рабочему графику.\n8 мая — с 09:00 до 16:00.\n9–10 мая — выходные.\n11 мая — с 09:00 до 16:00.\nС 12 мая — по рабочему графику.\n\nТехническая поддержка:\n30 апреля — с 09:00 до 20:00.\n1 мая — с 09:00 до 18:00.\n2–8 мая — по рабочему графику.\n9 мая — с 09:00 до 18:00.\n10–11 мая — с 09:00 до 20:00.\nС 12 мая — по рабочему графику.'},
    {dt:'2026-03-05', d:'5 марта 2026', t:'График работы на 8 Марта', s:'Как работают абонентский отдел и техподдержка с 7 по 9 марта.', b:'Абонентский отдел:\n7 марта — с 10:00 до 15:00.\n8 марта — выходной.\n9 марта — с 10:00 до 15:00.\nС 10 марта — по обычному графику.\n\nТехническая поддержка:\n8 марта — с 09:00 до 18:00.\n9 марта — с 09:00 до 20:00.\nС 10 марта — по обычному графику.'},
    {dt:'2026-02-20', d:'20 февраля 2026', t:'График работы на 23 февраля', s:'Изменения в работе абонентского отдела и техподдержки 21 и 23 февраля.', b:'Абонентский отдел:\n21 февраля — с 10:00 до 16:00.\n23 февраля — выходной.\nС 24 февраля — по обычному графику.\n\nТехническая поддержка:\n23 февраля — с 09:00 до 18:00.\nС 24 февраля — по обычному графику.'},
    {dt:'2025-12-29', d:'29 декабря 2025', t:'Новогодние праздники 2026', s:'График абонентского отдела и техподдержки с 30 декабря по 11 января.', b:'Абонентский отдел:\n30 декабря — с 09:00 до 15:00.\n31 декабря — с 10:00 до 15:00.\n1 января — выходной.\n2–3 января — с 10:00 до 15:00.\n4 января — выходной.\n5–6 января — с 10:00 до 15:00.\n7 января — выходной.\n8–10 января — с 10:00 до 15:00.\nС 12 января — по рабочему графику.\n\nТехническая поддержка:\n31 декабря — с 10:00 до 15:00.\n1 января — с 10:00 до 18:00.\n2–6 января — с 10:00 до 20:00.\n7 января — с 10:00 до 18:00.\n8–11 января — с 10:00 до 20:00.\nС 12 января — по рабочему графику.'}
  ];
  var track = document.getElementById('news-track'), newsIdx = 0;
  function esc(s){ return s.replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  if (track){
    track.innerHTML = NEWS.map(function(n, i){
      return '<button class="news-card'+(i===0?' lead-news':'')+'" type="button" data-news="'+i+'"><time datetime="'+n.dt+'">'+n.d+'</time><b>'+esc(n.t)+'</b><p>'+esc(n.s)+'</p><span class="more">Читать</span></button>';
    }).join('');
  }
  function showNews(i){
    newsIdx = i; var n = NEWS[i];
    document.getElementById('n-date').textContent = n.d;
    document.getElementById('t-news').textContent = n.t;
    // текст делим на абзацы; график из двух частей (отдел + техподдержка) ставим в две колонки
    var body = document.getElementById('n-body'), parts = n.b.split('\n\n');
    body.textContent = '';
    parts.forEach(function(t){ var p = document.createElement('p'); p.textContent = t; body.appendChild(p); });
    body.classList.toggle('two', parts.length === 2 && parts.every(function(t){ return t.split('\n').length >= 3; }));
    document.querySelectorAll('[data-news-step]').forEach(function(b){
      var j = i + +b.dataset.newsStep; b.disabled = j < 0 || j >= NEWS.length;
    });
  }
  document.addEventListener('click', function(e){
    var card = e.target.closest('[data-news]');
    if (card){ showNews(+card.dataset.news); document.getElementById('dlg-news').showModal(); return; }
    var st = e.target.closest('[data-news-step]');
    if (st && !st.disabled){
      showNews(newsIdx + +st.dataset.newsStep);
      var c = track && track.children[newsIdx];
      if (c) track.scrollLeft = c.offsetLeft - track.firstElementChild.offsetLeft; // лента под попапом едет за новостью
    }
  });
  // Слайдер новостей: стрелки листают на одну карточку, на телефоне — свайп
  (function(){
    if (!track) return;
    var btns = document.querySelectorAll('[data-sl]');
    function upd(){
      var max = track.scrollWidth - track.clientWidth - 2;
      btns.forEach(function(b){ b.disabled = +b.dataset.sl < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max; });
    }
    btns.forEach(function(b){
      b.addEventListener('click', function(){
        var card = track.firstElementChild; if (!card) return;
        var step = card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
        track.scrollBy({left: +b.dataset.sl * step, behavior: noMotion ? 'auto' : 'smooth'});
      });
    });
    track.addEventListener('scroll', upd, {passive:true});
    window.addEventListener('resize', upd);
    upd();
  })();

  // счётчик скорости на первом экране
  var cnt = document.querySelector('[data-count]');
  if (cnt && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    var target = +cnt.dataset.count, t0 = null;
    cnt.textContent = '0';
    setTimeout(function(){
      requestAnimationFrame(function step(ts){
        if (!t0) t0 = ts; var k = Math.min((ts - t0) / 1600, 1);
        cnt.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      });
    }, 400);
  }
})();
