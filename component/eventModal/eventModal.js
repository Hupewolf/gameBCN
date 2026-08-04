const $ = (id) => document.getElementById(id);

/**
 * Dữ liệu hoạt động mẫu.
 * active: true  -> có thể tham gia (hiện màu, đẩy lên đầu danh sách)
 * active: false -> chưa mở/khoá   (hiện xám, đẩy xuống cuối danh sách, không click được)
 *
 * deadlineMs  : dùng cho item active -> đếm ngược "Thời gian còn lại"
 * requirement : dùng cho item khoá   -> điều kiện mở khoá, hiện ở badge
 * timeText    : dùng cho item khoá   -> khung giờ diễn ra hoạt động
 */
const ACTIVITIES = [
    {
        id: 'tu-luyen',
        icon: 'fa-solid fa-spa',
        title: 'Tu Luyện',
        desc: 'Nhận tiến độ khi vào offline hoặc online',
        active: true,
        deadlineMs: Date.now() + (2 * 3600 + 15 * 60 + 30) * 1000,
        onJoin: () => console.log('Tham gia: Tu Luyện'),
    },
    {
        id: 'khieu-chien-boss',
        icon: 'fa-solid fa-dragon',
        title: 'Boss tuần',
        desc: 'Khiêu chiến boss để nhận trang bị và vật phẩm phẩm hiếm',
        active: true,
        deadlineMs: Date.now() + (45 * 60 + 12) * 1000,
        onJoin: () => { window.location.href = '../bossWeek/bossWeek.html'; },
    },
    {
        id: 'tong-mon-nhiem-vu',
        icon: 'fa-solid fa-scroll',
        title: 'Tông Môn Nhiệm Vụ',
        desc: 'Hoàn thành nhiệm vụ tông môn để nhận cống hiến và phần thưởng',
        active: true,
        deadlineMs: Date.now() + (5 * 3600 + 20 * 60) * 1000,
        onJoin: () => console.log('Tham gia: Tông Môn Nhiệm Vụ'),
    },
    {
        id: 'bi-canh',
        icon: 'fa-solid fa-mountain-sun',
        title: 'Bí Cảnh',
        desc: 'Khám phá bí cảnh, vượt qua thử thách nhận vật phẩm quý hiếm',
        active: false,
        requirement: 'Cần Tu Vi đạt Luyện Khí Kỳ',
        timeText: '19:00 hằng ngày',
    },
    {
        id: 'dau-phap-dai',
        icon: 'fa-solid fa-khanda',
        title: 'Đấu Pháp Đài',
        desc: 'Thi đấu với các đạo hữu khác để tranh thứ hạng cao',
        active: false,
        requirement: 'Cần Tu Vi đạt Trúc Cơ Kỳ',
        timeText: '20:30 hằng ngày',
    },
    {
        id: 'ma-gioi-xam-luoc',
        icon: 'fa-solid fa-gopuram',
        title: 'Ma Giới Xâm Lược',
        desc: 'Liên server cùng nhau đẩy lùi ma tộc, nhận phần thưởng hào phóng',
        active: false,
        requirement: 'Cần Tu Vi đạt Kim Đan Kỳ',
        timeText: '21:00 hằng ngày',
    },
];

export const EventModal = {
    _initialized: false,
    _timers: [],

    render() {
        if ($('event-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'event-modal-overlay';
        overlay.className = 'frost-overlay event-modal-overlay';
        overlay.innerHTML = `
            <div class="event-modal" id="event-modal">
                <div class="event-modal__header">
                    <span class="event-modal__title">Hoạt Động</span>
                    <button class="event-modal__close" id="event-modal-close" aria-label="Đóng">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="event-modal__list" id="event-modal-list"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.hide();
        });
        $('event-modal-close').addEventListener('click', () => this.hide());

        this._initialized = true;
        this._renderList();
    },

    /**
     * === CƠ CHẾ TÁI SỬ DỤNG (dùng lại cho mọi list hoạt động khác) ===
     * - active -> lên đầu danh sách, có màu, click được
     * - !active -> xuống cuối danh sách, xám, không click được
     * Array.prototype.sort ổn định (stable) nên các item cùng nhóm giữ nguyên
     * thứ tự khai báo trong ACTIVITIES.
     */
    _renderList() {
        this._clearTimers();

        const list = $('event-modal-list');
        if (!list) return;

        const sorted = [...ACTIVITIES].sort((a, b) => Number(b.active) - Number(a.active));

        list.innerHTML = sorted.map((item) => this._renderCard(item)).join('');

        sorted.forEach((item) => {
            if (!item.active) return;
            const card = $(`event-card-${item.id}`);
            card?.addEventListener('click', () => this._onJoin(item));
            if (item.deadlineMs) this._startCountdown(item);
        });
    },

    _renderCard(item) {
        const stateClass = item.active ? 'is-active' : 'is-locked';

        const badge = item.active
            ? `<span class="event-card__badge event-card__badge--active">Có thể tham gia</span>`
            : `<span class="event-card__badge event-card__badge--locked"><i class="fa-solid fa-lock"></i>${item.requirement}</span>`;

        const footerLabel = item.active ? 'Thời gian còn lại' : 'Thời gian tham gia';
        const footerValue = item.active
            ? `<span class="event-card__timer" id="event-timer-${item.id}">--:--:--</span>`
            : `<span class="event-card__time">${item.timeText}</span>`;

        return `
            <div class="event-card ${stateClass}" id="event-card-${item.id}">
                <div class="event-card__icon"><i class="${item.icon}"></i></div>
                <div class="event-card__body">
                    <div class="event-card__title-row">
                        <span class="event-card__title">${item.title}</span>
                        ${badge}
                    </div>
                    <p class="event-card__desc">${item.desc}</p>
                    <div class="event-card__footer">
                        <span class="event-card__footer-label">${footerLabel}</span>
                        ${footerValue}
                    </div>
                </div>
            </div>
        `;
    },

    _startCountdown(item) {
        const el = $(`event-timer-${item.id}`);
        if (!el) return;

        const timerId = setInterval(() => {
            const remain = item.deadlineMs - Date.now();
            if (remain <= 0) {
                el.textContent = '00:00:00';
                clearInterval(timerId);
                return;
            }
            el.textContent = this._formatCountdown(remain);
        }, 1000);

        el.textContent = this._formatCountdown(item.deadlineMs - Date.now());
        this._timers.push(timerId);
    },

    _formatCountdown(ms) {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    },

    _onJoin(item) {
        // TODO: nối logic/API phần thưởng riêng cho từng hoạt động tại đây
        if (typeof item.onJoin === 'function') item.onJoin();
    },

    _clearTimers() {
        this._timers.forEach(clearInterval);
        this._timers = [];
    },

    show() {
        if (!this._initialized) this.render();
        else this._renderList();
        const overlay = $('event-modal-overlay');
        requestAnimationFrame(() => {
            overlay?.classList.add('frost-overlay--visible');
        });
    },

    hide() {
        const overlay = $('event-modal-overlay');
        overlay?.classList.remove('frost-overlay--visible');
        this._clearTimers();
    },
};
