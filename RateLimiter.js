// ==============================================
// 🛡️ Hybrid Rate Limiter (สำหรับ Anonymous Users)
// ==============================================

/**
 * Class: RateLimiter
 * ใช้ Cache Service เพื่อจำกัดจำนวนครั้งที่เรียกใช้ function
 */
class RateLimiter {
    constructor(maxRequests, windowSeconds) {
        this.maxRequests = maxRequests;
        this.windowSeconds = windowSeconds;
        this.cache = CacheService.getScriptCache();
    }

    isAllowed(userId, action = 'default') {
        const key = `ratelimit_${action}_${userId}`;
        const cached = this.cache.get(key);

        if (!cached) {
            this.cache.put(key, '1', this.windowSeconds);
            return true;
        }

        const count = parseInt(cached);
        if (count >= this.maxRequests) return false;

        this.cache.put(key, String(count + 1), this.windowSeconds);
        return true;
    }

    getRemainingRequests(userId, action = 'default') {
        const key = `ratelimit_${action}_${userId}`;
        const cached = this.cache.get(key);
        if (!cached) return this.maxRequests;
        return Math.max(0, this.maxRequests - parseInt(cached));
    }

    reset(userId, action = 'default') {
        this.cache.remove(`ratelimit_${action}_${userId}`);
    }
}

// ==============================================
// 🎯 Hybrid Rate Limiting (2 ชั้น)
// ==============================================

/**
 * ตรวจสอบ Rate Limit แบบ Hybrid (Global + Per-Session)
 * @param {string} sessionId - Session ID จาก client
 * @param {string} action - Action name
 * @param {Object} limits - { global: {max, window}, session: {max, window} }
 * @returns {Object} { allowed: boolean, error: string }
 */
function checkHybridRateLimit(sessionId, action, limits) {
    // ชั้นที่ 1: Global Limit (ป้องกัน DDoS)
    const globalLimiter = new RateLimiter(limits.global.max, limits.global.window);
    if (!globalLimiter.isAllowed('GLOBAL', action)) {
        return {
            allowed: false,
            error: '⚠️ ระบบกำลังรับข้อมูลมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง'
        };
    }

    // ชั้นที่ 2: Per-Session Limit (ป้องกัน spam จาก user เดียว)
    const sessionLimiter = new RateLimiter(limits.session.max, limits.session.window);
    const sid = sessionId || 'anonymous';

    if (!sessionLimiter.isAllowed(sid, action)) {
        const remaining = sessionLimiter.getRemainingRequests(sid, action);
        return {
            allowed: false,
            error: `⏱️ คุณใช้งานเกินกำหนดแล้ว (${remaining} ครั้งเหลือ) กรุณารอ ${formatWaitTime(limits.session.window)}`
        };
    }

    return { allowed: true };
}

/**
 * แปลงวินาทีเป็นข้อความที่อ่านง่าย
 */
function formatWaitTime(seconds) {
    if (seconds < 60) return `${seconds} วินาที`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} นาที`;
    if (seconds < 86400) return `${Math.ceil(seconds / 3600)} ชั่วโมง`;
    return `${Math.ceil(seconds / 86400)} วัน`;
}

// ==============================================
// 🎯 Rate Limit Configs (แก้ที่นี่)
// ==============================================

const RATE_LIMITS = {
    SAVE_DATA: {
        global: { max: 200, window: 3600 },   // 200 ครั้ง/ชั่วโมง ทั้งระบบ
        session: { max: 30, window: 86400 }   // 30 ครั้ง/วัน ต่อ session
    },
    FEEDBACK: {
        global: { max: 100, window: 3600 },   // 100 ครั้ง/ชั่วโมง ทั้งระบบ
        session: { max: 5, window: 86400 }    // 5 ครั้ง/วัน ต่อ session
    },
    GEMINI_API: {
        global: { max: 50, window: 3600 },    // 50 ครั้ง/ชั่วโมง ทั้งระบบ
        session: { max: 10, window: 3600 }    // 10 ครั้ง/ชั่วโมง ต่อ session
    },
    LOAD_DATA: {
        global: { max: 500, window: 60 },     // 500 ครั้ง/นาที ทั้งระบบ
        session: { max: 50, window: 60 }      // 50 ครั้ง/นาที ต่อ session
    }
};

// ==============================================
// 📊 Admin Tools
// ==============================================

/**
 * ดูสถิติการใช้งานของ Session
 */
function checkSessionUsage(sessionId) {
    const limiter = new RateLimiter(100, 3600);

    Logger.log(`📊 สถิติของ Session: ${sessionId}`);
    Logger.log(`  - Save Data: ${limiter.getRemainingRequests(sessionId, 'save_data')} ครั้งเหลือ`);
    Logger.log(`  - Feedback: ${limiter.getRemainingRequests(sessionId, 'feedback')} ครั้งเหลือ`);
    Logger.log(`  - Gemini API: ${limiter.getRemainingRequests(sessionId, 'gemini_api')} ครั้งเหลือ`);
}

/**
 * รีเซ็ตการใช้งานของ Session (Admin only)
 */
function resetSessionLimit(sessionId) {
    const limiter = new RateLimiter(10, 3600);
    limiter.reset(sessionId, 'save_data');
    limiter.reset(sessionId, 'feedback');
    limiter.reset(sessionId, 'gemini_api');
    Logger.log(`✅ รีเซ็ต rate limit ของ session ${sessionId} แล้ว`);
}
