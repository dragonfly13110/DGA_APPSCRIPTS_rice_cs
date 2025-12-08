// ============================================
// 🤖 PROJECT: SMART RICE GUARDIAN (ระบบเตือนภัยข้าวอัจฉริยะ)
// Model: Gemini 2.5 Flash + Google Search + Hybrid Calculation
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

  // 2. ดึงข้อมูลสรุปแบบละเอียด (แทนที่ Raw Data เพื่อลดขนาด Context)
  const aggregatedData = getAggregatedRiceData();

  // 3. วิเคราะห์พื้นที่เสี่ยงที่ต้องดูแล
  const criticalRiskAreas = getCriticalRiskAreas();

  // 4. ดึงพยากรณ์อากาศ
  const weatherData = getDistrictWeather();

  // 5. สร้าง Prompt (ใช้ข้อมูลสรุปแทนข้อมูลดิบ)
  const prompt = `
    คุณคือ "AI Smart Farmer" ของจังหวัดฉะเชิงเทรา ใช้คำพูดภาษาไทย ที่เข้าใจง่าย 
    
    [คำสั่งพิเศษ: 🌐 Google Search]
    ค้นหาข้อมูลล่าสุดเดี๋ยวนี้เกี่ยวกับ:
    1. "พยากรณ์อากาศ 7 วัน ฉะเชิงเทรา"
    2. "ประกาศเตือนภัย กรมอุตุนิยมวิทยา ภาคตะวันออก"
    
    ---------------------------------------------------
    [ส่วนที่ 1: สถิติอย่างเป็นทางการ (Official Stats)]
    (ใช้ตัวเลขนี้ในการสรุปภาพรวม ห้ามคำนวณใหม่เอง)
    ${officialStats}
    ---------------------------------------------------
    [ส่วนที่ 2: สรุปข้อมูลการเพาะปลูกแบบละเอียด]
    ข้อมูลต่อไปนี้เป็นข้อมูลสรุปแบบละเอียด แยกตาม:
    - อำเภอ (พื้นที่, พันธุ์หลัก, ความคืบหน้าการเก็บเกี่ยว)
    - พันธุ์ข้าว (พื้นที่รวม, ผลผลิตเฉลี่ย)
    - เดือนเก็บเกี่ยว (แผนการเก็บเกี่ยว)
    - ระยะการเติบโต (กล้า, แตกกอ, ออกดอก, สุกแก่)
    ${aggregatedData}
    ---------------------------------------------------
    [ส่วนที่ 3: พื้นที่เสี่ยงที่ต้องเฝ้าระวัง]
    ข้อมูลพื้นที่เสี่ยงที่ยังปลูกอยู่ (ตัดข้าวที่เก็บเกี่ยวแล้วออก)
    มีการวิเคราะห์ Cross-check กับข้อมูลความเสี่ยง (น้ำท่วม, แล้ง, โรค/แมลง)
    และกรองตามฤดูกาล
    ${criticalRiskAreas}
    ---------------------------------------------------
    [ส่วนที่ 4: พยากรณ์อากาศ 7 วัน (Live API)]
    ${weatherData}
    ---------------------------------------------------
    
    [ภารกิจ]
    วิเคราะห์ข้อมูล Big Data ทั้งหมด และเขียน "รายงานสถานการณ์และเตือนภัยประจำวัน"
    **รูปแบบการตอบ:** เขียนเป็น Text/Markdown ปกติ ใช้อิโมจิประกอบหัวข้อ ให้กระชับ เป้าหมายหลักคือให้เจ้าหน้าที่และผู้บริหารได้อ่าน 
    
    **โครงสร้างรายงาน:**
    
    📊 **สรุปภาพรวมทั้งจังหวัด:**
    - รายงานยอดปลูกสะสม, เก็บเกี่ยวแล้ว, และคงเหลือในนา (อ้างอิงจากส่วนที่ 1)
    - วิเคราะห์ความคืบหน้าภาพรวม แยกตามพันธุ์ข้าวหลักๆ ว่าเก็บเกี่ยวไปแล้วกี่%
    
    🌾 **ข้าวที่ยังไม่เก็บเกี่ยว (สำคัญ! ดูจากส่วนที่ 2 หัวข้อสุดท้าย):**
    - ส่วนที่ 2 มีข้อมูล "ข้าวที่ยังไม่เก็บเกี่ยว - รายละเอียดตามอำเภอและพันธุ์" แบบละเอียดแล้ว
    - สรุปเป็น bullet points กระชับ โดยระบุ:
      → ข้าวพันธุ์อะไร ยังเหลือกี่ไร่ อยู่อำเภอไหนบ้าง
      → ระยะการเติบโต (กล้า/แตกกอ/ออกดอก/สุกแก่/พร้อมเก็บเกี่ยว) แต่ละพันธุ์
    - ตัวอย่าง:
      "• ข้าวหอมมะลิ 12,069 ไร่:
         - อ.ราชสาส์น 8,500 ไร่ (ออกดอก 60%, สุกแก่ 40%)
         - อ.พนมสารคาม 2,800 ไร่ (สุกแก่ 100%)"
    - ถ้ายาวให้ทำเป็น bullet point แยกชัดเจน
       
    ⛈️ **พื้นที่เสี่ยงภัยเร่งด่วน:**
    - ดูจากส่วนที่ 3 ที่มีการวิเคราะห์ความเสี่ยงตามฤดูกาลแล้ว
    - ถ้าไม่มี ให้ระบุว่า "ไม่พบพื้นที่เสี่ยงในขณะนี้" (ไม่ต้องอธิบายยาว)
       
    🚜 **แผนการเก็บเกี่ยว:**
    - สรุปแผนการเก็บเกี่ยวเดือนนี้และเดือนถัดไป (ดูจากส่วนที่ 2 "แผนการเก็บเกี่ยวรายเดือน")
    - อำเภอไหนมีข้าวพร้อมเก็บเกี่ยวมากที่สุด ต้องเร่งรัด
       
    🌤️ **สภาพอากาศและคำแนะนำ (กระชับ):**
    - สรุปสภาพอากาศ 7 วันข้างหน้า ไม่เกิน 3-4 ประโยค
    - เน้นเฉพาะสิ่งที่กระทบกับการเกษตร (ฝน, ลมแรง, อุณหภูมิต่ำ)
    - คำแนะนำสั้นๆ 2-3 ข้อ เช่น เฝ้าระวังฝน, ระวังลมแรง, ป้องกันอัคคีภัย

    💡 **ข้อแนะนำถึงเจ้าหน้าที่:**
    - ระบุพื้นที่เป้าหมายที่ต้องลงไปตรวจสอบ (อำเภอที่มีข้าวคงเหลือมาก ดูจากหัวข้อ "ข้าวที่ยังไม่เก็บเกี่ยว")
    - ให้คำแนะนำเจาะจง เช่น ติดตามการเก็บเกี่ยว, เฝ้าระวังภัย
    
    **หมายเหตุ:** 
    - รายงานให้กระชับ ตรงประเด็น ไม่ซ้ำซาก
    - หัวข้อ "ข้าวที่ยังไม่เก็บเกี่ยว" มีข้อมูลละเอียดให้แล้วในส่วนที่ 2 ให้สรุปเป็น bullet points ที่อ่านง่าย
    - หัวข้อ "สภาพอากาศ" ต้องสั้นและเข้าใจง่าย
  `;

  callGeminiAPI(prompt);
}

