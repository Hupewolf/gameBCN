import { playerState, GameHeader } from '../../share/main.js';
import { InstabilitySystem } from './instability.js';

GameHeader.render(playerState, { showHamburger: true }); // Chỉnh true/false để hiện/ẩn nút menu
InstabilitySystem.init(85); // Độ bất ổn bắt đầu từ 0%, tự tăng dần theo thời gian

document.addEventListener("DOMContentLoaded", () => {
    const scrollLeftBtn = document.getElementById("scrollLeftBtn");
    const scrollRightBtn = document.getElementById("scrollRightBtn");

    if (scrollLeftBtn && scrollRightBtn) {
        const scrollAmount = 300; 

        const updateArrowsVisibility = () => {
            const scrollLeft = document.body.scrollLeft || window.scrollX || document.documentElement.scrollLeft;
            const maxScroll = document.body.scrollWidth - document.body.clientWidth;

            if (scrollLeft <= 1) {
                scrollLeftBtn.classList.add("hidden");
            } else {
                scrollLeftBtn.classList.remove("hidden");
            }

            if (scrollLeft >= maxScroll - 1) {
                scrollRightBtn.classList.add("hidden");
            } else {
                scrollRightBtn.classList.remove("hidden");
            }
        };

        updateArrowsVisibility();

        document.body.addEventListener("scroll", updateArrowsVisibility);
        window.addEventListener("scroll", updateArrowsVisibility);
        window.addEventListener("resize", updateArrowsVisibility);

        scrollLeftBtn.addEventListener("click", () => {
            document.body.scrollBy({
                left: -scrollAmount,
                behavior: "smooth"
            });
            window.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        });

        scrollRightBtn.addEventListener("click", () => {
            document.body.scrollBy({
                left: scrollAmount,
                behavior: "smooth"
            });
            window.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });
    }
});