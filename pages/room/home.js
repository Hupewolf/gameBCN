import { playerState, GameHeader } from '../../share/main.js';
import { DialogueSystem } from '../../component/dialogueSystem/dialogue.js';

// Không có hamburger
GameHeader.render(playerState, { showHamburger: false });

// ====== Demo cốt truyện ======
// avatar để trống "" -> hộp thoại sẽ ẩn ảnh nhân vật (dùng cho lời dẫn/hệ thống)
// Muốn gắn ảnh nhân vật thì điền đường dẫn vào, ví dụ: avatar: '../../img/characters/nyx.png'
const demoStoryLines = [
    {
        speaker: 'Em chủ nhà',
        text: 'Chào chồng. Em xin 50 coin tiền phòng ạ.',
        avatar: '../../img/character/waifu_là_gì_hình_1-removebg-preview.png', // gắn ảnh nhân vật ở đây
    },
    {
        speaker: 'T.Nhân',
        text: 'Dell em ơi',
        avatar: '../../img/character/gojo_satoru_11_6cfc743e26-removebg-preview.png', // gắn ảnh nhân vật chính ở đây
    },
    {
        speaker: 'Em chủ nhà',
        text: 'Huhu anh hong thưn em',
        avatar: '../../img/character/waifu_là_gì_hình_1-removebg-preview.png',
    },
];

document.getElementById('story-trigger-btn')
    ?.addEventListener('click', () => {
        DialogueSystem.play(demoStoryLines, () => {
            console.log('Cốt truyện kết thúc');
        });
    });

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

Const