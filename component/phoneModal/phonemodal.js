export const PhoneModal = {
    _initialized: false,

    render() {
        if (document.getElementById('phone-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'phone-modal-overlay';
        overlay.innerHTML = `
            <div class="phone-modal" id="phone-modal">
                <div class="phone-modal__header">
                    <div class="phone-modal__section-label">THẺ THỢ SĂN</div>
                    <button class="phone-modal__close-btn" id="phone-modal-close" aria-label="Đóng">
                        <span></span><span></span><span></span>
                    </button>
                </div>

                <div class="phone-modal__stCard">
                    <div class="phone-modal__player">
                        <div class="phone-modal__avatar"></div>
                        <div class="phone-modal__info">
                            <span class="phone-modal__name">NovaExplorer</span>
                            <span class="phone-modal__level">Cấp 27</span>
                            <div class="phone-modal__xp-track">
                                <div class="phone-modal__xp-fill" style="width: 62%"></div>
                            </div>
                            <span class="phone-modal__xp-text">12,450 / 20,000 XP</span>
                        </div>
                    </div>
                    <span class="phone-modal__rank">B-Rank</span>
                </div>

                <div class="phone-modal__section-label">ỨNG DỤNG</div>
                <div class="phone-modal__app-grid" id="phone-app-grid"></div>

                <div class="navigation">
                    <button class="game-menu-btn-phone">
                        <div class="g-icon home-icon"></div>
                        <div class="game-menu-text-phone">Trang chủ</div>
                    </button>
                    <button class="game-menu-btn-phone">
                        <div class="g-icon mission-phone-icon"></div>
                        <div class="game-menu-text-phone">Nhiệm vụ</div>
                    </button>
                    <button class="game-menu-btn-phone">
                        <div class="g-icon explore-icon"></div>
                        <div class="game-menu-text-phone">Khám phá</div>
                    </button>
                    <button class="game-menu-btn-phone">
                        <div class="g-icon social-phone-icon"></div>
                        <div class="game-menu-text-phone">Cộng đồng</div>
                    </button>
                    <button class="game-menu-btn-phone">
                        <div class="g-icon my-icon"></div>
                        <div class="game-menu-text-phone">Cá nhân</div>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this._renderApps();
        this._bindEvents();
        this._initialized = true;
    },

    _apps: [
        { id: 'mission',  label: 'Nhiệm vụ', icon: '../../img/icon/ri_target-fill.svg' },
        { id: 'todo',     label: 'Tủ đồ',    icon: '../../img/icon/ph_handbag-fill.svg' },
        { id: 'shop',     label: 'Shopee',    icon: '../../img/icon/icon-park-outline_shopping.svg' },
        { id: 'map',      label: 'Bản đồ',   icon: '../../img/icon/stash_pin-place.svg' },
        { id: 'trophy',   label: 'Thành tích',icon: '../../img/icon/solar_cup-star-bold.svg' },
        { id: 'guild',    label: 'Bang hội',  icon: '../../img/icon/ion_people-sharp.svg' },
        { id: 'mail',     label: 'Thư',       icon: '../../img/icon/tdesign_share.svg' },
        { id: 'event',    label: 'Sự kiện',   icon: '../../img/icon/simple-line-icons_calender.svg' },
        { id: 'ranking',  label: 'BXH',       icon: '../../img/icon/solar_cup-star-bold.svg' },
        { id: 'settings', label: 'Cài đặt',   icon: '../../img/icon/ix_book.svg' },
        { id: 'more',     label: 'Khác',      icon: '../../img/icon/mynaui_plus-solid.svg' },
    ],

    _renderApps() {
        const grid = document.getElementById('phone-app-grid');
        if (!grid) return;
        grid.innerHTML = this._apps.map(app => `
            <button class="phone-app-item" data-app="${app.id}">
                <div class="phone-app-item__icon">
                    <img src="${app.icon}" alt="${app.label}">
                </div>
                <span class="phone-app-item__label">${app.label}</span>
            </button>
        `).join('');
    },

    _bindEvents() {
        document.getElementById('phone-modal-close')
            ?.addEventListener('click', () => this.hide());

        document.getElementById('phone-modal-overlay')
            ?.addEventListener('click', (e) => {
                if (e.target.id === 'phone-modal-overlay') this.hide();
            });

        document.getElementById('phone-app-grid')
            ?.addEventListener('click', (e) => {
                const btn = e.target.closest('.phone-app-item');
                if (!btn) return;
                this._onAppClick(btn.dataset.app);
            });

    },

    // _bindNavigation() {
    //     const list = document.querySelectorAll('#phone-modal .list');
    //     const indicator = document.querySelector('#phone-modal .indicator');

    //     // Hàm tính và set vị trí indicator dựa theo item thực tế
    //     const moveIndicator = (item) => {
    //         if (!indicator) return;
    //         const itemWidth = item.offsetWidth;
    //         const indicatorWidth = indicator.offsetWidth;
    //         const index = [...list].indexOf(item);
    //         const offset = index * itemWidth + (itemWidth - indicatorWidth) / 2;
    //         indicator.style.transform = `translateX(${offset}px)`;
    //     };

    //     // Set vị trí ban đầu cho item active (li đầu tiên)
    //     // Dùng requestAnimationFrame để chắc chắn DOM đã layout xong
    //     requestAnimationFrame(() => {
    //         const activeItem = document.querySelector('#phone-modal .list.active');
    //         if (activeItem) moveIndicator(activeItem);
    //     });

    //     list.forEach((item) => {
    //         item.addEventListener('click', function () {
    //             list.forEach(i => i.classList.remove('active'));
    //             this.classList.add('active');
    //             moveIndicator(this);
    //         });

    //         // Ripple
    //         const link = item.querySelector('a');
    //         const rippleContainer = document.createElement('div');
    //         rippleContainer.classList.add('ripple-container');
    //         link.prepend(rippleContainer);

    //         link.addEventListener('click', function (e) {
    //             const rect = rippleContainer.getBoundingClientRect();
    //             const x = e.clientX - rect.left;
    //             const y = e.clientY - rect.top;

    //             const ripple = document.createElement('span');
    //             ripple.classList.add('ripple');
    //             ripple.style.left = `${x}px`;
    //             ripple.style.top = `${y}px`;
    //             rippleContainer.appendChild(ripple);

    //             setTimeout(() => ripple.remove(), 600);
    //         });
    //     });
    // },

    _onAppClick(appId) {
        console.log('app clicked:', appId);
    },

    show() {
        if (!this._initialized) this.render();
        const overlay = document.getElementById('phone-modal-overlay');
        requestAnimationFrame(() => {
            overlay?.classList.add('phone-modal-overlay--visible');
        });
    },

    hide() {
        const overlay = document.getElementById('phone-modal-overlay');
        overlay?.classList.remove('phone-modal-overlay--visible');
    },
};