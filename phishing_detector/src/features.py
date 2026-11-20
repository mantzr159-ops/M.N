"""
features.py
-----------
استخراج الخصائص (Feature Extraction) من رابط URL.

الفكرة: نحوّل كل رابط نصّي إلى مجموعة أرقام (متجه خصائص) تصف شكله وبنيته،
بدون فتح الرابط أو الاتصال بالإنترنت (تحليل لغوي/بنيوي = Lexical features).
هذه الأرقام هي اللي يتعلّم منها نموذج الذكاء الاصطناعي.

كل دالة feature مستقلة وسهلة الشرح، عشان البحث العلمي يحتاج تفسير كل خاصية.
"""

import math
import re
from urllib.parse import urlparse
from collections import Counter

# كلمات شائعة في روابط التصيّد (تحاول تخدع المستخدم إنه بمكان موثوق)
SUSPICIOUS_WORDS = [
    "login", "signin", "secure", "account", "update", "verify", "confirm",
    "webscr", "banking", "bank", "password", "credential", "ebayisapi",
    "free", "bonus", "gift", "win", "prize", "alert", "suspend", "unlock",
    "recover", "validation", "authentication", "wallet", "invoice",
]

# خدمات اختصار الروابط (يستغلّها المهاجم لإخفاء الوجهة الحقيقية)
SHORTENERS = [
    "bit.ly", "goo.gl", "tinyurl.com", "ow.ly", "t.co", "is.gd", "buff.ly",
    "adf.ly", "cutt.ly", "shorte.st", "rebrand.ly", "bit.do", "rb.gy",
]

# أسماء علامات تجارية شهيرة (تُنتحل كثيراً في التصيّد)
BRANDS = [
    "paypal", "instagram", "facebook", "apple", "microsoft", "google",
    "amazon", "netflix", "whatsapp", "telegram", "snapchat", "bank",
]

IP_PATTERN = re.compile(
    r"^(?:\d{1,3}\.){3}\d{1,3}$"  # IPv4
)


def _safe_parse(url: str):
    """تحليل الرابط بأمان حتى لو كان مشوّهاً."""
    if "://" not in url:
        url = "http://" + url  # نضيف سكيم مؤقت عشان urlparse يشتغل صح
    return urlparse(url)


def _shannon_entropy(text: str) -> float:
    """
    إنتروبيا شانون = مقياس العشوائية في النص.
    روابط التصيّد كثير تستخدم سلاسل عشوائية (xk39fj2...) فتكون إنتروبيتها عالية.
    """
    if not text:
        return 0.0
    counts = Counter(text)
    length = len(text)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())


