"""
evaluate.py
-----------
يرسم مخططات التقييم ويحفظها كصور PNG (نستخدمها في التقرير والباوربوينت):
  1. مصفوفة الالتباس (Confusion Matrix)
  2. أهمية الخصائص (Feature Importance)
  3. منحنى ROC

يُشغّل بعد train.py.
"""

import os
import sys
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # بدون واجهة رسومية (مناسب للخادم)
import matplotlib.pyplot as plt
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_curve, auc

sys.path.insert(0, os.path.dirname(__file__))
from features import FEATURE_NAMES, extract_features  # noqa: E402

HERE = os.path.dirname(__file__)
ROOT = os.path.dirname(HERE)
MODEL_DIR = os.path.join(ROOT, "model")
FIG_DIR = os.path.join(ROOT, "figures")
DATA_PATH = os.path.join(ROOT, "data", "urls.csv")

os.makedirs(FIG_DIR, exist_ok=True)
plt.rcParams["figure.dpi"] = 130


def plot_confusion():
    cm = pd.read_csv(os.path.join(MODEL_DIR, "confusion_matrix.csv"), index_col=0).values
    fig, ax = plt.subplots(figsize=(5, 4.2))
    im = ax.imshow(cm, cmap="Blues")
    labels = ["Safe (0)", "Phishing (1)"]
    ax.set_xticks([0, 1], labels)
    ax.set_yticks([0, 1], labels)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix")
    for i in range(2):
        for j in range(2):
            ax.text(j, i, f"{cm[i][j]}", ha="center", va="center",
                    color="white" if cm[i][j] > cm.max() / 2 else "black",
                    fontsize=14, fontweight="bold")
    fig.colorbar(im, fraction=0.046, pad=0.04)
    fig.tight_layout()
    path = os.path.join(FIG_DIR, "confusion_matrix.png")
    fig.savefig(path)
    plt.close(fig)
    print("حُفظ:", path)


def plot_importance():
    imp = pd.read_csv(os.path.join(MODEL_DIR, "feature_importance.csv"))
    imp = imp.sort_values("importance", ascending=True).tail(12)
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.barh(imp["feature"], imp["importance"], color="#2563eb")
    ax.set_xlabel("Importance")
    ax.set_title("Top Feature Importances")
    fig.tight_layout()
    path = os.path.join(FIG_DIR, "feature_importance.png")
    fig.savefig(path)
    plt.close(fig)
    print("حُفظ:", path)


def plot_roc():
    model = joblib.load(os.path.join(MODEL_DIR, "model.pkl"))
    df = pd.read_csv(DATA_PATH)
    X = pd.DataFrame([extract_features(u) for u in df["url"].astype(str)],
                     columns=FEATURE_NAMES)
    y = df["label"].values
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y)
    y_prob = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)

    fig, ax = plt.subplots(figsize=(5, 4.2))
    ax.plot(fpr, tpr, color="#dc2626", lw=2, label=f"ROC (AUC = {roc_auc:.3f})")
    ax.plot([0, 1], [0, 1], "k--", lw=1)
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve")
    ax.legend(loc="lower right")
    fig.tight_layout()
    path = os.path.join(FIG_DIR, "roc_curve.png")
    fig.savefig(path)
    plt.close(fig)
    print("حُفظ:", path)


def main():
    plot_confusion()
    plot_importance()
    plot_roc()
    print("كل المخططات حُفظت في:", FIG_DIR)


if __name__ == "__main__":
    main()
