/*
 * build_deck.js — يولّد عرض باوربوينت عربي (RTL) يشرح مشروع كاشف روابط التصيّد.
 * التشغيل: node slides/build_deck.js
 */
const pptxgen = require("pptxgenjs");
const path = require("path");

const FIG = path.join(__dirname, "..", "figures");
const OUT = path.join(__dirname, "phishing_detector_presentation.pptx");

// ---- لوحة الألوان (أمن سيبراني: كحلي داكن + فيروزي) ----
const C = {
  bgDark: "0F1B2D",
  panel: "1B2A4A",
  card: "17233D",
  teal: "2DD4BF",
  tealDim: "14B8A6",
  light: "F1F5F9",
  muted: "94A3B8",
  red: "EF4444",
  green: "22C55E",
  white: "FFFFFF",
};

const FONT = "Arial"; // يدعم العربية ويُعرض بعرض صحيح
const pres = new pptxgen();
pres.defineLayout({ name: "W", width: 13.3, height: 7.5 });
pres.layout = "W";
pres.author = "Zahra Mohammed";
pres.title = "Phishing URL Detector";

// ---------- دوال مساعدة (كل واحدة ترجّع كائن خيارات جديد) ----------
function darkBg(slide) {
  slide.background = { color: C.bgDark };
}
function lightBg(slide) {
  slide.background = { color: C.white };
}
// عنوان علوي موحّد لشرائح المحتوى (محاذاة يمين للعربية)
function title(slide, text, dark = false) {
  slide.addText(text, {
    x: 0.5, y: 0.35, w: 12.3, h: 0.9,
    fontFace: FONT, fontSize: 30, bold: true,
    color: dark ? C.light : C.panel,
    align: "right", rtlMode: true, isTextBox: true, margin: 0,
  });
  // نقطة فيروزية صغيرة على اليسار (الجهة الفارغة في العناوين العربية)
  slide.addShape(pres.ShapeType.ellipse, {
    x: 0.5, y: 0.72, w: 0.22, h: 0.22, fill: { color: C.teal },
  });
}
function body(slide, text, opts = {}) {
  slide.addText(text, Object.assign({
    fontFace: FONT, fontSize: 16, color: C.panel,
    align: "right", rtlMode: true, isTextBox: true, valign: "top",
  }, opts));
}
// بطاقة رقم كبير (إحصائية)
function statCard(slide, x, y, w, number, label, accent = C.teal) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h: 1.7, rectRadius: 0.12,
    fill: { color: C.card }, line: { color: accent, width: 1 },
  });
  slide.addText(number, {
    x, y: y + 0.18, w, h: 0.95, fontFace: FONT, fontSize: 40, bold: true,
    color: accent, align: "center", isTextBox: true, margin: 0,
  });
  slide.addText(label, {
    x: x + 0.1, y: y + 1.1, w: w - 0.2, h: 0.5, fontFace: FONT, fontSize: 13,
    color: C.light, align: "center", rtlMode: true, isTextBox: true, margin: 0,
  });
}

// =====================================================================
// الشريحة 1 — الغلاف
// =====================================================================
(function () {
  const s = pres.addSlide();
  darkBg(s);
  // حلقة فيروزية كشعار (دائرتان)
  s.addShape(pres.ShapeType.ellipse, { x: 5.9, y: 0.75, w: 1.5, h: 1.5, fill: { color: C.bgDark }, line: { color: C.teal, width: 3 } });
  s.addShape(pres.ShapeType.ellipse, { x: 6.35, y: 1.2, w: 0.6, h: 0.6, fill: { color: C.teal } });
  s.addText("كاشف روابط التصيّد", {
    x: 1, y: 2.55, w: 11.3, h: 1.0, fontFace: FONT, fontSize: 48, bold: true,
    color: C.light, align: "center", rtlMode: true, isTextBox: true,
  });
  s.addText("نظام كشف دفاعي باستخدام تعلّم الآلة", {
    x: 1, y: 3.6, w: 11.3, h: 0.6, fontFace: FONT, fontSize: 22,
    color: C.teal, align: "center", rtlMode: true, isTextBox: true,
  });
  s.addText("Phishing URL Detection with Machine Learning", {
    x: 1, y: 4.2, w: 11.3, h: 0.5, fontFace: FONT, fontSize: 15, italic: true,
    color: C.muted, align: "center", isTextBox: true,
  });
  // شريط معلومات سفلي (بطاقة لا خط)
  s.addShape(pres.ShapeType.roundRect, { x: 3.4, y: 5.5, w: 6.5, h: 1.0, rectRadius: 0.1, fill: { color: C.panel } });
  s.addText("زهراء محمد  ·  دراسات الدكتوراه — علوم الحاسبات", {
    x: 3.4, y: 5.6, w: 6.5, h: 0.45, fontFace: FONT, fontSize: 15, bold: true,
    color: C.light, align: "center", rtlMode: true, isTextBox: true, margin: 0,
  });
  s.addText("مشروع أمن سيبراني دفاعي — لأغراض بحثية وتعليمية", {
    x: 3.4, y: 6.02, w: 6.5, h: 0.4, fontFace: FONT, fontSize: 12,
    color: C.muted, align: "center", rtlMode: true, isTextBox: true, margin: 0,
  });
})();

