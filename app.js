/* نور — Islamic app, version 1 (phase 1). Plain JavaScript, no build step. */
(function () {
  'use strict';

  var VERSION = '3.1.0';
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
    tasbih: store.get('tasbih', { n: 0, target: 33 }),
    reciter: store.get('reciter', 'mishary-alafasy/r1'),
    audio: store.get('audio', null),
    khatma: store.get('khatma', null),
    track: store.get('track', {}),
    zakat: store.get('zakat', { basis: 'gold', karat: 21 })
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
      search: 'البحث', searchPh: 'اكتب آية أو جزءًا منها', searchHint: 'اكتب ثلاثة أحرف أو أكثر من الآية للبحث في القرآن الكريم.', results: 'نتيجة', noResults: 'لا توجد نتائج.', moreResults: 'عُرضت أول ٥٠ نتيجة. أضف كلمات لتضييق البحث.',
      ayahDay: 'آية اليوم', readTafsir: 'قراءة التفسير', hadithDay: 'حديث اليوم', nawawi: 'الأربعون النووية', hadithN: 'الحديث', surah: 'سورة',
      tafsir: 'التفسير', tafsirM: 'التفسير الميسّر', translation: 'الترجمة الإنجليزية', close: 'إغلاق',
      listen: 'استماع إلى السورة', play: 'تشغيل', pause: 'إيقاف مؤقت', stop: 'إيقاف', reciter: 'القارئ', continueListening: 'أكمل الاستماع', audioErr: 'تعذّر تشغيل التلاوة. تحقق من الاتصال بالإنترنت.',
      khatma: 'ختمة القرآن', khatmaIn: 'اختم القرآن في', days: 'يومًا', dayN: 'اليوم', todayWird: 'ورد اليوم', pages: 'الصفحات', fromV: 'من', toV: 'إلى', startReading: 'ابدأ القراءة', doneToday: 'أتممت ورد اليوم',
      khatmaDone: 'أتممت الختمة، تقبّل الله منك.', khatmaReset: 'إنهاء الختمة والبدء من جديد', khatmaNote: 'التقسيم حسب صفحات مصحف المدينة النبوية (٦٠٤ صفحات).', khatmaIntro: 'اختر مدة الختمة وسيُقسَّم المصحف إلى ورد يومي.', notStarted: 'لم تبدأ بعد',
      tracker: 'متابعة الصلوات', trackToday: 'صلوات اليوم', last7: 'آخر ٧ أيام', prayed: 'صلّيت', trackNote: 'السجلّ محفوظ على جهازك فقط.',
      zakat: 'حاسبة الزكاة', zCash: 'النقود (في اليد والبنك)', zGold: 'وزن الذهب (غرام)', zKarat: 'العيار', zSilver: 'وزن الفضة (غرام)', zTrade: 'قيمة عروض التجارة', zGoldPrice: 'سعر غرام الذهب عيار ٢٤', zSilverPrice: 'سعر غرام الفضة الخالصة',
      zBasis: 'النصاب يُحسب على', zBasisGold: 'الذهب (٨٥ غرامًا)', zBasisSilver: 'الفضة (٥٩٥ غرامًا)', zTotal: 'مجموع المال', zNisab: 'قيمة النصاب', zDue: 'الزكاة الواجبة (ربع العشر ٢٫٥٪)', zBelow: 'المال أقل من النصاب، فلا زكاة فيه.', zNeedPrice: 'أدخل سعر الغرام لحساب النصاب.',
      zNote1: 'تجب الزكاة إذا بلغ المال النصاب ومرّ عليه عام هجري كامل.', zNote2: 'اختلف العلماء في نصاب النقود: هل يُقدَّر بالذهب أم بالفضة. اختر ما تعتمده جهة الإفتاء في بلدك.', zNote3: 'حُليّ المرأة المُعدّ للبس فيه خلاف: تجب فيه الزكاة عند الحنفية، ولا تجب عند الجمهور (المالكية والشافعية والحنابلة).', zNote4: 'الحاسبة للتقريب ولا تغني عن سؤال أهل العلم في حالتك.', zPrices: 'الأسعار تُدخلها أنت بعملتك من سعر السوق اليوم.',
      occasions: 'المناسبات', occNote: 'التواريخ محسوبة بتقويم أم القرى، وقد تختلف يومًا حسب رؤية الهلال في بلدك.', inDays: 'بعد', dayWord: 'يومًا', todayW: 'اليوم', month30: 'مواقيت ٣٠ يومًا', monthNote: 'قارن هذا الجدول بتقويم الأوقاف في بلدك للتأكد من طريقة الحساب.', date: 'التاريخ', mosques: 'أقرب المساجد على الخريطة',
      o_ramadan: 'أول رمضان', o_fitr: 'عيد الفطر', o_arafah: 'يوم عرفة', o_adha: 'عيد الأضحى', o_newyear: 'رأس السنة الهجرية', o_ashura: 'عاشوراء', o_white: 'الأيام البيض (١٣ و١٤ و١٥)',
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
      search: 'Search', searchPh: 'Type a verse or part of it (Arabic)', searchHint: 'Type three or more Arabic letters of a verse to search the Quran.', results: 'results', noResults: 'No results.', moreResults: 'Showing the first 50 results. Add more words to narrow it down.',
      ayahDay: 'Verse of the day', readTafsir: 'Read the tafsir', hadithDay: 'Hadith of the day', nawawi: "An-Nawawi's Forty", hadithN: 'Hadith', surah: 'Surah',
      tafsir: 'Tafsir', tafsirM: 'Tafsir al-Muyassar (Arabic)', translation: 'Translation (Saheeh International)', close: 'Close',
      listen: 'Listen to this surah', play: 'Play', pause: 'Pause', stop: 'Stop', reciter: 'Reciter', continueListening: 'Continue listening', audioErr: 'Could not play the recitation. Check your internet connection.',
      khatma: 'Quran khatma', khatmaIn: 'Complete the Quran in', days: 'days', dayN: 'Day', todayWird: "Today's portion", pages: 'Pages', fromV: 'From', toV: 'To', startReading: 'Start reading', doneToday: "I finished today's portion",
      khatmaDone: 'You completed the khatma. May Allah accept it from you.', khatmaReset: 'End this khatma and start again', khatmaNote: 'Portions follow the pages of the Madinah Mushaf (604 pages).', khatmaIntro: 'Choose a duration and the Mushaf is divided into a daily portion.', notStarted: 'Not started',
      tracker: 'Prayer tracker', trackToday: "Today's prayers", last7: 'Last 7 days', prayed: 'Prayed', trackNote: 'Your record is stored on this device only.',
      zakat: 'Zakat calculator', zCash: 'Cash (in hand and bank)', zGold: 'Gold weight (grams)', zKarat: 'Karat', zSilver: 'Silver weight (grams)', zTrade: 'Value of trade goods', zGoldPrice: 'Price of 1 g of 24k gold', zSilverPrice: 'Price of 1 g of pure silver',
      zBasis: 'Nisab is measured by', zBasisGold: 'Gold (85 g)', zBasisSilver: 'Silver (595 g)', zTotal: 'Total wealth', zNisab: 'Nisab value', zDue: 'Zakat due (2.5%)', zBelow: 'Your wealth is below the nisab, so no zakat is due.', zNeedPrice: 'Enter the price per gram to work out the nisab.',
      zNote1: 'Zakat is due once wealth reaches the nisab and a full lunar year has passed.', zNote2: 'Scholars differ on whether the nisab for cash is measured by gold or by silver. Choose what the fatwa authority in your country uses.', zNote3: "Women's jewellery kept for wearing is disputed: zakat is due on it in the Hanafi school, and not due according to the majority (Maliki, Shafi'i, Hanbali).", zNote4: 'This calculator is an estimate and does not replace asking a scholar about your case.', zPrices: "Enter today's market prices yourself, in your own currency.",
      occasions: 'Occasions', occNote: 'Dates use the Umm al-Qura calendar and may differ by a day depending on the local moon sighting.', inDays: 'in', dayWord: 'days', todayW: 'Today', month30: 'Times for 30 days', monthNote: 'Compare this table with your local official timetable to check the calculation method.', date: 'Date', mosques: 'Nearest mosques on the map',
      o_ramadan: 'First of Ramadan', o_fitr: 'Eid al-Fitr', o_arafah: 'Day of Arafah', o_adha: 'Eid al-Adha', o_newyear: 'Islamic New Year', o_ashura: 'Ashura', o_white: 'The White Days (13, 14, 15)',
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

  var RECITERS = [
    ['mishary-alafasy/r1', 'مشاري العفاسي', 'Mishary Alafasy'],
    ['yasser-dosari/r1', 'ياسر الدوسري', 'Yasser Al-Dosari'],
    ['muhammad-luhaidan/r1', 'محمد اللحيدان', 'Mohammed Al-Lohaidan'],
    ['maher-muaiqly/r1', 'ماهر المعيقلي', 'Maher Al-Muaiqly'],
    ['abdulrahman-sudais/r1', 'عبدالرحمن السديس', 'Abdulrahman As-Sudais'],
    ['saud-shuraim/r1', 'سعود الشريم', 'Saud Al-Shuraim'],
    ['saad-ghamdi/r1', 'سعد الغامدي', 'Saad Al-Ghamdi'],
    ['ahmad-ajmi/r1', 'أحمد بن علي العجمي', 'Ahmad Al-Ajmy'],
    ['nasser-qatami/r1', 'ناصر القطامي', 'Nasser Alqatami'],
    ['khalid-jalil/r1', 'خالد الجليل', 'Khalid Al-Jileel'],
    ['fares-abbad/r1', 'فارس عباد', 'Fares Abbad'],
    ['abubakr-shatri/r1', 'أبو بكر الشاطري', 'Abu Bakr Al-Shatri'],
    ['hani-rifai/r1', 'هاني الرفاعي', 'Hani Arrifai'],
    ['idrees-abkar/r1', 'إدريس أبكر', 'Idrees Abkr'],
    ['abdullah-juhani/r1', 'عبدالله عواد الجهني', 'Abdullah Al-Johany'],
    ['abdullah-basfar/r1', 'عبدالله بصفر', 'Abdullah Basfer'],
    ['abdullah-matrood/r1', 'عبدالله المطرود', 'Abdullah Al-Mattrod'],
    ['abdullah-khayyat/r1', 'عبدالله خياط', 'Abdullah Khayyat'],
    ['abdulmohsen-qasim/r1', 'عبدالمحسن القاسم', 'Abdulmohsen Al-Qasim'],
    ['abdulbari-thubaiti/r1', 'عبدالبارئ الثبيتي', 'Abdelbari Al-Toubayti'],
    ['ali-hudhaifi/r1', 'علي بن عبدالرحمن الحذيفي', 'Ali Alhuthaifi'],
    ['ali-jaber/r1', 'علي جابر', 'Ali Jaber'],
    ['salah-budair/r1', 'صلاح البدير', 'Salah Albudair'],
    ['salah-bukhatir/r1', 'صلاح بو خاطر', 'Salah Bukhatir'],
    ['muhammad-ayyub/r1', 'محمد أيوب', 'Mohammed Ayyub'],
    ['muhammad-muhaisni/r1', 'محمد المحيسني', 'Mohammed Al-Muhasny'],
    ['muhammad-jibreel/r1', 'محمد جبريل', 'Mohammed Jibreel'],
    ['mansour-salimi/r1', 'منصور السالمي', 'Mansour Al-Salemi'],
    ['raad-kurdi/r1', 'رعد محمد الكردي', 'Raad Al Kurdi'],
    ['peshawa-kurdi/r1', 'بيشه وا قادر الكردي', 'Peshawa Qadr Al-Kurdi'],
    ['wadee-yamani/r1', 'وديع اليمني', 'Wadeea Al-Yamani'],
    ['abdulrahman-oosi/r1', 'عبدالرحمن العوسي', 'Abdulrahman Aloosi'],
    ['khalifa-tunaiji/r1', 'خليفة الطنيجي', 'Khalifa Altunaiji'],
    ['nabil-rifai/r1', 'نبيل الرفاعي', 'Nabil Al Rifay'],
    ['mahmoud-rifai/r1', 'محمود الرفاعي', 'Mahmood Al Rifai'],
    ['ibrahim-akhdar/r1', 'إبراهيم الأخضر', 'Ibrahim Al-Akdar'],
    ['ibrahim-dosari/r2', 'إبراهيم الدوسري', 'Ibrahim Aldosari'],
    ['mahmoud-husary/r1', 'محمود خليل الحصري', 'Mahmoud Khalil Al-Husary'],
    ['muhammad-minshawi/r1', 'محمد صديق المنشاوي', 'Muhammad Siddiq Al-Minshawi'],
    ['abdulbasit-abdulsamad/r3', 'عبدالباسط عبدالصمد', 'Abdulbasit Abdulsamad'],
    ['mahmoud-banna/r1', 'محمود علي البنا', 'Mahmoud Ali Albanna'],
    ['muhammad-tablawi/r1', 'محمد الطبلاوي', 'Mohammad Al-Tablaway']
  ];
  function reciterName() { var r = RECITERS.filter(function (x) { return x[0] === S.reciter; })[0] || RECITERS[0]; return S.lang === 'ar' ? r[1] : r[2]; }

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
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    hadith: '<path d="M6 4h9l3 3v13H6z"/><path d="M9 11h6M9 15h6"/>',
    khatma: '<path d="M5 4h14v16H5z"/><path d="M9 4v9l3-2 3 2V4"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    tracker: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M8 13l3 3 5-6"/>',
    zakat: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.5 10a2.5 2 0 0 1 5 0c0 2.5-5 1.5-5 4a2.5 2 0 0 0 5 0"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    play: '<path d="M8 5.5v13l11-6.5z"/>',
    pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>'
  };
  function icon(n, fill) { return '<svg class="i' + (fill ? ' fill' : '') + '" aria-hidden="true" viewBox="0 0 24 24">' + IC[n] + '</svg>'; }

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
    if (m) m.setAttribute('content', getComputedStyle(el).getPropertyValue('--brand2').trim() || '#0A3427');
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

  function norm(s) {
    return String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[^ء-ي]/g, '');
  }
  function dayOfYear() { var d = new Date(); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5); }
  function sName(s) { return S.lang === 'ar' ? s.name : s.en; }

  /* ---------- audio ---------- */
  var audio = null, playing = null, lastSave = 0, dockMsg = '', selVerse = null;
  function audioUrl(s) { return 'https://cdn.mp3quran.net/audio/' + S.reciter + '/' + ('00' + s).slice(-3) + '.mp3'; }
  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio(); audio.preload = 'none';
    audio.addEventListener('timeupdate', function () {
      var now = Date.now();
      if (playing && now - lastSave > 4000) { lastSave = now; save('audio', { s: playing, t: Math.floor(audio.currentTime) }); }
    });
    audio.addEventListener('play', function () { dockMsg = ''; renderDock(); });
    audio.addEventListener('pause', function () { if (playing && audio.currentTime > 0) save('audio', { s: playing, t: Math.floor(audio.currentTime) }); renderDock(); });
    audio.addEventListener('ended', function () { if (playing) save('audio', { s: playing, t: 0 }); renderDock(); });
    audio.addEventListener('error', function () { if (playing) { dockMsg = t('audioErr'); renderDock(); } });
    return audio;
  }
  function setMedia(s) {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    var q = cache.quran, nm = q && q[s - 1] ? q[s - 1].name : String(s);
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: 'سورة ' + nm, artist: reciterName(), album: 'القرآن الكريم' });
      navigator.mediaSession.setActionHandler('play', function () { audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
    } catch (e) { /* ignore */ }
  }
  function playSurah(s, at) {
    var a = ensureAudio(), url = audioUrl(s);
    if (playing !== s || a.getAttribute('src') !== url) {
      playing = s; a.setAttribute('src', url);
      if (at > 0) { var seek = function () { a.removeEventListener('loadedmetadata', seek); try { a.currentTime = at; } catch (e) { /* ignore */ } }; a.addEventListener('loadedmetadata', seek); }
    }
    dockMsg = ''; var p = a.play(); if (p && p.catch) p.catch(function () {});
    setMedia(s); renderDock();
  }
  function stopAudio() { if (audio) { audio.pause(); } playing = null; dockMsg = ''; renderDock(); }
  function renderDock() {
    var dock = $('#dock'); if (!dock) return;
    var h = '';
    if (playing) {
      var q = cache.quran, nm = q && q[playing - 1] ? (S.lang === 'ar' ? 'سورة ' + q[playing - 1].name : q[playing - 1].en) : '';
      var paused = !audio || audio.paused;
      h += '<div class="bar"><span class="lbl">' + esc(dockMsg || (nm + ' · ' + reciterName())) + '</span><span class="acts">' +
        '<button data-act="aud-toggle" aria-label="' + esc(paused ? t('play') : t('pause')) + '">' + icon(paused ? 'play' : 'pause', true) + '</button>' +
        '<button class="ghost" data-act="aud-stop" aria-label="' + esc(t('stop')) + '">' + icon('close') + '</button></span></div>';
    }
    if (selVerse) {
      h += '<div class="bar"><span class="lbl">' + esc(t('ayah')) + ' ' + esc(nf(selVerse.v)) + '</span><span class="acts">' +
        '<button data-act="tafsir">' + esc(t('tafsir')) + '</button><button data-act="mark">' + esc(t('saveMark')) + '</button></span></div>';
    }
    dock.innerHTML = h;
  }

  /* ---------- tafsir sheet ---------- */
  function closeSheet() { var el = $('#sheet'); if (el) el.parentNode.removeChild(el); }
  function openTafsir(sid, v) {
    closeSheet();
    load('quran').then(function (q) {
      var s = q[sid - 1]; if (!s || !s.verses[v - 1]) return;
      var el = document.createElement('div'); el.className = 'sheet'; el.id = 'sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', t('tafsir'));
      el.innerHTML = '<div><div class="head"><h2>' + esc(sName(s)) + ' · ' + esc(t('ayah')) + ' ' + esc(nf(v)) + '</h2><button class="iconbtn" data-act="sheet-close" aria-label="' + esc(t('close')) + '">' + icon('close') + '</button></div>' +
        '<p class="v" lang="ar">' + esc(s.verses[v - 1]) + '</p><h2>' + esc(t('tafsirM')) + '</h2><p class="body" id="tfs" lang="ar" dir="rtl">' + esc(t('loading')) + '</p>' +
        (S.lang === 'en' ? '<h2>' + esc(t('translation')) + '</h2><p class="body" id="trn" lang="en" dir="ltr">' + esc(t('loading')) + '</p>' : '') + '</div>';
      el.addEventListener('click', function (e) { if (e.target === el) closeSheet(); });
      document.body.appendChild(el);
      var b = $('[data-act="sheet-close"]', el); if (b) b.focus();
      load('meta').then(function (m) {
        var i = 0; m.taf.forEach(function (st, k) { if (st <= sid) i = k; });
        return load('tafsir-' + (i + 1));
      }).then(function (tf) { var x = $('#tfs'); if (x) x.textContent = (tf[String(sid)] || [])[v - 1] || ''; })
        .catch(function () { var x = $('#tfs'); if (x) x.textContent = t('loadError'); });
      if (S.lang === 'en') load('en').then(function (en) { var x = $('#trn'); if (x) x.textContent = (en[sid - 1] || [])[v - 1] || ''; }).catch(function () { var x = $('#trn'); if (x) x.textContent = t('loadError'); });
    }).catch(function () {});
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

  /* ---------- khatma ---------- */
  function khatmaToday(m) {
    var k = S.khatma; if (!k) return null;
    var from = Math.floor(k.done * 604 / k.days) + 1, to = Math.floor((k.done + 1) * 604 / k.days);
    if (to < from) to = from;
    var st = m.pages[from - 1], nx = to < 604 ? m.pages[to] : null;
    return { from: from, to: to, start: st, next: nx };
  }

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

  var ORN = '<rect x="22" y="22" width="56" height="56"/><rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="18"/><rect x="8" y="8" width="84" height="84" transform="rotate(22.5 50 50)"/><rect x="8" y="8" width="84" height="84" transform="rotate(67.5 50 50)"/>';
  function orn(c) { return '<svg class="orn ' + c + '" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2">' + ORN + '</svg>'; }
  function heroSvg() {
    var win = function (x) { return '<path d="M' + x + ' 268v-26a9 9 0 0 1 18 0v26z"/>'; };
    return '<svg class="sky" viewBox="0 0 390 310" aria-hidden="true"><defs><linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" style="stop-color:var(--brand2)"/><stop offset=".75" style="stop-color:var(--brand)"/><stop offset="1" stop-color="#C79F4B" stop-opacity=".55"/></linearGradient></defs>' +
      '<rect width="390" height="310" style="fill:var(--brand2)"/><rect width="390" height="310" fill="url(#skyg)"/>' +
      '<g fill="#F3E3B5"><circle cx="30" cy="70" r="1.3"/><circle cx="62" cy="128" r="1"/><circle cx="118" cy="84" r="1.2"/><circle cx="150" cy="118" r="1"/><circle cx="246" cy="108" r="1.2"/><circle cx="286" cy="84" r="1"/><circle cx="338" cy="122" r="1.3"/><circle cx="366" cy="76" r="1"/><circle cx="20" cy="160" r="1"/><circle cx="372" cy="170" r="1"/></g>' +
      '<path d="M96 96a22 22 0 1 0 20 32 18 18 0 1 1-20-32z" fill="#E7C97F"/>' +
      '<g fill="#03120D" fill-opacity=".72"><rect x="92" y="212" width="206" height="60"/><path d="M148 212c0-62 94-62 94 0z"/><path d="M100 212c0-30 42-30 42 0zM248 212c0-30 42-30 42 0z"/>' +
      '<rect x="60" y="128" width="18" height="144"/><path d="M56 128h26l-13-26z"/><rect x="55" y="170" width="28" height="6"/><rect x="312" y="128" width="18" height="144"/><path d="M308 128h26l-13-26z"/><rect x="307" y="170" width="28" height="6"/><rect x="0" y="270" width="390" height="40"/></g>' +
      '<g fill="none" stroke="#E7C97F" stroke-width="2" stroke-linecap="round"><path d="M195 166v-16"/><path d="M69 102v-10M321 102v-10"/></g><circle cx="195" cy="146" r="3.5" fill="#E7C97F"/>' +
      '<g fill="#F0CF86" fill-opacity=".92">' + win(108) + win(147) + win(186) + win(225) + win(264) + '</g></svg>';
  }
  function viewHome() {
    var now = new Date();
    var h = '<section class="hero">' + heroSvg() + '<div class="title"><b>' + esc(t('app')) + '</b><span>' + esc(weekday(now)) + ' · ' + esc(hijri(now)) + '</span></div>' +
      '<div class="top"><a href="#/search" aria-label="' + esc(t('search')) + '">' + icon('search') + '</a><a href="#/settings" aria-label="' + esc(t('settings')) + '">' + icon('settings') + '</a></div></section>' +
      '<section class="ayahcard" aria-label="' + esc(t('ayahDay')) + '">' + orn('a') + orn('b') + '<span class="pill">' + icon('quran') + esc(t('ayahDay')) + '</span><div id="ayah"><p class="ref">' + esc(t('loading')) + '</p></div></section>';
    var np = nextPrayer();
    h += np ? nextCard(np) : locCard();
    h += '<div id="hd"></div><nav class="tiles" aria-label="' + esc(t('home')) + '">' +
      '<a href="#/quran">' + icon('quran') + esc(t('quran')) + '</a>' +
      '<a href="#/adhkar">' + icon('adhkar') + esc(t('adhkar')) + '</a>' +
      '<a href="#/hadith">' + icon('hadith') + esc(t('nawawi')) + '</a>' +
      '<a href="#/search">' + icon('search') + esc(t('search')) + '</a>' +
      '<a href="#/tasbih">' + icon('tasbih') + esc(t('tasbih')) + '</a>' +
      '<a href="#/qibla">' + icon('qibla') + esc(t('qibla')) + '</a>' +
      '<a href="#/tracker">' + icon('tracker') + esc(t('tracker')) + '</a>' +
      '<a href="#/zakat">' + icon('zakat') + esc(t('zakat')) + '</a>' +
      '<a href="#/occasions">' + icon('calendar') + esc(t('occasions')) + '</a></nav>';
    var k = S.khatma, pct = k ? Math.round(k.done * 100 / k.days) : 0, C = 2 * Math.PI * 32;
    h += '<a class="banner" href="#/khatma"><span class="ring"><svg viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="32" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="7"/><circle cx="38" cy="38" r="32" fill="none" stroke="#DDBB72" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (C * pct / 100).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><span>' + esc(nf(pct)) + '%</span></span>' +
      '<span class="grow"><b>' + esc(t('khatma')) + '</b><span class="dim">' + (k ? esc(t('dayN')) + ' ' + esc(nf(Math.min(k.done + 1, k.days))) + ' / ' + esc(nf(k.days)) : esc(t('notStarted'))) + '</span></span><span class="fwd" style="display:flex">' + icon('back') + '</span></a>';
    h += '<div id="cont" class="stack"></div><div id="daily"></div>';
    return {
      html: h,
      after: function () {
        Promise.all([load('quran'), load('meta')]).then(function (r) {
          var q = r[0], m = r[1], el = $('#ayah'); if (!el) return;
          var a = m.ayah[dayOfYear() % m.ayah.length], s = q[a[0] - 1];
          el.innerHTML = '<p class="v" lang="ar">' + esc(ayahOnly(s.verses[a[1] - 1])) + '</p><p class="ref" style="margin-bottom:10px">(' + esc(sName(s)) + ': ' + esc(nf(a[1])) + ')</p>' +
            '<a class="more" href="#/quran/' + a[0] + '/' + a[1] + '/t">' + esc(t('readTafsir')) + '</a>';
          var c = $('#cont'), out = '';
          if (S.audio && q[S.audio.s - 1]) {
            out += '<div class="card rowcard"><button class="round" data-act="aud-resume" aria-label="' + esc(t('play')) + '">' + icon('play', true) + '</button><span class="grow"><span class="muted small">' + esc(t('continueListening')) + '</span><b style="font-size:17px">' + esc(sName(q[S.audio.s - 1])) + '</b></span><span class="muted small">' + esc(reciterName()) + '</span></div>';
          }
          if (S.mark && q[S.mark.s - 1]) {
            out += '<a class="card rowcard" href="#/quran/' + S.mark.s + '/' + S.mark.v + '"><span class="round">' + icon('bookmark') + '</span><span class="grow"><span class="muted small">' + esc(t('continueReading')) + '</span><b style="font-size:17px">' + esc(sName(q[S.mark.s - 1])) + '</b></span><span class="muted small">' + esc(t('ayah')) + ' ' + esc(nf(S.mark.v)) + '</span></a>';
          }
          if (c) c.innerHTML = out;
        }).catch(function () { var el = $('#ayah'); if (el) el.innerHTML = '<p class="ref">' + esc(t('loadError')) + '</p>'; });
        load('hadith').then(function (hs) {
          var el = $('#hd'); if (!el) return;
          var x = hs[dayOfYear() % hs.length];
          el.innerHTML = '<a class="card hadith" href="#/hadith/' + x.n + '"><span class="pill">' + icon('hadith') + esc(t('hadithDay')) + '</span><span class="tx" lang="ar">' + esc(x.ar) + '</span><span class="muted small">' + esc(t('nawawi')) + ' · ' + esc(t('hadithN')) + ' ' + esc(nf(x.n)) + '</span></a>';
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
    h += '<a class="btn" href="#/month">' + esc(t('month30')) + '</a><a class="btn" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(S.lang === 'ar' ? 'مسجد' : 'mosque') + '" target="_blank" rel="noopener">' + esc(t('mosques')) + '</a>';
    return { html: h };
  }

  function viewMonth() {
    var h = '<header class="head"><a class="iconbtn" href="#/prayer" aria-label="' + esc(t('back')) + '"><span class="flip" style="display:flex">' + icon('back') + '</span></a><div style="flex-grow:1"><h1>' + esc(t('month30')) + '</h1><p class="muted small">' + esc(locName()) + '</p></div></header>';
    if (!S.loc) return { html: h + locCard() };
    var rows = '', i, d, df;
    try { df = new Intl.DateTimeFormat(S.lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'numeric' }); } catch (e) { df = null; }
    for (i = 0; i < 30; i++) {
      d = dayTimes(i); var base = partsInTz(new Date(), S.loc.tz); base.setDate(base.getDate() + i);
      rows += '<tr><th scope="row">' + esc(df ? df.format(base) : base.toDateString()) + '</th>' + d.filter(function (x) { return x.k !== 'sunrise'; }).map(function (x) { return '<td>' + esc(fmtTime(x.d).replace(/\s?[صمAP]M?$/i, '')) + '</td>'; }).join('') + '</tr>';
    }
    h += '<p class="notice">' + esc(t('monthNote')) + '</p><section class="card" style="padding:10px;overflow-x:auto"><table class="tt"><thead><tr><th scope="col">' + esc(t('date')) + '</th>' + ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(function (k) { return '<th scope="col">' + esc(t(k)) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table></section>';
    return { html: h };
  }

  /* ---------- tracker ---------- */
  function dkey(off) { var d = partsInTz(new Date(), S.loc && S.loc.tz); d.setDate(d.getDate() - (off || 0)); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var FIVE = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  function viewTracker() {
    var today = S.track[dkey(0)] || {};
    var h = '<header class="head"><div><h1>' + esc(t('tracker')) + '</h1><p class="muted small">' + esc(weekday(new Date())) + ' · ' + esc(hijri(new Date())) + '</p></div></header>' +
      '<section class="card"><h2>' + esc(t('trackToday')) + '</h2><div class="checks">' + FIVE.map(function (k) {
        return '<button class="check" data-act="track" data-v="' + k + '" aria-pressed="' + (!!today[k]) + '"><span class="box">' + icon('check') + '</span><span>' + esc(t(k)) + '</span></button>';
      }).join('') + '</div></section><section class="card"><h2>' + esc(t('last7')) + '</h2><div class="week">';
    var i, wf; try { wf = new Intl.DateTimeFormat(S.lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }); } catch (e) { wf = null; }
    for (i = 6; i >= 0; i--) {
      var rec = S.track[dkey(i)] || {}, n = FIVE.filter(function (k) { return rec[k]; }).length, dd = partsInTz(new Date(), S.loc && S.loc.tz); dd.setDate(dd.getDate() - i);
      h += '<div><span class="col"><span style="height:' + (n * 20) + '%"></span></span><b>' + esc(nf(n)) + '</b><span class="muted small">' + esc(wf ? wf.format(dd) : '') + '</span></div>';
    }
    h += '</div></section><p class="muted small center">' + esc(t('trackNote')) + '</p>';
    return { html: h };
  }

  /* ---------- zakat ---------- */
  function zField(id, label) { var v = S.zakat[id]; return '<div class="field"><label for="z_' + id + '">' + esc(label) + '</label><input class="search" style="border-radius:14px" id="z_' + id + '" data-z="' + id + '" type="number" inputmode="decimal" min="0" step="any" value="' + (v == null ? '' : esc(v)) + '"></div>'; }
  function zCalc() {
    var z = S.zakat, n = function (k) { var x = parseFloat(z[k]); return isNaN(x) || x < 0 ? 0 : x; };
    var gp = n('goldPrice'), sp = n('silverPrice');
    var total = n('cash') + n('trade') + n('gold') * (z.karat || 24) / 24 * gp + n('silver') * sp;
    var nisab = z.basis === 'silver' ? 595 * sp : 85 * gp;
    return { total: total, nisab: nisab, due: nisab > 0 && total >= nisab ? total * 0.025 : 0, ready: nisab > 0 };
  }
  function money(x) { try { return new Intl.NumberFormat(S.lang === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }).format(x); } catch (e) { return String(Math.round(x * 100) / 100); } }
  function zResult() {
    var r = zCalc();
    if (!r.ready) return '<p class="muted">' + esc(t('zNeedPrice')) + '</p>';
    return '<ul class="times"><li><span>' + esc(t('zTotal')) + '</span><span class="t">' + esc(money(r.total)) + '</span></li><li><span>' + esc(t('zNisab')) + '</span><span class="t">' + esc(money(r.nisab)) + '</span></li>' +
      '<li class="on"><span>' + esc(t('zDue')) + '</span><span class="t">' + esc(money(r.due)) + '</span></li></ul>' + (r.total < r.nisab ? '<p class="notice">' + esc(t('zBelow')) + '</p>' : '');
  }
  function viewZakat() {
    var z = S.zakat;
    var h = '<header class="head"><div><h1>' + esc(t('zakat')) + '</h1><p class="muted small">' + esc(t('zPrices')) + '</p></div></header>' +
      '<section class="card">' + zField('goldPrice', t('zGoldPrice')) + zField('silverPrice', t('zSilverPrice')) +
      '<div class="field"><span class="lbl">' + esc(t('zBasis')) + '</span>' + seg('zbasis', z.basis, [['gold', t('zBasisGold')], ['silver', t('zBasisSilver')]]) + '<p class="small muted">' + esc(t('zNote2')) + '</p></div></section>' +
      '<section class="card">' + zField('cash', t('zCash')) + zField('gold', t('zGold')) +
      '<div class="field"><span class="lbl">' + esc(t('zKarat')) + '</span>' + seg('zkarat', z.karat, [[24, nf(24)], [22, nf(22)], [21, nf(21)], [18, nf(18)]]) + '</div>' + zField('silver', t('zSilver')) + zField('trade', t('zTrade')) + '</section>' +
      '<section class="card" id="zres" aria-live="polite">' + zResult() + '</section>' +
      '<section class="card stack small"><p>' + esc(t('zNote1')) + '</p><p>' + esc(t('zNote3')) + '</p><p class="muted">' + esc(t('zNote4')) + '</p></section>';
    return { html: h };
  }

  /* ---------- occasions ---------- */
  function hParts(d) {
    try { var o = {}; new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d).forEach(function (p) { if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); }); return o; } catch (e) { return null; }
  }
  function viewOccasions() {
    var h = '<header class="head"><div><h1>' + esc(t('occasions')) + '</h1><p class="muted small">' + esc(hijri(new Date())) + '</p></div></header>';
    var want = [[9, 1, 'o_ramadan'], [10, 1, 'o_fitr'], [12, 9, 'o_arafah'], [12, 10, 'o_adha'], [1, 1, 'o_newyear'], [1, 10, 'o_ashura']], found = [], seen = {}, white = null, i;
    var base = new Date(); base.setHours(12, 0, 0, 0);
    var gf; try { gf = new Intl.DateTimeFormat(S.lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { gf = null; }
    for (i = 0; i < 400; i++) {
      var d = new Date(base.getTime() + (i + (S.hijri || 0) * -1) * 864e5), hp = hParts(new Date(d.getTime() + (S.hijri || 0) * 864e5));
      if (!hp) break;
      var real = new Date(base.getTime() + i * 864e5); hp = hParts(new Date(real.getTime() + (S.hijri || 0) * 864e5));
      if (!white && hp.day === 13) white = { k: 'o_white', d: real, i: i };
      want.forEach(function (w) { if (!seen[w[2]] && hp.month === w[0] && hp.day === w[1]) { seen[w[2]] = 1; found.push({ k: w[2], d: real, i: i }); } });
    }
    if (white) found.push(white);
    found.sort(function (a, b) { return a.i - b.i; });
    if (!found.length) return { html: h + '<p class="notice">' + esc(t('loadError')) + '</p>' };
    h += '<section class="card"><div class="list">' + found.map(function (x) {
      return '<a href="#/occasions" style="cursor:default"><span class="num" style="width:auto;min-width:54px;padding:0 8px">' + (x.i === 0 ? esc(t('todayW')) : esc(nf(x.i))) + '</span><span class="grow"><span class="nm" style="font-size:17px">' + esc(t(x.k)) + '</span><span class="muted small">' + esc(gf ? gf.format(x.d) : x.d.toDateString()) + (x.i > 0 ? ' · ' + esc(t('inDays')) + ' ' + esc(nf(x.i)) + ' ' + esc(t('dayWord')) : '') + '</span></span></a>';
    }).join('') + '</div></section><p class="notice">' + esc(t('occNote')) + '</p>';
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

  function viewSurah(id, verse, openT) {
    var h = '<header class="head"><a class="iconbtn" href="#/quran" aria-label="' + esc(t('back')) + '"><span class="flip" style="display:flex">' + icon('back') + '</span></a><div style="flex-grow:1" id="shead"><h1>' + esc(t('quran')) + '</h1></div></header>' +
      '<section class="card player"><button class="round" data-act="aud-play" data-s="' + id + '" aria-label="' + esc(t('play')) + '">' + icon('play', true) + '</button><div class="grow"><b>' + esc(t('listen')) + '</b><label class="sr-only" for="rec">' + esc(t('reciter')) + '</label><select id="rec" data-act="reciter">' +
      RECITERS.map(function (r) { return '<option value="' + r[0] + '"' + (S.reciter === r[0] ? ' selected' : '') + '>' + esc(S.lang === 'ar' ? r[1] : r[2]) + '</option>'; }).join('') + '</select></div></section>' +
      '<section class="card mushaf" id="mushaf"><p class="muted">' + esc(t('loading')) + '</p></section><div id="pager"></div>';
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
            selVerse = { s: s.id, v: +el.getAttribute('data-v') }; renderDock();
          }
          box.addEventListener('click', function (e) { var el = e.target.closest ? e.target.closest('span[data-v]') : null; if (el) pick(el); });
          box.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('data-v')) { e.preventDefault(); pick(e.target); } });
          if (verse) {
            var target = $('.ayat span[data-v="' + verse + '"]');
            if (target) setTimeout(function () { target.scrollIntoView({ block: 'center' }); pick(target); if (openT) openTafsir(s.id, verse); }, 60);
          }
        }).catch(function () { loadFail('#mushaf'); });
      }
    };
  }

  var normCache = null;
  function viewSearch() {
    var h = '<header class="head"><div><h1>' + esc(t('search')) + '</h1><p class="muted small">' + esc(t('quran')) + '</p></div></header>' +
      '<label class="sr-only" for="sq">' + esc(t('searchPh')) + '</label><input class="search" id="sq" type="search" lang="ar" dir="rtl" placeholder="' + esc(t('searchPh')) + '" autocomplete="off">' +
      '<p class="muted small" id="sinfo" role="status">' + esc(t('searchHint')) + '</p><section class="card" id="sres" hidden></section>';
    return {
      html: h,
      after: function () {
        var inp = $('#sq'), timer = null;
        function run() {
          var v = norm(inp.value), info = $('#sinfo'), box = $('#sres'); if (!info || !box) return;
          if (v.length < 3) { box.hidden = true; info.textContent = t('searchHint'); return; }
          info.textContent = t('loading');
          Promise.all([load('quran'), load('search')]).then(function (r) {
            var q = r[0], sr = r[1];
            if (!normCache) normCache = sr.map(function (a) { return a.map(norm); });
            var out = [], total = 0, i, j;
            for (i = 0; i < 114; i++) for (j = 0; j < normCache[i].length; j++) {
              if (normCache[i][j].indexOf(v) !== -1) { total++; if (out.length < 50) out.push([i, j]); }
            }
            if (norm(inp.value) !== v) return;
            info.textContent = total ? nf(total) + ' ' + t('results') + (total > 50 ? ' — ' + t('moreResults') : '') : t('noResults');
            box.hidden = !total;
            box.innerHTML = out.map(function (x) {
              var s = q[x[0]];
              return '<a class="result" href="#/quran/' + s.id + '/' + (x[1] + 1) + '"><span class="v" lang="ar">' + esc(s.verses[x[1]]) + '</span><span class="r">' + esc(sName(s)) + ' · ' + esc(t('ayah')) + ' ' + esc(nf(x[1] + 1)) + '</span></a>';
            }).join('');
          }).catch(function () { info.textContent = t('loadError'); });
        }
        inp.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 300); });
        inp.focus();
      }
    };
  }

  function viewHadithIndex() {
    var h = '<header class="head"><div><h1>' + esc(t('nawawi')) + '</h1><p class="muted small" lang="ar">الإمام يحيى بن شرف النووي</p></div></header><section class="card"><div class="list" id="hlist"><p class="muted">' + esc(t('loading')) + '</p></div></section>';
    return {
      html: h,
      after: function () {
        load('hadith').then(function (hs) {
          var l = $('#hlist'); if (!l) return;
          l.innerHTML = hs.map(function (x) {
            return '<a href="#/hadith/' + x.n + '"><span class="num">' + esc(nf(x.n)) + '</span><span class="grow"><span class="nm" style="font-size:16px">' + esc(t('hadithN')) + ' ' + esc(nf(x.n)) + '</span><span class="muted small" lang="ar" dir="rtl" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(x.ar.slice(0, 70)) + '…</span></span></a>';
          }).join('');
        }).catch(function () { loadFail('#hlist'); });
      }
    };
  }
  function viewHadith(n) {
    var h = '<header class="head"><a class="iconbtn" href="#/hadith" aria-label="' + esc(t('back')) + '"><span class="flip" style="display:flex">' + icon('back') + '</span></a><div style="flex-grow:1"><h1>' + esc(t('hadithN')) + ' ' + esc(nf(n)) + '</h1><p class="muted small">' + esc(t('nawawi')) + '</p></div></header><div id="hbody" class="stack"><p class="muted">' + esc(t('loading')) + '</p></div>';
    return {
      html: h,
      after: function () {
        load('hadith').then(function (hs) {
          var x = hs[n - 1], b = $('#hbody'); if (!b) return;
          if (!x) { location.hash = '#/hadith'; return; }
          var out = '<article class="card"><p class="ar-text" lang="ar">' + esc(x.ar) + '</p></article>';
          if (S.lang === 'en' && x.en) out += '<article class="card"><p lang="en" dir="ltr" style="line-height:1.8">' + esc(x.en) + '</p></article>';
          out += '<div class="pager">' + (n > 1 ? '<a class="btn" href="#/hadith/' + (n - 1) + '">' + esc(t('hadithN')) + ' ' + esc(nf(n - 1)) + '</a>' : '<span></span>') + (n < hs.length ? '<a class="btn" href="#/hadith/' + (n + 1) + '">' + esc(t('hadithN')) + ' ' + esc(nf(n + 1)) + '</a>' : '<span></span>') + '</div>';
          b.innerHTML = out;
        }).catch(function () { loadFail('#hbody'); });
      }
    };
  }

  function viewKhatma() {
    var h = '<header class="head"><div><h1>' + esc(t('khatma')) + '</h1><p class="muted small">' + esc(t('khatmaNote')) + '</p></div></header><div id="kbody" class="stack"><p class="muted">' + esc(t('loading')) + '</p></div>';
    return {
      html: h,
      after: function () {
        Promise.all([load('quran'), load('meta')]).then(function (r) {
          var q = r[0], m = r[1], b = $('#kbody'); if (!b) return;
          var k = S.khatma;
          if (!k) {
            b.innerHTML = '<section class="card stack"><h2>' + esc(t('khatmaIn')) + '</h2><p class="muted small">' + esc(t('khatmaIntro')) + '</p><div class="chips">' +
              [30, 60, 90, 120].map(function (d) { return '<button class="chip" data-act="k-start" data-v="' + d + '">' + esc(nf(d)) + ' ' + esc(t('days')) + '</button>'; }).join('') + '</div></section>';
            return;
          }
          if (k.done >= k.days) {
            b.innerHTML = '<section class="card stack center"><p class="big">' + esc(nf(100)) + '%</p><p>' + esc(t('khatmaDone')) + '</p><button class="btn primary" data-act="k-reset">' + esc(t('khatmaReset')) + '</button></section>';
            return;
          }
          var d = khatmaToday(m), s1 = q[d.start[0] - 1], end;
          if (d.next) { end = d.next[1] > 1 ? [d.next[0], d.next[1] - 1] : [d.next[0] - 1, q[d.next[0] - 2].verses.length]; } else end = [114, q[113].verses.length];
          var s2 = q[end[0] - 1], pct = Math.round(k.done * 100 / k.days);
          b.innerHTML = '<section class="next"><div class="top"><div><div class="dim">' + esc(t('todayWird')) + '</div><div class="name">' + esc(t('dayN')) + ' ' + esc(nf(k.done + 1)) + ' / ' + esc(nf(k.days)) + '</div></div><div style="text-align:end"><div class="time">' + esc(nf(pct)) + '%</div></div></div><hr>' +
            '<div class="dim">' + esc(t('pages')) + ': ' + esc(nf(d.from)) + ' – ' + esc(nf(d.to)) + '</div></section>' +
            '<section class="card"><ul class="times"><li><span>' + esc(t('fromV')) + '</span><span>' + esc(sName(s1)) + ' · ' + esc(t('ayah')) + ' ' + esc(nf(d.start[1])) + '</span></li><li><span>' + esc(t('toV')) + '</span><span>' + esc(sName(s2)) + ' · ' + esc(t('ayah')) + ' ' + esc(nf(end[1])) + '</span></li></ul></section>' +
            '<a class="btn gold" href="#/quran/' + d.start[0] + '/' + d.start[1] + '">' + esc(t('startReading')) + '</a><button class="btn primary" data-act="k-done">' + esc(t('doneToday')) + '</button><button class="btn" data-act="k-reset">' + esc(t('khatmaReset')) + '</button>';
        }).catch(function () { loadFail('#kbody'); });
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
      '<section class="card"><div class="field"><label for="rec">' + esc(t('reciter')) + '</label><select id="rec" data-act="reciter">' + RECITERS.map(function (r) { return '<option value="' + r[0] + '"' + (S.reciter === r[0] ? ' selected' : '') + '>' + esc(S.lang === 'ar' ? r[1] : r[2]) + '</option>'; }).join('') + '</select></div></section>' +
      '<a class="card rowcard" href="#/sources"><span class="round">' + icon('info') + '</span><span class="grow"><b style="font-size:17px">' + esc(t('sources')) + '</b><span class="muted small">' + esc(t('version')) + ' ' + esc(VERSION) + '</span></span></a>';
    return { html: h };
  }

  function viewSources() {
    var ar = S.lang === 'ar';
    var L = function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u.replace(/^https?:\/\//, '') + '</a>'; };
    var h = '<header class="head"><a class="iconbtn" href="#/settings" aria-label="' + esc(t('back')) + '"><span class="flip" style="display:flex">' + icon('back') + '</span></a><div style="flex-grow:1"><h1>' + esc(t('sources')) + '</h1></div></header>';
    if (ar) {
      h += '<section class="card src"><h2>القرآن الكريم</h2><p>النص القرآني برواية حفص عن عاصم بالرسم العثماني، من الإصدار الرقمي الرسمي لمجمع الملك فهد لطباعة المصحف الشريف (الإصدار 18)، معروض بخط المجمع «حفص» دون أي تعديل على النص.</p><p>' + L('https://qurancomplex.gov.sa/techquran/dev/') + '</p></section>' +
        '<section class="card src"><h2>البحث في القرآن</h2><p>يبحث في النص الإملائي من الإصدار نفسه لمجمع الملك فهد، ويعرض النتائج بالرسم العثماني.</p></section>' +
        '<section class="card src"><h2>التفسير</h2><p>«التفسير الميسّر» الصادر عن مجمع الملك فهد لطباعة المصحف الشريف، بالنسخة الرقمية التي ينشرها مشروع تنزيل.</p><p>' + L('https://tanzil.net/trans/') + '</p></section>' +
        '<section class="card src"><h2>التلاوات</h2><p>تُبثّ مباشرة من المكتبة الصوتية للقرآن الكريم mp3quran.net، برواية حفص عن عاصم.</p><p>' + L('https://mp3quran.net') + '</p></section>' +
        '<section class="card src"><h2>الأربعون النووية</h2><p>للإمام يحيى بن شرف النووي رحمه الله، بالنص المنشور في موقع sunnah.com.</p><p>' + L('https://sunnah.com/nawawi40') + '</p></section>' +
        '<section class="card src"><h2>الأذكار</h2><p>من كتاب «حصن المسلم من أذكار الكتاب والسنة» للشيخ د. سعيد بن علي بن وهف القحطاني رحمه الله، مع تخريج الأحاديث كما ورد في الكتاب. عُرضت فقط الأذكار التي تطابق نصّها في نسختين رقميتين مستقلتين من الكتاب.</p></section>' +
        '<section class="card src"><h2>مواقيت الصلاة والقبلة</h2><p>تُحسب على جهازك بمكتبة Adhan مفتوحة المصدر، المبنية على المعادلات الفلكية في كتاب «Astronomical Algorithms» لجان ميوس. طرق الحساب المتاحة هي المعتمدة لدى الهيئات المذكورة في الإعدادات.</p><p>' + L('https://github.com/batoulapps/adhan-js') + '</p></section>' +
        '<section class="card src"><h2>حاسبة الزكاة</h2><p>نصاب الذهب 85 غرامًا ونصاب الفضة 595 غرامًا والواجب ربع العشر (2.5%)، كما في الموسوعة الفقهية لموقع الدرر السنية وفتاوى دار الإفتاء المصرية.</p><p>' + L('https://dorar.net/feqhia/2153') + '</p></section>' +
        '<section class="card src"><h2>التاريخ الهجري</h2><p>تقويم أم القرى كما توفّره أنظمة التشغيل والمتصفحات، وقد يختلف يومًا عن رؤية الهلال في بلدك. يمكن تعديله من الإعدادات.</p></section>' +
        '<section class="card src"><h2>تنبيه</h2><p>هذه نسخة أولى. المحتوى الديني منقول من مصادره دون تصرّف، ومع ذلك يُنصح بمراجعته من أهل العلم. إذا وجدت خطأ فأبلغنا لتصحيحه.</p><p class="muted small">الخصوصية: لا يجمع التطبيق أي بيانات. موقعك وإعداداتك تبقى على جهازك.</p></section>';
    } else {
      h += '<section class="card src"><h2>The Quran</h2><p>Hafs ‘an ‘Asim in Uthmani script, from the official digital release of the King Fahd Glorious Quran Printing Complex (version 18), shown in the Complex’s own Hafs font with no change to the text.</p><p>' + L('https://qurancomplex.gov.sa/en/techquran/dev/') + '</p></section>' +
        '<section class="card src"><h2>Quran search</h2><p>Searches the plain-spelling text from the same King Fahd Complex release and shows results in Uthmani script.</p></section>' +
        '<section class="card src"><h2>Tafsir and translation</h2><p>“Al-Tafsir al-Muyassar” by the King Fahd Glorious Quran Printing Complex, and the Saheeh International English translation, both in the digital editions published by the Tanzil project.</p><p>' + L('https://tanzil.net/trans/') + '</p></section>' +
        '<section class="card src"><h2>Recitations</h2><p>Streamed from the mp3quran.net audio library, in the Hafs ‘an ‘Asim narration.</p><p>' + L('https://mp3quran.net') + '</p></section>' +
        '<section class="card src"><h2>An-Nawawi’s Forty</h2><p>By Imam Yahya ibn Sharaf an-Nawawi, in the text published on sunnah.com.</p><p>' + L('https://sunnah.com/nawawi40') + '</p></section>' +
        '<section class="card src"><h2>Adhkar</h2><p>From “Hisn al-Muslim” (Fortress of the Muslim) by Shaykh Dr Sa‘id ibn ‘Ali ibn Wahf al-Qahtani, with the hadith references given in the book. Only adhkar whose text matched in two independent digital copies of the book are included.</p></section>' +
        '<section class="card src"><h2>Prayer times and Qibla</h2><p>Calculated on your device with the open-source Adhan library, based on Jean Meeus’s “Astronomical Algorithms”. The available methods are those of the authorities listed in Settings.</p><p>' + L('https://github.com/batoulapps/adhan-js') + '</p></section>' +
        '<section class="card src"><h2>Zakat calculator</h2><p>Nisab of 85 g of gold or 595 g of silver, and a rate of 2.5%, as stated in the Dorar fiqh encyclopedia and by Egypt’s Dar al-Ifta.</p><p>' + L('https://dorar.net/feqhia/2153') + '</p></section>' +
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
    if (!keepScroll) { selVerse = null; closeSheet(); }
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    var v, section = 'home';
    switch (parts[0]) {
      case 'prayer': v = viewPrayer(); section = 'prayer'; break;
      case 'qibla': v = viewQibla(); section = 'prayer'; break;
      case 'quran': section = 'quran'; v = parts[1] ? viewSurah(parseInt(parts[1], 10) || 1, parseInt(parts[2], 10) || 0, parts[3] === 't') : viewQuranIndex(); break;
      case 'search': section = 'quran'; v = viewSearch(); break;
      case 'hadith': v = parts[1] ? viewHadith(parseInt(parts[1], 10) || 1) : viewHadithIndex(); break;
      case 'khatma': v = viewKhatma(); break;
      case 'month': section = 'prayer'; v = viewMonth(); break;
      case 'tracker': v = viewTracker(); break;
      case 'zakat': v = viewZakat(); break;
      case 'occasions': v = viewOccasions(); break;
      case 'adhkar': section = 'adhkar'; v = parts[1] ? viewAdhkarCat(parts[1]) : viewAdhkarIndex(); break;
      case 'tasbih': section = 'adhkar'; v = viewTasbih(); break;
      case 'settings': section = 'settings'; v = viewSettings(); break;
      case 'sources': section = 'settings'; v = viewSources(); break;
      default: v = viewHome();
    }
    applyLook();
    var y = window.scrollY;
    $('#app').innerHTML = v.html;
    renderNav(section); renderDock();
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
    else if (a === 'tafsir') { if (selVerse) openTafsir(selVerse.s, selVerse.v); }
    else if (a === 'sheet-close') closeSheet();
    else if (a === 'aud-play') playSurah(+el.getAttribute('data-s'), 0);
    else if (a === 'aud-resume') { if (S.audio) playSurah(S.audio.s, S.audio.t || 0); }
    else if (a === 'aud-toggle') { if (audio && playing) { if (audio.paused) { var pp = audio.play(); if (pp && pp.catch) pp.catch(function () {}); } else audio.pause(); } }
    else if (a === 'aud-stop') stopAudio();
    else if (a === 'track') { var dk = dkey(0), rec = S.track[dk] || {}; rec[v] = !rec[v]; S.track[dk] = rec; var keys = Object.keys(S.track).sort(); while (keys.length > 120) delete S.track[keys.shift()]; save('track', S.track); render(true); }
    else if (a === 'zbasis') { S.zakat.basis = v; save('zakat', S.zakat); render(true); }
    else if (a === 'zkarat') { S.zakat.karat = parseInt(v, 10); save('zakat', S.zakat); render(true); }
    else if (a === 'k-start') { save('khatma', { days: parseInt(v, 10), done: 0 }); render(true); }
    else if (a === 'k-done') { S.khatma.done += 1; save('khatma', S.khatma); render(false); }
    else if (a === 'k-reset') { save('khatma', null); render(false); }
    else if (a === 'mark') {
      if (!selVerse) return;
      save('mark', { s: selVerse.s, v: selVerse.v });
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
  document.addEventListener('input', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-z'); if (!k) return;
    S.zakat[k] = e.target.value; save('zakat', S.zakat);
    var r = $('#zres'); if (r) r.innerHTML = zResult();
  });
  document.addEventListener('change', function (e) {
    var el = e.target, a = el.getAttribute && el.getAttribute('data-act');
    if (a === 'city') { if (el.value === '') return; var c = CITIES[+el.value]; setLoc({ lat: c.lat, lng: c.lng, city: +el.value, tz: c.tz }); }
    else if (a === 'method') { save('method', el.value); render(true); }
    else if (a === 'reciter') { save('reciter', el.value); if (playing) { var cur = playing, at = audio ? audio.currentTime : 0; playing = null; playSurah(cur, at); } }
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
