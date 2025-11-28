# 🛡️ คู่มือการใช้ Rate Limiting

## วิธีติดตั้ง (3 ขั้นตอน)

### 1. สร้างไฟล์ `RateLimiter.js`
ใส่โค้ด Class RateLimiter ที่ผมเตรียมไว้ให้

### 2. แก้ไขฟังก์ชันหลัก
เพิ่ม Rate Limit เข้าไปในฟังก์ชันที่ต้องการป้องกัน

#### ตัวอย่างที่ 1: ป้องกัน Gemini API Abuse

**ไฟล์: `AI_Bot.gs.js`**

```javascript
// ก่อนแก้ไข
function callGeminiAPI(prompt) {
  let apiKey = GEMINI_API_KEY;
  if (!apiKey) { Logger.log("❌ กรุณาใส่ API Key"); return; }
  // ... ส่วนที่เหลือ ...
}

// หลังแก้ไข
function callGeminiAPI(prompt) {
  // 🛡️ เพิ่ม Rate Limit: 10 ครั้ง/ชั่วโมง
  const limiter = new RateLimiter(10, 3600);
  const userId = Session.getActiveUser().getEmail() || 'anonymous';
  
  if (!limiter.isAllowed(userId, 'gemini_api')) {
    const remaining = limiter.getRemainingRequests(userId, 'gemini_api');
    Logger.log(`⏱️ Rate limit exceeded. Remaining: ${remaining}`);
    throw new Error('คุณใช้ AI วิเคราะห์เกินกำหนดแล้ว กรุณารอ 1 ชั่วโมง');
  }
  
  let apiKey = GEMINI_API_KEY;
  if (!apiKey) { Logger.log("❌ กรุณาใส่ API Key"); return; }
  // ... ส่วนที่เหลือ ...
}
```

#### ตัวอย่างที่ 2: ป้องกัน Save Data Abuse

**ไฟล์: `รหัส.js`**

```javascript
// ก่อนแก้ไข
function saveData(payload) {
  Logger.log("Server: saveData called with payload: " + JSON.stringify(payload));
  try {
    // ... โค้ดบันทึกข้อมูล ...
  }
}

// หลังแก้ไข
function saveData(payload) {
  // 🛡️ เพิ่ม Rate Limit: 30 ครั้ง/วัน
  const limiter = new RateLimiter(30, 86400);
  const userId = Session.getActiveUser().getEmail() || 'anonymous';
  
  if (!limiter.isAllowed(userId, 'save_data')) {
    Logger.log(`⏱️ User ${userId} exceeded save data rate limit`);
    return { error: 'คุณบันทึกข้อมูลเกินกำหนดแล้ว กรุณารอ 24 ชั่วโมง' };
  }
  
  Logger.log("Server: saveData called with payload: " + JSON.stringify(payload));
  try {
    // ... โค้ดบันทึกข้อมูล ...
  }
}
```

### 3. Deploy ใหม่
```bash
clasp push
```

---

## ⚙️ ปรับแต่ง Rate Limit

### อัตรา (Rates) ที่แนะนำ

| ฟังก์ชัน | Max Requests | Window | เหตุผล |
|---------|--------------|--------|--------|
| **Gemini API** | 10 | 1 ชั่วโมง | API มี quota จำกัด |
| **Save Data** | 30 | 1 วัน | ป้องกันการส่งซ้ำ |
| **Load Data** | 100 | 1 นาที | Query ใช้ทรัพยากรน้อย |
| **Feedback** | 5 | 1 วัน | ป้องกัน spam |

### ตัวอย่างการปรับแต่ง

```javascript
// เข้มงวดมาก (AI Premium)
const limiter = new RateLimiter(5, 3600); // 5 ครั้ง/ชั่วโมง

// ปานกลาง (General API)
const limiter = new RateLimiter(60, 60); // 60 ครั้ง/นาที

// หลวมมาก (Internal Tool)
const limiter = new RateLimiter(1000, 60); // 1000 ครั้ง/นาที
```

---

## 🚨 Error Handling

### แสดง Error แบบ User-friendly