// =====================================================================
// الشريحة 2 — ما هو التصيّد
// =====================================================================
(function () {
  const s = pres.addSlide();
  lightBg(s);
  title(s, "ما هي هجمات التصيّد (Phishing)؟");
  body(s,
    "التصيّد هو خداع المستخدم عبر رابط أو رسالة مزيّفة تنتحل جهة موثوقة " +
    "(بنك، إنستغرام، بريد...) بهدف سرقة بيانات الدخول أو المعلومات الحساسة.",
    { x: 0.7, y: 1.5, w: 11.9, h: 1.0, fontSize: 18, color: C.panel });

  const rows = [
    ["الرابط هو سلاح الهجوم الأول", "معظم هجمات التصيّد تبدأ برابط يُرسل عبر رسالة أو بريد."],
    ["يصعب تمييزه بالعين", "الروابط المزيّفة تحاكي الحقيقية بتغييرات بسيطة جداً."],
    ["الكشف المبكّر = الحماية", "إيقاف الرابط قبل الضغط عليه يمنع الاختراق من أساسه."],
  ];
  let y = 2.7;
  rows.forEach((r, i) => {
    s.addShape(pres.ShapeType.roundRect, { x: 0.7, y, w: 11.9, h: 1.15, rectRadius: 0.1, fill: { color: "F1F5F9" } });
    // دائرة رقم
    s.addShape(pres.ShapeType.ellipse, { x: 11.75, y: y + 0.32, w: 0.55, h: 0.55, fill: { color: C.teal } });
    s.addText(String(i + 1), { x: 11.75, y: y + 0.32, w: 0.55, h: 0.55, fontFace: FONT, fontSize: 20, bold: true, color: C.white, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText(r[0], { x: 1.0, y: y + 0.18, w: 10.5, h: 0.45, fontFace: FONT, fontSize: 17, bold: true, color: C.panel, align: "right", rtlMode: true, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: 1.0, y: y + 0.62, w: 10.5, h: 0.45, fontFace: FONT, fontSize: 13, color: "475569", align: "right", rtlMode: true, isTextBox: true, margin: 0 });
    y += 1.3;
  });
})();

// =====================================================================
// الشريحة 3 — الإطار الأخلاقي
// =====================================================================
(function () {
  const s = pres.addSlide();
  darkBg(s);
  title(s, "الإطار الأخلاقي: دفاع لا هجوم", true);
  s.addText("هذا المشروع يحمي المستخدمين ولا يستهدف أي شخص أو نظام حقيقي.", {
    x: 0.5, y: 1.4, w: 12.3, h: 0.5, fontFace: FONT, fontSize: 16,
    color: C.muted, align: "right", rtlMode: true, isTextBox: true,
  });

  // عمود أخضر: ما نفعله
  s.addShape(pres.ShapeType.roundRect, { x: 6.9, y: 2.15, w: 5.9, h: 4.7, rectRadius: 0.12, fill: { color: C.card }, line: { color: C.green, width: 1.5 } });
  s.addText("✓  ما يقوم به المشروع", { x: 7.0, y: 2.35, w: 5.7, h: 0.5, fontFace: FONT, fontSize: 19, bold: true, color: C.green, align: "right", rtlMode: true, isTextBox: true, margin: 0 });
  s.addText([
    { text: "تحليل بنية الرابط نصّياً فقط (بدون فتحه)", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "تصنيف الرابط: آمن أو تصيّد مع نسبة ثقة", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "التدريب على بيانات مخبرية مُصرّح بها", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "بناء أداة حماية قابلة للنشر والبحث", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 7.0, y: 3.0, w: 5.7, h: 3.6, fontFace: FONT, fontSize: 15, color: C.light, align: "right", rtlMode: true, isTextBox: true, paraSpaceAfter: 14 });

  // عمود أحمر: ما لا نفعله
  s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 2.15, w: 5.9, h: 4.7, rectRadius: 0.12, fill: { color: C.card }, line: { color: C.red, width: 1.5 } });
  s.addText("✕  ما لا يقوم به إطلاقاً", { x: 0.6, y: 2.35, w: 5.7, h: 0.5, fontFace: FONT, fontSize: 19, bold: true, color: C.red, align: "right", rtlMode: true, isTextBox: true, margin: 0 });
  s.addText([
    { text: "لا يخترق أي حساب أو تطبيق حقيقي", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "لا ينشئ روابط تصيّد أو صفحات مزيّفة", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "لا يتتبّع أو يراقب أي شخص", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "لا يُستخدم ضد مستخدمين بدون إذن", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 0.6, y: 3.0, w: 5.7, h: 3.6, fontFace: FONT, fontSize: 15, color: C.light, align: "right", rtlMode: true, isTextBox: true, paraSpaceAfter: 14 });
})();

// =====================================================================
// الشريحة 4 — فكرة العمل (Pipeline)
// =====================================================================
(function () {
  const s = pres.addSlide();
  lightBg(s);
  title(s, "فكرة العمل: من رابط إلى قرار");
  const steps = [
    ["الرابط", "URL المُدخَل", C.panel],
    ["استخراج الخصائص", "تحويله إلى ~27 رقماً", C.tealDim],
    ["نموذج التعلّم", "Random Forest", C.tealDim],
    ["القرار", "آمن / تصيّد + الثقة", C.green],
  ];
  // نرسم من اليمين لليسار (اتجاه القراءة العربي)
  const w = 2.7, gap = 0.45, h = 2.2, y = 2.6;
  let x = 13.3 - 0.5 - w; // أول بطاقة على اليمين
  steps.forEach((st, i) => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: "F1F5F9" }, line: { color: st[2], width: 2 } });
    s.addText(st[0], { x, y: y + 0.55, w, h: 0.7, fontFace: FONT, fontSize: 19, bold: true, color: st[2], align: "center", rtlMode: true, isTextBox: true, margin: 0 });
    s.addText(st[1], { x: x + 0.1, y: y + 1.25, w: w - 0.2, h: 0.6, fontFace: FONT, fontSize: 13, color: "475569", align: "center", rtlMode: true, isTextBox: true, margin: 0 });
    // سهم لليسار بين البطاقات
    if (i < steps.length - 1) {
      s.addText("◀", { x: x - gap - 0.05, y: y + h / 2 - 0.3, w: gap + 0.1, h: 0.6, fontFace: FONT, fontSize: 22, color: C.tealDim, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    }
    x -= (w + gap);
  });
  s.addText("التحليل يعتمد على شكل الرابط فقط (Lexical) — سريع وآمن ولا يحتاج فتح الرابط.", {
    x: 0.7, y: 5.4, w: 11.9, h: 0.6, fontFace: FONT, fontSize: 15, italic: true, color: "475569",
    align: "center", rtlMode: true, isTextBox: true,
  });
})();

