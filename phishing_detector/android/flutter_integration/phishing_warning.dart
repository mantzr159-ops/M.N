// phishing_warning.dart
// -----------------------------------------------------------------------------
// عنصر (Widget) جاهز يفحص نص الرسالة، ويعرض تحذيراً أحمر إذا احتوت رابط تصيّد.
// إذا كانت الرسالة آمنة (أو بلا رابط) لا يعرض شيئاً.
//
// أسهل طريقة للدمج: ضعيه أسفل كل فقاعة رسالة:
//     PhishingWarning(text: message.text)
// -----------------------------------------------------------------------------

import 'package:flutter/material.dart';
import 'phishing_detector.dart';

class PhishingWarning extends StatelessWidget {
  final String text;
  const PhishingWarning({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    final PhishResult? r = PhishingDetector.scanText(text);

    // لا رابط، أو رابط آمن → لا نعرض شيئاً.
    if (r == null || !r.isPhishing) return const SizedBox.shrink();

    final pct = (r.probability * 100).toStringAsFixed(0);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Container(
        margin: const EdgeInsets.only(top: 6),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFFDECEC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFEF4444), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.warning_amber_rounded,
                    color: Color(0xFFEF4444), size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'تحذير: رابط تصيّد مُحتمل ($pct%)',
                    style: const TextStyle(
                      color: Color(0xFFB91C1C),
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
            if (r.reasons.isNotEmpty) ...[
              const SizedBox(height: 6),
              ...r.reasons.map(
                (reason) => Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text('• $reason',
                      style: const TextStyle(
                          color: Color(0xFF7F1D1D), fontSize: 12.5)),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'لا تضغطي على الرابط ولا تُدخلي بياناتك.',
                style: TextStyle(
                    color: Color(0xFF7F1D1D),
                    fontSize: 12,
                    fontStyle: FontStyle.italic),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
