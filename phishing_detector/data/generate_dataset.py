"""
generate_dataset.py
-------------------
توليد مجموعة بيانات واقعية من الروابط (نصفها حقيقي/آمن ونصفها تصيّد).

ملاحظة بحثية مهمة:
  هذه بيانات مُولّدة اصطناعياً لأغراض التعلّم والتجربة. في بحث الدكتوراه
  النهائي يُفضّل استبدالها ببيانات حقيقية من مصادر موثوقة مثل:
    - PhishTank (روابط تصيّد مؤكّدة)
    - OpenPhish
    - UCI / Kaggle Phishing datasets
    - Alexa / Tranco top sites (للروابط الآمنة)
  الكود مصمّم بحيث تقدرين تبدّلين الملف urls.csv بأي بيانات حقيقية بنفس الأعمدة.

المخرجات: ملف data/urls.csv فيه عمودان: url, label
  label = 0  →  آمن (legitimate)
  label = 1  →  تصيّد (phishing)
"""

import csv
import os
import random

random.seed(42)  # لنتائج قابلة للتكرار (reproducible)

# نطاقات حقيقية شائعة (للروابط الآمنة)
LEGIT_DOMAINS = [
    "google.com", "youtube.com", "facebook.com", "instagram.com", "wikipedia.org",
    "amazon.com", "twitter.com", "linkedin.com", "microsoft.com", "apple.com",
    "github.com", "stackoverflow.com", "reddit.com", "netflix.com", "paypal.com",
    "bbc.com", "cnn.com", "nytimes.com", "dropbox.com", "whatsapp.com",
    "telegram.org", "zoom.us", "spotify.com", "adobe.com", "cloudflare.com",
    "mozilla.org", "office.com", "bing.com", " ", "wordpress.com",
]
LEGIT_DOMAINS = [d.strip() for d in LEGIT_DOMAINS if d.strip()]

LEGIT_PATHS = [
    "", "/", "/about", "/help", "/contact", "/search?q=books",
    "/user/profile", "/products/123", "/articles/2024/news", "/login",
    "/settings/account", "/docs/getting-started", "/watch?v=abc123",
]

# مكوّنات لتوليد روابط تصيّد واقعية
PHISH_BRANDS = ["paypal", "instagram", "facebook", "apple", "microsoft",
                "amazon", "netflix", "whatsapp", "bankofamerica", "google"]
PHISH_WORDS = ["login", "secure", "verify", "account", "update", "confirm",
               "signin", "support", "recovery", "alert", "unlock", "billing"]
SUSPICIOUS_TLDS = ["tk", "ml", "ga", "cf", "xyz", "top", "click", "online",
                   "info", "work", "live", "zip"]
RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"


def random_string(n):
    return "".join(random.choice(RANDOM_CHARS) for _ in range(n))


def make_legit_url():
    """توليد رابط آمن واقعي."""
    domain = random.choice(LEGIT_DOMAINS)
    scheme = "https" if random.random() < 0.9 else "http"  # الآمنة غالباً https
    sub = "www." if random.random() < 0.5 else ""
    path = random.choice(LEGIT_PATHS)

    # 15% من الروابط الآمنة "صعبة": طويلة أو فيها كلمات/رموز تشبه التصيّد
    # (مثل صفحة تسجيل دخول حقيقية طويلة) — تجعل المسألة واقعية وغير مثالية
    if random.random() < 0.15:
        hard = random.choice([
            f"{scheme}://{sub}{domain}/account/login?session={random_string(12)}&ref=email",
            f"{scheme}://{sub}{domain}/secure/update-password?token={random_string(16)}",
            f"{scheme}://{sub}{domain}/verify-account/confirm?user={random_string(8)}",
            f"{scheme}://support.{domain}/billing/invoice-{random_string(6)}.pdf",
        ])
        return hard
    return f"{scheme}://{sub}{domain}{path}"


def make_phish_url():
    """توليد رابط تصيّد واقعي بأحد الأنماط الشائعة."""
    pattern = random.randint(0, 7)
    brand = random.choice(PHISH_BRANDS)
    word = random.choice(PHISH_WORDS)
    tld = random.choice(SUSPICIOUS_TLDS)
    scheme = "http" if random.random() < 0.7 else "https"  # التصيّد غالباً http

    if pattern == 0:
        # انتحال العلامة كنطاق فرعي لنطاق غريب
        return f"{scheme}://{brand}.{word}-{random_string(5)}.{tld}/{word}.php"
    elif pattern == 1:
        # عنوان IP مباشر
        ip = ".".join(str(random.randint(1, 255)) for _ in range(4))
        return f"{scheme}://{ip}/{brand}/{word}.php?id={random_string(8)}"
    elif pattern == 2:
        # نطاق فيه شرطات كثيرة + كلمات خداع
        return (f"{scheme}://{brand}-{word}-{random_string(4)}.{tld}"
                f"/{word}/update?user={random_string(6)}")
    elif pattern == 3:
        # رمز @ لإخفاء الوجهة الحقيقية
        return f"{scheme}://{brand}.com@{random_string(8)}.{tld}/{word}"
    elif pattern == 4:
        # رابط طويل جداً مع سلسلة عشوائية
        return (f"{scheme}://{random_string(6)}.{tld}/{brand}/{word}/"
                f"secure/{random_string(20)}/index.html?token={random_string(15)}")
    elif pattern == 5:
        # نطاق فرعي متعدد الطبقات
        return (f"{scheme}://{word}.{brand}.{random_string(5)}.{tld}"
                f"/signin?redirect={random_string(10)}")
    elif pattern == 6:
        # تصيّد "ماكر": يستخدم https ونطاق .com عادي بدون علامات واضحة
        return (f"https://{brand}{random.choice(['-', ''])}{word}"
                f"{random.randint(1,99)}.com/{word}")
    else:
        # تصيّد على موقع شرعي مُخترَق (compromised host): النطاق حقيقي وموثوق
        # لكن الصفحة خبيثة. هذا أصعب نوع لأن خصائص الرابط تبدو آمنة تماماً.
        legit = random.choice(LEGIT_DOMAINS)
        return f"https://www.{legit}/{random_string(6)}/{word}.php"


def main(n_each=3000, out_path=None):
    if out_path is None:
        out_path = os.path.join(os.path.dirname(__file__), "urls.csv")

    rows = []
    for _ in range(n_each):
        rows.append((make_legit_url(), 0))
        rows.append((make_phish_url(), 1))

    # ضجيج تسميات واقعي: ~3% من الروابط مُسمّاة خطأً (كما يحصل في البيانات الحقيقية
    # بسبب أخطاء بشرية أو روابط غامضة). يمنع النتيجة المثالية غير الواقعية.
    noise_rate = 0.03
    n_noise = int(len(rows) * noise_rate)
    for idx in random.sample(range(len(rows)), n_noise):
        url, label = rows[idx]
        rows[idx] = (url, 1 - label)  # نقلب التسمية

    random.shuffle(rows)

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["url", "label"])
        writer.writerows(rows)

    print(f"تم توليد {len(rows)} رابط في: {out_path}")
    print(f"  آمن (0): {sum(1 for _, l in rows if l == 0)}")
    print(f"  تصيّد (1): {sum(1 for _, l in rows if l == 1)}")


if __name__ == "__main__":
    main()