// ============================================
// 🛠️ ฟังก์ชันย่อย
// ============================================

// 1. เรียก Gemini (Model: gemini-2.5-flash)
function callGeminiAPI(prompt) {
  // 🛡️ Rate Limiting (Hybrid: Global + Per-Session)
  const sessionId = 'system_auto_run';
  const rateLimitCheck = checkHybridRateLimit(sessionId, 'gemini_api', RATE_LIMITS.GEMINI_API);

  if (!rateLimitCheck.allowed) {
    Logger.log(`⏱️ AI Bot rate limit exceeded: ${rateLimitCheck.error}`);
    return;
  }

  let apiKey = GEMINI_API_KEY;
  if (!apiKey) { Logger.log("❌ กรุณาใส่ GEMINI_API_KEY ใน Script Properties"); return; }

  // 📊 วัดขนาด Prompt
  const promptLength = prompt.length;
  const estimatedTokens = Math.ceil(promptLength / 4); // ประมาณการ: ~4 chars = 1 token
  Logger.log(`📝 Prompt Size: ${promptLength.toLocaleString()} characters (~${estimatedTokens.toLocaleString()} tokens)`);

  // ✅ ใช้ Gemini 2.5 Flash + Google Search
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    "contents": [{ "parts": [{ "text": prompt }] }],
    // 👇 ใช้ Google Search เพื่อค้นหาข้อมูลล่าสุด
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
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log(`📡 Gemini API Response Code: ${responseCode}`);

    if (responseCode !== 200) {
      Logger.log(`❌ API Error (HTTP ${responseCode}): ${responseText.substring(0, 500)}`);
      return;
    }

    const json = JSON.parse(responseText);

    // 📊 ดึงข้อมูล Token Usage จาก API Response
    if (json.usageMetadata) {
      const usage = json.usageMetadata;
      Logger.log(`📊 Token Usage:`);
      Logger.log(`   - Input Tokens: ${(usage.promptTokenCount || 0).toLocaleString()}`);
      Logger.log(`   - Output Tokens: ${(usage.candidatesTokenCount || 0).toLocaleString()}`);
      Logger.log(`   - Total Tokens: ${(usage.totalTokenCount || 0).toLocaleString()}`);

      // คำนวณความแม่นยำของการประมาณการ
      if (usage.promptTokenCount) {
        const accuracy = ((estimatedTokens / usage.promptTokenCount) * 100).toFixed(1);
        Logger.log(`   - Estimation Accuracy: ${accuracy}% (estimated ${estimatedTokens} vs actual ${usage.promptTokenCount})`);
      }
    }

    // ดึง Text คำตอบ
    let text = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      const responseLength = text.length;
      Logger.log(`📄 Response Size: ${responseLength.toLocaleString()} characters`);
      saveToSheet(text);
      Logger.log("✅ Gemini 2.5 Flash วิเคราะห์เสร็จสิ้น!");
    } else {
      Logger.log("⚠️ AI ไม่ตอบกลับ: " + JSON.stringify(json));
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

// 2.5. สรุปข้อมูลการเพาะปลูกแบบละเอียด (Aggregated Data)
function getAggregatedRiceData() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName("DGA_rice_Cha_2568/69");
  if (!sheet) return "ไม่มีข้อมูล";

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Data structures สำหรับสรุป
  const districtSummary = {};
  const varietySummary = {};
  const harvestMonthSummary = {};
  const growthStageSummary = {
    "กล้า (0-30 วัน)": { area: 0, count: 0 },
    "แตกกอ (31-60 วัน)": { area: 0, count: 0 },
    "ออกดอก (61-90 วัน)": { area: 0, count: 0 },
    "สุกแก่ (91-120 วัน)": { area: 0, count: 0 },
    "พร้อมเก็บเกี่ยว (>120 วัน)": { area: 0, count: 0 },
    "เก็บเกี่ยวแล้ว": { area: 0, count: 0 }
  };
  const irrigationSummary = { "ชลประทาน": 0, "นอกเขตชลประทาน": 0 };

  const today = new Date();

  // วนลูปประมวลผลข้อมูล
  for (let i = 1; i < data.length; i++) {
    const reportDate = data[i][1];  // วันที่รายงาน
    const district = data[i][2];     // อำเภอ
    const subdistrict = data[i][3];  // ตำบล
    const variety = data[i][4];      // พันธุ์ข้าว
    const area = parseFloat(data[i][5]) || 0;  // พื้นที่ (ไร่)
    const yieldPerRai = parseFloat(data[i][6]) || 0;  // ผลผลิต/ไร่
    const irrigation = data[i][7];   // เขตชลประทาน
    const harvestMonth = data[i][8]; // เดือนเก็บเกี่ยว
    const production = parseFloat(data[i][9]) || 0;  // ผลผลิตรวม
    const status = data[i][11];      // สถานะ

    if (!district || area === 0) continue;

    // === 1. สรุปตามอำเภอ ===
    if (!districtSummary[district]) {
      districtSummary[district] = {
        totalArea: 0,
        harvestedArea: 0,
        varieties: {},
        irrigation: { "ชลประทาน": 0, "นอกเขตชลประทาน": 0 },
        expectedProduction: 0,
        actualProduction: 0
      };
    }

    districtSummary[district].totalArea += area;
    districtSummary[district].expectedProduction += production;

    if (status === "เก็บเกี่ยวแล้ว" || status === "✅ เก็บเกี่ยวแล้ว") {
      districtSummary[district].harvestedArea += area;
      districtSummary[district].actualProduction += production;
    }

    // นับพันธุ์ในอำเภอ
    if (!districtSummary[district].varieties[variety]) {
      districtSummary[district].varieties[variety] = 0;
    }
    districtSummary[district].varieties[variety] += area;

    // ระบบชลประทาน
    const irrigationType = (irrigation === "ใช่" || irrigation === "✅") ? "ชลประทาน" : "นอกเขตชลประทาน";
    districtSummary[district].irrigation[irrigationType] += area;

    // === 2. สรุปตามพันธุ์ ===
    if (!varietySummary[variety]) {
      varietySummary[variety] = {
        totalArea: 0,
        harvestedArea: 0,
        avgYield: 0,
        yieldSum: 0,
        count: 0,
        districts: new Set()
      };
    }

    varietySummary[variety].totalArea += area;
    varietySummary[variety].yieldSum += yieldPerRai * area;
    varietySummary[variety].count++;
    varietySummary[variety].districts.add(district);

    if (status === "เก็บเกี่ยวแล้ว" || status === "✅ เก็บเกี่ยวแล้ว") {
      varietySummary[variety].harvestedArea += area;
    }

    // === 3. สรุปตามเดือนเก็บเกี่ยว ===
    if (harvestMonth) {
      if (!harvestMonthSummary[harvestMonth]) {
        harvestMonthSummary[harvestMonth] = { area: 0, varieties: {} };
      }
      harvestMonthSummary[harvestMonth].area += area;

      if (!harvestMonthSummary[harvestMonth].varieties[variety]) {
        harvestMonthSummary[harvestMonth].varieties[variety] = 0;
      }
      harvestMonthSummary[harvestMonth].varieties[variety] += area;
    }

    // === 4. สรุปตามระยะการเติบโต ===
    if (status === "เก็บเกี่ยวแล้ว" || status === "✅ เก็บเกี่ยวแล้ว") {
      growthStageSummary["เก็บเกี่ยวแล้ว"].area += area;
      growthStageSummary["เก็บเกี่ยวแล้ว"].count++;
    } else if (reportDate instanceof Date) {
      const daysOld = Math.floor((today - reportDate) / (1000 * 60 * 60 * 24));

      let stage = "พร้อมเก็บเกี่ยว (>120 วัน)";
      if (daysOld <= 30) stage = "กล้า (0-30 วัน)";
      else if (daysOld <= 60) stage = "แตกกอ (31-60 วัน)";
      else if (daysOld <= 90) stage = "ออกดอก (61-90 วัน)";
      else if (daysOld <= 120) stage = "สุกแก่ (91-120 วัน)";

      growthStageSummary[stage].area += area;
      growthStageSummary[stage].count++;
    }

    // === 5. สรุประบบชลประทาน ===
    irrigationSummary[irrigationType] += area;
  }

  // === สร้างรายงานสรุป ===
  let report = "";

  // 1. สรุปตามอำเภอ
  report += "\n📍 **สรุปรายอำเภอ:**\n";
  const sortedDistricts = Object.entries(districtSummary).sort((a, b) => b[1].totalArea - a[1].totalArea);

  for (const [district, data] of sortedDistricts) {
    const harvestPercent = (data.totalArea > 0) ? ((data.harvestedArea / data.totalArea) * 100).toFixed(1) : 0;
    const remainingArea = data.totalArea - data.harvestedArea;

    // หาพันธุ์หลัก (top 3)
    const topVarieties = Object.entries(data.varieties)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([v, a]) => {
        const percent = ((a / data.totalArea) * 100).toFixed(0);
        return `${v} ${percent}%`;
      })
      .join(", ");

    const irrigationPercent = ((data.irrigation["ชลประทาน"] / data.totalArea) * 100).toFixed(0);

    report += `- **อ.${district}**: ${data.totalArea.toLocaleString()} ไร่ | `;
    report += `เก็บเกี่ยว ${harvestPercent}% (${data.harvestedArea.toLocaleString()} ไร่) | `;
    report += `คงเหลือ ${remainingArea.toLocaleString()} ไร่\n`;
    report += `  พันธุ์หลัก: ${topVarieties} | ชลประทาน ${irrigationPercent}%\n`;
  }

  // 2. สรุปตามพันธุ์
  report += "\n🌾 **สรุปรายพันธุ์:**\n";
  const sortedVarieties = Object.entries(varietySummary).sort((a, b) => b[1].totalArea - a[1].totalArea);

  for (const [variety, data] of sortedVarieties) {
    const harvestPercent = (data.totalArea > 0) ? ((data.harvestedArea / data.totalArea) * 100).toFixed(1) : 0;
    const avgYield = (data.totalArea > 0) ? (data.yieldSum / data.totalArea).toFixed(0) : 0;
    const districtCount = data.districts.size;

    report += `- **${variety}**: ${data.totalArea.toLocaleString()} ไร่ | `;
    report += `เก็บเกี่ยว ${harvestPercent}% | `;
    report += `ผลผลิตเฉลี่ย ${avgYield} กก./ไร่ | `;
    report += `ปลูกใน ${districtCount} อำเภอ\n`;
  }

  // 3. สรุปตามเดือนเก็บเกี่ยว
  report += "\n📅 **แผนการเก็บเกี่ยวรายเดือน:**\n";
  const monthOrder = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const sortedMonths = monthOrder.filter(m => harvestMonthSummary[m]);

  for (const month of sortedMonths) {
    const data = harvestMonthSummary[month];
    const topVariety = Object.entries(data.varieties).sort((a, b) => b[1] - a[1])[0];

    report += `- **${month}**: ${data.area.toLocaleString()} ไร่`;
    if (topVariety) {
      report += ` (หลัก: ${topVariety[0]} ${topVariety[1].toLocaleString()} ไร่)`;
    }
    report += "\n";
  }

  // 4. สรุปตามระยะการเติบโต
  report += "\n🌱 **สรุปตามระยะการเติบโต:**\n";
  for (const [stage, data] of Object.entries(growthStageSummary)) {
    if (data.area > 0) {
      report += `- **${stage}**: ${data.area.toLocaleString()} ไร่ (${data.count} แปลง)\n`;
    }
  }

  // 5. สรุประบบชลประทาน
  const totalArea = irrigationSummary["ชลประทาน"] + irrigationSummary["นอกเขตชลประทาน"];
  const irrigationPercent = totalArea > 0 ? ((irrigationSummary["ชลประทาน"] / totalArea) * 100).toFixed(1) : 0;

  report += "\n💧 **ระบบชลประทาน:**\n";
  report += `- ในเขตชลประทาน: ${irrigationSummary["ชลประทาน"].toLocaleString()} ไร่ (${irrigationPercent}%)\n`;
  report += `- นอกเขตชลประทาน: ${irrigationSummary["นอกเขตชลประทาน"].toLocaleString()} ไร่\n`;

  // === 6. ข้าวที่ยังไม่เก็บเกี่ยว (แยกตามอำเภอและพันธุ์) ===
  report += "\n🌾 **ข้าวที่ยังไม่เก็บเกี่ยว - รายละเอียดตามอำเภอและพันธุ์:**\n";

  // สร้าง cross-reference data
  const remainingCrops = {};

  for (let i = 1; i < data.length; i++) {
    const reportDate = data[i][1];
    const district = data[i][2];
    const variety = data[i][4];
    const area = parseFloat(data[i][5]) || 0;
    const status = data[i][11];

    if (!district || area === 0) continue;

    // เฉพาะข้าวที่ยังไม่เก็บเกี่ยว
    if (status === "เก็บเกี่ยวแล้ว" || status === "✅ เก็บเกี่ยวแล้ว") continue;

    const key = `${district}|${variety}`;

    if (!remainingCrops[key]) {
      remainingCrops[key] = {
        district,
        variety,
        totalArea: 0,
        stages: {
          "กล้า": 0,
          "แตกกอ": 0,
          "ออกดอก": 0,
          "สุกแก่": 0,
          "พร้อมเก็บเกี่ยว": 0
        }
      };
    }

    remainingCrops[key].totalArea += area;

    // คำนวณระยะการเติบโต
    if (reportDate instanceof Date) {
      const daysOld = Math.floor((today - reportDate) / (1000 * 60 * 60 * 24));

      let stage = "พร้อมเก็บเกี่ยว";
      if (daysOld <= 30) stage = "กล้า";
      else if (daysOld <= 60) stage = "แตกกอ";
      else if (daysOld <= 90) stage = "ออกดอก";
      else if (daysOld <= 120) stage = "สุกแก่";

      remainingCrops[key].stages[stage] += area;
    }
  }

  // จัดกลุ่มตามอำเภอ
  const byDistrict = {};
  for (const [key, crop] of Object.entries(remainingCrops)) {
    if (!byDistrict[crop.district]) {
      byDistrict[crop.district] = [];
    }
    byDistrict[crop.district].push(crop);
  }

  // เรียงตามพื้นที่มากสุด
  const sortedDistricts2 = Object.entries(byDistrict).sort((a, b) => {
    const aTotal = a[1].reduce((sum, c) => sum + c.totalArea, 0);
    const bTotal = b[1].reduce((sum, c) => sum + c.totalArea, 0);
    return bTotal - aTotal;
  });

  if (sortedDistricts2.length === 0) {
    report += "- ✅ ไม่มีข้าวคงเหลือในนา (เก็บเกี่ยวครบทั้งจังหวัด)\n";
  } else {
    for (const [district, crops] of sortedDistricts2) {
      const districtTotal = crops.reduce((sum, c) => sum + c.totalArea, 0);
      report += `\n**อ.${district}** (รวม ${districtTotal.toLocaleString()} ไร่):\n`;

      // เรียงพันธุ์ตามพื้นที่มากสุด
      crops.sort((a, b) => b.totalArea - a.totalArea);

      for (const crop of crops) {
        report += `  - **${crop.variety}**: ${crop.totalArea.toLocaleString()} ไร่\n`;

        // แสดงระยะการเติบโต
        const stageDetails = [];
        for (const [stage, stageArea] of Object.entries(crop.stages)) {
          if (stageArea > 0) {
            const percent = ((stageArea / crop.totalArea) * 100).toFixed(0);
            stageDetails.push(`${stage} ${stageArea.toLocaleString()} ไร่ (${percent}%)`);
          }
        }
        if (stageDetails.length > 0) {
          report += `    → ${stageDetails.join(", ")}\n`;
        }
      }
    }
  }

  return report;
}

