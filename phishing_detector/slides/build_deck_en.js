/*
 * build_deck_en.js — English (LTR) version of the phishing-detector deck.
 * Run: node slides/build_deck_en.js
 */
const pptxgen = require("pptxgenjs");
const path = require("path");

const FIG = path.join(__dirname, "..", "figures");
const OUT = path.join(__dirname, "phishing_detector_presentation_EN.pptx");

const C = {
  bgDark: "0F1B2D", panel: "1B2A4A", card: "17233D",
  teal: "2DD4BF", tealDim: "14B8A6", light: "F1F5F9",
  muted: "94A3B8", red: "EF4444", green: "22C55E", white: "FFFFFF",
};
const FONT = "Arial";
const pres = new pptxgen();
pres.defineLayout({ name: "W", width: 13.3, height: 7.5 });
pres.layout = "W";
pres.author = "Zahra Mohammed";
pres.title = "Phishing URL Detector";

function darkBg(s) { s.background = { color: C.bgDark }; }
function lightBg(s) { s.background = { color: C.white }; }
function title(s, text, dark = false) {
  s.addText(text, {
    x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontFace: FONT, fontSize: 30, bold: true,
    color: dark ? C.light : C.panel, align: "left", isTextBox: true, margin: 0,
  });
  s.addShape(pres.ShapeType.ellipse, { x: 12.55, y: 0.72, w: 0.22, h: 0.22, fill: { color: C.teal } });
}
function statCard(s, x, y, w, number, label, accent = C.teal) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h: 1.7, rectRadius: 0.12, fill: { color: C.card }, line: { color: accent, width: 1 } });
  s.addText(number, { x, y: y + 0.18, w, h: 0.95, fontFace: FONT, fontSize: 40, bold: true, color: accent, align: "center", isTextBox: true, margin: 0 });
  s.addText(label, { x: x + 0.1, y: y + 1.1, w: w - 0.2, h: 0.5, fontFace: FONT, fontSize: 13, color: C.light, align: "center", isTextBox: true, margin: 0 });
}

// 1 — Cover
(function () {
  const s = pres.addSlide(); darkBg(s);
  s.addShape(pres.ShapeType.ellipse, { x: 5.9, y: 0.7, w: 1.5, h: 1.5, fill: { color: C.bgDark }, line: { color: C.teal, width: 3 } });
  s.addShape(pres.ShapeType.ellipse, { x: 6.35, y: 1.15, w: 0.6, h: 0.6, fill: { color: C.teal } });
  s.addText("Phishing URL Detector", { x: 1, y: 2.45, w: 11.3, h: 1.0, fontFace: FONT, fontSize: 46, bold: true, color: C.light, align: "center", isTextBox: true });
  s.addText("A Defensive Machine Learning System", { x: 1, y: 3.5, w: 11.3, h: 0.6, fontFace: FONT, fontSize: 21, color: C.teal, align: "center", isTextBox: true });
  s.addText("Detecting phishing links from URL structure — without opening them", { x: 1, y: 4.1, w: 11.3, h: 0.5, fontFace: FONT, fontSize: 14, italic: true, color: C.muted, align: "center", isTextBox: true });
  s.addShape(pres.ShapeType.roundRect, { x: 3.1, y: 5.35, w: 7.1, h: 1.25, rectRadius: 0.1, fill: { color: C.panel } });
  s.addText([
    { text: "Presented by: ", options: { color: C.muted } },
    { text: "Zahra Mohammed", options: { color: C.light, bold: true } },
  ], { x: 3.1, y: 5.5, w: 7.1, h: 0.45, fontFace: FONT, fontSize: 16, align: "center", isTextBox: true, margin: 0 });
  s.addText([
    { text: "Supervisor: ", options: { color: C.muted } },
    { text: "Prof. Salah Albermany", options: { color: C.teal, bold: true } },
  ], { x: 3.1, y: 5.98, w: 7.1, h: 0.45, fontFace: FONT, fontSize: 15, align: "center", isTextBox: true, margin: 0 });
})();