// =====================================================================
// الشريحة 5 — استخراج الخصائص (جدول)
// =====================================================================
(function () {
  const s = pres.addSlide();
  lightBg(s);
  title(s, "استخراج الخصائص (Feature Extraction)");
  body(s, "نحوّل كل رابط إلى أرقام تصف بنيته. أمثلة على الفروق بين الآمن والتصيّد:", {
    x: 0.7, y: 1.45, w: 11.9, h: 0.5, fontSize: 16 });

  const header = ["الخاصية", "رابط آمن", "رابط تصيّد"].map((t) => ({
    text: t, options: { fill: { color: C.panel }, color: C.white, bold: true, fontSize: 15, align: "center", rtlMode: true, valign: "middle" },
  }));
  const data = [
    ["طول الرابط", "قصير نسبياً", "طويل غالباً"],
    ["وجود عنوان IP بدل اسم", "نادر", "شائع"],
    ["رمز @ في الرابط", "لا", "يُستخدم للإخفاء"],
    ["كلمات خداع (login, verify)", "قليلة", "كثيرة"],
    ["انتحال علامة تجارية", "لا", "نعم"],
    ["نطاق علوي مشبوه (.tk .xyz)", "نادر", "شائع"],
    ["استخدام HTTPS", "غالباً نعم", "غالباً لا"],
  ];
  const rows = [header];
  data.forEach((r, i) => {
    const bg = i % 2 ? "EEF2F7" : "FFFFFF";
    rows.push([
      { text: r[0], options: { fill: { color: bg }, color: C.panel, bold: true, fontSize: 13, align: "right", rtlMode: true, valign: "middle" } },
      { text: r[1], options: { fill: { color: bg }, color: "16803C", fontSize: 13, align: "center", rtlMode: true, valign: "middle" } },
      { text: r[2], options: { fill: { color: bg }, color: "B91C1C", fontSize: 13, align: "center", rtlMode: true, valign: "middle" } },
    ]);
  });
  s.addTable(rows, { x: 0.7, y: 2.1, w: 11.9, colW: [5.1, 3.4, 3.4], rowH: 0.52, border: { type: "solid", color: "D8DEE9", pt: 1 }, fontFace: FONT });
})();

