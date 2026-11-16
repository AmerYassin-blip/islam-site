/* نور — Islamic app, version 1 (phase 1). Plain JavaScript, no build step. */
(function () {
  'use strict';

  var VERSION = '1.0.0';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------- storage (per device; safe if unavailable) ---------- */
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('nur.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem('nur.' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  var S = {
    lang: store.get('lang', 'ar'),
    theme: store.get('theme', 'green'),
    dark: store.get('dark', 'auto'),
    fs: store.get('fs', 1),
    loc: store.get('loc', null),
    method: store.get('method', 'auto'),
    asr: store.get('asr', 'standard'),
    hijri: store.get('hijri', 0),
    mark: store.get('mark', null),
    tasbih: store.get('tasbih', { n: 0, target: 33 })
  };
  function save(k, v) { S[k] = v; store.set(k, v); }

  /* ---------- translations (interface only) ---------- */
  var T = {
    ar: {
      app: 'نور', home: 'الرئيسية', prayer: 'الصلاة', quran: 'القرآن', adhkar: 'الأذكار', settings: 'الإعدادات',
      salam: 'السلام عليكم', nextPrayer: 'الصلاة القادمة', remaining: 'باقي', tomorrow: 'غدًا',
      fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
      tasbih: 'المسبحة', qibla: 'القبلة', continueReading: 'تابع القراءة', ayah: 'الآية', dailyDhikr: 'ذكر اليوم',
      setLocation: 'حدّد موقعك لعرض مواقيت الصلاة', setLocationHint: 'الموقع يبقى على جهازك فقط ولا يُرسل لأي جهة.',
      detect: 'استخدم موقعي الحالي', orCity: 'أو اختر مدينة', chooseCity: 'اختر مدينة…', myLocation: 'موقعي الحالي',
      locError: 'تعذّر تحديد الموقع. اسمح بالوصول إلى الموقع أو اختر مدينة.',
      todayTimes: 'مواقيت اليوم', method: 'طريقة الحساب', methodNote: 'قارن الأوقات مع تقويم بلدك واختر الطريقة المطابقة له من الإعدادات.',
      qiblaDir: 'اتجاه القبلة', fromNorth: 'درجة من الشمال (مع عقارب الساعة)', startCompass: 'تشغيل البوصلة',
      compassNote: 'دقة البوصلة تعتمد على الجهاز. أبعد الهاتف عن المعادن وحرّكه على شكل رقم 8 لمعايرته.',
      compassOff: 'البوصلة غير متاحة على هذا الجهاز. استخدم الرقم أعلاه مع بوصلة أخرى.',
      north: 'ش', surahs: 'السور', searchSurah: 'ابحث باسم السورة أو رقمها', verses: 'آيات', meccan: 'مكية', medinan: 'مدنية',
      juz: 'الجزء', page: 'صفحة', saveMark: 'حفظ العلامة', markSaved: 'تم حفظ العلامة', prev: 'السورة السابقة', nextS: 'السورة التالية',
      back: 'رجوع', tapVerse: 'اضغط على أي آية لحفظ علامة القراءة عندها.',
      times: 'مرات', once: 'مرة واحدة', done: 'تم', source: 'المصدر', virtue: 'الفضل',
      tapToCount: 'اضغط على الدائرة للتسبيح', reset: 'تصفير العدّاد', target: 'العدد المطلوب', free: 'بلا حد', of: 'من',
      language: 'اللغة', color: 'لون التطبيق', green: 'أخضر', pink: 'زهري', darkMode: 'الوضع الليلي', auto: 'تلقائي', light: 'فاتح', dark: 'ليلي',
      fontSize: 'حجم الخط', fsS: 'عادي', fsM: 'كبير', fsL: 'أكبر', location: 'الموقع', notSet: 'غير محدد',
      asrTime: 'وقت العصر', asrStd: 'الجمهور (الشافعي والحنبلي والمالكي)', asrHan: 'الحنفي',
      asrNote: 'عند الحنفية يدخل وقت العصر متأخرًا عن قول الجمهور.',
      hijriAdj: 'تعديل التاريخ الهجري', hijriNote: 'التاريخ محسوب بتقويم أم القرى وقد يختلف يومًا عن رؤية الهلال في بلدك.',
      day: 'يوم', sources: 'المصادر وحول التطبيق', autoMethod: 'تلقائي حسب المنطقة',
      loading: 'جارٍ التحميل…', loadError: 'تعذّر تحميل البيانات. تحقق من الاتصال وحاول مرة أخرى.', retry: 'إعادة المحاولة',
      version: 'الإصدار', adhkarNote: 'نصوص الأذكار معروضة بالعربية كما وردت في المصدر.'
    },
    en: {
      app: 'Nur', home: 'Home', prayer: 'Prayer', quran: 'Quran', adhkar: 'Adhkar', settings: 'Settings',
      salam: 'As-salamu alaykum', nextPrayer: 'Next prayer', remaining: 'in', tomorrow: 'tomorrow',
      fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
      tasbih: 'Tasbih', qibla: 'Qibla', continueReading: 'Continue reading', ayah: 'Ayah', dailyDhikr: 'Dhikr of the day',
      setLocation: 'Set your location to see prayer times', setLocationHint: 'Your location stays on this device and is never sent anywhere.',
      detect: 'Use my current location', orCity: 'Or choose a city', chooseCity: 'Choose a city…', myLocation: 'My location',
      locError: 'Could not get your location. Allow location access or choose a city.',
      todayTimes: "Today's times", method: 'Calculation method', methodNote: 'Compare the times with your local timetable and pick the matching method in Settings.',
      qiblaDir: 'Qibla direction', fromNorth: 'degrees from North (clockwise)', startCompass: 'Start compass',
      compassNote: 'Compass accuracy depends on the device. Keep the phone away from metal and move it in a figure 8 to calibrate.',
      compassOff: 'No compass on this device. Use the number above with another compass.',
      north: 'N', surahs: 'Surahs', searchSurah: 'Search by surah name or number', verses: 'verses', meccan: 'Meccan', medinan: 'Medinan',
      juz: 'Juz', page: 'Page', saveMark: 'Save bookmark', markSaved: 'Bookmark saved', prev: 'Previous surah', nextS: 'Next surah',
      back: 'Back', tapVerse: 'Tap any verse to save your reading bookmark there.',
      times: 'times', once: 'Once', done: 'Done', source: 'Source', virtue: 'Virtue',
      tapToCount: 'Tap the circle to count', reset: 'Reset counter', target: 'Target', free: 'No limit', of: 'of',
      language: 'Language', color: 'App colour', green: 'Green', pink: 'Pink', darkMode: 'Dark mode', auto: 'Auto', light: 'Light', dark: 'Dark',
      fontSize: 'Text size', fsS: 'Normal', fsM: 'Large', fsL: 'Larger', location: 'Location', notSet: 'Not set',
      asrTime: 'Asr time', asrStd: "Majority (Shafi'i, Hanbali, Maliki)", asrHan: 'Hanafi',
      asrNote: 'In the Hanafi school Asr begins later than in the majority view.',
      hijriAdj: 'Hijri date adjustment', hijriNote: 'The date uses the Umm al-Qura calendar and may differ by a day from the local moon sighting.',
      day: 'day', sources: 'Sources & about', autoMethod: 'Automatic by region',
      loading: 'Loading…', loadError: 'Could not load the data. Check your connection and try again.', retry: 'Try again',
      version: 'Version', adhkarNote: 'Adhkar are shown in Arabic exactly as in the source.'
    }
  };
  function t(k) { return (T[S.lang] && T[S.lang][k]) || T.ar[k] || k; }
  function nf(n) { try { return new Intl.NumberFormat(S.lang === 'ar' ? 'ar-EG' : 'en-US', { useGrouping: false }).format(n); } catch (e) { return String(n); } }

  var METHODS = {
    MuslimWorldLeague: { ar: 'رابطة العالم الإسلامي', en: 'Muslim World League' },
    Egyptian: { ar: 'الهيئة المصرية العامة للمساحة', en: 'Egyptian General Authority of Survey' },
    UmmAlQura: { ar: 'أم القرى — مكة المكرمة', en: 'Umm al-Qura, Makkah' },
    Karachi: { ar: 'جامعة العلوم الإسلامية — كراتشي', en: 'University of Islamic Sciences, Karachi' },
    Dubai: { ar: 'دبي', en: 'Dubai' },
    Kuwait: { ar: 'الكويت', en: 'Kuwait' },
    Qatar: { ar: 'قطر', en: 'Qatar' },
    Turkey: { ar: 'رئاسة الشؤون الدينية — تركيا', en: 'Diyanet, Türkiye' },
    Singapore: { ar: 'سنغافورة', en: 'Singapore' },
    NorthAmerica: { ar: 'الجمعية الإسلامية لأمريكا الشمالية', en: 'Islamic Society of North America' },
    MoonsightingCommittee: { ar: 'لجنة رؤية الهلال', en: 'Moonsighting Committee' },
    Tehran: { ar: 'طهران', en: 'Tehran' }
  };
  var TZ_METHOD = {
    'Asia/Riyadh': 'UmmAlQura', 'Africa/Cairo': 'Egyptian', 'Asia/Damascus': 'Egyptian', 'Asia/Beirut': 'Egyptian',
    'Asia/Dubai': 'Dubai', 'Asia/Kuwait': 'Kuwait', 'Asia/Qatar': 'Qatar', 'Europe/Istanbul': 'Turkey',
    'Asia/Karachi': 'Karachi', 'Asia/Kolkata': 'Karachi', 'Asia/Dhaka': 'Karachi', 'Asia/Singapore': 'Singapore', 'Asia/Tehran': 'Tehran'
  };
  var CITIES = [
    { ar: 'القدس', en: 'Jerusalem', lat: 31.7780, lng: 35.2354, tz: 'Asia/Jerusalem' },
    { ar: 'غزة', en: 'Gaza', lat: 31.5017, lng: 34.4668, tz: 'Asia/Gaza' },
    { ar: 'نابلس', en: 'Nablus', lat: 32.2211, lng: 35.2544, tz: 'Asia/Hebron' },
    { ar: 'الخليل', en: 'Hebron', lat: 31.5326, lng: 35.0998, tz: 'Asia/Hebron' },
    { ar: 'رام الله', en: 'Ramallah', lat: 31.9038, lng: 35.2034, tz: 'Asia/Hebron' },
    { ar: 'عمّان', en: 'Amman', lat: 31.9539, lng: 35.9106, tz: 'Asia/Amman' },
    { ar: 'مكة المكرمة', en: 'Makkah', lat: 21.4225, lng: 39.8262, tz: 'Asia/Riyadh' },
    { ar: 'المدينة المنورة', en: 'Madinah', lat: 24.4672, lng: 39.6112, tz: 'Asia/Riyadh' },
    { ar: 'الرياض', en: 'Riyadh', lat: 24.7136, lng: 46.6753, tz: 'Asia/Riyadh' },
    { ar: 'القاهرة', en: 'Cairo', lat: 30.0444, lng: 31.2357, tz: 'Africa/Cairo' },
    { ar: 'دبي', en: 'Dubai', lat: 25.2048, lng: 55.2708, tz: 'Asia/Dubai' },
    { ar: 'إسطنبول', en: 'Istanbul', lat: 41.0082, lng: 28.9784, tz: 'Europe/Istanbul' }
  ];

  /* ---------- icons ---------- */
  var IC = {
    home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
    prayer: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    quran: '<path d="M12 6c-2-1.3-4.5-1.8-8-1.8v13c3.5 0 6 .5 8 1.8 2-1.3 4.5-1.8 8-1.8v-13c-3.5 0-6 .5-8 1.8zM12 6v13"/>',
    adhkar: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    tasbih: '<circle cx="12" cy="5" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="18" cy="16" r="2"/><circle cx="12" cy="20" r="2"/><circle cx="6" cy="16" r="2"/><circle cx="6" cy="9" r="2"/>',
    qibla: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    back: '<path d="M9 5l7 7-7 7"/>',
    bookmark: '<path d="M7 4h10v16l-5-4-5 4z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
  };
  function icon(n) { return '<svg class="i" aria-hidden="true" viewBox="0 0 24 24">' + IC[n] + '</svg>'; }

  /* ---------- appearance ---------- */
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyLook() {
    var el = document.documentElement;
    el.lang = S.lang; el.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
    if (S.theme === 'pink') el.setAttribute('data-theme', 'pink'); else el.removeAttribute('data-theme');
    var dark = S.dark === 'dark' || (S.dark === 'auto' && mq && mq.matches);
    if (dark) el.setAttribute('data-dark', '1'); else el.removeAttribute('data-dark');
    el.style.setProperty('--fs', String(S.fs));
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute('content', getComputedStyle(el).getPropertyValue('--bg').trim() || '#F3F6F4');
    document.title = t('app');
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { applyLook(); });

  /* ---------- dates ---------- */
  function partsInTz(d, tz) {
    try {
      var f = new Intl.DateTimeFormat('en-US', { timeZone: tz || undefined, year: 'numeric', month: 'numeric', day: 'numeric' });
      var o = {}; f.formatToParts(d).forEach(function (p) { o[p.type] = +p.value; });
      return new Date(o.year, o.month - 1, o.day);
    } catch (e) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  }
  function fmtTime(d) {
    if (!d || isNaN(d.getTime())) return '—';
    try {
      return new Intl.DateTimeFormat(S.lang === 'ar' ? 'ar-EG' : 'en-US', { hour: 'numeric', minute: '2-digit', timeZone: (S.loc && S.loc.tz) || undefined }).format(d);
    } catch (e) { return d.toLocaleTimeString(); }
  }
  function hijri(d) {
    var x = new Date(d.getTime() + (S.hijri || 0) * 864e5);
    try {
      return new Intl.DateTimeFormat(S.lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura-nu-arab' : 'en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', timeZone: (S.loc && S.loc.tz) || undefined }).format(x);
    } catch (e) { return ''; }
  }
  function weekday(d) {
    try { return new Intl.DateTimeFormat(S.lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', timeZone: (S.loc && S.loc.tz) || undefined }).format(d); } catch (e) { return ''; }
  }

  /* ---------- prayer times (adhan-js) ---------- */
  function methodKey() {
    if (S.method && S.method !== 'auto' && METHODS[S.method]) return S.method;
    var tz = (S.loc && S.loc.tz) || '';
    if (!tz) { try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { tz = ''; } }
    if (TZ_METHOD[tz]) return TZ_METHOD[tz];
    if (tz.indexOf('America/') === 0) return 'NorthAmerica';
    return 'MuslimWorldLeague';
  }
  function params() {
    var p = adhan.CalculationMethod[methodKey()]();
    p.madhab = S.asr === 'hanafi' ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
    return p;
  }
  var PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  function dayTimes(offsetDays) {
    if (!S.loc || typeof adhan === 'undefined') return null;
    var base = partsInTz(new Date(), S.loc.tz);
    base.setDate(base.getDate() + (offsetDays || 0));
    var pt = new adhan.PrayerTimes(new adhan.Coordinates(S.loc.lat, S.loc.lng), base, params());
    return PRAYERS.map(function (k) { return { k: k, d: pt[k] }; });
  }
  function nextPrayer() {
    var today = dayTimes(0); if (!today) return null;
    var now = Date.now(), i;
    for (i = 0; i < today.length; i++) {
      if (today[i].k !== 'sunrise' && today[i].d && today[i].d.getTime() > now) return { k: today[i].k, d: today[i].d, today: today, tomorrow: false };
    }
    var tm = dayTimes(1);
    return { k: 'fajr', d: tm[0].d, today: today, tomorrow: true };
  }
  function countdown(d) {
    var s = Math.max(0, Math.floor((d.getTime() - Date.now()) / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    var pad = function (n) { return (n < 10 ? nf(0) : '') + nf(n); };
    return nf(h) + ':' + pad(m) + ':' + pad(x);
  }
  function qiblaDeg() { return S.loc ? adhan.Qibla(new adhan.Coordinates(S.loc.lat, S.loc.lng)) : null; }

  /* ---------- data ---------- */
  var cache = {};
  function load(name) {
    if (cache[name]) return Promise.resolve(cache[name]);
    return fetch(name + '.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { cache[name] = j; return j; });
  }
  function stripMarks(s) { return String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[أإآٱ]/g, 'ا').trim().toLowerCase(); }
  function ayahOnly(text) { return String(text).replace(/[ \s]*[٠-٩]+\s*$/, ''); }

  /* ---------- views ---------- */
  var cleanup = null;
  var counts = {};

  function locCard() {
    return '<section class="card stack"><h2>' + esc(t('setLocation')) + '</h2>' +
      '<p class="muted small">' + esc(t('setLocationHint')) + '</p>' +
      '<button class="btn primary" data-act="detect">' + esc(t('detect')) + '</button>' +
      '<label class="small muted" for="city">' + esc(t('orCity')) + '</label>' + citySelect() +
      '<p class="small" id="locmsg" role="status"></p></section>';
  }
  function citySelect() {
    var cur = S.loc && S.loc.city != null ? S.loc.city : '';
    return '<select id="city" data-act="city"><option value="">' + esc(t('chooseCity')) + '</option>' +
      CITIES.map(function (c, i) { return '<option value="' + i + '"' + (String(cur) === String(i) ? ' selected' : '') + '>' + esc(c[S.lang] || c.ar) + '</option>'; }).join('') + '</select>';
  }
  function locName() {
    if (!S.loc) return t('notSet');
    if (S.loc.city != null && CITIES[S.loc.city]) return CITIES[S.loc.city][S.lang] || CITIES[S.loc.city].ar;
    return t('myLocation');
  }

  function nextCard(np) {
    var five = np.today.filter(function (x) { return x.k !== 'sunrise'; }).map(function (x) {
      return '<div class="' + (!np.tomorrow && x.k === np.k ? 'on' : '') + '"><span>' + esc(t(x.k)) + '</span><b>' + esc(fmtTime(x.d)) + '</b></div>';
    }).join('');
    return '<section class="next" aria-label="' + esc(t('nextPrayer')) + '"><div class="top"><div><div class="dim">' + esc(t('nextPrayer')) + (np.tomorrow ? ' · ' + esc(t('tomorrow')) : '') + '</div>' +
      '<div class="name">' + esc(t(np.k)) + '</div></div><div style="text-align:end"><div class="time">' + esc(fmtTime(np.d)) + '</div>' +
      '<div class="dim">' + esc(t('remaining')) + ' <span id="cd">' + esc(countdown(np.d)) + '</span></div></div></div><hr><div class="five">' + five + '</div></section>';
  }

  function viewHome() {
    var now = new Date();
    var h = '<header class="head"><div><h1>' + esc(t('salam')) + '</h1><p class="muted small">' + esc(weekday(now)) + ' · ' + esc(hijri(now)) + '</p></div>' +
      '<a class="iconbtn" href="#/settings" aria-label="' + esc(t('settings')) + '">' + icon('settings') + '</a></header>';
    var np = nextPrayer();
    h += np ? nextCard(np) : locCard();
    h += '<nav class="quick" aria-label="' + esc(t('home')) + '">' +
      '<a href="#/quran">' + icon('quran') + esc(t('quran')) + '</a>' +
      '<a href="#/adhkar">' + icon('adhkar') + esc(t('adhkar')) + '</a>' +
      '<a href="#/tasbih">' + icon('tasbih') + esc(t('tasbih')) + '</a>' +
      '<a href="#/qibla">' + icon('qibla') + esc(t('qibla')) + '</a></nav>';
    h += '<div id="cont"></div><div id="daily"></div>';
    return {
      html: h,
      after: function () {
        if (S.mark) {
          load('quran').then(function (q) {
            var s = q[S.mark.s - 1], el = $('#cont'); if (!s || !el) return;
            el.innerHTML = '<a class="card rowcard" href="#/quran/' + s.id + '/' + S.mark.v + '"><span class="round">' + icon('bookmark') + '</span>' +
              '<span class="grow"><span class="muted small">' + esc(t('continueReading')) + '</span><b style="font-size:17px">' + esc(S.lang === 'ar' ? s.name : s.en) + '</b></span>' +
              '<span class="muted small">' + esc(t('ayah')) + ' ' + esc(nf(S.mark.v)) + '</span></a>';
          }).catch(function () {});
        }
        load('adhkar').then(function (a) {
          var el = $('#daily'); if (!el) return;
          var pool = a.cats[0].items.filter(function (x) { return x.t.length < 200; });
          if (!pool.length) return;
          var d = new Date(), day = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5);
          var it = pool[day % pool.length];
          el.innerHTML = '<section class="daily"><span class="lbl">' + esc(t('dailyDhikr')) + '</span><p class="ar-text" lang="ar">' + esc(it.t) + '</p><span class="muted small" lang="ar">' + esc(a.source) + '</span></section>';
        }).catch(function () {});
      }
    };
  }

  function viewPrayer() {
    var h = '<header class="head"><div><h1>' + esc(t('prayer')) + '</h1><p class="muted small">' + esc(locName()) + ' · ' + esc(hijri(new Date())) + '</p></div>' +
      '<a class="iconbtn" href="#/qibla" aria-label="' + esc(t('qibla')) + '">' + icon('qibla') + '</a></header>';
    var np = nextPrayer();
    if (!np) return { html: h + locCard() };
    h += nextCard(np);
    h += '<section class="card"><h2>' + esc(t('todayTimes')) + '</h2><ul class="times">' + np.today.map(function (x) {
      return '<li class="' + (!np.tomorrow && x.k === np.k ? 'on' : '') + '"><span>' + esc(t(x.k)) + '</span><span class="t">' + esc(fmtTime(x.d)) + '</span></li>';
    }).join('') + '</ul></section>';
    var mk = methodKey();
    h += '<p class="notice"><b>' + esc(t('method')) + ':</b> ' + esc(METHODS[mk][S.lang] || METHODS[mk].ar) + ' · <b>' + esc(t('asrTime')) + ':</b> ' + esc(S.asr === 'hanafi' ? t('asrHan') : t('asrStd')) + '<br>' + esc(t('methodNote')) + '</p>';
    return { html: h };
  }

  function viewQibla() {
    var h = '<header class="head"><a class="iconbtn" href="#/prayer" aria-label="' + esc(t('back')) + '"><span class="flip" style="display:flex">' + icon('back') + '</span></a><div style="flex-grow:1"><h1>' + esc(t('qiblaDir')) + '</h1><p class="muted small">' + esc(locName()) + '</p></div></header>';
    if (!S.loc) return { html: h + locCard() };
    var q = qiblaDeg();
    h += '<section class="card stack center"><div class="compass" aria-hidden="true"><div class="dial" id="dial"><span class="n">' + esc(t('north')) + '</span>' +
      '<div class="needle" style="transform:rotate(' + q.toFixed(1) + 'deg)"><svg viewBox="0 0 220 220"><path d="M110 26l14 84h-28z" fill="currentColor"/><circle cx="110" cy="110" r="9" fill="currentColor"/><path d="M110 110v60" stroke="currentColor" stroke-width="3" opacity=".3"/></svg></div></div></div>' +
      '<p><span class="big">' + esc(nf(Math.round(q))) + '°</span><br><span class="muted small">' + esc(t('fromNorth')) + '</span></p>' +
      '<button class="btn primary" data-act="compass">' + esc(t('startCompass')) + '</button><p class="small muted" id="cmsg" role="status">' + esc(t('compassNote')) + '</p></section>';
    return { html: h };
  }

  function viewQuranIndex() {
    var h = '<header class="head"><div><h1>' + esc(t('quran')) + '</h1><p class="muted small">' + esc(nf(114)) + ' ' + esc(t('surahs')) + '</p></div></header>' +
      '<label class="sr-only" for="q">' + esc(t('searchSurah')) + '</label><input class="search" id="q" type="search" placeholder="' + esc(t('searchSurah')) + '" autocomplete="off">' +
      '<div id="cont"></div><section class="card"><div class="list" id="slist"><p class="muted">' + esc(t('loading')) + '</p></div></section>';
    return {
      html: h,
      after: function () {
        load('quran').then(function (q) {
          var list = $('#slist'); if (!list) return;
          function row(s) {
            var ty = s.type === 'meccan' ? t('meccan') : s.type === 'medinan' ? t('medinan') : '';
            return '<a href="#/quran/' + s.id + '" data-n="' + esc(stripMarks(s.name) + ' ' + stripMarks(s.en) + ' ' + s.id) + '"><span class="num">' + esc(nf(s.id)) + '</span><span class="grow"><span class="nm">' + esc(S.lang === 'ar' ? s.name : s.en) + '</span>' +
              '<span class="muted small">' + esc(ty) + (ty ? ' · ' : '') + esc(nf(s.verses.length)) + ' ' + esc(t('verses')) + '</span></span><span class="muted small">' + esc(S.lang === 'ar' ? '' : s.name) + '</span></a>';
          }
          list.innerHTML = q.map(row).join('');
          if (S.mark && q[S.mark.s - 1]) {
            var s = q[S.mark.s - 1];
            $('#cont').innerHTML = '<a class="card rowcard" href="#/quran/' + s.id + '/' + S.mark.v + '"><span class="round">' + icon('bookmark') + '</span><span class="grow"><span class="muted small">' + esc(t('continueReading')) + '</span><b style="font-size:17px">' + esc(S.lang === 'ar' ? s.name : s.en) + '</b></span><span class="muted small">' + esc(t('ayah')) + ' ' + esc(nf(S.mark.v)) + '</span></a>';
          }
          $('#q').addEventListener('input', function () {
            var v = stripMarks(this.value).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); });
            Array.prototype.forEach.call(list.children, function (a) { a.style.display = !v || a.getAttribute('data-n').indexOf(v) !== -1 ? '' : 'none'; });
          });
        }).catch(function () { loadFail('#slist'); });
      }
    };
  }

  function loadFail(sel) {
    var el = $(sel); if (!el) return;
    el.innerHTML = '<p>' + esc(t('loadError')) + '</p><button class="btn" data-act="reload">' + esc(t('retry')) + '</button>';
  }

  function viewSurah(id, verse) {
    var h = '<header class="head"><a class="iconbtn" href="#/quran" aria-label="' + esc(t('back')) + '"><span class="flip" style="display:flex">' + icon('back') + '</span></a><div style="flex-grow:1" id="shead"><h1>' + esc(t('quran')) + '</h1></div></header>' +
      '<section class="card mushaf" id="mushaf"><p class="muted">' + esc(t('loading')) + '</p></section><div id="pager"></div><div id="bar"></div>';
    return {
      html: h,
      after: function () {
        load('quran').then(function (q) {
          var s = q[id - 1], box = $('#mushaf'); if (!box) return;
          if (!s) { location.hash = '#/quran'; return; }
          var ty = s.type === 'meccan' ? t('meccan') : s.type === 'medinan' ? t('medinan') : '';
          $('#shead').innerHTML = '<h1>' + esc(S.lang === 'ar' ? 'سورة ' + s.name : s.en) + '</h1><p class="muted small">' + esc(ty) + (ty ? ' · ' : '') + esc(nf(s.verses.length)) + ' ' + esc(t('verses')) + ' · ' + esc(t('juz')) + ' ' + esc(nf(s.juz)) + '</p>';
          var out = '';
          if (s.id !== 1 && s.id !== 9) out += '<p class="basmala" lang="ar">' + esc(ayahOnly(q[0].verses[0])) + '</p>';
          out += '<p class="ayat" lang="ar">' + s.verses.map(function (v, i) {
            var n = i + 1, mk = S.mark && S.mark.s === s.id && S.mark.v === n;
            return '<span role="button" tabindex="0" data-v="' + n + '"' + (mk ? ' class="mark"' : '') + '>' + esc(v) + '</span>';
          }).join(' ') + '</p>';
          box.innerHTML = out + '<p class="muted small center" style="margin-top:14px">' + esc(t('tapVerse')) + '</p>';
          var pg = '<div class="pager">';
          pg += s.id > 1 ? '<a class="btn" href="#/quran/' + (s.id - 1) + '">' + esc(t('prev')) + '</a>' : '<span></span>';
          pg += s.id < 114 ? '<a class="btn" href="#/quran/' + (s.id + 1) + '">' + esc(t('nextS')) + '</a>' : '<span></span>';
          $('#pager').innerHTML = pg + '</div>';
          function pick(el) {
            var old = $('.ayat .sel'); if (old) old.classList.remove('sel');
            el.classList.add('sel');
            var n = +el.getAttribute('data-v');
            $('#bar').innerHTML = '<div class="actionbar"><div><span>' + esc(t('ayah')) + ' ' + esc(nf(n)) + '</span><button data-act="mark" data-s="' + s.id + '" data-v="' + n + '">' + esc(t('saveMark')) + '</button></div></div>';
          }
          box.addEventListener('click', function (e) { var el = e.target.closest ? e.target.closest('span[data-v]') : null; if (el) pick(el); });
          box.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('data-v')) { e.preventDefault(); pick(e.target); } });
          if (verse) {
            var target = $('.ayat span[data-v="' + verse + '"]');
            if (target) setTimeout(function () { target.scrollIntoView({ block: 'center' }); target.classList.add('sel'); }, 60);
          }
        }).catch(function () { loadFail('#mushaf'); });
      }
    };
  }

  function viewAdhkarIndex() {
    var h = '<header class="head"><div><h1>' + esc(t('adhkar')) + '</h1><p class="muted small" id="asrc"></p></div></header>' +
      '<section class="card"><div class="list" id="alist"><p class="muted">' + esc(t('loading')) + '</p></div></section>' +
      '<a class="card rowcard" href="#/tasbih"><span class="round">' + icon('tasbih') + '</span><span class="grow"><b style="font-size:17px">' + esc(t('tasbih')) + '</b></span></a>';
    return {
      html: h,
      after: function () {
        load('adhkar').then(function (a) {
          var l = $('#alist'); if (!l) return;
          $('#asrc').textContent = a.source;
          l.innerHTML = a.cats.map(function (c, i) {
            return '<a href="#/adhkar/' + esc(c.id) + '"><span class="num">' + esc(nf(i + 1)) + '</span><span class="grow"><span class="nm">' + esc(S.lang === 'ar' ? c.ar : c.en) + '</span><span class="muted small">' + esc(nf(c.items.length)) + '</span></span></a>';
          }).join('');
        }).catch(function () { loadFail('#alist'); });
      }
    };
  }

  function viewAdhkarCat(cid) {
    var h = '<header class="head"><a class="iconbtn" href="#/adhkar" aria-label="' + esc(t('back')) + '"><span class="flip" style="display:flex">' + icon('back') + '</span></a><div style="flex-grow:1" id="ahead"><h1>' + esc(t('adhkar')) + '</h1></div></header><div id="items" class="stack"><p class="muted">' + esc(t('loading')) + '</p></div>';
    return {
      html: h,
      after: function () {
        load('adhkar').then(function (a) {
          var c = a.cats.filter(function (x) { return x.id === cid; })[0], box = $('#items'); if (!box) return;
          if (!c) { location.hash = '#/adhkar'; return; }
          $('#ahead').innerHTML = '<h1>' + esc(S.lang === 'ar' ? c.ar : c.en) + '</h1><p class="muted small" lang="ar">' + esc(a.source) + '</p>';
          box.innerHTML = (S.lang === 'ar' ? '' : '<p class="notice">' + esc(t('adhkarNote')) + '</p>') + c.items.map(function (it, i) {
            var key = cid + ':' + i, done = counts[key] || 0;
            var foot = '';
            if (it.n > 0) {
              var fin = done >= it.n;
              foot = '<div class="foot"><span class="muted small">' + (it.n === 1 ? esc(t('once')) : esc(nf(it.n)) + ' ' + esc(t('times'))) + '</span>' +
                '<button class="count" data-act="count" data-k="' + esc(key) + '" data-n="' + it.n + '"' + (fin ? ' disabled' : '') + '>' + (fin ? esc(t('done')) : esc(nf(done)) + ' / ' + esc(nf(it.n))) + '</button></div>';
            }
            return '<article class="card dhikr"><p class="ar-text" lang="ar">' + esc(it.t) + '</p>' +
              (it.f ? '<p class="meta" lang="ar">' + esc(it.f) + '</p>' : '') +
              (it.s ? '<details><summary>' + esc(t('source')) + '</summary><p class="meta" lang="ar">' + esc(it.s) + '</p></details>' : '') + foot + '</article>';
          }).join('');
        }).catch(function () { loadFail('#items'); });
      }
    };
  }

  function viewTasbih() {
    var tb = S.tasbih, targets = [33, 99, 100, 0];
    var h = '<header class="head"><a class="iconbtn" href="#/adhkar" aria-label="' + esc(t('back')) + '"><span class="flip" style="display:flex">' + icon('back') + '</span></a><div style="flex-grow:1"><h1>' + esc(t('tasbih')) + '</h1></div></header>' +
      '<section class="card stack center"><div><p class="lbl small muted" id="tl">' + esc(t('target')) + '</p><div class="chips" role="group" aria-labelledby="tl" style="justify-content:center;margin-top:8px">' +
      targets.map(function (x) { return '<button class="chip" data-act="target" data-t="' + x + '" aria-pressed="' + (tb.target === x) + '">' + (x ? esc(nf(x)) : esc(t('free'))) + '</button>'; }).join('') + '</div></div>' +
      '<button class="bead" data-act="bead" aria-label="' + esc(t('tasbih')) + '"><span class="n" id="tn" aria-live="polite">' + esc(nf(tb.n)) + '</span><span class="of" id="tof">' + (tb.target ? esc(t('of')) + ' ' + esc(nf(tb.target)) : '') + '</span></button>' +
      '<p class="muted small">' + esc(t('tapToCount')) + '</p><button class="btn" data-act="treset">' + esc(t('reset')) + '</button></section>';
    return { html: h };
  }

  function seg(act, cur, opts) {
    return '<div class="chips" role="group">' + opts.map(function (o) {
      return '<button class="chip" data-act="' + act + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + (o[2] || '') + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }
  function viewSettings() {
    var h = '<header class="head"><div><h1>' + esc(t('settings')) + '</h1></div></header><section class="card">' +
      '<div class="field"><span class="lbl">' + esc(t('language')) + '</span>' + seg('lang', S.lang, [['ar', 'العربية'], ['en', 'English']]) + '</div>' +
      '<div class="field"><span class="lbl">' + esc(t('color')) + '</span>' + seg('theme', S.theme, [['green', t('green'), '<span class="swatch" style="background:#0F5C4A"></span> '], ['pink', t('pink'), '<span class="swatch" style="background:#B0356B"></span> ']]) + '</div>' +
      '<div class="field"><span class="lbl">' + esc(t('darkMode')) + '</span>' + seg('dark', S.dark, [['auto', t('auto')], ['light', t('light')], ['dark', t('dark')]]) + '</div>' +
      '<div class="field"><span class="lbl">' + esc(t('fontSize')) + '</span>' + seg('fs', S.fs, [[1, t('fsS')], [1.15, t('fsM')], [1.3, t('fsL')]]) + '</div></section>' +
      '<section class="card"><div class="field"><label for="city">' + esc(t('location')) + ' — <span class="muted" style="font-weight:400">' + esc(locName()) + '</span></label>' +
      '<button class="btn" data-act="detect">' + esc(t('detect')) + '</button>' + citySelect() + '<p class="small muted" id="locmsg" role="status">' + esc(t('setLocationHint')) + '</p></div>' +
      '<div class="field"><label for="method">' + esc(t('method')) + '</label><select id="method" data-act="method"><option value="auto">' + esc(t('autoMethod')) + ' (' + esc(METHODS[(function () { var m = S.method; S.method = 'auto'; var k = methodKey(); S.method = m; return k; })()][S.lang]) + ')</option>' +
      Object.keys(METHODS).map(function (k) { return '<option value="' + k + '"' + (S.method === k ? ' selected' : '') + '>' + esc(METHODS[k][S.lang] || METHODS[k].ar) + '</option>'; }).join('') + '</select><p class="small muted">' + esc(t('methodNote')) + '</p></div>' +
      '<div class="field"><span class="lbl">' + esc(t('asrTime')) + '</span>' + seg('asr', S.asr, [['standard', t('asrStd')], ['hanafi', t('asrHan')]]) + '<p class="small muted">' + esc(t('asrNote')) + '</p></div>' +
      '<div class="field"><span class="lbl">' + esc(t('hijriAdj')) + ' — <span class="muted" style="font-weight:400">' + esc(hijri(new Date())) + '</span></span>' + seg('hijri', S.hijri, [[-1, nf(-1) + ' ' + t('day')], [0, nf(0)], [1, '+' + nf(1) + ' ' + t('day')]]) + '<p class="small muted">' + esc(t('hijriNote')) + '</p></div></section>' +
      '<a class="card rowcard" href="#/sources"><span class="round">' + icon('info') + '</span><span class="grow"><b style="font-size:17px">' + esc(t('sources')) + '</b><span class="muted small">' + esc(t('version')) + ' ' + esc(VERSION) + '</span></span></a>';
    return { html: h };
  }

  function viewSources() {
    var ar = S.lang === 'ar';
    var L = function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u.replace(/^https?:\/\//, '') + '</a>'; };
    var h = '<header class="head"><a class="iconbtn" href="#/settings" aria-label="' + esc(t('back')) + '"><span class="flip" style="display:flex">' + icon('back') + '</span></a><div style="flex-grow:1"><h1>' + esc(t('sources')) + '</h1></div></header>';
    if (ar) {
      h += '<section class="card src"><h2>القرآن الكريم</h2><p>النص القرآني برواية حفص عن عاصم بالرسم العثماني، من الإصدار الرقمي الرسمي لمجمع الملك فهد لطباعة المصحف الشريف (الإصدار 18)، معروض بخط المجمع «حفص» دون أي تعديل على النص.</p><p>' + L('https://qurancomplex.gov.sa/techquran/dev/') + '</p></section>' +
        '<section class="card src"><h2>الأذكار</h2><p>من كتاب «حصن المسلم من أذكار الكتاب والسنة» للشيخ د. سعيد بن علي بن وهف القحطاني رحمه الله، مع تخريج الأحاديث كما ورد في الكتاب. عُرضت فقط الأذكار التي تطابق نصّها في نسختين رقميتين مستقلتين من الكتاب.</p></section>' +
        '<section class="card src"><h2>مواقيت الصلاة والقبلة</h2><p>تُحسب على جهازك بمكتبة Adhan مفتوحة المصدر، المبنية على المعادلات الفلكية في كتاب «Astronomical Algorithms» لجان ميوس. طرق الحساب المتاحة هي المعتمدة لدى الهيئات المذكورة في الإعدادات.</p><p>' + L('https://github.com/batoulapps/adhan-js') + '</p></section>' +
        '<section class="card src"><h2>التاريخ الهجري</h2><p>تقويم أم القرى كما توفّره أنظمة التشغيل والمتصفحات، وقد يختلف يومًا عن رؤية الهلال في بلدك. يمكن تعديله من الإعدادات.</p></section>' +
        '<section class="card src"><h2>تنبيه</h2><p>هذه نسخة أولى. المحتوى الديني منقول من مصادره دون تصرّف، ومع ذلك يُنصح بمراجعته من أهل العلم. إذا وجدت خطأ فأبلغنا لتصحيحه.</p><p class="muted small">الخصوصية: لا يجمع التطبيق أي بيانات. موقعك وإعداداتك تبقى على جهازك.</p></section>';
    } else {
      h += '<section class="card src"><h2>The Quran</h2><p>Hafs ‘an ‘Asim in Uthmani script, from the official digital release of the King Fahd Glorious Quran Printing Complex (version 18), shown in the Complex’s own Hafs font with no change to the text.</p><p>' + L('https://qurancomplex.gov.sa/en/techquran/dev/') + '</p></section>' +
        '<section class="card src"><h2>Adhkar</h2><p>From “Hisn al-Muslim” (Fortress of the Muslim) by Shaykh Dr Sa‘id ibn ‘Ali ibn Wahf al-Qahtani, with the hadith references given in the book. Only adhkar whose text matched in two independent digital copies of the book are included.</p></section>' +
        '<section class="card src"><h2>Prayer times and Qibla</h2><p>Calculated on your device with the open-source Adhan library, based on Jean Meeus’s “Astronomical Algorithms”. The available methods are those of the authorities listed in Settings.</p><p>' + L('https://github.com/batoulapps/adhan-js') + '</p></section>' +
        '<section class="card src"><h2>Hijri date</h2><p>The Umm al-Qura calendar as provided by your device. It may differ by a day from the local moon sighting, and can be adjusted in Settings.</p></section>' +
        '<section class="card src"><h2>Note</h2><p>This is a first version. Religious content is reproduced from its sources unaltered; review by a qualified scholar is still advised. If you find a mistake, please report it.</p><p class="muted small">Privacy: the app collects no data. Your location and settings stay on your device.</p></section>';
    }
    return { html: h };
  }

  /* ---------- router ---------- */
  var NAV = [['', 'home'], ['prayer', 'prayer'], ['quran', 'quran'], ['adhkar', 'adhkar'], ['settings', 'settings']];
  function renderNav(section) {
    $('#nav').setAttribute('aria-label', t('home'));
    $('#nav').innerHTML = '<div class="row">' + NAV.map(function (n) {
      return '<a href="#/' + n[0] + '"' + (section === n[1] ? ' aria-current="page"' : '') + '>' + icon(n[1]) + '<span>' + esc(t(n[1])) + '</span></a>';
    }).join('') + '</div>';
  }
  function render(keepScroll) {
    if (cleanup) { cleanup(); cleanup = null; }
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    var v, section = 'home';
    switch (parts[0]) {
      case 'prayer': v = viewPrayer(); section = 'prayer'; break;
      case 'qibla': v = viewQibla(); section = 'prayer'; break;
      case 'quran': section = 'quran'; v = parts[1] ? viewSurah(parseInt(parts[1], 10) || 1, parseInt(parts[2], 10) || 0) : viewQuranIndex(); break;
      case 'adhkar': section = 'adhkar'; v = parts[1] ? viewAdhkarCat(parts[1]) : viewAdhkarIndex(); break;
      case 'tasbih': section = 'adhkar'; v = viewTasbih(); break;
      case 'settings': section = 'settings'; v = viewSettings(); break;
      case 'sources': section = 'settings'; v = viewSources(); break;
      default: v = viewHome();
    }
    applyLook();
    var y = window.scrollY;
    $('#app').innerHTML = v.html;
    renderNav(section);
    if (v.after) v.after();
    window.scrollTo(0, keepScroll ? y : 0);
  }
  window.addEventListener('hashchange', function () { render(false); });

  /* ---------- actions ---------- */
  function setLoc(loc) { save('loc', loc); render(true); }
  function detect() {
    var msg = $('#locmsg');
    if (!navigator.geolocation) { if (msg) msg.textContent = t('locError'); return; }
    if (msg) msg.textContent = t('loading');
    navigator.geolocation.getCurrentPosition(function (p) {
      setLoc({ lat: +p.coords.latitude.toFixed(4), lng: +p.coords.longitude.toFixed(4), city: null, tz: null });
    }, function () { var m = $('#locmsg'); if (m) m.textContent = t('locError'); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 3600000 });
  }
  function startCompass() {
    var dial = $('#dial'), msg = $('#cmsg'), got = false;
    function on(e) {
      var hd = null;
      if (typeof e.webkitCompassHeading === 'number') hd = e.webkitCompassHeading;
      else if (e.absolute && e.alpha != null) hd = 360 - e.alpha;
      if (hd == null || !dial) return;
      got = true; dial.style.transform = 'rotate(' + (-hd).toFixed(1) + 'deg)';
    }
    function attach() {
      window.addEventListener('deviceorientationabsolute', on, true);
      window.addEventListener('deviceorientation', on, true);
      cleanup = function () { window.removeEventListener('deviceorientationabsolute', on, true); window.removeEventListener('deviceorientation', on, true); };
      setTimeout(function () { if (!got && msg && document.body.contains(msg)) msg.textContent = t('compassOff'); }, 3000);
    }
    var D = window.DeviceOrientationEvent;
    if (!D) { if (msg) msg.textContent = t('compassOff'); return; }
    if (typeof D.requestPermission === 'function') {
      D.requestPermission().then(function (r) { if (r === 'granted') attach(); else if (msg) msg.textContent = t('compassOff'); }).catch(function () { if (msg) msg.textContent = t('compassOff'); });
    } else attach();
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el || el.tagName === 'SELECT') return;
    var a = el.getAttribute('data-act'), v = el.getAttribute('data-v');
    if (a === 'detect') detect();
    else if (a === 'compass') startCompass();
    else if (a === 'reload') { cache = {}; render(false); }
    else if (a === 'lang') { save('lang', v); render(true); }
    else if (a === 'theme') { save('theme', v); render(true); }
    else if (a === 'dark') { save('dark', v); render(true); }
    else if (a === 'fs') { save('fs', parseFloat(v)); render(true); }
    else if (a === 'asr') { save('asr', v); render(true); }
    else if (a === 'hijri') { save('hijri', parseInt(v, 10)); render(true); }
    else if (a === 'mark') {
      save('mark', { s: +el.getAttribute('data-s'), v: +el.getAttribute('data-v') });
      var old = $('.ayat .mark'); if (old) old.classList.remove('mark');
      var cur = $('.ayat span[data-v="' + S.mark.v + '"]'); if (cur) cur.classList.add('mark');
      el.textContent = t('markSaved'); el.disabled = true;
    }
    else if (a === 'count') {
      var k = el.getAttribute('data-k'), n = +el.getAttribute('data-n');
      counts[k] = (counts[k] || 0) + 1;
      if (counts[k] >= n) { el.textContent = t('done'); el.disabled = true; } else el.textContent = nf(counts[k]) + ' / ' + nf(n);
      if (navigator.vibrate) navigator.vibrate(8);
    }
    else if (a === 'bead') {
      var tb = S.tasbih;
      if (tb.target && tb.n >= tb.target) tb.n = 0;
      tb.n += 1; save('tasbih', tb); $('#tn').textContent = nf(tb.n);
      if (navigator.vibrate) navigator.vibrate(tb.target && tb.n === tb.target ? [30, 60, 30] : 8);
    }
    else if (a === 'treset') { S.tasbih.n = 0; save('tasbih', S.tasbih); $('#tn').textContent = nf(0); }
    else if (a === 'target') { S.tasbih.target = +el.getAttribute('data-t'); S.tasbih.n = 0; save('tasbih', S.tasbih); render(true); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target, a = el.getAttribute && el.getAttribute('data-act');
    if (a === 'city') { if (el.value === '') return; var c = CITIES[+el.value]; setLoc({ lat: c.lat, lng: c.lng, city: +el.value, tz: c.tz }); }
    else if (a === 'method') { save('method', el.value); render(true); }
  });

  /* ---------- clock ---------- */
  var shownNext = null;
  setInterval(function () {
    var cd = $('#cd'); if (!cd) { shownNext = null; return; }
    var np = nextPrayer(); if (!np) return;
    var id = np.k + np.d.getTime();
    if (shownNext && shownNext !== id) { shownNext = id; render(true); return; }
    shownNext = id; cd.textContent = countdown(np.d);
  }, 1000);

  /* ---------- start ---------- */
  render(false);
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