// 2.6. วิเคราะห์พื้นที่เสี่ยงที่ต้องดูแล (Critical Risk Areas)
function getCriticalRiskAreas() {
  const ss = SpreadsheetApp.openById(SS_ID);

  // ดึงข้อมูลการปลูก
  const riceSheet = ss.getSheetByName("DGA_rice_Cha_2568/69");
  // ดึงข้อมูลความเสี่ยง
  const riskSheet = ss.getSheetByName("ตำบล");

  if (!riceSheet || !riskSheet) return "ไม่มีข้อมูลความเสี่ยง";

  const riceData = riceSheet.getDataRange().getValues();
  const riskData = riskSheet.getDataRange().getValues();

  // สร้าง Map ของข้อมูลความเสี่ยงรายตำบล
  const riskMap = {};
  for (let i = 1; i < riskData.length; i++) {
    const district = riskData[i][0];      // อำเภอ
    const subdistrict = riskData[i][1];   // ตำบล
    const floodRisk = riskData[i][2];     // ความเสี่ยงน้ำท่วม
    const droughtRisk = riskData[i][3];   // ความเสี่ยงแล้ง
    const pestRisk = riskData[i][4];      // ความเสี่ยงโรคและแมลง

    const key = `${district}|${subdistrict}`;
    riskMap[key] = { district, subdistrict, floodRisk, droughtRisk, pestRisk };
  }

  // วิเคราะห์พื้นที่เสี่ยงที่ยังปลูกอยู่
  const criticalAreas = [];
  const subdistrictData = {};

  for (let i = 1; i < riceData.length; i++) {
    const district = riceData[i][2];
    const subdistrict = riceData[i][3];
    const variety = riceData[i][4];
    const area = parseFloat(riceData[i][5]) || 0;
    const harvestMonth = riceData[i][8];
    const status = riceData[i][11];
    const reportDate = riceData[i][1];

    // ข้ามข้าวที่เก็บเกี่ยวแล้ว
    if (status === "เก็บเกี่ยวแล้ว" || status === "✅ เก็บเกี่ยวแล้ว") continue;

    const key = `${district}|${subdistrict}`;
    const riskInfo = riskMap[key];

    if (!riskInfo) continue;

    // สะสมข้อมูลรายตำบล
    if (!subdistrictData[key]) {
      subdistrictData[key] = {
        ...riskInfo,
        totalArea: 0,
        varieties: {},
        harvestMonths: {},
        oldestPlantDate: null,
        newestPlantDate: null
      };
    }

    subdistrictData[key].totalArea += area;
    subdistrictData[key].varieties[variety] = (subdistrictData[key].varieties[variety] || 0) + area;
    subdistrictData[key].harvestMonths[harvestMonth] = (subdistrictData[key].harvestMonths[harvestMonth] || 0) + area;

    // ติดตามวันที่ปลูก
    if (reportDate instanceof Date) {
      if (!subdistrictData[key].oldestPlantDate || reportDate < subdistrictData[key].oldestPlantDate) {
        subdistrictData[key].oldestPlantDate = reportDate;
      }
      if (!subdistrictData[key].newestPlantDate || reportDate > subdistrictData[key].newestPlantDate) {
        subdistrictData[key].newestPlantDate = reportDate;
      }
    }
  }

  // กรองเฉพาะพื้นที่ที่มีความเสี่ยงสูง/กลาง
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11

  for (const [key, data] of Object.entries(subdistrictData)) {
    const risks = [];
    let riskScore = 0;

    // ประเมินความเสี่ยงน้ำท่วม (เช็คตามฤดูกาล)
    // ฤดูฝน: พ.ค. - ต.ค. (เดือน 4-9)
    if (currentMonth >= 4 && currentMonth <= 9) {
      if (data.floodRisk === "สูง") {
        risks.push("⛈️ เสี่ยงน้ำท่วมสูง");
        riskScore += 3;
      } else if (data.floodRisk === "กลาง") {
        risks.push("🌧️ เสี่ยงน้ำท่วมกลาง");
        riskScore += 2;
      }
    }

    // ประเมินความเสี่ยงแล้ง (เช็คตามฤดูกาล)
    // ฤดูแล้ง: พ.ย. - เม.ย. (เดือน 10-11, 0-3)
    if (currentMonth >= 10 || currentMonth <= 3) {
      if (data.droughtRisk === "สูง") {
        risks.push("☀️ เสี่ยงแล้งสูง");
        riskScore += 3;
      } else if (data.droughtRisk === "กลาง") {
        risks.push("🌤️ เสี่ยงแล้งกลาง");
        riskScore += 2;
      }
    }

    // ประเมินความเสี่ยงโรคและแมลง
    if (data.pestRisk === "สูง") {
      risks.push("🐛 เสี่ยงโรค/แมลงสูง");
      riskScore += 3;
    } else if (data.pestRisk === "กลาง") {
      risks.push("🦟 เสี่ยงโรค/แมลงกลาง");
      riskScore += 2;
    }

    // เก็บเฉพาะพื้นที่ที่มีความเสี่ยง
    if (risks.length > 0) {
      criticalAreas.push({ ...data, risks, riskScore });
    }
  }

  // เรียงตามความเสี่ยง (สูงสุดก่อน)
  criticalAreas.sort((a, b) => b.riskScore - a.riskScore);

  // สร้างรายงาน
  let report = "\n⚠️ **พื้นที่เสี่ยงที่ต้องเฝ้าระวัง:**\n";

  if (criticalAreas.length === 0) {
    report += "- ✅ ไม่พบพื้นที่เสี่ยงในขณะนี้\n";
    return report;
  }

  // แสดงรายละเอียด top 10 พื้นที่เสี่ยง
  const topRisks = criticalAreas.slice(0, 10);

  for (const area of topRisks) {
    const topVariety = Object.entries(area.varieties).sort((a, b) => b[1] - a[1])[0];
    const topHarvestMonth = Object.entries(area.harvestMonths).sort((a, b) => b[1] - a[1])[0];

    let ageInfo = "";
    if (area.oldestPlantDate) {
      const daysOld = Math.floor((today - area.oldestPlantDate) / (1000 * 60 * 60 * 24));
      ageInfo = ` | อายุข้าวเก่าสุด ${daysOld} วัน`;
    }

    report += `- **ต.${area.subdistrict} (อ.${area.district})**: ${area.totalArea.toLocaleString()} ไร่ | `;
    report += `${area.risks.join(", ")}\n`;
    report += `  พันธุ์หลัก: ${topVariety[0]} ${topVariety[1].toLocaleString()} ไร่`;
    if (topHarvestMonth) {
      report += ` | เก็บเกี่ยว: ${topHarvestMonth[0]}`;
    }
    report += ageInfo + "\n";
  }

  // สรุปภาพรวมความเสี่ยง
  const totalRiskArea = criticalAreas.reduce((sum, area) => sum + area.totalArea, 0);
  const highRiskCount = criticalAreas.filter(a => a.riskScore >= 6).length;
  const mediumRiskCount = criticalAreas.filter(a => a.riskScore >= 3 && a.riskScore < 6).length;

  report += "\n📊 **สรุปความเสี่ยง:**\n";
  report += `- พื้นที่เสี่ยงทั้งหมด: ${totalRiskArea.toLocaleString()} ไร่ ใน ${criticalAreas.length} ตำบล\n`;
  report += `- ความเสี่ยงสูง: ${highRiskCount} ตำบล | ความเสี่ยงกลาง: ${mediumRiskCount} ตำบล\n`;

  return report;
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
    try {
      if (!timestamps[i][0]) continue;

      const timestamp = new Date(timestamps[i][0]);
      if (isNaN(timestamp.getTime())) continue;

      if (timestamp >= cutoffDate && timestamp <= now) {
        // สร้าง dateKey จาก Asia/Bangkok timezone
        const dateKey = Utilities.formatDate(timestamp, "Asia/Bangkok", "yyyy-MM-dd");

        // เก็บเฉพาะวันที่ไม่ซ้ำ (ใช้วันล่าสุดของแต่ละวัน)
        if (!seenDates.has(dateKey)) {
          seenDates.add(dateKey);

          availableDates.push({
            displayText: dateKey,  // ใช้ ISO format เลย ไม่แปลงเป็นภาษาไทย
            isoDate: dateKey,
            timestamp: timestamp.getTime()
          });

          // Debug log
          Logger.log(`Available date: ${dateKey}`);
        }
      }
    } catch (e) {
      Logger.log("Error processing timestamp in row " + (i + 2) + ": " + e.toString());
    }
  }

  // เรียงจากใหม่ไปเก่า
  availableDates.sort((a, b) => b.timestamp - a.timestamp);

  return availableDates;
}