def extract_features(url: str) -> dict:
    """
    تأخذ رابطاً نصّياً وترجّع قاموس {اسم الخاصية: قيمتها}.
    هذه هي الدالة الرئيسية المستخدمة في التدريب والتنبؤ.
    """
    url = url.strip()
    parsed = _safe_parse(url)
    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""
    url_lower = url.lower()

    digits = sum(c.isdigit() for c in url)
    letters = sum(c.isalpha() for c in url)

    features = {
        # --- خصائص الطول ---
        "url_length": len(url),                       # طول الرابط كامل
        "hostname_length": len(hostname),             # طول اسم المضيف
        "path_length": len(path),                     # طول المسار

        # --- عدّ الرموز (الرموز الكثيرة علامة تصيّد) ---
        "num_dots": url.count("."),                   # عدد النقاط
        "num_hyphens": url.count("-"),                # عدد الشرطات
        "num_at": url.count("@"),                     # رمز @ (يخفي الوجهة الحقيقية)
        "num_question": url.count("?"),               # علامات الاستفهام
        "num_equals": url.count("="),                 # علامات يساوي
        "num_ampersand": url.count("&"),              # رموز &
        "num_underscore": url.count("_"),             # الشرطة السفلية
        "num_percent": url.count("%"),                # ترميز % (يخفي محارف)
        "num_slash": url.count("/"),                  # عدد الشرطات المائلة
        "num_digits": digits,                         # عدد الأرقام

        # --- نِسَب ---
        "digit_ratio": digits / len(url) if url else 0,   # نسبة الأرقام
        "letter_ratio": letters / len(url) if url else 0, # نسبة الحروف

        # --- بنية النطاق ---
        "num_subdomains": max(hostname.count(".") - 1, 0),  # عدد النطاقات الفرعية
        "has_ip": 1 if IP_PATTERN.match(hostname) else 0,   # هل المضيف عنوان IP؟
        "has_port": 1 if parsed.port else 0,                # هل فيه بورت صريح؟

        # --- مؤشرات أمان/خداع ---
        "has_https": 1 if parsed.scheme == "https" else 0,  # هل يستخدم HTTPS؟
        "has_at_symbol": 1 if "@" in url else 0,            # وجود @
        "double_slash_redirect": 1 if url.rfind("//") > 7 else 0,  # // بعد السكيم = إعادة توجيه

        # --- كلمات ونطاقات مشبوهة ---
        "num_suspicious_words": sum(w in url_lower for w in SUSPICIOUS_WORDS),
        "is_shortened": 1 if any(s in url_lower for s in SHORTENERS) else 0,

        # --- انتحال العلامات التجارية ---
        # العلامة موجودة بالرابط بس مو كنطاق أساسي = انتحال (مثل instagram.secure-xyz.com)
        "brand_in_subdomain_or_path": _brand_spoof(hostname, path, url_lower),

        # --- العشوائية ---
        "hostname_entropy": round(_shannon_entropy(hostname), 3),  # عشوائية اسم المضيف

        # --- مؤشرات إضافية ---
        "tld_suspicious": _suspicious_tld(hostname),  # نطاق علوي مشبوه (.xyz .tk ...)
    }
    return features


def _brand_spoof(hostname: str, path: str, url_lower: str) -> int:
    """
    يرجّع 1 إذا ظهر اسم علامة تجارية في مكان خادع:
    - داخل المسار (instagram في المسار مو بالنطاق)
    - أو كنطاق فرعي لنطاق غريب
    مثال خطر: http://instagram.login-verify.com  →  النطاق الحقيقي login-verify.com
    """
    for brand in BRANDS:
        if brand in url_lower:
            # هل النطاق الأساسي هو نفسه العلامة؟ (آمن) أو لا؟ (مشبوه)
            parts = hostname.split(".")
            # النطاق الأساسي = آخر جزأين (example.com)
            base = ".".join(parts[-2:]) if len(parts) >= 2 else hostname
            if brand not in base:  # العلامة ظهرت بس مو بالنطاق الأساسي
                return 1
    return 0


# نطاقات علوية (TLD) يكثر استغلالها في التصيّد لأنها رخيصة/مجانية
SUSPICIOUS_TLDS = {
    "tk", "ml", "ga", "cf", "gq", "xyz", "top", "work", "click",
    "link", "info", "country", "stream", "download", "racing", "zip",
}


def _suspicious_tld(hostname: str) -> int:
    """يرجّع 1 إذا كان النطاق العلوي من النطاقات المشبوهة الرخيصة."""
    if not hostname or "." not in hostname:
        return 0
    tld = hostname.rsplit(".", 1)[-1].lower()
    return 1 if tld in SUSPICIOUS_TLDS else 0


# قائمة أسماء الخصائص بالترتيب الثابت (مهمة عشان ترتيب الأعمدة يكون نفسه دايماً)
FEATURE_NAMES = list(extract_features("http://example.com").keys())


if __name__ == "__main__":
    # تجربة سريعة
    import json
    tests = [
        "https://www.instagram.com/",
        "http://instagram.secure-login-verify.tk/account/update?id=1",
        "http://192.168.0.5/paypal/login.php",
    ]
    for t in tests:
        print("\nURL:", t)
        print(json.dumps(extract_features(t), indent=2, ensure_ascii=False))
