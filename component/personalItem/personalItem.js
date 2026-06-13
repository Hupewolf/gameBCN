export const InventoryModal = {
    allItems: [],
    currentItems: [],
    async fetchData() {
        try {
            const response = await fetch("https://6a2d87622edd4cb330d141e8.mockapi.io/items/items");
            if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
            const data = await response.json();
            console.log("Dữ liệu trả về từ API:", data);
            return data;
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu hoạt động:", error);
            return null;
        }
    },

    render() {
        const modalHTML = `
            <div id="inventory-modal">
                <div class="inventory-modal-content">
                    <button class="close-inventory-btn" id="close-inventory-btn" aria-label="Đóng">✕</button>
                    <div class="inventory-sidebar">
                        <ul class="inventory-category-list">
                            <li class="inventory-category-item active" data-category="thực phẩm">Thực phẩm <button class="btnQuestion"><i class="fa-solid fa-question"></i></button></li>
                            <li class="inventory-category-item" data-category="trang bị">Trang bị <button class="btnQuestion"><i class="fa-solid fa-question"></i></button></li>
                        </ul>
                    </div>
                    <div class="inventory-main">
                        <h2 class="inventory-title" id="inventory-title">Túi đồ thực phẩm</h2>
                        <div class="inventory-grid-wrapper">
                            <div class="inventory-grid">
                                ${Array.from({ length: 32 })
                                    .map(() => `<div class="inventory-slot"></div>`)
                                    .join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        this._bindEvents();
    },

    filterAndRender(category) {
        if (!this.allItems) return;

        const filteredItems = this.allItems.filter((item) => {
            const itemType = String(item.type || "")
                .toLowerCase()
                .trim();
            const targetCat = String(category).toLowerCase().trim();

            if (!itemType) return false;

            return itemType === targetCat;
        });

        this.currentItems = Array.from({ length: 32 }, (_, i) => filteredItems[i] || null);
        this.renderItems();
    },

    renderItems(data) {
        if (data) {
            const fetchedItems = Array.isArray(data) ? data : data.items || [];
            this.currentItems = Array.from({ length: 32 }, (_, i) => fetchedItems[i] || null);
        }

        const slots = document.querySelectorAll(".inventory-slot");

        slots.forEach((slot, index) => {
            slot.innerHTML = "";
            slot.style.opacity = "";
            slot.onclick = null;
            slot.ondragstart = null;
            slot.ondragover = null;
            slot.ondrop = null;
            slot.ondragend = null;

            const item = this.currentItems[index];

            if (item) {
                slot.setAttribute("draggable", "true");
                slot.innerHTML = `
                    <span style="position: absolute; top: 4px; left: 6px; font-size: 13px; font-weight: bold; color: #00f3ff; text-shadow: 1px 1px 2px #000; pointer-events: none;">+${item.index}</span>
                    <img src="${item.image}" alt="${item.name}" title="${item.name}" style="width: 50%; height: 50%; object-fit: contain; pointer-events: none;">
                    <div class="item-actions" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(13, 27, 42, 0.9); flex-direction: column; justify-content: center; align-items: center; gap: 8px; border-radius: 6px; z-index: 10;">
                        <button class="use-item-btn" style="background: #4caf50; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; width: 80%;">Sử dụng</button>
                        <button class="cancel-item-btn" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; width: 80%;">Hủy</button>
                    </div>
                `;

                slot.onclick = () => {
                    document.querySelectorAll(".item-actions").forEach((el) => (el.style.display = "none"));
                    slot.querySelector(".item-actions").style.display = "flex";
                };

                slot.querySelector(".use-item-btn").onclick = (e) => {
                    e.stopPropagation();
                    console.log(`Bạn đã sử dụng vật phẩm: ${item.name}`);
                    slot.querySelector(".item-actions").style.display = "none";
                };

                slot.querySelector(".cancel-item-btn").onclick = (e) => {
                    e.stopPropagation();
                    slot.querySelector(".item-actions").style.display = "none";
                };

                slot.ondragstart = (e) => {
                    e.dataTransfer.setData("sourceIndex", index);
                    setTimeout(() => (slot.style.opacity = "0.5"), 0);
                };
                slot.ondragend = () => {
                    slot.style.opacity = "1";
                };
            } else {
                slot.removeAttribute("draggable");
            }

            slot.ondragover = (e) => {
                e.preventDefault();
            };

            slot.ondrop = (e) => {
                e.preventDefault();
                const sourceIndex = e.dataTransfer.getData("sourceIndex");
                if (sourceIndex !== "" && sourceIndex !== index.toString()) {
                    const srcIdx = parseInt(sourceIndex, 10);

                    const temp = this.currentItems[srcIdx];
                    this.currentItems[srcIdx] = this.currentItems[index];
                    this.currentItems[index] = temp;

                    this.renderItems();
                }
            };
        });
    },

    async show() {
        let modal = document.getElementById("inventory-modal");
        if (!modal) {
            this.render();
            modal = document.getElementById("inventory-modal");
        }
        modal.style.display = "flex";

        const data = await this.fetchData();
        if (data) {
            this.allItems = Array.isArray(data) ? data : data.items || [];
            const activeCat = document.querySelector(".inventory-category-item.active");
            const category = activeCat ? activeCat.dataset.category : "thực phẩm";
            this.filterAndRender(category);
        }
    },
    _bindEvents() {
        const modal = document.getElementById("inventory-modal");
        const closeBtn = document.getElementById("close-inventory-btn");
        const categoryItems = document.querySelectorAll(".inventory-category-item");
        const inventoryTitle = document.getElementById("inventory-title");

        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });

        categoryItems.forEach((item) => {
            item.addEventListener("click", () => {
                categoryItems.forEach((i) => i.classList.remove("active"));
                item.classList.add("active");

                inventoryTitle.textContent = `Túi đồ ${item.dataset.category}`;
                this.filterAndRender(item.dataset.category);
            });
        });

        const btnQuestions = document.querySelectorAll(".btnQuestion");
        btnQuestions.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ li bên ngoài
                const item = btn.closest(".inventory-category-item");
                if (item) {
                    if (item.dataset.category === "thực phẩm") {
                        if (typeof openModal === "function") {
                            openModal({
                                title: `Cách sử dụng vật phẩm`,
                                message: `
                                    <ul class="modalInstruct">
                                        <li class="content">Thức ăn: Khi sử dụng, món ăn sẽ hồi phục chỉ số đói của nhân vật theo mức năng lượng mà món ăn đó cung cấp.</li>
                                        <li class="content">Nước uống: Khi sử dụng, nước uống sẽ hồi phục chỉ số khát của nhân vật theo lượng nước mà vật phẩm đó cung cấp.</li>
                                    </ul>
                                `,
                                options: ["hidden"],
                            });
                        }
                    } else if (item.dataset.category === "trang bị") {
                        if (typeof openModal === "function") {
                            openModal({
                                title: `Cách sử dụng trang bị`,
                                message: ``,
                                options: ["hidden"],
                            });
                        }
                    }
                }
            });
        });
    },
};
