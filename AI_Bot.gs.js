// ============================================
// 🤖 PROJECT: SMART RICE GUARDIAN (ระบบเตือนภัยข้าวอัจฉริยะ)
// Model: Gemini 2.5 Pro + Google Search + Hybrid Calculation
// ============================================

const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const OPENWEATHER_API_KEY = PropertiesService.getScriptProperties().getProperty('OPENWEATHER_API_KEY');
const SS_ID = "1QyruEowKFva5n7JNiizQ-0IR3rV87ReYNPSnWXT9eac";

const DISTRICT_COORDS = {
  "เมืองฉะเชิงเทรา": { lat: 13.690, lon: 101.070 },
  "บางคล้า": { lat: 13.725, lon: 101.208 },
  "บางน้ำเปรี้ยว": { lat: 13.845, lon: 101.060 },
  "บางปะกง": { lat: 13.545, lon: 100.995 },
  "บ้านโพธิ์": { lat: 13.595, lon: 101.075 },
  "พนมสารคาม": { lat: 13.745, lon: 101.350 },
  "ราชสาส์น": { lat: 13.780, lon: 101.290 },
  "สนามชัยเขต": { lat: 13.655, lon: 101.445 },
  "แปลงยาว": { lat: 13.585, lon: 101.285 },
  "ท่าตะเกียบ": { lat: 13.435, lon: 101.625 },
  "คลองเขื่อน": { lat: 13.785, lon: 101.155 }
};

// ============================================
// 🚀 ฟังก์ชันหลัก
// ============================================
function runSmartAIAnalysis() {
  // 1. ดึงตัวเลขสรุปที่ถูกต้องแม่นยำ (Official Stats)
  const officialStats = getProvinceStats();

  // 2. ดึงข้อมูลดิบทั้งหมดเพื่อหา Insight เชิงลึก
  const rawData = getFullSheetData("DGA_rice_Cha_2568/69");
  const riskData = getFullSheetData("ตำบล");

  // 3. ดึงพยากรณ์อากาศ
  const weatherData = getDistrictWeather();

  // 4. สร้าง Prompt
  const prompt = `
    คุณคือ "AI Smart Farmer" ของจังหวัดฉะเชิงเทรา ใช้คำพูดภาษาไทย ที่เข้าใจง่าย 
    
    [คำสั่งพิเศษ: 🌐 Google Search]
    ค้นหาข้อมูลล่าสุดเดี๋ยวนี้เกี่ยวกับ:
    1. "พยากรณ์อากาศรายเดือน ฉะเชิงเทรา ${getThaiMonth()} 2568"
    2. "สถานการณ์น้ำลุ่มน้ำบางปะกง ล่าสุด"
    3. "ประกาศเตือนภัย กรมอุตุนิยมวิทยา ล่าสุด ภาคตะวันออก"
    
    ---------------------------------------------------
    [ส่วนที่ 1: สถิติอย่างเป็นทางการ (Official Stats)]
    (ใช้ตัวเลขนี้ในการสรุปภาพรวม ห้ามคำนวณใหม่เอง)
    ${officialStats}
    ---------------------------------------------------
    [ส่วนที่ 2: ข้อมูลความเสี่ยงรายพื้นที่ (Master Data)]
    ${riskData}
    ---------------------------------------------------
    [ส่วนที่ 3: รายงานการเพาะปลูกรายล็อต (Transaction Data)]
    ใช้ข้อมูลนี้วิเคราะห์จุดเสี่ยงรายตำบล (อายุข้าว, ระยะการเติบโต)
    ${rawData}
    ---------------------------------------------------
    [ส่วนที่ 4: พยากรณ์อากาศ 7 วัน (Live API)]
    ${weatherData}
    ---------------------------------------------------
    
    [ภารกิจ]
    วิเคราะห์ข้อมูล Big Data ทั้งหมด และเขียน "รายงานสถานการณ์และเตือนภัยประจำวัน"
    **รูปแบบการตอบ:** เขียนเป็น Text/Markdown ปกติ ใช้อิโมจิประกอบหัวข้อ  ไม่ต้องยาวมากนะ เอาให้กระชับ เป้าหมายหลักคือให้เจ้าหน้าที่และผู้บริหารได้อ่าน 
    
    หัวข้อรายงาน:
    
    0. 📊 **สรุปภาพรวมทั้งจังหวัด (Executive Summary):**
       - รายงานยอดปลูกสะสม, เก็บเกี่ยวแล้ว, และคงเหลือในนา (อ้างอิงจากส่วนที่ 1)
       - วิเคราะห์ความคืบหน้าภาพรวมสั้นๆ แยกตามพันธุ์ข้าว ว่าทำอะไรไปแล้วบ้างกี่เปอร์เซ็น
       - มีอะไรผิดปกติบ้าง จากที่ควรจะเป็น
       
    1. ⛈️ **พื้นที่เสี่ยงภัยเร่งด่วน (High Alert):**
       - วิเคราะห์ Cross-check: พื้นที่ที่ "เสี่ยงน้ำท่วมสูง" หรือ พื้นที่ที่ "เสี่ยงแล้ง" ดูฤดูกาลและเดือนด้วยล่ะ ถ้าหมดฤดูกาลน้ำท่วมไปแล้วก็ไม่ต้องพูดถึง แต่อาจจะมีเรื่องแล้งแทน
       - ระบุชื่อตำบล อำเภอ และจำนวนไร่ที่ต้องเร่งช่วยเหลือ
       
    2. 🚜 **แผนบริหารการเก็บเกี่ยว:**
       - อำเภอไหนมีข้าวอะไรบ้าง ระยะไหนบ้าง "สุกแก่/รอเกี่ยว" หนาแน่นที่สุด?  และทำอะไรไปแล้วบ้างกี่เปอร์เซ็น
       
    3. 🌡️ **แนวโน้มอากาศและคำแนะนำ:**
       - สรุปสถานการณ์จากข่าวและ API พร้อมคำแนะนำแก่เกษตรกร

    4. 💡 **ข้อแนะนำถึงเจ้าหน้าที่ในพื้นที่:**
       - ระบุพื้นที่เป้าหมาย ที่เจ้าหน้าที่ต้องลงไปตรวจสอบในช่วงสัปดาห์นี้
  `;

  callGeminiAPI(prompt);
}

