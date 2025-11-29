// ============================================
// Global Configuration
// ============================================
const SPREADSHEET_ID = "1QyruEowKFva5n7JNiizQ-0IR3rV87ReYNPSnWXT9eac"; // Make sure this is your actual Spreadsheet ID
const SHEET_NAME = "DGA_rice_Cha_2568/69"; // Make sure this is your actual Sheet Name

const districtsData = {
  "เมืองฉะเชิงเทรา": ["หน้าเมือง", "ท่าไข่", "บ้านใหม่", "คลองนา", "บางตีนเป็ด", "บางไผ่", "คลองจุกกระเฌอ", "บางแก้ว", "บางขวัญ", "คลองนครเนื่องเขต", "วังตะเคียน", "โสธร", "บางพระ", "บางกะไห", "หนามแดง", "คลองเปรง",
    "คลองอุดมชลจร", "คลองหลวงแพ่ง", "บางเตย"],
  "บางคล้า": ["บางคล้า", "บางสวน", "บางกระเจ็ด", "ปากน้ำ", "ท่าทองหลาง", "สาวชะโงก", "เสม็ดเหนือ", "เสม็ดใต้", "หัวไทร"],
  "บางน้ำเปรี้ยว": ["บางน้ำเปรี้ยว", "บางขนาก", "สิงโตทอง", "หมอนทอง", "บึงน้ำรักษ์", "ดอนเกาะกา", "โยธะกา", "ดอนฉิมพลี", "ศาลาแดง", "โพรงอากาศ"],
  "บางปะกง": ["บางปะกง", "ท่าสะอ้าน", "บางวัว", "บางสมัคร", "บางผึ้ง", "บางเกลือ", "สองคลอง", "หนองจอก", "พิมพา", "ท่าข้าม", "หอมศีล", "เขาดิน"],
  "บ้านโพธิ์": ["บ้านโพธิ์", "เกาะไร่", "คลองขุด", "คลองบ้านโพธิ์", "คลองประเวศ", "ดอนทราย", "เทพราช", "ท่าพลับ", "หนองตีนนก", "หนองบัว", "บางซ่อน", "บางกรูด", "แหลมประดู่", "ลาดขวาง", "สนามจันทร์", "แสนภูดาษ", "สิบเอ็ดศอก"],
  "พนมสารคาม": ["เกาะขนุน", "บ้านซ่อง", "พนมสารคาม", "เมืองเก่า", "หนองยาว", "ท่าถ่าน", "หนองแหน", "เขาหินซ้อน"],
  "ราชสาส์น": ["บางคา", "เมืองใหม่", "ดงน้อย"],
  "สนามชัยเขต": ["คู้ยายหมี", "ท่ากระดาน", "ทุ่งพระยา", "ลาดกระทิง"],
  "แปลงยาว": ["แปลงยาว", "วังเย็น", "หัวสำโรง", "หนองไม้แก่น"],
  "ท่าตะเกียบ": ["ท่าตะเกียบ", "คลองตะเกรา"],
  "คลองเขื่อน": ["ก้อนแก้ว", "คลองเขื่อน", "บางเล่า", "บางโรง", "บางตลาด"]
};

const COLUMN_NAMES = {
  TIMESTAMP: "Timestamp บันทึก",
  REPORT_DATE: "วันที่รายงาน",
  DISTRICT: "อำเภอ",
  TAMBON: "ตำบล",
  RICE_VARIETY: "พันธุ์ข้าว",
  AREA_RAI: "พื้นที่เพาะปลูก (ไร่)",
  YIELD_PER_RAI_KG: "ผลผลิตต่อไร่ (กก.)",
  IRRIGATION_ZONE: "เขตชลประทาน",
  HARVEST_MONTH: "เดือนที่เก็บเกี่ยว",
  TOTAL_YIELD_TON: "ปริมาณผลผลิต (ตัน)",
  ROW_ID: "เลขอ้างอิงการบันทึก"
};

