const formatPrice = (v) => `${v.toLocaleString('vi-VN')} <img class="price-icon" src="../../img/icon/UCoin.svg" alt="UCoin">`;

const SUGGESTIONS = [
    { id: 'sg1', name: 'Burger Bò Phô Mai', stat: '+10', time: '45p', food: '../../img/icon/burger.png', background: 'url(../../img/foodApp-img/burger.jpg)', rating: 4.8, price: 50, tag: 'Yêu thích' },
    { id: 'sg2', name: 'Cơm Gà xối mỡ', stat: '+10', time: '35p', food: '../../img/icon/burger.png', background: 'url(../../img/foodApp-img/comgaxoimo.jpg)', rating: 4.9, price: 40, tag: null },
    { id: 'sg3', name: 'Pizza Hải Sản', stat: '+10', time: '60', food: '../../img/icon/burger.png', background: 'url(../../img/foodApp-img/pizzahaisan.jpg)', rating: 4.6, price: 70, tag: null },
    { id: 'sg4', name: 'Matcha latte', stat: '+10', time: '60', food: '../../img/icon/water-drop.png', background: 'url(../../img/foodApp-img/matchalatte.jpg)', rating: 4.5, price: 30, tag: null },
    { id: 'sg5', name: 'Nước lọc', stat: '+10', time: '60', food: '../../img/icon/water-drop.png', background: 'url(../../img/foodApp-img/nuocloc.jpg)', rating: 4.5, price: 30, tag: null },
];

// const RESTAURANTS = [
//     { id: 'rs1', name: 'Burger House', background: 'linear-gradient(135deg,#ff7e5f,#feb47b)', rating: 4.9, reviews: 128, distance: '1.2 km', discount: 'Giảm 15K' },
//     { id: 'rs2', name: 'Cơm Ngon 27', background: 'linear-gradient(135deg,#56ab2f,#a8e063)', rating: 4.7, reviews: 89, distance: '0.8 km', discount: null },
//     { id: 'rs3', name: 'Pizza World', background: 'linear-gradient(135deg,#eb3349,#f45c43)', rating: 4.6, reviews: 203, distance: '2.1 km', discount: 'Giảm 25K' },
//     { id: 'rs4', name: 'Trà Sữa Mộc', background: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', rating: 4.8, reviews: 156, distance: '1.5 km', discount: 'Giảm 10K' },
// ];

const EMPTY_TAB_INFO = {
    orders: { icon: '../../img/icon/mage_file-2.svg', text: 'Chưa có đơn hàng nào' },
    favorite: { icon: '../../img/icon/mdi_heart.svg', text: 'Chưa có quán ăn yêu thích' },
    account: { icon: '../../img/icon/material-symbols_person-phone.svg', text: 'Tính năng đang phát triển' },
    default: { icon: '../../img/icon/mdi_heart.svg', text: 'Tính năng đang phát triển' },
};

