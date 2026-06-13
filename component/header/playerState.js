export const playerState = {
	name: 'NovaExplorer',
	level: 27,
	xp: { current: 12450, max: 20000 },
	stats: {
		hunger: { value: 60, max: 100, icon: '../../img/icon/burger.png', label: 'Đói' },
		thirst: { value: 45, max: 100, icon: '../../img/icon/water-drop.png', label: 'Khát' },
		stress: { value: 30, max: 100, icon: '../../img/icon/brain.png', label: 'Stress' },
	},
	currency: {
		gold: { value: 2450, icon: '../../img/icon/star.png' },
		gem: { value: 780, icon: '../../img/icon/diamond.png' },
		energy: { current: 96, max: 120, icon: '../../img/icon/flash.png' },
	},
};
