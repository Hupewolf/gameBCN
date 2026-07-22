// ==========================================================================
// statDecay.js — Chỉ số đói/khát giảm tự động theo thời gian.
// Gọi startStatDecay() 1 lần sau khi GameHeader đã render xong.
//
// Cách phục hồi: dùng đồ ăn/uống trong túi đồ (personalItem.js đã xử lý).
// ==========================================================================

import { playerState } from '../../share/main.js';
import { updateStatBar } from './StatBar.js';

const DECAY_INTERVAL_MS = 5_000;  // 5 giây giảm 1 lần (chỉnh lại sau khi test xong)
const DECAY_AMOUNT      = 0;      // giảm bao nhiêu mỗi lần
const API_URL           = 'https://6a53c0628547b9f7111bc89e.mockapi.io/accounts/test/testManage';
const API_SYNC_EVERY    = 12;     // sync lên API mỗi 12 tick = 60 giây (tránh spam request)

let _tick = 0;

export function startStatDecay() {
    setInterval(async () => {
        _tick++;

        const savedUser = localStorage.getItem('currentUser');
        if (!savedUser) return;
        const userData = JSON.parse(savedUser);
        if (!userData.values) userData.values = { hungry: 100, thirsty: 100, stress: 0 };

        // ── Giảm đói & khát ───────────────────────────────────────────────
        const decayMap = [
            { statKey: 'hunger', apiKey: 'hungry'  },
            { statKey: 'thirst', apiKey: 'thirsty' },
        ];

        decayMap.forEach(({ statKey, apiKey }) => {
            const current = parseInt(userData.values[apiKey] ?? playerState.stats[statKey].value, 10);
            const newVal  = Math.max(0, current - DECAY_AMOUNT);

            // Cập nhật cả 3 chỗ: userData (để lưu) + playerState (object in-memory) + DOM
            userData.values[apiKey]          = newVal;
            playerState.stats[statKey].value = newVal;
            updateStatBar(statKey, newVal, playerState.stats[statKey].max);
        });

        // ── Lưu localStorage ──────────────────────────────────────────────
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // ── Đồng bộ API (không phải mỗi tick) ────────────────────────────
        if (_tick % API_SYNC_EVERY === 0 && userData.id) {
            try {
                await fetch(`${API_URL}/${userData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData),
                });
            } catch (e) {
                console.warn('[statDecay] sync API thất bại:', e);
            }
        }
    }, DECAY_INTERVAL_MS);
}
