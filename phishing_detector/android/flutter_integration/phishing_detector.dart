// phishing_detector.dart
// -----------------------------------------------------------------------------
// كاشف روابط التصيّد — نسخة Dart للدمج داخل تطبيق المحادثة (Flutter).
//
// يعمل بالكامل داخل الجهاز (offline). لا يعتمد على Flutter (يستورد فقط
// dart:convert و dart:math)، فيمكن استخدامه في أي مشروع Dart/Flutter.
//
// منقول حرفياً من features.py، وتم التحقق أن استخراج الخصائص والنتيجة
// مطابقان تماماً للنموذج البحثي في بايثون (فرق الاحتمال = 0).
//
// النموذج: Logistic Regression على 26 خاصية، دقّة ~95%.
// -----------------------------------------------------------------------------

import 'dart:convert';
import 'dart:math';

/// نتيجة فحص رابط واحد.
class PhishResult {
  /// هل الرابط تصيّد؟
  final bool isPhishing;

  /// احتمال التصيّد (0 إلى 1).
  final double probability;

  /// أسباب/مؤشرات القرار (تظهر فقط عند التصيّد).
  final List<String> reasons;

  const PhishResult(this.isPhishing, this.probability, this.reasons);

  /// نسبة الثقة في القرار المعروض (0 إلى 1).
  double get confidence => isPhishing ? probability : 1 - probability;
}

/// الكاشف. كل الدوال ثابتة (static) — استدعيها مباشرة:
///   final r = PhishingDetector.check("http://...");
///   final r2 = PhishingDetector.scanText("شوف هذا الرابط ...");
class PhishingDetector {
  static final Map<String, dynamic> _m =
      jsonDecode(_modelJson) as Map<String, dynamic>;

  // تحليل الرابط يدوياً — مطابق لسلوك urlparse في بايثون.
  static Map<String, String> _parse(String raw) {
    final work = raw.contains('://') ? raw : 'http://$raw';
    final si = work.indexOf('://');
    final scheme = work.substring(0, si).toLowerCase();
    final rest = work.substring(si + 3);
    final m = rest.indexOf(RegExp(r'[/?#]'));
    final authority = m == -1 ? rest : rest.substring(0, m);
    final after = m == -1 ? '' : rest.substring(m);
    var path = '';
    if (after.startsWith('/')) {
      final q = after.indexOf(RegExp(r'[?#]'));
      path = q == -1 ? after : after.substring(0, q);
    }
    var hostport = authority.contains('@')
        ? authority.substring(authority.lastIndexOf('@') + 1)
        : authority;
    var host = hostport;
    var portStr = '';
    final ci = hostport.lastIndexOf(':');
    if (ci != -1 && RegExp(r'^\d+$').hasMatch(hostport.substring(ci + 1))) {
      host = hostport.substring(0, ci);
      portStr = hostport.substring(ci + 1);
    }
    return {
      'host': host.toLowerCase(),
      'path': path,
      'scheme': scheme,
      'port': portStr,
    };
  }

