/*
 * detector.js — استخراج الخصائص + النموذج الخفيف، منقول بدقّة من features.py
 * يعمل في المتصفح وفي Node (كلاهما فيه WHATWG URL).
 * MODEL يُحقن من model.json. دالة detect(url) ترجّع {label, prob, reasons, features}.
 */
(function (root) {
  "use strict";

  function safeParse(rawUrl) {
    // يطابق _safe_parse في بايثون: أضف http:// إن غاب السكيم
    var u = rawUrl;
    if (u.indexOf("://") === -1) u = "http://" + u;
    try {
      var p = new URL(u);
      // WHATWG يحوّل المسار الفارغ إلى "/" بينما urlparse في بايثون يتركه "".
      // نطابق بايثون: لو لا يوجد "/" صريح بعد المضيف، يكون المسار فارغاً.
      var path = p.pathname || "";
      var afterScheme = u.split("://")[1] || "";
      if (path === "/" && afterScheme.indexOf("/") === -1) path = "";
      return {
        hostname: p.hostname || "",     // WHATWG يزيل userinfo والبورت ويحوّل لحروف صغيرة
        path: path,
        scheme: (p.protocol || "").replace(":", "").toLowerCase(),
        port: p.port || "",
      };
    } catch (e) {
      return { hostname: "", path: "", scheme: "", port: "" };
    }
  }

  function countChar(s, ch) {
    var n = 0;
    for (var i = 0; i < s.length; i++) if (s[i] === ch) n++;
    return n;
  }

  var IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

  function shannonEntropy(text) {
    if (!text) return 0.0;
    var counts = {}, i;
    for (i = 0; i < text.length; i++) counts[text[i]] = (counts[text[i]] || 0) + 1;
    var len = text.length, h = 0.0;
    for (var k in counts) {
      if (!counts.hasOwnProperty(k)) continue;
      var pr = counts[k] / len;
      h -= pr * (Math.log(pr) / Math.log(2));
    }
    return h;
  }

  function brandSpoof(hostname, urlLower, brands) {
    for (var i = 0; i < brands.length; i++) {
      var brand = brands[i];
      if (urlLower.indexOf(brand) !== -1) {
        var parts = hostname.split(".");
        var base = parts.length >= 2 ? parts.slice(-2).join(".") : hostname;
        if (base.indexOf(brand) === -1) return 1;
      }
    }
    return 0;
  }

  function suspiciousTld(hostname, tlds) {
    if (!hostname || hostname.indexOf(".") === -1) return 0;
    var tld = hostname.split(".").pop().toLowerCase();
    return tlds.indexOf(tld) !== -1 ? 1 : 0;
  }

  // تُرجع القيم بنفس ترتيب MODEL.feature_names
  function extractFeatures(rawUrl, M) {
    var url = (rawUrl || "").trim();
    var p = safeParse(url);
    var hostname = p.hostname, path = p.path;
    var urlLower = url.toLowerCase();

    var digits = 0, letters = 0, i, c;
    for (i = 0; i < url.length; i++) {
      c = url[i];
      if (c >= "0" && c <= "9") digits++;
      else if (/[a-zA-Z]/.test(c)) letters++;
    }
    var n = url.length || 1;

    var susp = 0, w;
    for (i = 0; i < M.suspicious_words.length; i++)
      if (urlLower.indexOf(M.suspicious_words[i]) !== -1) susp++;
    var shortened = 0;
    for (i = 0; i < M.shorteners.length; i++)
      if (urlLower.indexOf(M.shorteners[i]) !== -1) { shortened = 1; break; }

    var f = {
      url_length: url.length,
      hostname_length: hostname.length,
      path_length: path.length,
      num_dots: countChar(url, "."),
      num_hyphens: countChar(url, "-"),
      num_at: countChar(url, "@"),
      num_question: countChar(url, "?"),
      num_equals: countChar(url, "="),
      num_ampersand: countChar(url, "&"),
      num_underscore: countChar(url, "_"),
      num_percent: countChar(url, "%"),
      num_slash: countChar(url, "/"),
      num_digits: digits,
      digit_ratio: digits / n,
      letter_ratio: letters / n,
      num_subdomains: Math.max(countChar(hostname, ".") - 1, 0),
      has_ip: IPV4.test(hostname) ? 1 : 0,
      has_port: p.port ? 1 : 0,
      has_https: p.scheme === "https" ? 1 : 0,
      has_at_symbol: url.indexOf("@") !== -1 ? 1 : 0,
      double_slash_redirect: url.lastIndexOf("//") > 7 ? 1 : 0,
      num_suspicious_words: susp,
      is_shortened: shortened,
      brand_in_subdomain_or_path: brandSpoof(hostname, urlLower, M.brands),
      hostname_entropy: Math.round(shannonEntropy(hostname) * 1000) / 1000,
      tld_suspicious: suspiciousTld(hostname, M.suspicious_tlds),
    };
    return f;
  }

  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  // استدلال الانحدار اللوجستي: z = (x-mean)/scale ثم sigmoid(coef·z + intercept)
  function predictProb(features, M) {
    var names = M.feature_names, z = M.intercept;
    for (var i = 0; i < names.length; i++) {
      var x = features[names[i]];
      var scaled = (x - M.scaler_mean[i]) / M.scaler_scale[i];
      z += M.coef[i] * scaled;
    }
    return sigmoid(z);
  }

  function reasonsFor(f) {
    var r = [];
    if (f.has_ip) r.push("المضيف عنوان IP بدل اسم نطاق");
    if (f.has_at_symbol) r.push("يحتوي رمز @ لإخفاء الوجهة الحقيقية");
    if (f.num_suspicious_words > 0) r.push("كلمات خداع (" + f.num_suspicious_words + ")");
    if (f.brand_in_subdomain_or_path) r.push("انتحال علامة تجارية في مكان خادع");
    if (f.tld_suspicious) r.push("نطاق علوي مشبوه (مثل ‎.tk ‎.xyz)");
    if (f.is_shortened) r.push("رابط مختصر يخفي الوجهة");
    if (f.num_hyphens >= 3) r.push("شرطات كثيرة (" + f.num_hyphens + ")");
    if (!f.has_https) r.push("لا يستخدم HTTPS");
    return r;
  }

  function detect(url, M) {
    var f = extractFeatures(url, M);
    var prob = predictProb(f, M);
    return {
      label: prob >= 0.5 ? 1 : 0,
      prob: prob,
      reasons: reasonsFor(f),
      features: f,
    };
  }

  var api = { extractFeatures: extractFeatures, predictProb: predictProb, detect: detect };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Detector = api;
})(typeof window !== "undefined" ? window : this);
