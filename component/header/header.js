import { StatBar, updateStatBar } from './StatBar.js';

const getInitials = (name) => {
	if (!name) return "G"; 
	const words = name.trim().split(/\s+/);
	if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
	return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name) => {
	if (!name) return "#6c757d"; 
	const colors = ["#f56a00", "#7265e6", "#ffbf00", "#00a2ae", "#1890ff", "#eb2f96", "#52c41a", "#e83e8c", "#dc3545", "#fd7e14"];
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return colors[Math.abs(hash) % colors.length];
};

export const GameHeader = {
	render(state = {}) {
		const el = document.getElementById('game-header');
		if (!el) return;

		const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
		if (!isLoggedIn) {
			el.innerHTML = `
				<div class="header__left">
					<div class="header__player">
						<div class="header__avatar">
							<img src="../../img/icon/fluent_person-28-filled.svg" alt="Guest" width="40" height="40">
						</div>
						<button id="header-login-btn" >Đăng nhập</button>
					</div>
				</div>
			`;
			this._bindEvents(false);
			return;
		}

		const xpPct = (state.xp.current / state.xp.max) * 100;
		const stats = Object.entries(state.stats);
		const cur = state.currency;
		const initials = getInitials(state.name);
		const bgColor = getAvatarColor(state.name);

		el.innerHTML = `
			<div class="header__left">
				<div class="header__player" id="user-profile-toggle" style="position: relative; cursor: pointer;">
					<div class="header__avatar" style="width: 48px; height: 48px; background-color: ${bgColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 18px; flex-shrink: 0; text-transform: uppercase;">
						${initials}
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
					<div class="dropdown-menu" id="user-dropdown">
						<button class="dropdown-item" id="logout-btn">
							<i class="fa-solid fa-right-from-bracket"></i> Đăng xuất
						</button>
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

	_bindEvents(isLoggedIn = true) {
		if (!isLoggedIn) {
			document.getElementById("header-login-btn")?.addEventListener("click", () => {
				window.location.href = "../login/login.html"; 
			});
		} else {
			const profileToggle = document.getElementById('user-profile-toggle');
			const dropdown = document.getElementById('user-dropdown');
			const logoutBtn = document.getElementById('logout-btn');

			if (profileToggle && dropdown) {
				profileToggle.addEventListener('click', (e) => {
					e.stopPropagation();
					dropdown.classList.toggle('show');
				});
				
				document.addEventListener('click', (e) => {
					if (!profileToggle.contains(e.target)) {
						dropdown.classList.remove('show');
					}
				});
			}

			if (logoutBtn) {
				logoutBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					localStorage.removeItem("isLoggedIn");
					localStorage.removeItem("currentUser");
					window.location.reload(); 
				});
			}

			document.querySelector('.currency__add-btn')
				?.addEventListener('click', () => {
				});
		}
	},

};