  static int _count(String s, String ch) {
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      if (s[i] == ch) n++;
    }
    return n;
  }

  static double _entropy(String t) {
    if (t.isEmpty) return 0;
    final c = <String, int>{};
    for (var i = 0; i < t.length; i++) {
      final k = t[i];
      c[k] = (c[k] ?? 0) + 1;
    }
    var h = 0.0;
    for (final v in c.values) {
      final p = v / t.length;
      h -= p * (log(p) / log(2));
    }
    return h;
  }

  static int _brandSpoof(String host, String ul, List<dynamic> brands) {
    for (final b in brands) {
      if (ul.contains(b as String)) {
        final p = host.split('.');
        final base = p.length >= 2 ? p.sublist(p.length - 2).join('.') : host;
        if (!base.contains(b)) return 1;
      }
    }
    return 0;
  }

  static int _tldSuspicious(String host, List<dynamic> tlds) {
    if (host.isEmpty || !host.contains('.')) return 0;
    return tlds.contains(host.split('.').last.toLowerCase()) ? 1 : 0;
  }

  static final RegExp _ipv4 = RegExp(r'^(\d{1,3}\.){3}\d{1,3}$');
  static final RegExp _letter = RegExp(r'[a-zA-Z]');

  static Map<String, double> _features(String raw) {
    final url = raw.trim();
    final p = _parse(url);
    final host = p['host']!;
    final path = p['path']!;
    final ul = url.toLowerCase();

    var digits = 0, letters = 0;
    for (var i = 0; i < url.length; i++) {
      final c = url[i];
      if (c.compareTo('0') >= 0 && c.compareTo('9') <= 0) {
        digits++;
      } else if (_letter.hasMatch(c)) {
        letters++;
      }
    }
    final n = url.isEmpty ? 1 : url.length;

    var susp = 0;
    for (final w in _m['suspicious_words'] as List) {
      if (ul.contains(w as String)) susp++;
    }
    var sh = 0;
    for (final s in _m['shorteners'] as List) {
      if (ul.contains(s as String)) {
        sh = 1;
        break;
      }
    }

    return {
      'url_length': url.length.toDouble(),
      'hostname_length': host.length.toDouble(),
      'path_length': path.length.toDouble(),
      'num_dots': _count(url, '.').toDouble(),
      'num_hyphens': _count(url, '-').toDouble(),
      'num_at': _count(url, '@').toDouble(),
      'num_question': _count(url, '?').toDouble(),
      'num_equals': _count(url, '=').toDouble(),
      'num_ampersand': _count(url, '&').toDouble(),
      'num_underscore': _count(url, '_').toDouble(),
      'num_percent': _count(url, '%').toDouble(),
      'num_slash': _count(url, '/').toDouble(),
      'num_digits': digits.toDouble(),
      'digit_ratio': digits / n,
      'letter_ratio': letters / n,
      'num_subdomains': max(_count(host, '.') - 1, 0).toDouble(),
      'has_ip': _ipv4.hasMatch(host) ? 1.0 : 0.0,
      'has_port': p['port']!.isNotEmpty ? 1.0 : 0.0,
      'has_https': p['scheme'] == 'https' ? 1.0 : 0.0,
      'has_at_symbol': url.contains('@') ? 1.0 : 0.0,
      'double_slash_redirect': url.lastIndexOf('//') > 7 ? 1.0 : 0.0,
      'num_suspicious_words': susp.toDouble(),
      'is_shortened': sh.toDouble(),
      'brand_in_subdomain_or_path':
          _brandSpoof(host, ul, _m['brands'] as List).toDouble(),
      'hostname_entropy': (_entropy(host) * 1000).round() / 1000,
      'tld_suspicious': _tldSuspicious(host, _m['suspicious_tlds'] as List).toDouble(),
    };
  }

  static List<String> _reasons(Map<String, double> f) {
    final r = <String>[];
    if (f['has_ip'] == 1) r.add('المضيف عنوان IP بدل اسم نطاق');
    if (f['has_at_symbol'] == 1) r.add('يحتوي رمز @ لإخفاء الوجهة الحقيقية');
    if (f['num_suspicious_words']! > 0) {
      r.add('كلمات خداع (${f['num_suspicious_words']!.toInt()})');
    }
    if (f['brand_in_subdomain_or_path'] == 1) {
      r.add('انتحال علامة تجارية في مكان خادع');
    }
    if (f['tld_suspicious'] == 1) r.add('نطاق علوي مشبوه (مثل ‎.tk ‎.xyz)');
    if (f['is_shortened'] == 1) r.add('رابط مختصر يخفي الوجهة');
    if (f['num_hyphens']! >= 3) r.add('شرطات كثيرة (${f['num_hyphens']!.toInt()})');
    if (f['has_https'] == 0) r.add('لا يستخدم HTTPS');
    return r;
  }

  /// فحص رابط واحد وإرجاع النتيجة.
  static PhishResult check(String url) {
    final f = _features(url);
    final names = _m['feature_names'] as List;
    final mean = _m['scaler_mean'] as List;
    final scale = _m['scaler_scale'] as List;
    final coef = _m['coef'] as List;
    var z = (_m['intercept'] as num).toDouble();
    for (var i = 0; i < names.length; i++) {
      final x = f[names[i] as String]!;
      final zScaled = (x - (mean[i] as num)) / (scale[i] as num);
      z += (coef[i] as num) * zScaled;
    }
    final prob = 1 / (1 + exp(-z));
    return PhishResult(prob >= 0.5, prob, prob >= 0.5 ? _reasons(f) : const []);
  }

  /// يبحث عن أول رابط داخل نص رسالة ويفحصه.
  /// يرجّع null إذا لم يحتوِ النص على رابط.
  static PhishResult? scanText(String text) {
    final match = RegExp(
      r'(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9.-]*\.(?:com|net|org|xyz|tk|ml|ga|cf|gq|info|top|click|online|live|io|co)(?:\/[^\s]*)?)',
      caseSensitive: false,
    ).firstMatch(text);
    if (match == null) return null;
    return check(match.group(0)!);
  }
}

