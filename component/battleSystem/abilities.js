// abilities.js — Nơi định nghĩa từng cơ chế cụ thể, extend từ Ability.
// Muốn thêm cơ chế mới (triệu hồi tay sai, lá chắn,...) thì cứ thêm 1 class
// mới ở đây theo đúng khuôn: bắt buộc có check(boss), tuỳ chọn start()/stop().

import { Ability } from './Ability.js';

    // GlitchEffect — "gây nhiễu": khi máu boss tụt xuống dưới ngưỡng (mặc định 50%),
    // màn hình trận đấu bị nhiễu sóng (CSS class .battle-overlay--glitch).

export class GlitchEffect extends Ability {
    constructor(threshold = 0.5) {
        super('Nhiễu sóng');
        this.threshold = threshold; // % máu để kích hoạt
    }

    check(boss) {
        return boss.hp <= boss.maxHp * this.threshold;
    }

    start() {
        document.getElementById('battle-overlay')?.classList.add('battle-overlay--glitch');
    }

    stop() {
        document.getElementById('battle-overlay')?.classList.remove('battle-overlay--glitch');
    }
}


    // EnrageEffect — "cuồng nộ": khi máu boss tụt xuống dưới ngưỡng (mặc định 25%),
    // boss phát sáng đỏ cảnh báo nguy hiểm hơn.

// export class EnrageEffect extends Ability {
//     constructor(threshold = 0.25) {
//         super('Cuồng nộ');
//         this.threshold = threshold;
//     }

//     check(boss) {
//         return boss.hp <= boss.maxHp * this.threshold;
//     }

//     start() {
//         document.getElementById('battle-boss-stage')?.classList.add('battle-boss-stage--enrage');
//     }

//     stop() {
//         document.getElementById('battle-boss-stage')?.classList.remove('battle-boss-stage--enrage');
//     }
// }
