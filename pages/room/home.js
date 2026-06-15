import { playerState, GameHeader } from '../../share/main.js';
import { PhoneModal } from '../../component/phoneModal/phonemodal.js';

// Không có hamburger
GameHeader.render(playerState, { showHamburger: false });


const box = document.getElementById("mission-box");
const openBtn = document.getElementById("mission-icon");
const closeBtn = document.getElementById("mission-close");
const wrapper = document.querySelector(".outer-box");

closeBtn.addEventListener("click", () => {
    box.classList.add("collapsed");
    wrapper.classList.add("minimized");
});

openBtn.addEventListener("click", () => {
    box.classList.remove("collapsed");
    wrapper.classList.remove("minimized");
});

const phoneTrigger = document.getElementById("phone-trigger-btn");
if (phoneTrigger) {
	phoneTrigger.addEventListener("click", () => {
		PhoneModal.show();
	});
}