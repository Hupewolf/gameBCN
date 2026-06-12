import { StatBar, updateStatBar } from './StatBar.js';

export const GameHeader = {

	// options: { showHamburger: bool }
	render(state, options = {}) {
		const el = document.getElementById('game-header');
		if (!el) return;

		const { showHamburger = false } = options;
		const xpPct = (state.xp.current / state.xp.max) * 100;
		const stats = Object.entries(state.stats);
		const cur = state.currency;

		el.innerHTML = `
			<div class="header__left">

				${showHamburger ? `
				<div class="header__sidebar-area">
					<button class="header__hamburger" id="hamburger-btn" aria-label="Menu">
						<img src="../../img/icon/pajamas_hamburger.svg" alt="menu" width="20" height="20">
					</button>
					<div id="sidebar-below"></div>
				</div>` : ''}

				<!-- Player info -->
				<div class="header__player">
					<div class="header__avatar">
						<img src="../../img/icon/fluent_person-28-filled.svg" alt="${state.name}" width="40" height="40">
					</div>
					<div class="header__info">
						<span class="header__name">${state.name}</span>
						<span class="header__level">Cấp ${state.level}</span>
						<div class="header__xp-track">
							<div class="header__xp-fill" style="width:${xpPct}%"></div>
						</div>
						<span class="header__xp-text">
							${state.xp.current.toLocaleString()} / ${state.xp.max.toLocaleString()} XP
						</span>
					</div>
				</div>

			</div>

			<!-- Stats -->
			<div class="header__stats">
				${stats.map(([key, s]) => StatBar({ key, ...s })).join('')}
			</div>

			<!-- Currency -->
			<div class="header__currency">
				<span class="currency-item" data-currency="gold">
					<img src="${cur.gold.icon}" alt="gold" width="16" height="16">
					<span class="currency-item__val">${cur.gold.value.toLocaleString()}</span>
				</span>
				<span class="currency-item" data-currency="gem">
					<img src="${cur.gem.icon}" alt="gem" width="16" height="16">
					<span class="currency-item__val">${cur.gem.value.toLocaleString()}</span>
				</span>
				<span class="currency-item" data-currency="energy">
					<img src="${cur.energy.icon}" alt="energy" width="16" height="16">
					<span class="currency-item__val">${cur.energy.current}/${cur.energy.max}</span>
				</span>
				<button class="currency__add-btn" aria-label="Nạp thêm"><img src="../../img/icon/mynaui_plus-solid.svg" width="24" height="24"></button>
			</div>
		`;

		this._bindEvents();
	},

	_bindEvents() {
		document.getElementById('hamburger-btn')
			?.addEventListener('click', () => {
				
			});
// đống dưới sẽ xài sau
		// document.querySelector('.currency__add-btn')
		// 	?.addEventListener('click', () => {
				
		// 	});
	},

	// // Cập nhật stat cụ thể
	// updateStat(key, value, max) {
	// 	updateStatBar(key, value, max);
	// },

	// // Cập nhật currency
	// updateCurrency(key, value) {
	// 	const el = document.querySelector(`.currency-item[data-currency="${key}"] .currency-item__val`);
	// 	if (!el) return;
	// 	el.textContent = typeof value === 'object'
	// 		? `${value.current}/${value.max}`
	// 		: value.toLocaleString();
	// },

	// // Cập nhật XP
	// updateXP(current, max) {
	// 	const pct = (current / max) * 100;
	// 	const fill = document.querySelector('.header__xp-fill');
	// 	const text = document.querySelector('.header__xp-text');
	// 	if (fill) fill.style.width = `${pct}%`;
	// 	if (text) text.textContent = `${current.toLocaleString()} / ${max.toLocaleString()} XP`;
	// },
};