```javascript
function handleRateLimitError() {
  try {
    callGeminiAPIWithRateLimit(prompt);
  } catch (e) {
    if (e.message.includes('Rate limit')) {
      // แสดงข้อความที่สุภาพ
      return { 
        error: true,
        message: '⏱️ คุณใช้งานเกินกำหนด กรุณารอสักครู่',
        retryAfter: 3600 // วินาที
      };
    }
    throw e; // Error อื่น ๆ
  }
}
```

---

## 📊 Monitoring

### ดูสถิติการใช้งาน

```javascript
function viewSystemStats() {
  const users = ['user1@example.com', 'user2@example.com'];
  
  users.forEach(email => {
    const limiter = new RateLimiter(10, 3600);
    const remaining = limiter.getRemainingRequests(email, 'gemini_api');
    Logger.log(`${email}: ${remaining} ครั้งเหลือ`);
  });
}
```

---

## 🎯 Advanced: Multi-tier Rate Limiting

สำหรับระบบที่มี User หลาย level (Free/Pro/Admin)

```javascript
function getRateLimitForUser(userId) {
  // ดึงข้อมูล User tier จาก Sheet หรือ Database
  const userTier = getUserTier(userId); // 'free', 'pro', 'admin'
  
  const limits = {
    'free': { maxRequests: 5, window: 3600 },
    'pro': { maxRequests: 50, window: 3600 },
    'admin': { maxRequests: 1000, window: 3600 }
  };
  
  const config = limits[userTier] || limits['free'];
  return new RateLimiter(config.maxRequests, config.window);
}

function callAPIWithTieredLimit(prompt) {
  const userId = Session.getActiveUser().getEmail();
  const limiter = getRateLimitForUser(userId);
  
  if (!limiter.isAllowed(userId, 'gemini_api')) {
    throw new Error('เกินกำหนด กรุณา upgrade เป็น Pro');
  }
  
  // ... เรียก API ...
}
```

---

## ✅ Checklist

- [ ] สร้างไฟล์ `RateLimiter.js`
- [ ] เพิ่ม Rate Limit ใน `callGeminiAPI()`
- [ ] เพิ่ม Rate Limit ใน `saveData()`
- [ ] ทดสอบโดยเรียก API หลายครั้งติด ๆ กัน
- [ ] Deploy ด้วย `clasp push`
- [ ] ตั้ง Monitoring (optional)

---

## 🔗 Alternative: Properties Service

ถ้าต้องการ Persistent Tracking (ไม่หายแม้ restart)

```javascript
class PersistentRateLimiter {
  constructor(maxRequests, windowSeconds) {
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
    this.props = PropertiesService.getScriptProperties();
  }
  
  isAllowed(userId, action = 'default') {
    const key = `ratelimit_${action}_${userId}`;
    const data = this.props.getProperty(key);
    
    if (!data) {
      const timestamp = Date.now();
      this.props.setProperty(key, JSON.stringify({
        count: 1,
        startTime: timestamp
      }));
      return true;
    }
    
    const parsed = JSON.parse(data);
    const now = Date.now();
    const elapsed = (now - parsed.startTime) / 1000;
    
    // หมดเวลา window แล้ว → reset
    if (elapsed > this.windowSeconds) {
      this.props.setProperty(key, JSON.stringify({
        count: 1,
        startTime: now
      }));
      return true;
    }
    
    // เกินกำหนด
    if (parsed.count >= this.maxRequests) {
      return false;
    }
    
    // เพิ่ม count
    parsed.count++;
    this.props.setProperty(key, JSON.stringify(parsed));
    return true;
  }
}
```

---

## 📚 สรุป

**ข้อดี:**
- ✅ ป้องกัน API abuse
- ✅ ประหยัด quota
- ✅ ป้องกัน spam/bot attacks

**ง่าย/ยาก:**
- 🟢 **ง่ายมาก** ไม่เกิน 10 บรรทัดต่อฟังก์ชัน
- 🟢 ใช้ Cache Service ไม่ต้องจัดการ cleanup
- 🟢 Deploy ง่าย: `clasp push`

**เวลาในการติดตั้ง:**
- ⏱️ 10-15 นาที (ทั้งหมด)