// ============================================
// 🛠️ ฟังก์ชันย่อย
// ============================================

// 1. เรียก Gemini (Model: gemini-2.5-pro)
function callGeminiAPI(prompt) {
  // 🛡️ Rate Limiting (Hybrid: Global + Per-Session)
  // หมายเหตุ: สำหรับ AI Bot ที่รันอัตโนมัติ ใช้ 'system' เป็น sessionId
  const sessionId = 'system_auto_run';
  const rateLimitCheck = checkHybridRateLimit(sessionId, 'gemini_api', RATE_LIMITS.GEMINI_API);

  if (!rateLimitCheck.allowed) {
    Logger.log(`⏱️ AI Bot rate limit exceeded: ${rateLimitCheck.error}`);
    return; // ข้ามไม่รัน (ไม่ throw error เพราะเป็น auto-run)
  }

  let apiKey = GEMINI_API_KEY;
  if (!apiKey) { Logger.log("❌ กรุณาใส่ API Key"); return; }

  // ✅ จัดให้ครับ Gemini 2.5 Pro
  const model = "gemini-2.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    "contents": [{ "parts": [{ "text": prompt }] }],
    // 👇 ใช้คำสั่ง Search แบบใหม่ (google_search)
    "tools": [{ "google_search": {} }]
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    // ดึง Text คำตอบ
    let text = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      saveToSheet(text);
      Logger.log("✅ Gemini 2.5 Pro วิเคราะห์เสร็จสิ้น!");
    } else {
      Logger.log("⚠️ AI ไม่ตอบกลับ (อาจเป็นเพราะชื่อโมเดลใหม่เกินไป หรือ Server Busy): " + JSON.stringify(json));
    }
  } catch (e) {
    Logger.log("❌ Error: " + e.toString());
  }
}

// 2. คำนวณสถิติจังหวัด (เพื่อให้ตัวเลขเป๊ะ)
function getProvinceStats() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName("DGA_rice_Cha_2568/69");
  if (!sheet) return "ไม่มีข้อมูล";

  const data = sheet.getDataRange().getValues();
  let totalPlanted = 0;
  let totalHarvested = 0;

  for (let i = 1; i < data.length; i++) {
    let area = parseFloat(data[i][5]) || 0; // Col F
    let status = data[i][11]; // Col L

    totalPlanted += area;
    if (status === "เก็บเกี่ยวแล้ว" || status === "✅ เก็บเกี่ยวแล้ว") {
      totalHarvested += area;
    }
  }

  let percent = (totalPlanted > 0) ? ((totalHarvested / totalPlanted) * 100).toFixed(2) : 0;
  let remaining = totalPlanted - totalHarvested;

  return `- พื้นที่ปลูกสะสม: ${totalPlanted.toLocaleString()} ไร่\n- เก็บเกี่ยวแล้ว: ${totalHarvested.toLocaleString()} ไร่ (${percent}%)\n- คงเหลือในนา: ${remaining.toLocaleString()} ไร่`;
}

// 3. ดึงข้อมูลดิบทั้ง Sheet (Full Context)
function getFullSheetData(sheetName) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return "ไม่พบข้อมูล: " + sheetName;

  const data = sheet.getDataRange().getValues();
  let csvString = "";

  // ตัด Header มาด้วย
  for (let i = 0; i < data.length; i++) {
    let rowString = data[i].map(cell => {
      if (cell instanceof Date) return Utilities.formatDate(cell, "Asia/Bangkok", "yyyy-MM-dd");
      return String(cell).replace(/,/g, " ");
    }).join(",");
    csvString += rowString + "\n";
  }
  return csvString;
}