// ============================================
// Web App Router (3-in-1 Pattern)
// ============================================
function doGet(e) {
  const page = e.parameter.page || 'main';

  switch (page) {
    case 'ai':
      // 🤖 หน้า AI View (รายงานวิเคราะห์)
      return HtmlService.createTemplateFromFile('AI_View')
        .evaluate()
        .setTitle("รายงานสถานการณ์ข้าวอัจฉริยะ (AI Insight)")
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');

    case 'docs':
      // 📚 หน้าคู่มือการใช้งาน
      return HtmlService.createTemplateFromFile('Docs_View')
        .evaluate()
        .setTitle("คู่มือการใช้งาน - ระบบบันทึกข้อมูลข้าว")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');

    case 'feedback':
      // 📝 หน้าแบบประเมิน
      return HtmlService.createTemplateFromFile('Feedback_Form')
        .evaluate()
        .setTitle("แบบสอบถามความพึงพอใจ - ทีมเป็ดน้อยร้อยหน้าที่")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');

    default:
      // 🌐 หน้าบันทึกข้อมูล (Main / Default)
      return HtmlService.createTemplateFromFile('Index')
        .evaluate()
        .setTitle("ระบบบันทึกข้อมูลการเพาะปลูกข้าว จ.ฉะเชิงเทรา")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

// ============================================
// Data Initialization for Client
// ============================================
function getInitialData() {
  return {
    districts: districtsData
  };
}

// ============================================
// Load Existing Data from Sheet
// ============================================
function loadData(reportDateString, districtName) {
  Logger.log(`Server: loadData called for Date: ${reportDateString}, District: ${districtName}`);
  try {
    // --- SERVER-SIDE VALIDATION FOR DAY (15th or 25th) ---
    const targetDate = new Date(reportDateString); // Expects YYYY-MM-DD (CE)
    const dayOfMonth = targetDate.getUTCDate(); // Use getUTCDate for consistency

    if (dayOfMonth !== 15 && dayOfMonth !== 25) {
      Logger.log(`Server Error (loadData): Invalid report day. Received ${dayOfMonth}, expected 15 or 25 for date ${reportDateString}.`);
      return { error: `ข้อมูลสามารถโหลดได้เฉพาะวันที่ 15 หรือ 25 ของเดือนเท่านั้น (วันที่พยายามโหลด: ${targetDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })})` };
    }
    // --- END SERVER-SIDE VALIDATION ---

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      Logger.log(`Server Error (loadData): Sheet "${SHEET_NAME}" not found.`);
      return { error: `ไม่พบชีท "${SHEET_NAME}"` };
    }

    const allData = sheet.getDataRange().getValues();
    if (allData.length < 1) {
      Logger.log(`Server Warning (loadData): Sheet "${SHEET_NAME}" is empty or has no headers.`);
      return { success: true, data: [] };
    }
    const headers = allData[0];

    const colIdx = {};
    let allEssentialColumnsFound = true;
    const essentialKeysForLoading = ['REPORT_DATE', 'DISTRICT', 'TAMBON', 'RICE_VARIETY', 'AREA_RAI', 'YIELD_PER_RAI_KG', 'IRRIGATION_ZONE', 'HARVEST_MONTH'];

    for (const key in COLUMN_NAMES) {
      const colName = COLUMN_NAMES[key];
      const headerIndex = headers.indexOf(colName);
      colIdx[key] = headerIndex;
      if (essentialKeysForLoading.includes(key) && headerIndex === -1) {
        Logger.log(`Server Error (loadData): Essential column "${colName}" (Key: ${key}) not found in headers.`);
        allEssentialColumnsFound = false;
      }
    }

    if (!allEssentialColumnsFound) {
      return { error: `ไม่พบคอลัมน์ที่จำเป็นบางส่วนใน Google Sheet. กรุณาตรวจสอบหัวตาราง: ${essentialKeysForLoading.filter(k => colIdx[k] === -1).map(k => COLUMN_NAMES[k]).join(', ')}` };
    }

    const filteredData = [];
    // targetDate is already defined from the validation step above

    for (let rowIndex = 1; rowIndex < allData.length; rowIndex++) {
      const currentRow = allData[rowIndex];
      if (colIdx.REPORT_DATE === -1 || colIdx.DISTRICT === -1) {
        Logger.log("Server Error (loadData): REPORT_DATE or DISTRICT column index is -1.");
        continue;
      }

      let sheetDateValue = currentRow[colIdx.REPORT_DATE];
      let sheetDate;

      if (sheetDateValue instanceof Date) {
        sheetDate = sheetDateValue;
      } else if (sheetDateValue && (typeof sheetDateValue === 'string' || typeof sheetDateValue === 'number')) {
        sheetDate = new Date(sheetDateValue);
        if (isNaN(sheetDate.getTime())) {
          continue;
        }
      } else {
        continue;
      }

      const normalizedSheetDate = new Date(Date.UTC(sheetDate.getFullYear(), sheetDate.getMonth(), sheetDate.getDate()));
      const normalizedTargetDate = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));

      if (normalizedSheetDate.getTime() === normalizedTargetDate.getTime() && currentRow[colIdx.DISTRICT] === districtName) {
        if (colIdx.TAMBON === -1 || colIdx.RICE_VARIETY === -1 || colIdx.AREA_RAI === -1 ||
          colIdx.YIELD_PER_RAI_KG === -1 || colIdx.IRRIGATION_ZONE === -1 || colIdx.HARVEST_MONTH === -1) {
          Logger.log(`Server Warning (loadData): Row ${rowIndex + 1} matches date/district, but some data columns are missing index. Skipping push.`);
          continue;
        }
        filteredData.push({
          tambon: currentRow[colIdx.TAMBON],
          variety: currentRow[colIdx.RICE_VARIETY],
          area: currentRow[colIdx.AREA_RAI],
          yieldPerRai: currentRow[colIdx.YIELD_PER_RAI_KG],
          irrigation: currentRow[colIdx.IRRIGATION_ZONE],
          harvestMonth: currentRow[colIdx.HARVEST_MONTH]
        });
      }
    }
    Logger.log(`Server (loadData): Found ${filteredData.length} items for ${reportDateString}, ${districtName}.`);
    return { success: true, data: filteredData };
  } catch (e) {
    Logger.log("Server Exception (loadData): " + e.toString() + "\nStack: " + e.stack);
    return { error: "เกิดข้อผิดพลาดในการโหลดข้อมูล: " + e.message };
  }
}