// =====================================================================
// الشريحة 6 — البيانات
// =====================================================================
(function () {
  const s = pres.addSlide();
  darkBg(s);
  title(s, "مجموعة البيانات", true);
  statCard(s, 9.6, 1.7, 3.2, "6,000", "رابط إجمالي", C.teal);
  statCard(s, 6.2, 1.7, 3.2, "50 / 50", "آمن مقابل تصيّد", C.teal);
  statCard(s, 2.8, 1.7, 3.2, "27", "خاصية لكل رابط", C.teal);

  s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 3.9, w: 12.3, h: 2.9, rectRadius: 0.12, fill: { color: C.card } });
  s.addText("ملاحظة بحثية مهمة", { x: 0.8, y: 4.1, w: 11.7, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: C.teal, align: "right", rtlMode: true, isTextBox: true, margin: 0 });
  s.addText([
    { text: "البيانات هنا مُولّدة اصطناعياً لأغراض بناء النموذج وتجربته.", options: { breakLine: true } },
    { text: "للبحث النهائي يُستبدَل الملف ببيانات حقيقية من: PhishTank · OpenPhish · Tranco · UCI/Kaggle.", options: { breakLine: true } },
    { text: "الكود مصمَّم ليقبل أي ملف بنفس الأعمدة (url, label) دون تعديل.", options: { breakLine: false } },
  ], { x: 0.8, y: 4.65, w: 11.7, h: 2.0, fontFace: FONT, fontSize: 15, color: C.light, align: "right", rtlMode: true, isTextBox: true, paraSpaceAfter: 12 });
})();

// =====================================================================
// الشريحة 7 — النموذج
// =====================================================================
(function () {
  const s = pres.addSlide();
  lightBg(s);
  title(s, "النموذج: الغابة العشوائية (Random Forest)");
  body(s,
    "الغابة العشوائية = مجموعة كبيرة من «أشجار القرار» تعمل معاً. كل شجرة تعطي رأيها، " +
    "والقرار النهائي بالتصويت. هذا يجعل النموذج دقيقاً ومقاوماً للضجيج.",
    { x: 0.7, y: 1.5, w: 11.9, h: 1.1, fontSize: 17 });

  const pts = [
    ["دقّة عالية", "التصويت الجماعي يقلّل الأخطاء الفردية"],
    ["قابل للتفسير", "يعطينا «أهمية كل خاصية» — مهم للبحث العلمي"],
    ["سريع وعملي", "يدرّب ويتنبّأ بسرعة على آلاف الروابط"],
  ];
  let x = 13.3 - 0.7 - 3.8;
  pts.forEach((p) => {
    s.addShape(pres.ShapeType.roundRect, { x, y: 3.1, w: 3.8, h: 2.9, rectRadius: 0.12, fill: { color: "F1F5F9" }, line: { color: C.tealDim, width: 1 } });
    s.addShape(pres.ShapeType.ellipse, { x: x + 3.0, y: 3.35, w: 0.55, h: 0.55, fill: { color: C.tealDim } });
    s.addText(p[0], { x: x + 0.2, y: 3.95, w: 3.4, h: 0.6, fontFace: FONT, fontSize: 18, bold: true, color: C.panel, align: "right", rtlMode: true, isTextBox: true, margin: 0 });
    s.addText(p[1], { x: x + 0.2, y: 4.6, w: 3.4, h: 1.2, fontFace: FONT, fontSize: 14, color: "475569", align: "right", rtlMode: true, isTextBox: true, margin: 0 });
    x -= 4.0;
  });
})();

