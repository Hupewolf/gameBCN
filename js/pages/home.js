import { playerState, GameHeader } from '../main.js';
import { NavButton } from '../components/NavButton.js';

// Không có hamburger
GameHeader.render(playerState, { showHamburger: false });

NavButton.render('nav-btn-slot', {
	label: 'Ra thành phố',
	icon: '../../img/background/53e4bcab-684d-4a3d-a038-c800d58642f8-removebg-preview.png',
	href: 'pages/city.html',
});
