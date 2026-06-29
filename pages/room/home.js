import { playerState, GameHeader } from '../../share/main.js';
import { DialogueSystem } from '../../component/dialogueSystem/dialogue.js';
import { PaymentNotice } from '../../component/paymentNotice/paymentNotice.js';

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
            // Hết cốt truyện -> hiện bảng đóng tiền nhà
            // (sau này tái sử dụng PaymentNotice.show({...}) cho bảng đóng phạt với data khác)
            PaymentNotice.show({
                title: 'THÔNG BÁO ĐÓNG TIỀN NHÀ',
                issuer: 'Đơn vị quản lý: NEXUS HOUSING CORP',
                infoTitle: 'THÔNG TIN HOÁ ĐƠN',
                fields: [
                    { label: 'Mã hoá đơn', value: 'NH-2045-0091' },
                    { label: 'Kỳ thanh toán', value: 'Tháng 06/2045' },
                    { label: 'Địa điểm', value: 'Phòng 204, Khu Trung Tâm' },
                    { label: 'Loại phí', value: 'Tiền nhà hàng tháng' },
                ],
                amountTitle: 'SỐ TIỀN CẦN ĐÓNG',
                amount: '1.200.000 đ',
                deadlineLabel: 'Hạn đóng tiền',
                deadlineMs: Date.now() + 2 * 24 * 60 * 60 * 1000, // demo: hạn 2 ngày kể từ lúc hiện ra
                secondaryText: 'XEM CHI TIẾT',
                primaryText: 'XÁC NHẬN ĐÓNG TIỀN',
                onPrimary: () => {
                    console.log('Đã xác nhận đóng tiền nhà');
                },
                onSecondary: () => {
                    console.log('Xem chi tiết hoá đơn tiền nhà');
                },
            });
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

