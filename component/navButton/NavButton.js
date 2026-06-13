
export const NavButton = {

	render(slotId, { label, icon, href }) {
		const el = document.getElementById(slotId);
		if (!el) return;

		el.innerHTML = `
			<a class="nav-btn primary" href="${href}">
				<img class="nav-btn__icon" src="${icon}" alt="${label}">
				<span class="nav-btn__label">${label}</span>
				<span class="nav-btn__arrow"><img src="../../img/icon/Vector.svg" alt="menu" width="16" height="16"></span>
			</a>
    `;
	},
};
