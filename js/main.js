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
  // Анимация большой цифры «30» при появлении блока
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

  // попапы
  function open(id, opts){
    var d = document.getElementById('dlg-'+id);
    var f = d.querySelector('form'); if (f) f.classList.remove('sent');
    if (opts && opts.plan && id==='connect') planSel.value = opts.plan;
    if (opts && opts.plan && id==='speed') {
      var sp = d.querySelector('#s-speed');
      var m = opts.plan.match(/до (\d+)/); if (m) [].forEach.call(sp.options, function(o){ if (o.text.indexOf('до '+m[1]+' ')===0) sp.value=o.value; });
    }
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open','');
  }
  document.addEventListener('click', function(e){
    var o = e.target.closest('[data-open]');
    if (o){ open(o.dataset.open, {plan:o.dataset.plan}); return; }
    var c = e.target.closest('[data-close]');
    if (c){ c.closest('dialog').close(); return; }
    var s = e.target.closest('[data-sum]');
    if (s){ document.getElementById('p-sum').value = s.dataset.sum; return; }
    if (e.target.tagName === 'DIALOG') e.target.close(); // клик по фону
  });
  document.querySelectorAll('dialog form').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var bad = [].filter.call(f.querySelectorAll('[required]'), function(i){ return i.type==='checkbox' ? !i.checked : !i.value.trim(); });
      f.querySelectorAll('input,select,textarea').forEach(function(i){ i.style.borderColor=''; });
      if (bad.length){ bad.forEach(function(i){ i.style.borderColor='#D93636'; }); bad[0].focus(); return; }
      f.classList.add('sent'); // здесь — отправка в CRM заказчика
    });
  });

  // новости
  var NEWS = [
    {d:'11 июня 2026', t:'График работы в День России', b:'Уважаемые абоненты! Абонентский отдел Zhukovsky.Net в праздничные дни работает по следующему графику:\n12 июня — выходной.\n13 июня — с 09:00 до 15:00.\nС 14 июня — по обычному графику.\n\nТехническая поддержка:\n12 июня — с 09:00 до 18:00.\n13 июня — с 09:00 до 20:00.\nС 14 июня — по обычному графику.'},
    {d:'27 мая 2026', t:'Обновление тарифных планов', b:'Уважаемые абоненты!\nОператор связи ZHUKNET (ООО «Телесервис») уведомляет, что с 1 июля 2026 года для физических лиц проводится индексация всех базовых тарифных планов на интернет-услуги, включая действующие и архивные.\n\nАктуальные тарифы — в разделе «Тарифы».'},
    {d:'29 апреля 2026', t:'График работы в майские праздники', b:'Абонентский отдел:\n30 апреля — с 09:00 до 16:00.\n1 мая — выходной.\n2–7 мая — по рабочему графику.\n8 мая — с 09:00 до 16:00.\n9–10 мая — выходные.\n11 мая — с 09:00 до 16:00.\n\nТехническая поддержка:\n30 апреля — с 09:00 до 20:00.\n1 мая — с 09:00 до 18:00.\n2–8 мая — по рабочему графику.\n9 мая — с 09:00 до 18:00.\n10–11 мая — с 09:00 до 20:00.'}
  ];
  document.querySelectorAll('[data-news]').forEach(function(b){
    b.addEventListener('click', function(){
      var n = NEWS[+b.dataset.news];
      document.getElementById('n-date').textContent = n.d;
      document.getElementById('t-news').textContent = n.t;
      document.getElementById('n-body').textContent = n.b;
      document.getElementById('dlg-news').showModal();
    });
  });

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
