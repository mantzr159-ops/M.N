"""
export_model.py
---------------
يصدّر نموذجاً خفيفاً (Logistic Regression) يعمل داخل الجوال بدون سيرفر.

لماذا Logistic Regression للجوال؟
  - النموذج البحثي (Random Forest) قوي لكنه ثقيل ويصعب نقله لـ Kotlin/JS.
  - الانحدار اللوجستي = معادلة بسيطة (أوزان × خصائص + ثابت) تُنفَّذ بسهولة
    وبدقة مطابقة تماماً في أي لغة. مناسب للتشغيل داخل الجهاز (on-device).

المخرجات: model.json فيه كل ما يحتاجه التطبيق:
  - قوائم الكلمات/النطاقات المشبوهة (ليطابق استخراج الخصائص تماماً)
  - معاملات التحجيم (mean/scale) + أوزان النموذج + الثابت
  - ترتيب الخصائص
"""

import os
import sys
import json
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

HERE = os.path.dirname(__file__)
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "src"))
from features import (extract_features, FEATURE_NAMES, SUSPICIOUS_WORDS,  # noqa: E402
                      SHORTENERS, BRANDS, SUSPICIOUS_TLDS)

DATA = os.path.join(ROOT, "data", "urls.csv")


def main():
    df = pd.read_csv(DATA)
    X = pd.DataFrame([extract_features(u) for u in df["url"].astype(str)], columns=FEATURE_NAMES)
    y = df["label"].values
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("lr", LogisticRegression(max_iter=1000, C=1.0)),
    ])
    pipe.fit(Xtr, ytr)
    pred = pipe.predict(Xte)

    print("=== أداء النموذج الخفيف (Logistic Regression) على بيانات الاختبار ===")
    print(f"الدقّة Accuracy : {accuracy_score(yte, pred):.4f}")
    print(f"Precision      : {precision_score(yte, pred):.4f}")
    print(f"Recall         : {recall_score(yte, pred):.4f}")
    print(f"F1             : {f1_score(yte, pred):.4f}")

    scaler = pipe.named_steps["scaler"]
    lr = pipe.named_steps["lr"]

    export = {
        "feature_names": list(FEATURE_NAMES),
        "scaler_mean": [round(float(v), 8) for v in scaler.mean_],
        "scaler_scale": [round(float(v), 8) for v in scaler.scale_],
        "coef": [round(float(v), 8) for v in lr.coef_[0]],
        "intercept": round(float(lr.intercept_[0]), 8),
        # القوائم المرجعية (لتطابق استخراج الخصائص بين بايثون و Kotlin/JS)
        "suspicious_words": SUSPICIOUS_WORDS,
        "shorteners": SHORTENERS,
        "brands": BRANDS,
        "suspicious_tlds": sorted(SUSPICIOUS_TLDS),
        "metrics": {
            "accuracy": round(float(accuracy_score(yte, pred)), 4),
            "f1": round(float(f1_score(yte, pred)), 4),
        },
    }

    out = os.path.join(HERE, "model.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(export, f, ensure_ascii=False, indent=2)
    print(f"\nتم تصدير النموذج إلى: {out}  ({len(export['feature_names'])} خاصية)")


if __name__ == "__main__":
    main()
