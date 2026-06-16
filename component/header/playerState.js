const savedUser = localStorage.getItem("currentUser");
const userData = savedUser ? JSON.parse(savedUser) : null;

export const playerState = userData ? {
    name: userData.name || 'Người chơi',
    level: userData.level || 0,
    xp: userData.exp || { current: 0, max: 20000 },
    stats: {
        hunger: { value: userData.values?.hungry ?? 60, max: 100, icon: '../../img/icon/burger.png', label: 'Đói' },
        thirst: { value: userData.values?.thirsty ?? 45, max: 100, icon: '../../img/icon/water-drop.png', label: 'Khát' },
        stress: { value: userData.values?.stress ?? 30, max: 100, icon: '../../img/icon/brain.png', label: 'Stress' },
    },
    currency: {
        gem: { value: 780, icon: '../../img/icon/UCoin.svg' },
        energy: { current: 96, max: 120, icon: '../../img/icon/flash.png' },
    },
} : {
    name: 'NovaExplorer',
    level: 27,
    xp: { current: 12450, max: 20000 },
    stats: {
        hunger: { value: 60, max: 100, icon: '../../img/icon/burger.png', label: 'Đói' },
        thirst: { value: 45, max: 100, icon: '../../img/icon/water-drop.png', label: 'Khát' },
        stress: { value: 30, max: 100, icon: '../../img/icon/brain.png', label: 'Stress' },
    },
    currency: {
        gem: { value: 780, icon: '../../img/icon/UCoin.svg' },
        energy: { current: 96, max: 120, icon: '../../img/icon/flash.png' },
    },
};
