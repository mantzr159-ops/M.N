package com.zahra.phishguard

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity

/**
 * كاشف روابط التصيّد — تطبيق أندرويد.
 *
 * التطبيق يعمل بالكامل داخل الجهاز (on-device) وبدون إنترنت:
 * واجهة الاستخدام ونموذج الكشف (Logistic Regression) مُضمَّنان في مجلد assets،
 * ويُحمَّلان داخل WebView. لا يُطلب أي إذن إنترنت، ولا يُرسَل أي رابط لأي خادم.
 */
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true          // منطق الكشف مكتوب بـ JavaScript
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            webViewClient = WebViewClient()            // إبقاء التنقّل داخل التطبيق
            // تحميل الواجهة والنموذج من الأصول المحلية (بدون شبكة)
            loadUrl("file:///android_asset/index.html")
        }
        setContentView(webView)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }
}