// 2 — What is phishing
(function () {
  const s = pres.addSlide(); lightBg(s);
  title(s, "What Is Phishing?");
  s.addText("Phishing deceives a user with a fake link or message impersonating a trusted party (a bank, Instagram, email...) to steal login credentials or sensitive data.",
    { x: 0.6, y: 1.5, w: 12.1, h: 1.0, fontFace: FONT, fontSize: 18, color: C.panel, align: "left", isTextBox: true });
  const rows = [
    ["The link is the first weapon", "Most phishing attacks start with a link sent by message or email."],
    ["Hard to spot by eye", "Fake links mimic real ones with tiny, subtle changes."],
    ["Early detection = protection", "Stopping the link before a click prevents the breach entirely."],
  ];
  let y = 2.7;
  rows.forEach((r, i) => {
    s.addShape(pres.ShapeType.roundRect, { x: 0.6, y, w: 12.1, h: 1.15, rectRadius: 0.1, fill: { color: "F1F5F9" } });
    s.addShape(pres.ShapeType.ellipse, { x: 0.85, y: y + 0.32, w: 0.55, h: 0.55, fill: { color: C.teal } });
    s.addText(String(i + 1), { x: 0.85, y: y + 0.32, w: 0.55, h: 0.55, fontFace: FONT, fontSize: 20, bold: true, color: C.white, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText(r[0], { x: 1.6, y: y + 0.18, w: 10.8, h: 0.45, fontFace: FONT, fontSize: 17, bold: true, color: C.panel, align: "left", isTextBox: true, margin: 0 });
    s.addText(r[1], { x: 1.6, y: y + 0.62, w: 10.8, h: 0.45, fontFace: FONT, fontSize: 13, color: "475569", align: "left", isTextBox: true, margin: 0 });
    y += 1.3;
  });
})();

// 3 — Ethics
(function () {
  const s = pres.addSlide(); darkBg(s);
  title(s, "Ethical Scope: Defense, Not Attack", true);
  s.addText("This project protects users and never targets any real person or system.",
    { x: 0.6, y: 1.4, w: 12.1, h: 0.5, fontFace: FONT, fontSize: 16, color: C.muted, align: "left", isTextBox: true });
  s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 2.15, w: 5.9, h: 4.7, rectRadius: 0.12, fill: { color: C.card }, line: { color: C.green, width: 1.5 } });
  s.addText("What the project DOES", { x: 0.7, y: 2.35, w: 5.6, h: 0.5, fontFace: FONT, fontSize: 19, bold: true, color: C.green, align: "left", isTextBox: true, margin: 0 });
  s.addText([
    { text: "Analyzes URL structure only (never opens it)", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Classifies a link: safe or phishing + confidence", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Trains on authorized lab data", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Builds a deployable, research-grade tool", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 0.7, y: 3.0, w: 5.6, h: 3.6, fontFace: FONT, fontSize: 15, color: C.light, align: "left", isTextBox: true, paraSpaceAfter: 14 });
  s.addShape(pres.ShapeType.roundRect, { x: 6.9, y: 2.15, w: 5.9, h: 4.7, rectRadius: 0.12, fill: { color: C.card }, line: { color: C.red, width: 1.5 } });
  s.addText("What it NEVER does", { x: 7.1, y: 2.35, w: 5.6, h: 0.5, fontFace: FONT, fontSize: 19, bold: true, color: C.red, align: "left", isTextBox: true, margin: 0 });
  s.addText([
    { text: "Does not hack any real account or app", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Does not create phishing links or fake pages", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Does not track or monitor any person", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Is not used against users without consent", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 7.1, y: 3.0, w: 5.6, h: 3.6, fontFace: FONT, fontSize: 15, color: C.light, align: "left", isTextBox: true, paraSpaceAfter: 14 });
})();

// 4 — Pipeline
(function () {
  const s = pres.addSlide(); lightBg(s);
  title(s, "How It Works: From a URL to a Decision");
  const steps = [
    ["Input URL", "The link to check", C.panel],
    ["Feature Extraction", "Convert to ~27 numbers", C.tealDim],
    ["ML Model", "Random Forest", C.tealDim],
    ["Decision", "Safe / Phishing + confidence", C.green],
  ];
  const w = 2.7, gap = 0.45, h = 2.2, y = 2.6;
  let x = 0.5;
  steps.forEach((st, i) => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: "F1F5F9" }, line: { color: st[2], width: 2 } });
    s.addText(st[0], { x, y: y + 0.5, w, h: 0.7, fontFace: FONT, fontSize: 18, bold: true, color: st[2], align: "center", isTextBox: true, margin: 0 });
    s.addText(st[1], { x: x + 0.1, y: y + 1.2, w: w - 0.2, h: 0.7, fontFace: FONT, fontSize: 12, color: "475569", align: "center", isTextBox: true, margin: 0 });
    if (i < steps.length - 1) {
      s.addText("▶", { x: x + w - 0.05, y: y + h / 2 - 0.3, w: gap + 0.1, h: 0.6, fontFace: FONT, fontSize: 22, color: C.tealDim, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    }
    x += (w + gap);
  });
  s.addText("Analysis relies only on the URL's shape (lexical) — fast, safe, and never opens the link.",
    { x: 0.6, y: 5.4, w: 12.1, h: 0.6, fontFace: FONT, fontSize: 15, italic: true, color: "475569", align: "center", isTextBox: true });
})();

// 5 — Feature table
(function () {
  const s = pres.addSlide(); lightBg(s);
  title(s, "Feature Extraction");
  s.addText("Each URL becomes numbers describing its structure. Examples of safe vs. phishing:",
    { x: 0.6, y: 1.45, w: 12.1, h: 0.5, fontFace: FONT, fontSize: 16, color: C.panel, align: "left", isTextBox: true });
  const header = ["Feature", "Safe URL", "Phishing URL"].map((t) => ({
    text: t, options: { fill: { color: C.panel }, color: C.white, bold: true, fontSize: 15, align: "center", valign: "middle" },
  }));
  const data = [
    ["URL length", "Relatively short", "Often very long"],
    ["Uses an IP instead of a name", "Rare", "Common"],
    ["'@' symbol in the URL", "No", "Used to hide target"],
    ["Deceptive words (login, verify)", "Few", "Many"],
    ["Brand impersonation", "No", "Yes"],
    ["Suspicious TLD (.tk .xyz)", "Rare", "Common"],
    ["Uses HTTPS", "Usually yes", "Usually no"],
  ];
  const rows = [header];
  data.forEach((r, i) => {
    const bg = i % 2 ? "EEF2F7" : "FFFFFF";
    rows.push([
      { text: r[0], options: { fill: { color: bg }, color: C.panel, bold: true, fontSize: 13, align: "left", valign: "middle" } },
      { text: r[1], options: { fill: { color: bg }, color: "16803C", fontSize: 13, align: "center", valign: "middle" } },
      { text: r[2], options: { fill: { color: bg }, color: "B91C1C", fontSize: 13, align: "center", valign: "middle" } },
    ]);
  });
  s.addTable(rows, { x: 0.6, y: 2.1, w: 12.1, colW: [5.3, 3.4, 3.4], rowH: 0.52, border: { type: "solid", color: "D8DEE9", pt: 1 }, fontFace: FONT });
})();

// 6 — Dataset
(function () {
  const s = pres.addSlide(); darkBg(s);
  title(s, "The Dataset", true);
  statCard(s, 0.5, 1.7, 3.2, "6,000", "Total URLs", C.teal);
  statCard(s, 3.9, 1.7, 3.2, "50 / 50", "Safe vs. Phishing", C.teal);
  statCard(s, 7.3, 1.7, 3.2, "27", "Features per URL", C.teal);
  s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 3.9, w: 12.3, h: 2.9, rectRadius: 0.12, fill: { color: C.card } });
  s.addText("Important research note", { x: 0.8, y: 4.1, w: 11.7, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: C.teal, align: "left", isTextBox: true, margin: 0 });
  s.addText([
    { text: "The data here is synthetically generated to build and test the model.", options: { breakLine: true } },
    { text: "For the final research, replace it with real data from: PhishTank · OpenPhish · Tranco · UCI/Kaggle.", options: { breakLine: true } },
    { text: "The code accepts any file with the same columns (url, label) with no changes.", options: { breakLine: false } },
  ], { x: 0.8, y: 4.65, w: 11.7, h: 2.0, fontFace: FONT, fontSize: 15, color: C.light, align: "left", isTextBox: true, paraSpaceAfter: 12 });
})();

// 7 — Model
(function () {
  const s = pres.addSlide(); lightBg(s);
  title(s, "The Model: Random Forest");
  s.addText("A Random Forest is a large set of decision trees working together. Each tree votes, and the final decision is by majority — making the model accurate and noise-resistant.",
    { x: 0.6, y: 1.5, w: 12.1, h: 1.1, fontFace: FONT, fontSize: 17, color: C.panel, align: "left", isTextBox: true });
  const pts = [
    ["High accuracy", "Group voting reduces individual errors"],
    ["Interpretable", "Gives feature importance — key for research"],
    ["Fast & practical", "Trains and predicts quickly on thousands of URLs"],
  ];
  let x = 0.7;
  pts.forEach((p) => {
    s.addShape(pres.ShapeType.roundRect, { x, y: 3.1, w: 3.8, h: 2.9, rectRadius: 0.12, fill: { color: "F1F5F9" }, line: { color: C.tealDim, width: 1 } });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.25, y: 3.35, w: 0.55, h: 0.55, fill: { color: C.tealDim } });
    s.addText(p[0], { x: x + 0.2, y: 3.95, w: 3.4, h: 0.6, fontFace: FONT, fontSize: 18, bold: true, color: C.panel, align: "left", isTextBox: true, margin: 0 });
    s.addText(p[1], { x: x + 0.2, y: 4.6, w: 3.4, h: 1.2, fontFace: FONT, fontSize: 14, color: "475569", align: "left", isTextBox: true, margin: 0 });
    x += 4.0;
  });
})();