// ============================================
// Save Data to Sheet
// ============================================
function saveData(payload) {
  Logger.log("Server: saveData called with payload: " + JSON.stringify(payload));

  // 🛡️ Rate Limiting (Hybrid: Global + Per-Session)
  const sessionId = payload.sessionId || 'anonymous';
  const rateLimitCheck = checkHybridRateLimit(sessionId, 'save_data', RATE_LIMITS.SAVE_DATA);

  if (!rateLimitCheck.allowed) {
    Logger.log(`⏱️ Rate limit exceeded for session ${sessionId}: ${rateLimitCheck.error}`);
    return { error: rateLimitCheck.error };
  }

  try {
    const reportDateString = payload.reportDate; // YYYY-MM-DD from client
    const districtName = payload.district;
    const entriesFromClient = payload.entries || [];

    // --- SERVER-SIDE VALIDATION FOR DAY (15th or 25th) ---
    const targetDateForSave = new Date(reportDateString); // Expects YYYY-MM-DD (CE)
    const dayOfMonth = targetDateForSave.getUTCDate(); // Use getUTCDate for consistency

    if (dayOfMonth !== 15 && dayOfMonth !== 25) {
      Logger.log(`Server Error (saveData): Invalid report day for saving. Received ${dayOfMonth}, expected 15 or 25 for date ${reportDateString}.`);
      return { error: `ข้อมูลสามารถบันทึกได้เฉพาะวันที่ 15 หรือ 25 ของเดือนเท่านั้น (วันที่พยายามบันทึก: ${targetDateForSave.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })})` };
    }
    // --- END SERVER-SIDE VALIDATION ---

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      Logger.log(`Server Error (saveData): Sheet "${SHEET_NAME}" not found.`);
      return { error: `ไม่พบชีท "${SHEET_NAME}"` };
    }

    const allSheetData = sheet.getDataRange().getValues();
    if (allSheetData.length === 0) {
      Logger.log(`Server Error (saveData): Sheet "${SHEET_NAME}" is empty and has no headers.`);
      return { error: `Sheet "${SHEET_NAME}" ไม่มีข้อมูลหัวตาราง` };
    }
    const headers = allSheetData[0];
    const reportDateColIdx = headers.indexOf(COLUMN_NAMES.REPORT_DATE);
    const districtColIdx = headers.indexOf(COLUMN_NAMES.DISTRICT);
    const rowIdColIdx = headers.indexOf(COLUMN_NAMES.ROW_ID);


    if (reportDateColIdx === -1 || districtColIdx === -1 || rowIdColIdx === -1) {
      let missingCols = [];
      if (reportDateColIdx === -1) missingCols.push(COLUMN_NAMES.REPORT_DATE);
      if (districtColIdx === -1) missingCols.push(COLUMN_NAMES.DISTRICT);
      if (rowIdColIdx === -1) missingCols.push(COLUMN_NAMES.ROW_ID);
      Logger.log(`Server Error (saveData): Column(s) "${missingCols.join(', ')}" not found for deletion/saving.`);
      return { error: `ไม่พบคอลัมน์สำคัญใน Sheet: ${missingCols.join(', ')}` };
    }

    // targetDateForDeletion renamed to targetDateForSave, already defined above
    const rowsToDeleteSheetIndices = [];

    for (let i = allSheetData.length - 1; i >= 1; i--) {
      let sheetDateValue = allSheetData[i][reportDateColIdx];
      let sheetDate;
      if (sheetDateValue instanceof Date) {
        sheetDate = sheetDateValue;
      } else if (sheetDateValue) {
        sheetDate = new Date(sheetDateValue);
      } else {
        continue;
      }
      if (isNaN(sheetDate.getTime())) continue;

      const normalizedSheetDate = new Date(Date.UTC(sheetDate.getFullYear(), sheetDate.getMonth(), sheetDate.getDate()));
      const normalizedTargetDate = new Date(Date.UTC(targetDateForSave.getFullYear(), targetDateForSave.getMonth(), targetDateForSave.getDate()));

      if (normalizedSheetDate.getTime() === normalizedTargetDate.getTime() && allSheetData[i][districtColIdx] === districtName) {
        rowsToDeleteSheetIndices.push(i + 1);
      }
    }

    if (rowsToDeleteSheetIndices.length > 0) {
      rowsToDeleteSheetIndices.sort((a, b) => b - a);
      rowsToDeleteSheetIndices.forEach(rowIndex => sheet.deleteRow(rowIndex));
      SpreadsheetApp.flush();
    }

    const rowsToAdd = [];
    const currentTimestamp = new Date();
    const reportDateForSheet = targetDateForSave; // Use the already validated Date object

    entriesFromClient.forEach(entry => {
      const variety = entry.variety;
      const area = parseFloat(entry.area) || 0;
      const yieldPerRaiKg = parseFloat(entry.yieldPerRai) || 0;

      if (variety && area > 0 && yieldPerRaiKg > 0) {
        const totalYieldKg = area * yieldPerRaiKg;
        const totalYieldTon = totalYieldKg / 1000;

        let newRow = [];
        // Build row based on header indices for safety
        newRow[headers.indexOf(COLUMN_NAMES.TIMESTAMP)] = currentTimestamp;
        newRow[headers.indexOf(COLUMN_NAMES.REPORT_DATE)] = reportDateForSheet;
        newRow[headers.indexOf(COLUMN_NAMES.DISTRICT)] = districtName;
        newRow[headers.indexOf(COLUMN_NAMES.TAMBON)] = entry.tambon;
        newRow[headers.indexOf(COLUMN_NAMES.RICE_VARIETY)] = variety;
        newRow[headers.indexOf(COLUMN_NAMES.AREA_RAI)] = area;
        newRow[headers.indexOf(COLUMN_NAMES.YIELD_PER_RAI_KG)] = yieldPerRaiKg;
        newRow[headers.indexOf(COLUMN_NAMES.IRRIGATION_ZONE)] = entry.irrigation;
        newRow[headers.indexOf(COLUMN_NAMES.HARVEST_MONTH)] = entry.harvestMonth;
        newRow[headers.indexOf(COLUMN_NAMES.TOTAL_YIELD_TON)] = totalYieldTon;
        // ROW_ID will be filled later
        rowsToAdd.push(newRow);
      }
    });

    if (rowsToAdd.length > 0) {
      const firstNewRow = sheet.getLastRow() + 1;
      const numColumns = headers.length;
      const completeRowsToAdd = rowsToAdd.map(rowArray => {
        let fullRow = new Array(numColumns).fill(null);
        rowArray.forEach((value, index) => {
          // Only assign if the index exists in the header-based array
          // This check is slightly redundant if newRow is built carefully, but safe
          if (index < numColumns && headers[index] !== undefined) fullRow[index] = value;
        });
        return fullRow;
      });

      sheet.getRange(firstNewRow, 1, completeRowsToAdd.length, numColumns).setValues(completeRowsToAdd);
      for (let i = 0; i < completeRowsToAdd.length; i++) {
        sheet.getRange(firstNewRow + i, rowIdColIdx + 1).setValue(firstNewRow + i);
      }
    }

    try {
      const lastDataRow = sheet.getLastRow();
      if (lastDataRow > 1) {
        if (headers.indexOf(COLUMN_NAMES.TIMESTAMP) > -1) sheet.getRange(2, headers.indexOf(COLUMN_NAMES.TIMESTAMP) + 1, lastDataRow - 1, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
        if (headers.indexOf(COLUMN_NAMES.REPORT_DATE) > -1) sheet.getRange(2, headers.indexOf(COLUMN_NAMES.REPORT_DATE) + 1, lastDataRow - 1, 1).setNumberFormat("yyyy-mm-dd");
        if (headers.indexOf(COLUMN_NAMES.AREA_RAI) > -1) sheet.getRange(2, headers.indexOf(COLUMN_NAMES.AREA_RAI) + 1, lastDataRow - 1, 1).setNumberFormat("#,##0.00");
        if (headers.indexOf(COLUMN_NAMES.YIELD_PER_RAI_KG) > -1) sheet.getRange(2, headers.indexOf(COLUMN_NAMES.YIELD_PER_RAI_KG) + 1, lastDataRow - 1, 1).setNumberFormat("#,##0.00");
        if (headers.indexOf(COLUMN_NAMES.TOTAL_YIELD_TON) > -1) sheet.getRange(2, headers.indexOf(COLUMN_NAMES.TOTAL_YIELD_TON) + 1, lastDataRow - 1, 1).setNumberFormat("#,##0.000");
      }
    } catch (formatError) {
      Logger.log("Server (saveData): Non-critical formatting error: " + formatError.message);
    }

    return { success: true, message: `บันทึกข้อมูลสำเร็จ (${rowsToAdd.length} รายการ)` };
  } catch (e) {
    Logger.log("Server Exception (saveData): " + e.toString() + "\nStack: " + e.stack);
    return { error: "เกิดข้อผิดพลาดรุนแรงในการบันทึกข้อมูล: " + e.message };
  }
}