// 4. ดึงพยากรณ์อากาศ
function getDistrictWeather() {
  if (!OPENWEATHER_API_KEY) return "No Weather Key";
  let report = "";
  for (const [district, coords] of Object.entries(DISTRICT_COORDS)) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&lang=th&appid=${OPENWEATHER_API_KEY}`;
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText());
      let maxRain = 0;
      data.list.forEach(p => { if (p.rain && p.rain['3h'] > maxRain) maxRain = p.rain['3h']; });
      let condition = (maxRain > 10) ? "⛈️ หนักมาก" : (maxRain > 5) ? "🌧️ หนัก" : "☀️ ปกติ";
      report += `- อ.${district}: ${condition} (${maxRain} มม.)\n`;
    } catch (e) { }
  }
  return report;
}

// 5. บันทึกผล
function saveToSheet(text) {
  const ss = SpreadsheetApp.openById(SS_ID);
  let outSheet = ss.getSheetByName("AI_Insight");
  if (!outSheet) { outSheet = ss.insertSheet("AI_Insight"); outSheet.getRange("A1:B1").setValues([["Time", "Report"]]); }
  outSheet.insertRowAfter(1);
  outSheet.getRange("A2:B2").setValues([[new Date(), text]]);
}

function getThaiMonth() {
  return ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][new Date().getMonth()];
}

// ============================================
// 📄 ฟังก์ชันสำหรับ Web Interface (AI_View.html)
// ============================================

// ดึงรายงาน AI ล่าสุด
function getLatestAIReport() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName("AI_Insight");
  
  if (!sheet || sheet.getLastRow() < 2) {
    return {
      time: "ไม่มีข้อมูล",
      text: "ยังไม่มีรายงานในระบบ กรุณารอการวิเคราะห์อัตโนมัติในรอบถัดไป"
    };
  }
  
  // ดึงข้อมูลจากแถวที่ 2 (แถวล่าสุดหลังจาก insertRowAfter(1))
  const data = sheet.getRange(2, 1, 1, 2).getValues()[0];
  const timestamp = data[0];
  const reportText = data[1];
  
  return {
    time: Utilities.formatDate(new Date(timestamp), "Asia/Bangkok", "d MMMM yyyy, HH:mm น.", "th_TH"),
    text: reportText || "ไม่มีข้อมูล"
  };
}

// ดึงรายการวันที่ที่มีรายงาน (14 วันย้อนหลัง)
function getAvailableDates(days = 14) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName("AI_Insight");
  
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }
  
  const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1); // Column A (Time)
  const timestamps = dataRange.getValues();
  
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const availableDates = [];
  const seenDates = new Set();
  
  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = new Date(timestamps[i][0]);
    
    if (timestamp >= cutoffDate && timestamp <= now) {
      const dateKey = Utilities.formatDate(timestamp, "Asia/Bangkok", "yyyy-MM-dd");
      
      // เก็บเฉพาะวันที่ไม่ซ้ำ (ใช้วันล่าสุดของแต่ละวัน)
      if (!seenDates.has(dateKey)) {
        seenDates.add(dateKey);
        
        availableDates.push({
          displayText: formatThaiDate(timestamp),
          isoDate: dateKey,
          timestamp: timestamp.getTime()
        });
      }
    }
  }
  
  // เรียงจากใหม่ไปเก่า
  availableDates.sort((a, b) => b.timestamp - a.timestamp);
  
  return availableDates;
}

// ดึงรายงานตามวันที่ที่เลือก
function getReportByDate(dateString) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName("AI_Insight");
  
  if (!sheet || sheet.getLastRow() < 2) {
    return {
      time: "ไม่มีข้อมูล",
      text: "ไม่พบรายงานในวันที่เลือก"
    };
  }
  
  const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2);
  const data = dataRange.getValues();
  
  // แปลง dateString เป็น Date object
  const targetDate = new Date(dateString);
  const targetDateStr = Utilities.formatDate(targetDate, "Asia/Bangkok", "yyyy-MM-dd");
  
  // หารายงานล่าสุดของวันนั้น
  let foundReport = null;
  
  for (let i = 0; i < data.length; i++) {
    const timestamp = new Date(data[i][0]);
    const recordDateStr = Utilities.formatDate(timestamp, "Asia/Bangkok", "yyyy-MM-dd");
    
    if (recordDateStr === targetDateStr) {
      // เก็บรายงานล่าสุดของวันนั้น (ข้อมูลเรียงจากใหม่ไปเก่า)
      if (!foundReport) {
        foundReport = {
          time: Utilities.formatDate(timestamp, "Asia/Bangkok", "d MMMM yyyy, HH:mm น.", "th_TH"),
          text: data[i][1] || "ไม่มีข้อมูล"
        };
        break; // หยุดทันทีเมื่อเจอรายงานแรก (ล่าสุด)
      }
    }
  }
  
  if (!foundReport) {
    return {
      time: "ไม่มีข้อมูล",
      text: "ไม่พบรายงานในวันที่ " + formatThaiDate(targetDate)
    };
  }
  
  return foundReport;
}

// ฟังก์ชันช่วยแปลงวันที่เป็นภาษาไทย
function formatThaiDate(date) {
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const d = new Date(date);
  const day = d.getDate();
  const month = thaiMonths[d.getMonth()];
  const year = d.getFullYear() + 543; // แปลงเป็น พ.ศ.
  
  return `${day} ${month} ${year}`;
}