// =====================================================================
// الشريحة 8 — النتائج
// =====================================================================
(function () {
  const s = pres.addSlide();
  darkBg(s);
  title(s, "النتائج على بيانات الاختبار", true);
  // بطاقات المقاييس على اليمين
  statCard(s, 9.5, 1.55, 3.3, "97.4%", "الدقّة Accuracy", C.teal);
  statCard(s, 9.5, 3.45, 3.3, "97.8%", "الضبط Precision", C.teal);
  statCard(s, 9.5, 5.35, 3.3, "97.0%", "الاستدعاء Recall", C.teal);
  statCard(s, 6.0, 5.35, 3.3, "97.3%", "ROC-AUC", C.green);
  // مصفوفة الالتباس (صورة) على اليسار
  s.addText("مصفوفة الالتباس", { x: 0.5, y: 1.5, w: 5.2, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.light, align: "center", rtlMode: true, isTextBox: true, margin: 0 });
  s.addImage({ path: path.join(FIG, "confusion_matrix.png"), x: 0.7, y: 1.95, w: 4.9, h: 3.1 });
  s.addText("13 إنذار خاطئ · 18 تصيّد فائت فقط من أصل 1200", { x: 0.5, y: 5.2, w: 5.2, h: 0.5, fontFace: FONT, fontSize: 12, italic: true, color: C.muted, align: "center", rtlMode: true, isTextBox: true });
})();

