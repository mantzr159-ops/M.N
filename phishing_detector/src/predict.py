"""
predict.py
----------
أداة سطر أوامر للتنبؤ: تعطيها رابطاً فتقول لك آمن أو تصيّد ونسبة الثقة.

الاستخدام:
    python src/predict.py "http://instagram.secure-login.tk/verify"
    python src/predict.py            # الوضع التفاعلي (تكتبين رابط وراء رابط)
"""

import os
import sys
import joblib
import pandas as pd

sys.path.insert(0, os.path.dirname(__file__))
from features import extract_features, FEATURE_NAMES  # noqa: E402

HERE = os.path.dirname(__file__)
ROOT = os.path.dirname(HERE)
MODEL_PATH = os.path.join(ROOT, "model", "model.pkl")


def load_model():
    if not os.path.exists(MODEL_PATH):
        print("النموذج غير موجود. درّبي أولاً: python src/train.py")
        sys.exit(1)
    return joblib.load(MODEL_PATH)


def predict_url(model, url: str):
    """يرجّع (التصنيف، نسبة الثقة، الخصائص) لرابط واحد."""
    feats = extract_features(url)
    X = pd.DataFrame([feats], columns=FEATURE_NAMES)
    label = int(model.predict(X)[0])
    prob_phish = float(model.predict_proba(X)[0][1])
    return label, prob_phish, feats


def explain(url, label, prob, feats):
    """طباعة نتيجة مفهومة مع أهم أسباب القرار."""
    verdict = "🔴 تصيّد (PHISHING)" if label == 1 else "🟢 آمن (SAFE)"
    confidence = prob if label == 1 else (1 - prob)
    print("-" * 60)
    print(f"الرابط   : {url}")
    print(f"الحكم    : {verdict}")
    print(f"الثقة    : {confidence * 100:.1f}%")
    print(f"احتمال التصيّد: {prob * 100:.1f}%")

    # نعرض المؤشرات المشبوهة اللي انرفعت
    reasons = []
    if feats["has_ip"]:
        reasons.append("المضيف عنوان IP بدل اسم نطاق")
    if feats["has_at_symbol"]:
        reasons.append("يحتوي رمز @ (يخفي الوجهة الحقيقية)")
    if feats["num_suspicious_words"] > 0:
        reasons.append(f"كلمات خداع ({feats['num_suspicious_words']})")
    if feats["brand_in_subdomain_or_path"]:
        reasons.append("انتحال علامة تجارية في مكان خادع")
    if feats["tld_suspicious"]:
        reasons.append("نطاق علوي مشبوه (مثل .tk .xyz)")
    if feats["is_shortened"]:
        reasons.append("رابط مختصر يخفي الوجهة")
    if feats["num_hyphens"] >= 3:
        reasons.append(f"شرطات كثيرة ({feats['num_hyphens']})")
    if not feats["has_https"]:
        reasons.append("لا يستخدم HTTPS")
    if reasons:
        print("مؤشرات مرصودة:")
        for r in reasons:
            print(f"   ⚠️  {r}")
    print("-" * 60)


def main():
    model = load_model()
    args = sys.argv[1:]

    if args:
        for url in args:
            label, prob, feats = predict_url(model, url)
            explain(url, label, prob, feats)
    else:
        print("الوضع التفاعلي — اكتبي رابطاً (أو 'exit' للخروج):")
        while True:
            try:
                url = input("\nURL> ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if url.lower() in ("exit", "quit", "q", ""):
                break
            label, prob, feats = predict_url(model, url)
            explain(url, label, prob, feats)


if __name__ == "__main__":
    main()
