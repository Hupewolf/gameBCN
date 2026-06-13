function modalInput(input, event) {
    switch (event) {
        case "skipChapter":
            handleChapterEvent(input, "skip");
    }
}
function handleChapterEvent(input, type) {
    switch (type) {
        case "skip":
            if (input == "accept") {
                document.querySelector("#start-course").style.display = "none";
                document.querySelector(".course-chapter").classList.remove("disable");
            }
            closeModal();
    }
}
function closeModal() {
    console.log(1);
    let modal = document.querySelector(".backdrop");
    modal.style.display = "none";
}
function openModal(content) {
    let title = content?.title ?? "Sample Title";
    let message = content?.message ?? "Sample Message";
    let options =
        content?.options !== undefined
            ? [...content.options]
            : [
                  {
                      type: "tertiary",
                      message: "Close",
                      callback: closeModal,
                  },
                  {
                      type: "primary",
                      message: "Accept",
                      callback: closeModal,
                  },
              ];
    createModal();
    flushModal();
    let header = document.querySelector(".modal-header");
    let content2 = document.querySelector(".modal-message");
    let choices = document.querySelector(".modal-choices");
    header.textContent = title;
    content2.innerHTML = message;
    if (options[0] === "hidden") {
        choices.classList.add("hidden");
    } else {
        for (let item of options) {
            console.log(item);
            let button = document.createElement("button");
            button.className = item.type ?? "primary";
            if (item.type == "primary") {
                button.setAttribute("type", "button");
            }
            button.innerHTML = item.message ?? "Sample Text";
            button.addEventListener("click", item.callback ?? closeModal);
            choices.appendChild(button);
        }
    }
}
function createModal() {
    if (!document.querySelector(".backdrop")) {
        let container = document.querySelector("main") || document.body;
        let backdrop = document.createElement("div");
        backdrop.classList.add("backdrop");
        backdrop.innerHTML = `
            <div class="modal-container">
                <button class="tertiary exit-modal" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
                <h2 class="modal-header"></h2>
                <form class="modal-form">
                    <div class="modal-message">
                    </div>
                    <div class="modal-choices">
                    </div>
                </form>
            </div>
        `;
        container.appendChild(backdrop);
        let backdrop2 = document.querySelector(".backdrop");
        let form = document.querySelector(".modal-form");
        backdrop2.addEventListener("click", (e) => {
            if (e.target == backdrop2) {
                closeModal();
            }
        });
        form.addEventListener("submit", (e) => {
            e.preventDefault();
        });
    } else {
        document.querySelector(".backdrop").style.display = "flex";
    }
}
function flushModal() {
    let header = document.querySelector(".modal-header");
    let content2 = document.querySelector(".modal-message");
    let choices = document.querySelector(".modal-choices");
    header.innerHTML = "";
    content2.innerHTML = "";
    choices.innerHTML = "";
    choices.style.display = "";
    choices.classList.remove("hidden");
}
