import { playerState, GameHeader } from '../main.js';
import { NavButton } from '../components/NavButton.js';

// Có hamburger
GameHeader.render(playerState, { showHamburger: true });

NavButton.render('nav-btn-slot', {
	label: 'Về căn cứ',
	icon: '../../img/icon/mdi_home.png',
	href: '../index.html',
});