// =====================================================================
// الشريحة 9 — أهمية الخصائص
// =====================================================================
(function () {
  const s = pres.addSlide();
  lightBg(s);
  title(s, "أهم الخصائص المؤثّرة في القرار");
  s.addImage({ path: path.join(FIG, "feature_importance.png"), x: 0.6, y: 1.6, w: 7.4, h: 5.3 });
  s.addShape(pres.ShapeType.roundRect, { x: 8.4, y: 2.1, w: 4.4, h: 4.3, rectRadius: 0.12, fill: { color: "F1F5F9" } });
  s.addText("ماذا يعني هذا؟", { x: 8.6, y: 2.3, w: 4.0, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: C.panel, align: "right", rtlMode: true, isTextBox: true, margin: 0 });
  s.addText([
    { text: "أقوى إشارة: انتحال علامة تجارية في مكان خادع.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "ثم: كلمات الخداع ونسبة الأرقام في الرابط.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "ثم: النطاق المشبوه وعشوائية اسم المضيف.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "النموذج يشرح قراره — ميزة بحثية مهمة.", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 8.6, y: 2.9, w: 4.0, h: 3.3, fontFace: FONT, fontSize: 14, color: "334155", align: "right", rtlMode: true, isTextBox: true, paraSpaceAfter: 14 });
})();

// =====================================================================
// الشريحة 10 — منحنى ROC
// =====================================================================
(function () {
  const s = pres.addSlide();
  lightBg(s);
  title(s, "منحنى ROC وجودة التمييز");
  s.addImage({ path: path.join(FIG, "roc_curve.png"), x: 0.9, y: 1.7, w: 6.2, h: 5.0 });
  s.addShape(pres.ShapeType.roundRect, { x: 7.5, y: 2.1, w: 5.3, h: 4.3, rectRadius: 0.12, fill: { color: "F1F5F9" } });
  s.addText("قراءة المنحنى", { x: 7.7, y: 2.3, w: 4.9, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: C.panel, align: "right", rtlMode: true, isTextBox: true, margin: 0 });
  s.addText([
    { text: "كلما اقترب المنحنى من الزاوية العليا اليسرى كان التمييز أفضل.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "المساحة تحت المنحنى AUC = 0.97 (الممتاز قريب من 1.0).", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "النموذج يفرّق بقوة بين الآمن والتصيّد عبر عتبات مختلفة.", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 7.7, y: 2.9, w: 4.9, h: 3.3, fontFace: FONT, fontSize: 15, color: "334155", align: "right", rtlMode: true, isTextBox: true, paraSpaceAfter: 14 });
})();

// =====================================================================
// الشريحة 11 — أمثلة حية
// =====================================================================
(function () {
  const s = pres.addSlide();
  darkBg(s);
  title(s, "أمثلة حية من الكاشف", true);
  const header = ["الرابط", "الحكم", "الثقة"].map((t) => ({
    text: t, options: { fill: { color: C.panel }, color: C.white, bold: true, fontSize: 15, align: "center", rtlMode: true, valign: "middle" },
  }));
  const data = [
    ["https://www.instagram.com/", "آمن", "98.1%", C.green],
    ["https://www.google.com/search?q=python", "آمن", "98.3%", C.green],
    ["http://instagram.secure-login-verify.tk/...", "تصيّد", "87.7%", C.red],
    ["http://192.168.0.5/paypal/login.php?...", "تصيّد", "99.0%", C.red],
    ["http://paypal.com@malicious-site.xyz/login", "تصيّد", "95.5%", C.red],
  ];
  const rows = [header];
  data.forEach((r, i) => {
    const bg = i % 2 ? "17233D" : "1B2A4A";
    rows.push([
      { text: r[0], options: { fill: { color: bg }, color: C.light, fontSize: 12, align: "left", fontFace: "Courier New", valign: "middle" } },
      { text: r[1], options: { fill: { color: bg }, color: r[3], bold: true, fontSize: 14, align: "center", rtlMode: true, valign: "middle" } },
      { text: r[2], options: { fill: { color: bg }, color: C.light, fontSize: 13, align: "center", valign: "middle" } },
    ]);
  });
  s.addTable(rows, { x: 0.6, y: 2.0, w: 12.1, colW: [7.3, 2.6, 2.2], rowH: 0.6, border: { type: "solid", color: "334155", pt: 1 }, fontFace: FONT });
  s.addText("الكاشف يصنّف كل رابط ويعرض أسباب القرار (كلمات خداع، نطاق مشبوه، رمز @ ...).", {
    x: 0.6, y: 5.8, w: 12.1, h: 0.5, fontFace: FONT, fontSize: 13, italic: true, color: C.muted, align: "center", rtlMode: true, isTextBox: true,
  });
})();

// =====================================================================
// الشريحة 12 — الخاتمة والتطوير
// =====================================================================
(function () {
  const s = pres.addSlide();
  darkBg(s);
  s.addShape(pres.ShapeType.ellipse, { x: 6.15, y: 0.7, w: 1.0, h: 1.0, fill: { color: C.bgDark }, line: { color: C.teal, width: 3 } });
  s.addShape(pres.ShapeType.ellipse, { x: 6.45, y: 1.0, w: 0.4, h: 0.4, fill: { color: C.teal } });
  s.addText("الخاتمة والتطويرات المستقبلية", {
    x: 1, y: 1.9, w: 11.3, h: 0.8, fontFace: FONT, fontSize: 32, bold: true, color: C.light, align: "center", rtlMode: true, isTextBox: true,
  });
  s.addShape(pres.ShapeType.roundRect, { x: 1.6, y: 3.0, w: 10.1, h: 3.3, rectRadius: 0.12, fill: { color: C.card } });
  s.addText([
    { text: "بناء كاشف دفاعي كامل بدقّة ~97% باستخدام تحليل بنية الرابط.", options: { bullet: { indent: 15 }, breakLine: true, color: C.teal, bold: true } },
    { text: "استبدال البيانات ببيانات حقيقية (PhishTank / OpenPhish).", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "مقارنة خوارزميات: Random Forest · XGBoost · شبكات عصبية.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "إضافة خصائص المحتوى (HTML/JS) وبيانات WHOIS/DNS.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "دراسة الهجمات المضادة (Adversarial) ومقاومة النموذج لها.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "النشر كـ API أو إضافة متصفح للحماية الفورية.", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 1.9, y: 3.25, w: 9.5, h: 2.9, fontFace: FONT, fontSize: 15.5, color: C.light, align: "right", rtlMode: true, isTextBox: true, paraSpaceAfter: 10 });
  s.addText("شكراً — زهراء محمد", { x: 1, y: 6.55, w: 11.3, h: 0.5, fontFace: FONT, fontSize: 16, bold: true, color: C.teal, align: "center", rtlMode: true, isTextBox: true });
})();

pres.writeFile({ fileName: OUT }).then((f) => console.log("تم إنشاء العرض:", f));
