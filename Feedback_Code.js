// ==========================================
// 📝 ส่วนจัดการแบบสอบถาม (Feedback System v2)
// ==========================================

const FEEDBACK_SHEET_ID = "1RwzQQfDnQGQiucu_RcT9wk-Bjj9AhKYF8FtpnCinDMA"; // ID เดิม
const FEEDBACK_TAB_NAME = "Responses";

// ⚠️ DISABLED: ฟังก์ชันนี้ถูก comment ออกเพื่อไม่ให้ชนกับ doGet() หลักใน รหัส.js
// หากต้องการใช้หน้าแบบประเมินแยกต่างหาก ให้ deploy อีกโปรเจค
/*
function doGet(e) {
  return HtmlService.createTemplateFromFile('Feedback_Form')
    .evaluate()
    .setTitle("แบบสอบถามความพึงพอใจ - ทีมเป็ดน้อยร้อยหน้าที่")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
*/

function saveFeedbackData(formObject) {
  // 🛡️ Rate Limiting (Hybrid: Global + Per-Session)
  const sessionId = formObject.sessionId || 'anonymous';
  const rateLimitCheck = checkHybridRateLimit(sessionId, 'feedback', RATE_LIMITS.FEEDBACK);

  if (!rateLimitCheck.allowed) {
    Logger.log(`⏱️ Feedback rate limit exceeded for session ${sessionId}: ${rateLimitCheck.error}`);
    return { success: false, error: rateLimitCheck.error };
  }

  try {
    const ss = SpreadsheetApp.openById(FEEDBACK_SHEET_ID);
    let sheet = ss.getSheetByName(FEEDBACK_TAB_NAME);

    // สร้างหัวตารางใหม่ (ถ้ายังไม่มี)
    if (!sheet) {
      sheet = ss.insertSheet(FEEDBACK_TAB_NAME);
      // เพิ่มคอลัมน์คะแนนย่อย
      sheet.appendRow([
        "Timestamp",
        "ด้านความสวยงาม (UI)",
        "ด้านการใช้งาน (UX)",
        "ด้านประโยชน์ข้อมูล",
        "คะแนนเฉลี่ย",
        "ประเภทผู้ใช้งาน",
        "ข้อเสนอแนะเพิ่มเติม"
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#E4F1E8").setBorder(true, true, true, true, true, true);
    }

    // คำนวณคะแนนเฉลี่ย
    const r1 = parseInt(formObject.rating_design);
    const r2 = parseInt(formObject.rating_usability);
    const r3 = parseInt(formObject.rating_utility);
    const avg = ((r1 + r2 + r3) / 3).toFixed(2);

    const timestamp = new Date();
    const rowData = [
      timestamp,
      r1, // Design
      r2, // UX
      r3, // Utility
      avg, // Average
      formObject.userType,
      formObject.comment
    ];

    sheet.appendRow(rowData);
    return { success: true };

  } catch (e) {
    return { success: false, error: e.toString() };
  }
}