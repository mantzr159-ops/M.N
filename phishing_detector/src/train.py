"""
train.py
--------
تدريب نموذج كشف روابط التصيّد.

الخطوات:
  1. نقرأ البيانات (urls.csv)
  2. نحوّل كل رابط إلى متجه خصائص باستخدام features.py
  3. نقسم البيانات: تدريب (80%) واختبار (20%)
  4. ندرّب نموذج Random Forest
  5. نقيّم الأداء ونطبع التقارير
  6. نحفظ النموذج في model/model.pkl

Random Forest = "غابة عشوائية": مجموعة أشجار قرار تصوّت معاً.
اخترناه لأنه قوي، سريع، ويعطي "أهمية الخصائص" (مفيد جداً للشرح البحثي).
"""

import os
import sys
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    precision_score, recall_score, f1_score, roc_auc_score,
)

# نضيف مجلد src للمسار عشان نقدر نستورد features
sys.path.insert(0, os.path.dirname(__file__))
from features import extract_features, FEATURE_NAMES  # noqa: E402

HERE = os.path.dirname(__file__)
ROOT = os.path.dirname(HERE)
DATA_PATH = os.path.join(ROOT, "data", "urls.csv")
MODEL_DIR = os.path.join(ROOT, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")


def build_feature_matrix(urls):
    """تحويل قائمة روابط إلى جدول خصائص (DataFrame)."""
    rows = [extract_features(u) for u in urls]
    return pd.DataFrame(rows, columns=FEATURE_NAMES)


def main():
    # 1) قراءة البيانات
    if not os.path.exists(DATA_PATH):
        print("ملف البيانات غير موجود. شغّلي أولاً: python data/generate_dataset.py")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH)
    print(f"عدد الروابط: {len(df)}  |  آمن: {(df.label==0).sum()}  تصيّد: {(df.label==1).sum()}")

    # 2) استخراج الخصائص
    print("جاري استخراج الخصائص من الروابط...")
    X = build_feature_matrix(df["url"].astype(str).tolist())
    y = df["label"].values

    # 3) تقسيم البيانات (stratify عشان نحافظ على نفس نسبة الفئتين)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"تدريب: {len(X_train)}  |  اختبار: {len(X_test)}")

    # 4) تدريب النموذج
    print("جاري تدريب نموذج Random Forest...")
    model = RandomForestClassifier(
        n_estimators=200,      # عدد الأشجار
        max_depth=None,        # عمق غير محدود
        min_samples_leaf=2,    # يقلّل الـ overfitting
        n_jobs=-1,             # استخدم كل الأنوية
        random_state=42,
    )
    model.fit(X_train, y_train)

    # 5) التقييم على بيانات الاختبار (لم يشاهدها النموذج)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print("\n" + "=" * 55)
    print("            نتائج التقييم على بيانات الاختبار")
    print("=" * 55)
    print(f"الدقة (Accuracy)        : {accuracy_score(y_test, y_pred):.4f}")
    print(f"الضبط (Precision)       : {precision_score(y_test, y_pred):.4f}")
    print(f"الاستدعاء (Recall)      : {recall_score(y_test, y_pred):.4f}")
    print(f"F1-Score               : {f1_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC                : {roc_auc_score(y_test, y_prob):.4f}")

    print("\nمصفوفة الالتباس (Confusion Matrix):")
    cm = confusion_matrix(y_test, y_pred)
    print(f"                 تنبّأ: آمن   تنبّأ: تصيّد")
    print(f"فعلياً آمن       {cm[0][0]:6d}      {cm[0][1]:6d}")
    print(f"فعلياً تصيّد     {cm[1][0]:6d}      {cm[1][1]:6d}")

    print("\nتقرير التصنيف الكامل:")
    print(classification_report(y_test, y_pred,
          target_names=["آمن (0)", "تصيّد (1)"]))

    # التحقق المتقاطع (Cross-validation) لتأكيد ثبات الأداء
    print("التحقق المتقاطع (5-fold cross-validation)...")
    cv = cross_val_score(model, X, y, cv=5, scoring="f1")
    print(f"F1 عبر 5 طيّات: {cv.round(4)}  |  المتوسط: {cv.mean():.4f}")

    # أهم الخصائص (مفيد جداً لشرح: ليش النموذج قرّر كذا؟)
    print("\nأهم 10 خصائص تأثيراً في القرار:")
    importances = sorted(
        zip(FEATURE_NAMES, model.feature_importances_),
        key=lambda x: x[1], reverse=True,
    )
    for name, imp in importances[:10]:
        bar = "█" * int(imp * 100)
        print(f"  {name:28s} {imp:.4f}  {bar}")

    # 6) حفظ النموذج
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nتم حفظ النموذج في: {MODEL_PATH}")

    # نحفظ أهمية الخصائص لاستخدامها في الباوربوينت لاحقاً
    imp_df = pd.DataFrame(importances, columns=["feature", "importance"])
    imp_df.to_csv(os.path.join(MODEL_DIR, "feature_importance.csv"), index=False)

    # نحفظ المقاييس
    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred),
        "recall": recall_score(y_test, y_pred),
        "f1": f1_score(y_test, y_pred),
        "roc_auc": roc_auc_score(y_test, y_prob),
        "cv_f1_mean": cv.mean(),
    }
    pd.DataFrame([metrics]).to_csv(
        os.path.join(MODEL_DIR, "metrics.csv"), index=False)
    # نحفظ مصفوفة الالتباس للرسم لاحقاً
    pd.DataFrame(cm, index=["actual_safe", "actual_phish"],
                 columns=["pred_safe", "pred_phish"]).to_csv(
        os.path.join(MODEL_DIR, "confusion_matrix.csv"))

    return model


if __name__ == "__main__":
    main()
