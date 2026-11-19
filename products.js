// البيانات الافتراضية للمتجر. أي تعديل من لوحة التحكم (admin.html) يُحفظ في المتصفح ويتقدّم على هذه القيم.
window.DEFAULT_CATEGORIES = [
  { id: "all", name: "الكل" },
  { id: "electronics", name: "إلكترونيات" },
  { id: "fashion", name: "أزياء" },
  { id: "home", name: "المنزل" },
  { id: "beauty", name: "العناية والجمال" },
  { id: "sports", name: "رياضة" },
];

window.DEFAULT_PRODUCTS = [
  { id: 1, name: "سماعات لاسلكية", category: "electronics", price: 249, oldPrice: 320, rating: 4.7, emoji: "🎧", color: "#e0e7ff", desc: "سماعات بلوتوث بعزل ضوضاء نشط وبطارية تدوم حتى 30 ساعة." },
  { id: 2, name: "ساعة ذكية", category: "electronics", price: 399, rating: 4.5, emoji: "⌚", color: "#dbeafe", desc: "تتبع اللياقة ونبضات القلب والنوم، مقاومة للماء." },
  { id: 3, name: "شاحن سريع 65 واط", category: "electronics", price: 89, rating: 4.3, emoji: "🔌", color: "#e0f2fe", desc: "شاحن GaN صغير الحجم بثلاثة منافذ لجميع أجهزتك." },
  { id: 4, name: "كاميرا فورية", category: "electronics", price: 459, oldPrice: 520, rating: 4.6, emoji: "📷", color: "#ede9fe", desc: "اطبع صورك فورًا بألوان زاهية وتصميم كلاسيكي." },
  { id: 5, name: "قميص قطني", category: "fashion", price: 79, rating: 4.2, emoji: "👕", color: "#fce7f3", desc: "قطن مصري 100٪، مريح ومناسب للاستخدام اليومي." },
  { id: 6, name: "حذاء رياضي", category: "fashion", price: 289, oldPrice: 350, rating: 4.8, emoji: "👟", color: "#ffe4e6", desc: "نعل خفيف ومرن يمنحك راحة طوال اليوم." },
  { id: 7, name: "نظارة شمسية", category: "fashion", price: 149, rating: 4.1, emoji: "🕶️", color: "#fef3c7", desc: "حماية كاملة من الأشعة فوق البنفسجية UV400." },
  { id: 8, name: "حقيبة ظهر", category: "fashion", price: 179, rating: 4.4, emoji: "🎒", color: "#fae8ff", desc: "مقاومة للماء مع جيب مبطن للحاسوب المحمول." },
  { id: 9, name: "ماكينة قهوة", category: "home", price: 549, oldPrice: 650, rating: 4.7, emoji: "☕", color: "#fef9c3", desc: "حضّر الإسبريسو والكابتشينو في المنزل بضغطة زر." },
  { id: 10, name: "نبتة منزلية", category: "home", price: 59, rating: 4.5, emoji: "🪴", color: "#dcfce7", desc: "نبتة داخلية سهلة العناية تضيف الحياة لمساحتك." },
  { id: 11, name: "شمعة معطرة", category: "home", price: 45, rating: 4.3, emoji: "🕯️", color: "#ffedd5", desc: "شمع صويا طبيعي برائحة العود والفانيليا." },
  { id: 12, name: "عطر فاخر", category: "beauty", price: 320, rating: 4.9, emoji: "🧴", color: "#f3e8ff", desc: "عطر شرقي بنفحات المسك والعنبر يدوم طويلًا." },
  { id: 13, name: "مجموعة العناية بالبشرة", category: "beauty", price: 199, oldPrice: 260, rating: 4.6, emoji: "✨", color: "#fdf2f8", desc: "غسول وسيروم ومرطب لبشرة نضرة." },
  { id: 14, name: "سجادة يوغا", category: "sports", price: 99, rating: 4.4, emoji: "🧘", color: "#ccfbf1", desc: "سطح مانع للانزلاق وسماكة 6 ملم." },
  { id: 15, name: "دمبل قابل للتعديل", category: "sports", price: 379, rating: 4.5, emoji: "🏋️", color: "#d1fae5", desc: "أوزان من 2 إلى 24 كجم في جهاز واحد." },
  { id: 16, name: "قارورة ماء حرارية", category: "sports", price: 69, rating: 4.7, emoji: "🥤", color: "#cffafe", desc: "تحافظ على البرودة 24 ساعة والسخونة 12 ساعة." },
];

// تحميل البيانات المحفوظة من لوحة التحكم إن وُجدت
(function () {
  function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v : fallback;
    } catch (e) { return fallback; }
  }
  const clone = (x) => JSON.parse(JSON.stringify(x));
  window.CATEGORIES = load("mn-categories", clone(window.DEFAULT_CATEGORIES));
  window.PRODUCTS = load("mn-products", clone(window.DEFAULT_PRODUCTS));
})();
