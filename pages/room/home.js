import { playerState, GameHeader } from '../../share/main.js';

// Không có hamburger
GameHeader.render(playerState, { showHamburger: false });


const box = document.getElementById("mission-box");
const btn = document.getElementById("mission-today");

btn.addEventListener("click", () => {
    box.classList.toggle("collapsed");
});