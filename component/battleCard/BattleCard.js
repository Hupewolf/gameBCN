/**
 * BattleCard Component
 * Hiển thị thông tin trận đánh ngay phía trên NavButton trong footer.
 *
 * Usage:
 *   BattleCard.render('battle-card-slot', {
 *       name: 'Abnormality #3',
 *       zone: 'Khu vực dị thường',
 *       level: 25,
 *       rewards: { xp: 300, star: 150, diamond: 10 },
 *       onStart: () => { ... }  // callback khi bấm nút
 *   });
 */

export const BattleCard = {

    render(slotId, { name, zone, level, rewards, onStart }) {
        const el = document.getElementById(slotId);
        if (!el) return;

        const { xp = 0, star = 0 } = rewards ?? {};

        el.innerHTML = `
            <div class="battle-card">

                <!-- Icon cảnh báo -->
                <div class="battle-card__icon-wrap">
                    <div class="warning-icon"></div>
                </div>

                <!-- Thông tin -->
                <div class="battle-card__info">
                    <div class="battle-card__header">
                        <span class="battle-card__name">${name}</span>
                        <span class="battle-card__level">
                            Lv.${level}
                            <span class="battle-card__level-info-btn">i</span>
                        </span>
                    </div>

                    <div class="battle-card__zone">${zone}</div>

                    <div class="battle-card__rewards-row">
                        <span class="battle-card__rewards-label"><img src="../../img/icon/mdi_gift.svg"></span>
                        <span class="battle-card__reward xp-badge">XP x${xp}</span>
                        <span class="battle-card__reward">
                            <img src="../../img/icon/UCoin.svg" alt="star"> x${star}
                        </span>
                    </div>
                </div>

                <!-- Nút bắt đầu -->
                <button class="battle-card__btn" id="battle-start-btn">
                    BẮT ĐẦU<br>TRẬN ĐẤU
                </button>
            </div>
        `;

        // Gắn sự kiện nút
        const btn = el.querySelector('#battle-start-btn');
        if (btn && typeof onStart === 'function') {
            btn.addEventListener('click', onStart);
        }
    },

    /** Ẩn/hiện card */
    hide(slotId) {
        const el = document.getElementById(slotId);
        if (el) el.style.display = 'none';
    },

    show(slotId) {
        const el = document.getElementById(slotId);
        if (el) el.style.display = 'flex';
    },
};
