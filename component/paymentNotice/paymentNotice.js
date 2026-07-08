// ==========================================================================
// PaymentNotice — Bảng thông báo đóng tiền (dùng chung: tiền nhà, phiếu phạt,...)
// Mọi nội dung đều truyền qua config, component không hardcode nội dung cụ thể.
//
// Cách dùng ở bất kỳ trang nào:
//
//   import { PaymentNotice } from '../../component/paymentNotice/paymentNotice.js';
//
//   PaymentNotice.show({
//       title: 'THÔNG BÁO ĐÓNG TIỀN NHÀ',
//       issuer: 'Đơn vị quản lý: NEXUS HOUSING CORP',
//       image: '',                       // optional, để trống thì ẩn khung ảnh
//       infoTitle: 'THÔNG TIN HOÁ ĐƠN',
//       fields: [
//           { label: 'Mã hoá đơn', value: 'NH-2045-0091' },
//           { label: 'Kỳ thanh toán', value: 'Tháng 06/2045' },
//       ],
//       amountTitle: 'SỐ TIỀN CẦN ĐÓNG',
//       amount: '1.200.000 đ',
//       deadlineLabel: 'Hạn đóng tiền',
//       deadlineMs: Date.now() + 2 * 24 * 60 * 60 * 1000, // đếm ngược tới mốc này
//       secondaryText: 'XEM CHI TIẾT',
//       primaryText: 'XÁC NHẬN ĐÓNG TIỀN',
//       onSecondary: () => {},
//       onPrimary: () => {},
//   });
// ==========================================================================

export const PaymentNotice = {
    _initialized: false,
    _countdownTimer: null,
    _onPrimary: null,
    _onSecondary: null,

    init() {
        if (this._initialized) return;
        this._render();
        this._bindEvents();
        this._initialized = true;
    },

    _render() {
        if (document.getElementById('payment-notice-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'payment-notice-overlay';
        overlay.className = 'payment-notice-overlay';
        overlay.innerHTML = `
            <div class="payment-notice" id="payment-notice">
                <div class="payment-notice__corner-deco"></div>

                <button class="payment-notice__close" id="payment-notice-close" aria-label="Đóng">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <div class="payment-notice__header">
                    <i class="fa-solid fa-triangle-exclamation payment-notice__header-icon"></i>
                    <span class="payment-notice__title" id="payment-notice-title">THÔNG BÁO</span>
                </div>
                <div class="payment-notice__issuer" id="payment-notice-issuer"></div>

                <div class="payment-notice__body">
                    <div class="payment-notice__image-wrap payment-notice-hidden">
                        <img id="payment-notice-image" class="payment-notice__image" src="" alt="">
                    </div>

                    <div class="payment-notice__info">
                        <div class="payment-notice__info-title" id="payment-notice-info-title">THÔNG TIN</div>
                        <div class="payment-notice__fields" id="payment-notice-fields"></div>

                        <div class="payment-notice__amount-title" id="payment-notice-amount-title">SỐ TIỀN CẦN ĐÓNG</div>
                        <div class="payment-notice__amount" id="payment-notice-amount">0 đ</div>

                        <div class="payment-notice__deadline">
                            <span id="payment-notice-deadline-label">Hạn thanh toán</span>
                            <span class="payment-notice__deadline-badge">
                                <i class="fa-regular fa-clock"></i>
                                <span id="payment-notice-countdown">--</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="payment-notice__actions">
                    <button class="payment-notice__btn payment-notice__btn--secondary" id="payment-notice-secondary-btn">XEM CHI TIẾT</button>
                    <button class="payment-notice__btn payment-notice__btn--primary" id="payment-notice-primary-btn">XÁC NHẬN ĐÓNG TIỀN</button>
                </div>

                <div class="payment-notice__footnote">
                    <i class="fa-solid fa-lock"></i>
                    Giao dịch được mã hoá và bảo mật tuyệt đối bởi Nexus Corp.
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    _bindEvents() {
        document.getElementById('payment-notice-close')
            ?.addEventListener('click', () => this.hide());

        // Click ra ngoài bảng (lên overlay) thì đóng
        document.getElementById('payment-notice-overlay')
            ?.addEventListener('click', (e) => {
                if (e.target.id === 'payment-notice-overlay') this.hide();
            });
    },

    show(config = {}) {
        if (!this._initialized) this.init();
        const $ = (id) => document.getElementById(id);

        $('payment-notice-title').textContent = config.title || 'THÔNG BÁO';
        $('payment-notice-issuer').textContent = config.issuer || '';
        $('payment-notice-info-title').textContent = config.infoTitle || 'THÔNG TIN';
        $('payment-notice-amount-title').textContent = config.amountTitle || 'SỐ TIỀN CẦN ĐÓNG';
        $('payment-notice-amount').textContent = config.amount || '0 đ';
        $('payment-notice-deadline-label').textContent = config.deadlineLabel || 'Hạn thanh toán';
        $('payment-notice-secondary-btn').textContent = config.secondaryText || 'XEM CHI TIẾT';
        $('payment-notice-primary-btn').textContent = config.primaryText || 'XÁC NHẬN ĐÓNG TIỀN';

        // Ảnh minh hoạ (optional) - không truyền thì ẩn khung ảnh, info chiếm full chiều ngang
        const imageWrap = document.querySelector('.payment-notice__image-wrap');
        const imageEl = $('payment-notice-image');
        if (config.image) {
            imageEl.src = config.image;
            imageWrap?.classList.remove('payment-notice-hidden');
        } else {
            imageWrap?.classList.add('payment-notice-hidden');
        }

        // Danh sách field thông tin (label - value)
        const fieldsEl = $('payment-notice-fields');
        fieldsEl.innerHTML = (config.fields || [])
            .map(
                (f) => `
                <div class="payment-notice__field">
                    <span class="payment-notice__field-label">${f.label}</span>
                    <span class="payment-notice__field-value">${f.value}</span>
                </div>`
            )
            .join('');

        // Đếm ngược hạn đóng tiền
        clearInterval(this._countdownTimer);
        if (config.deadlineMs) {
            const tick = () => {
                const remain = config.deadlineMs - Date.now();
                $('payment-notice-countdown').textContent =
                    remain > 0 ? this._formatCountdown(remain) : 'Đã quá hạn';
                if (remain <= 0) clearInterval(this._countdownTimer);
            };
            tick();
            this._countdownTimer = setInterval(tick, 1000);
        } else {
            $('payment-notice-countdown').textContent = config.deadlineText || '--';
        }

        // Gắn hành động cho 2 nút
        this._onPrimary = typeof config.onPrimary === 'function' ? config.onPrimary : null;
        this._onSecondary = typeof config.onSecondary === 'function' ? config.onSecondary : null;

        $('payment-notice-primary-btn').onclick = () => {
            this._onPrimary?.();
            this.hide();
        };
        $('payment-notice-secondary-btn').onclick = () => {
            this._onSecondary?.();
        };

        document.getElementById('payment-notice-overlay')?.classList.add('payment-notice-overlay--visible');
    },

    hide() {
        clearInterval(this._countdownTimer);
        document.getElementById('payment-notice-overlay')?.classList.remove('payment-notice-overlay--visible');
    },

    _formatCountdown(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (n) => String(n).padStart(2, '0');
        return `${days} ngày ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    },
};
