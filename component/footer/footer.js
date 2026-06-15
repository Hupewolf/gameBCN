import { NavButton } from "../navButton/NavButton.js";
import { InventoryModal } from "../personalItem/personalItem.js";
import { BattleCard } from "../battleCard/BattleCard.js";

const footer = document.getElementsByTagName("footer")[0] ?? [];
footer.innerHTML = `
        <div class="game-menu">
            <button class="game-menu-btn">
                <div class="g-icon bag-icon"></div>
                <div class="game-menu-text">Túi đồ</div>
            </button>
            <button class="game-menu-btn">
                <div class="g-icon skill-icon"></div>
                <div class="game-menu-text">Kỹ năng</div>
            </button>
            <button class="game-menu-btn">
                <div class="g-icon mission-icon"></div>
                <div class="game-menu-text">Nhiệm vụ</div>
            </button>
            <button class="game-menu-btn">
                <div class="g-icon place-icon"></div>
                <div class="game-menu-text">Bản đồ</div>
            </button>
            <button class="game-menu-btn">
                <div class="g-icon social-icon"></div>
                <div class="game-menu-text">Xã hội</div>
            </button>
            <button class="game-menu-btn">
                <div class="g-icon cup-icon"></div>
                <div class="game-menu-text">Thành tích</div>
            </button>
        </div>
        <div class="footer-right-panel">
            <div id="battle-card-slot"></div>
            <div id="nav-btn-slot"></div>
        </div>
`;
const navBtnArrow = document.querySelector(".nav-btn__arrow");

const isCityPage = window.location.pathname.includes("city.html");

NavButton.render("nav-btn-slot", {
    label: isCityPage ? "Quay về phòng" : "Ra thành phố",
    icon: isCityPage ? "/img/icon/iconRoom.svg" : "/img/icon/iconCity.svg",
    href: isCityPage ? "../room/room.html" : "../city/city.html",
});

// Render BattleCard phía trên NavButton
BattleCard.render("battle-card-slot", {
    name: "Quỷ ghê lém",
    zone: "Khu vực dị thường",
    level: 25,
    rewards: { xp: 300, star: 150 },
    onStart: () => {
        console.log("Bắt đầu Battle: Quỷ ghê lém");
        // TODO: mở màn hình battle
    },
});

const bagBtn = document.querySelector(".bag-icon")?.closest(".game-menu-btn");
if (bagBtn) {
    bagBtn.addEventListener("click", () => {
        InventoryModal.show();
    });
}