// 8 — Results
(function () {
  const s = pres.addSlide(); darkBg(s);
  title(s, "Results on Test Data", true);
  statCard(s, 9.5, 1.55, 3.3, "97.4%", "Accuracy", C.teal);
  statCard(s, 9.5, 3.45, 3.3, "97.8%", "Precision", C.teal);
  statCard(s, 9.5, 5.35, 3.3, "97.0%", "Recall", C.teal);
  statCard(s, 6.0, 5.35, 3.3, "97.3%", "ROC-AUC", C.green);
  s.addText("Confusion Matrix", { x: 0.5, y: 1.5, w: 5.2, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.light, align: "center", isTextBox: true, margin: 0 });
  s.addImage({ path: path.join(FIG, "confusion_matrix.png"), x: 0.7, y: 1.95, w: 4.9, h: 3.1 });
  s.addText("Only 13 false alarms and 18 missed phishing out of 1,200", { x: 0.5, y: 5.2, w: 5.2, h: 0.5, fontFace: FONT, fontSize: 12, italic: true, color: C.muted, align: "center", isTextBox: true });
})();

// 9 — Feature importance
(function () {
  const s = pres.addSlide(); lightBg(s);
  title(s, "Most Influential Features");
  s.addImage({ path: path.join(FIG, "feature_importance.png"), x: 0.6, y: 1.6, w: 7.4, h: 5.3 });
  s.addShape(pres.ShapeType.roundRect, { x: 8.4, y: 2.1, w: 4.4, h: 4.3, rectRadius: 0.12, fill: { color: "F1F5F9" } });
  s.addText("What does this mean?", { x: 8.6, y: 2.3, w: 4.0, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: C.panel, align: "left", isTextBox: true, margin: 0 });
  s.addText([
    { text: "Strongest signal: brand impersonation in a deceptive spot.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Then: deceptive words and the digit ratio in the URL.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Then: suspicious TLD and hostname randomness.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "The model explains its decision — a key research advantage.", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 8.6, y: 2.9, w: 4.0, h: 3.3, fontFace: FONT, fontSize: 14, color: "334155", align: "left", isTextBox: true, paraSpaceAfter: 14 });
})();

// 10 — ROC
(function () {
  const s = pres.addSlide(); lightBg(s);
  title(s, "ROC Curve and Discrimination Quality");
  s.addImage({ path: path.join(FIG, "roc_curve.png"), x: 0.9, y: 1.7, w: 6.2, h: 5.0 });
  s.addShape(pres.ShapeType.roundRect, { x: 7.5, y: 2.1, w: 5.3, h: 4.3, rectRadius: 0.12, fill: { color: "F1F5F9" } });
  s.addText("Reading the curve", { x: 7.7, y: 2.3, w: 4.9, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: C.panel, align: "left", isTextBox: true, margin: 0 });
  s.addText([
    { text: "The closer the curve hugs the top-left corner, the better.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Area under the curve AUC = 0.97 (excellent is close to 1.0).", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "The model separates safe from phishing strongly across thresholds.", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 7.7, y: 2.9, w: 4.9, h: 3.3, fontFace: FONT, fontSize: 15, color: "334155", align: "left", isTextBox: true, paraSpaceAfter: 14 });
})();

// 11 — Live examples
(function () {
  const s = pres.addSlide(); darkBg(s);
  title(s, "Live Examples from the Detector", true);
  const header = ["URL", "Verdict", "Confidence"].map((t) => ({
    text: t, options: { fill: { color: C.panel }, color: C.white, bold: true, fontSize: 15, align: "center", valign: "middle" },
  }));
  const data = [
    ["https://www.instagram.com/", "Safe", "98.1%", C.green],
    ["https://www.google.com/search?q=python", "Safe", "98.3%", C.green],
    ["http://instagram.secure-login-verify.tk/...", "Phishing", "87.7%", C.red],
    ["http://192.168.0.5/paypal/login.php?...", "Phishing", "99.0%", C.red],
    ["http://paypal.com@malicious-site.xyz/login", "Phishing", "95.5%", C.red],
  ];
  const rows = [header];
  data.forEach((r, i) => {
    const bg = i % 2 ? "17233D" : "1B2A4A";
    rows.push([
      { text: r[0], options: { fill: { color: bg }, color: C.light, fontSize: 12, align: "left", fontFace: "Courier New", valign: "middle" } },
      { text: r[1], options: { fill: { color: bg }, color: r[3], bold: true, fontSize: 14, align: "center", valign: "middle" } },
      { text: r[2], options: { fill: { color: bg }, color: C.light, fontSize: 13, align: "center", valign: "middle" } },
    ]);
  });
  s.addTable(rows, { x: 0.6, y: 2.0, w: 12.1, colW: [7.3, 2.6, 2.2], rowH: 0.6, border: { type: "solid", color: "334155", pt: 1 }, fontFace: FONT });
  s.addText("The detector classifies each URL and shows the reasons (deceptive words, suspicious TLD, '@' symbol...).",
    { x: 0.6, y: 5.8, w: 12.1, h: 0.5, fontFace: FONT, fontSize: 13, italic: true, color: C.muted, align: "center", isTextBox: true });
})();

// 12 — Conclusion
(function () {
  const s = pres.addSlide(); darkBg(s);
  s.addShape(pres.ShapeType.ellipse, { x: 6.15, y: 0.7, w: 1.0, h: 1.0, fill: { color: C.bgDark }, line: { color: C.teal, width: 3 } });
  s.addShape(pres.ShapeType.ellipse, { x: 6.45, y: 1.0, w: 0.4, h: 0.4, fill: { color: C.teal } });
  s.addText("Conclusion & Future Work", { x: 1, y: 1.9, w: 11.3, h: 0.8, fontFace: FONT, fontSize: 32, bold: true, color: C.light, align: "center", isTextBox: true });
  s.addShape(pres.ShapeType.roundRect, { x: 1.6, y: 3.0, w: 10.1, h: 3.3, rectRadius: 0.12, fill: { color: C.card } });
  s.addText([
    { text: "Built a complete defensive detector at ~97% accuracy using URL structure.", options: { bullet: { indent: 15 }, breakLine: true, color: C.teal, bold: true } },
    { text: "Replace the data with real datasets (PhishTank / OpenPhish).", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Compare algorithms: Random Forest · XGBoost · Neural Networks.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Add content features (HTML/JS) and WHOIS/DNS data.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Study adversarial phishing and model robustness.", options: { bullet: { indent: 15 }, breakLine: true } },
    { text: "Deploy as an API or a browser extension for real-time protection.", options: { bullet: { indent: 15 }, breakLine: false } },
  ], { x: 1.9, y: 3.25, w: 9.5, h: 2.9, fontFace: FONT, fontSize: 15.5, color: C.light, align: "left", isTextBox: true, paraSpaceAfter: 10 });
  s.addText("Thank you — Zahra Mohammed  ·  Supervisor: Prof. Salah Albermany",
    { x: 1, y: 6.55, w: 11.3, h: 0.5, fontFace: FONT, fontSize: 15, bold: true, color: C.teal, align: "center", isTextBox: true });
})();

pres.writeFile({ fileName: OUT }).then((f) => console.log("Created:", f));