export const FoodApp = {
    cart: [],
    _activeTab: 'home',
    _root: null,
    _onBack: null,

    render(slotId, { onBack } = {}) {
        const el = document.getElementById(slotId);
        if (!el) return;

        this._root = el;
        this._onBack = onBack;
        this._activeTab = 'home';

        el.innerHTML = `
            <div class="food-app">
                <div class="food-app__header">
                    <button class="food-app__icon-btn" id="food-app-back-btn" aria-label="Quay lại">
                        <div class="food-app__icon">
                            <img src="../../img/icon/Vector.svg" style="transform: rotate(180deg)">
                        </div>
                    </button>
                    <span class="food-app__title">Shopuu</span>
                    <button class="food-app__icon-btn food-app__cart-icon-btn" id="food-app-cart-icon-btn" aria-label="Giỏ hàng">
                        <div class="food-app__icon">
                            <img src="../../img/icon/icon-park-outline_shopping.svg">
                        </div>
                        <span class="food-app__cart-dot" id="food-app-cart-dot" hidden></span>
                    </button>
                </div>

                <div class="food-app__body" id="food-app-body">
                    ${this._renderHomeContent()}
                </div>

                <div class="food-app__cartbar" id="food-app-cartbar" hidden>
                    <div class="food-app__cartbar-bottom">
                        <div class="food-app__cartbar-info">
                            <span class="food-app__cartbar-count" id="food-app-cart-count">0 món</span>
                            <span class="food-app__cartbar-total" id="food-app-cart-total">0 <img class="price-icon" src="../../img/icon/UCoin.svg" alt="UCoin"></span>
                        </div>
                        <button class="food-app__cartbar-btn" id="food-app-view-cart-btn">Xem giỏ hàng</button>
                    </div>
                </div>

                <div class="food-app__nav">
                    <button class="food-app__nav-item active" data-tab="home">
                        <div class="food-app__icon">
                            <img src="../../img/icon/mdi_home.svg">
                        </div>
                        <span>Trang chủ</span>
                    </button>
                    <button class="food-app__nav-item" data-tab="orders">
                        <div class="food-app__icon">
                            <img src="../../img/icon/mage_file-2.svg">
                        </div>
                        <span>Đơn hàng</span>
                    </button>
                    <button class="food-app__nav-item" data-tab="favorite">
                        <div class="food-app__icon">
                            <img src="../../img/icon/mdi_heart.svg">
                        </div>
                        <span>Yêu thích</span>
                    </button>
                    <button class="food-app__nav-item" data-tab="account">
                        <div class="food-app__icon">
                            <img src="../../img/icon/material-symbols_person-phone.svg">
                        </div>
                        <span>Tài khoản</span>
                    </button>
                </div>
            </div>
        `;

        this._bindEvents();
        this._bindCardEvents();
        this._renderCartBar();
    },

    _renderHomeContent() {
        return `
            <section class="food-app__section">
                <div class="food-app__section-title">Gợi ý cho bạn</div>
                <div class="food-app__hscroll">
                    ${SUGGESTIONS.map((item) => this._renderFoodCard(item)).join('')}
                </div>
            </section>

        `;
    },

            //     <section class="food-app__section">
            //     <div class="food-app__section-title">Nhà hàng nổi bật</div>
            //     <div class="food-app__hscroll">
            //         ${RESTAURANTS.map((r) => this._renderRestaurantCard(r)).join('')}
            //     </div>
            // </section>

    _renderFoodCard(item) {
        return `
            <div class="food-card" data-id="${item.id}">
                <div class="food-card__img" style="background:${item.background}; background-repeat: no-repeat; background-position: center; background-size: cover;">
                    ${item.tag ? `<span class="food-card__tag">${item.tag}</span>` : ''}
                    
                    <button class="food-card__add-btn" data-add="${item.id}" aria-label="Thêm vào giỏ">
                        <img src="../../img/icon/mynaui_plus-solid.svg">
                    </button>
                </div>
                <div class="food-card__info">
                    <div class="food-card__name">${item.name}</div>
                    <div class="food-card__shop">
                        <div class="food-card__stat"><span>${item.stat}</span> <img src="${item.food}"></div>
                        <div class="food-card__time"><img src="../../img/icon/mdi_clock.svg"><span>${item.time}</span></div>
                    </div>
                    <div class="food-card__price-row">
                        <span class="food-card__price">${formatPrice(item.price)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // _renderRestaurantCard(r) {
    //     return `
    //         <div class="restaurant-card" data-id="${r.id}">
    //             <div class="restaurant-card__img" style="background:${r.background}">
    //                 <span class="restaurant-card__rating"><i class="fa-solid fa-star"></i> ${r.rating}</span>
    //                 ${r.discount ? `<span class="restaurant-card__discount">${r.discount}</span>` : ''}
    //             </div>
    //             <div class="restaurant-card__info">
    //                 <div class="restaurant-card__name">${r.name}</div>
    //                 <div class="restaurant-card__meta"><i class="fa-solid fa-star"></i> ${r.rating} (${r.reviews}) · ${r.distance}</div>
    //             </div>
    //         </div>
    //     `;
    // },

    _bindEvents() {
        const root = this._root;
        if (!root) return;

        root.querySelector('#food-app-back-btn')?.addEventListener('click', () => {
            if (typeof this._onBack === 'function') this._onBack();
        });

        root.querySelector('#food-app-view-cart-btn')?.addEventListener('click', () => this._showCartModal());
        root.querySelector('#food-app-cart-icon-btn')?.addEventListener('click', () => this._showCartModal());

        root.querySelectorAll('.food-app__nav-item').forEach((btn) => {
            btn.addEventListener('click', () => {
                root.querySelectorAll('.food-app__nav-item').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this._activeTab = btn.dataset.tab;
                this._renderTab();
            });
        });
    },

    _bindCardEvents() {
        const root = this._root;
        if (!root) return;
        root.querySelectorAll('[data-add]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._addToCart(btn.dataset.add);
            });
        });
    },

    _renderTab() {
        const body = this._root?.querySelector('#food-app-body');
        if (!body) return;

        if (this._activeTab === 'home') {
            body.innerHTML = this._renderHomeContent();
            this._bindCardEvents();
            return;
        }

        const info = EMPTY_TAB_INFO[this._activeTab] || EMPTY_TAB_INFO.default;
        body.innerHTML = `
            <div class="food-app__empty">
                <img src="${info.icon}">
                <p>${info.text}</p>
            </div>
        `;
    },

    _addToCart(id) {
        const item = SUGGESTIONS.find((i) => i.id === id);
        if (!item) return;

        const existing = this.cart.find((c) => c.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
        }
        this._renderCartBar();
    },

    _renderCartBar() {
        const bar = document.getElementById('food-app-cartbar');
        const countEl = document.getElementById('food-app-cart-count');
        const totalEl = document.getElementById('food-app-cart-total');
        const dot = document.getElementById('food-app-cart-dot');
        if (!bar) return;

        const totalQty = this.cart.reduce((s, c) => s + c.qty, 0);
        const totalPrice = this.cart.reduce((s, c) => s + c.qty * c.price, 0);

        if (totalQty === 0) {
            bar.hidden = true;
            if (dot) dot.hidden = true;
            return;
        }

        bar.hidden = false;
        if (countEl) countEl.textContent = `${totalQty} món`;
        if (totalEl) totalEl.innerHTML = formatPrice(totalPrice);
        if (dot) {
            dot.hidden = false;
            dot.textContent = totalQty;
        }
    },

    _showCartModal() {
        if (typeof openModal !== 'function') return;

        if (this.cart.length === 0) {
            openModal({
                title: 'Giỏ hàng',
                message: `<p style="text-align:center;color:#aaa;">Giỏ hàng của bạn đang trống.</p>`,
                options: ['hidden'],
            });
            return;
        }

        const totalPrice = this.cart.reduce((s, c) => s + c.qty * c.price, 0);
        const rows = this.cart
            .map((c) => `
                <li class="food-app__cart-row">
                    <span>${c.name} x${c.qty}</span>
                    <span>${formatPrice(c.qty * c.price)}</span>
                </li>
            `)
            .join('');

        openModal({
            title: 'Giỏ hàng của bạn',
            message: `
                <ul class="food-app__cart-list">${rows}</ul>
                <div class="food-app__cart-modal-total">
                    <span>Tổng cộng</span>
                    <span>${formatPrice(totalPrice)}</span>
                </div>
            `,
            options: [
                { type: 'tertiary', message: 'Đóng', callback: () => { if (typeof closeModal === 'function') closeModal(); } },
                { type: 'primary', message: 'Đặt hàng', callback: () => this._placeOrder() },
            ],
        });
    },

    _placeOrder() {
        this.cart = [];
        this._renderCartBar();
        if (typeof openModal === 'function') {
            openModal({
                title: 'Đặt hàng thành công!',
                message: `<p style="text-align:center;">Đơn hàng của bạn đang được giao đến xin hãy chờ đừng bay acc sớm nhóe. Cảm ơn bạn đã sử dụng Shopuu</p>`,
                options: ['hidden'],
            });
        }
    },
};