// =============================================================================
// بيانات النموذج (مُصدَّرة من export_model.py). لا تعدّليها يدوياً.
// =============================================================================
const String _modelJson = r'''
{
  "feature_names": [
    "url_length",
    "hostname_length",
    "path_length",
    "num_dots",
    "num_hyphens",
    "num_at",
    "num_question",
    "num_equals",
    "num_ampersand",
    "num_underscore",
    "num_percent",
    "num_slash",
    "num_digits",
    "digit_ratio",
    "letter_ratio",
    "num_subdomains",
    "has_ip",
    "has_port",
    "has_https",
    "has_at_symbol",
    "double_slash_redirect",
    "num_suspicious_words",
    "is_shortened",
    "brand_in_subdomain_or_path",
    "hostname_entropy",
    "tld_suspicious"
  ],
  "scaler_mean": [
    44.698125,
    15.629375,
    14.47145833,
    1.97541667,
    0.295,
    0.06270833,
    0.37833333,
    0.39958333,
    0.02125,
    0.0,
    0.0,
    3.68354167,
    3.00791667,
    0.05492727,
    0.76068004,
    0.64354167,
    0.065625,
    0.0,
    0.679375,
    0.06270833,
    0.0,
    0.86666667,
    0.04229167,
    0.31770833,
    3.26938688,
    0.25916667
  ],
  "scaler_scale": [
    18.18063062,
    5.57347995,
    12.59479133,
    0.90658461,
    0.57378132,
    0.24243762,
    0.48497136,
    0.53142873,
    0.14421663,
    1.0,
    1.0,
    1.06968646,
    3.9154528,
    0.06334018,
    0.06588376,
    0.70046113,
    0.24762544,
    1.0,
    0.46671684,
    0.24243762,
    1.0,
    0.87376898,
    0.20125377,
    0.46558538,
    0.43105583,
    0.43817725
  ],
  "coef": [
    -0.24444506,
    2.0707349,
    -3.42377682,
    5.01722357,
    -0.33655193,
    -0.56711853,
    -0.00832662,
    -0.12461113,
    -0.431183,
    0.0,
    0.0,
    1.77952265,
    0.45108517,
    1.36089624,
    0.92124271,
    -5.43813786,
    0.15695351,
    0.0,
    0.10683832,
    -0.56711853,
    0.0,
    0.9864754,
    -0.10636373,
    1.16312965,
    -0.40181348,
    0.66425354
  ],
  "intercept": 0.19682816,
  "suspicious_words": [
    "login",
    "signin",
    "secure",
    "account",
    "update",
    "verify",
    "confirm",
    "webscr",
    "banking",
    "bank",
    "password",
    "credential",
    "ebayisapi",
    "free",
    "bonus",
    "gift",
    "win",
    "prize",
    "alert",
    "suspend",
    "unlock",
    "recover",
    "validation",
    "authentication",
    "wallet",
    "invoice"
  ],
  "shorteners": [
    "bit.ly",
    "goo.gl",
    "tinyurl.com",
    "ow.ly",
    "t.co",
    "is.gd",
    "buff.ly",
    "adf.ly",
    "cutt.ly",
    "shorte.st",
    "rebrand.ly",
    "bit.do",
    "rb.gy"
  ],
  "brands": [
    "paypal",
    "instagram",
    "facebook",
    "apple",
    "microsoft",
    "google",
    "amazon",
    "netflix",
    "whatsapp",
    "telegram",
    "snapchat",
    "bank"
  ],
  "suspicious_tlds": [
    "cf",
    "click",
    "country",
    "download",
    "ga",
    "gq",
    "info",
    "link",
    "ml",
    "racing",
    "stream",
    "tk",
    "top",
    "work",
    "xyz",
    "zip"
  ],
  "metrics": {
    "accuracy": 0.9542,
    "f1": 0.9541
  }
}''';