// แปลงวันที่จาก yyyy-MM-dd เป็นภาษาไทย (ไม่ผ่าน Date object เพื่อหลีกเลี่ยง timezone issue)
function formatThaiDateFromString(dateKey) {
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  // dateKey format: "2025-11-27"
  const parts = dateKey.split("-");
  const year = parseInt(parts[0]) + 543; // แปลงเป็น พ.ศ.
  const monthIdx = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);

  return `${day} ${thaiMonths[monthIdx]} ${year}`;
}

// ดึงรายงานตามวันที่ที่เลือก
function getReportByDate(dateString) {
  Logger.log("=== getReportByDate START ===");
  Logger.log("Search for: '" + dateString + "'");
  Logger.log("Search string length: " + dateString.length);
  Logger.log("Search char codes: " + Array.from(dateString).map(c => c.charCodeAt(0)).join(','));

  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName("AI_Insight");

  if (!sheet || sheet.getLastRow() < 2) {
    return {
      time: "ไม่มีข้อมูล",
      text: "ไม่พบรายงานในวันที่เลือก"
    };
  }

  const lastRow = sheet.getLastRow();
  Logger.log("Sheet last row: " + lastRow);

  const dataRange = sheet.getRange(2, 1, lastRow - 1, 2);
  const data = dataRange.getValues();

  Logger.log("Data array length: " + data.length);

  // ทำความสะอาด dateString (trim whitespace)
  const targetDateStr = dateString.trim();

  // หารายงานล่าสุดของวันนั้น
  let foundReport = null;
  let checkedDates = [];
  let processedCount = 0;
  let skippedCount = 0;
  let formatErrorCount = 0;

  for (let i = 0; i < data.length; i++) {
    processedCount++;

    if (!data[i][0]) {
      skippedCount++;
      Logger.log(`Row ${i + 2}: Empty timestamp, skipping (skipped: ${skippedCount}/${processedCount})`);
      continue;
    }

    const timestamp = new Date(data[i][0]);
    if (isNaN(timestamp.getTime())) {
      skippedCount++;
      Logger.log(`Row ${i + 2}: Invalid timestamp, skipping (skipped: ${skippedCount}/${processedCount})`);
      continue;
    }

    // ลอง format date ด้วย Utilities.formatDate ก่อน ถ้า error ใช้วิธี manual
    let recordDateStr = null;
    try {
      recordDateStr = Utilities.formatDate(timestamp, "Asia/Bangkok", "yyyy-MM-dd").trim();
    } catch (formatError) {
      formatErrorCount++;
      Logger.log(`Row ${i + 2}: Utilities.formatDate error, using manual formatting (errors: ${formatErrorCount})`);

      // Manual formatting as fallback
      const year = timestamp.getFullYear();
      const month = String(timestamp.getMonth() + 1).padStart(2, '0');
      const day = String(timestamp.getDate()).padStart(2, '0');
      recordDateStr = `${year}-${month}-${day}`;

      Logger.log(`  Manual formatted date: ${recordDateStr}`);
    }

    if (!recordDateStr) {
      skippedCount++;
      Logger.log(`Row ${i + 2}: Could not format date, skipping`);
      continue;
    }

    checkedDates.push(recordDateStr);

    const isMatch = (recordDateStr === targetDateStr);
    const hasText = (data[i][1] && String(data[i][1]).trim().length > 0);

    // Log ALL rows for debugging
    Logger.log(`Row ${i + 2}: Date=${recordDateStr}, Match=${isMatch}, HasText=${hasText}`);

    if (isMatch) {
      Logger.log(`  *** POTENTIAL MATCH FOUND at Row ${i + 2} ***`);
      Logger.log(`  Text length: ${data[i][1] ? String(data[i][1]).length : 0}`);
      Logger.log(`  Text preview: ${String(data[i][1]).substring(0, 100)}...`);

      // เก็บรายงานล่าสุดของวันนั้น แม้ว่า text จะว่างก็ตาม
      if (!foundReport && hasText) {
        let formattedTime = null;
        try {
          formattedTime = Utilities.formatDate(timestamp, "Asia/Bangkok", "d MMMM yyyy, HH:mm น.", "th_TH");
        } catch (e) {
          // Fallback to simple format
          formattedTime = recordDateStr;
        }

        foundReport = {
          time: formattedTime,
          text: data[i][1]
        };
        Logger.log("  >>> FOUND VALID REPORT! Breaking...");
        break;
      } else if (!foundReport && !hasText) {
        Logger.log("  >>> Match found but text is empty, continuing search...");
      }
    }
  }

  Logger.log(`Loop completed: processed ${processedCount} rows, skipped ${skippedCount}, format errors ${formatErrorCount}`);
  Logger.log("All dates found in sheet: " + JSON.stringify([...new Set(checkedDates)]));

  if (!foundReport) {
    let displayDate = dateString;
    try {
      const d = new Date(dateString);
      displayDate = formatThaiDate(d);
    } catch (e) { }

    const uniqueDates = [...new Set(checkedDates)].sort();
    Logger.log("NOT FOUND!");
    Logger.log("=== getReportByDate END ===");

    return {
      time: "ไม่มีข้อมูล",
      text: "ไม่พบรายงานในวันที่ " + displayDate + " (ค้นหา: " + targetDateStr + ")\n\nวันที่ที่มีในระบบ: " + uniqueDates.join(", ")
    };
  }

  Logger.log("=== getReportByDate END ===");
  return foundReport;
}

// ฟังก์ชันช่วยแปลงวันที่เป็นภาษาไทย (Timezone Aware)
function formatThaiDate(date) {
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  // ใช้ Utilities.formatDate เพื่อให้ได้วัน/เดือน/ปี ตาม Timezone ของไทยแน่นอน
  const d = new Date(date);
  const day = parseInt(Utilities.formatDate(d, "Asia/Bangkok", "d"));
  const monthIdx = parseInt(Utilities.formatDate(d, "Asia/Bangkok", "M")) - 1;
  const year = parseInt(Utilities.formatDate(d, "Asia/Bangkok", "yyyy")) + 543;

  return `${day} ${thaiMonths[monthIdx]} ${year}`;
}