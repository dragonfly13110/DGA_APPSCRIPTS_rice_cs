// ไฟล์: Web_Player.gs

// ⚠️ DISABLED: ฟังก์ชันนี้ถูก comment ออกเพื่อไม่ให้ชนกับ doGet() หลักใน รหัส.js
// หากต้องการใช้หน้า AI View แยกต่างหาก ให้ deploy อีกโปรเจค
/*
function doGet(e) {
  return HtmlService.createTemplateFromFile('AI_View')
    .evaluate()
    .setTitle("รายงานสถานการณ์ข้าวอัจฉริยะ (AI Insight)")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
*/

// ฟังก์ชันดึงบทวิเคราะห์ล่าสุดจาก Sheet
function getLatestAIReport() {
  const ss = SpreadsheetApp.openById("1QyruEowKFva5n7JNiizQ-0IR3rV87ReYNPSnWXT9eac"); // ID เดิมของคุณ
  const sheet = ss.getSheetByName("AI_Insight");

  // ดึงแถวล่าสุด (ข้อมูลล่าสุดอยู่แถว 2 เพราะเรา insertRowAfter 1 ตลอด)
  // แต่เพื่อความชัวร์ ดึงแถวที่ 2 มาเลย
  const data = sheet.getRange("B2").getValue();
  const time = sheet.getRange("A2").getValue();

  // จัดรูปแบบเวลาให้สวยงาม
  const dateStr = Utilities.formatDate(new Date(time), "Asia/Bangkok", "dd/MM/yyyy เวลา HH:mm น.");

  return {
    text: data,
    time: dateStr
  };
}