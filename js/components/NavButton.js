/**
 * NavButton — nút chuyển trang dưới footer
 * 
 * Dùng:
 *   NavButton.render('nav-btn-slot', {
 *     label: 'Ra thành phố',
 *     icon: 'assets/icons/car.png',
 *     href: 'city.html',
 *   });
 */
export const NavButton = {

	render(slotId, { label, icon, href }) {
		const el = document.getElementById(slotId);
		if (!el) return;

		el.innerHTML = `
			<a class="nav-btn" href="${href}">
				<img class="nav-btn__icon" src="${icon}" alt="${label}">
				<span class="nav-btn__label">${label}</span>
				<span class="nav-btn__arrow">></span>
			</a>
    `;
	},
};
