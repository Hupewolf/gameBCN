import { playerState, GameHeader } from '../../share/main.js';

GameHeader.render(playerState, { showHamburger: true });
// Dữ liệu mẫu mảng Guild
const guildsData = [
    {
        id: 1,
        name: "BCN Tech",
        level: 25,
        members: "42/50",
        rank: 3,
        xp: "12,400",
        description: "Guild quy tụ các thành viên đam mê công nghệ, chuyên trị các dự án Web, App và Design. Cùng nhau xây dựng và chia sẻ kiến thức.",
        color: "#00e5ff" 
    },
    {
        id: 2,
        name: "Uside Weather Devs",
        level: 18,
        members: "15/30",
        rank: 12,
        xp: "8,750",
        description: "Tập trung phát triển các ứng dụng tiện ích. Châm ngôn: Code sạch, UI mượt, API không bao giờ tạch.",
        color: "#b300ff" 
    },
    {
        id: 3,
        name: "Logic & Math",
        level: 15,
        members: "20/40",
        rank: 25,
        xp: "6,200",
        description: "Nơi hội tụ của những bộ não yêu thích Toán rời rạc, tích phân và thuật toán tối ưu. Chuyên giải quyết các bài toán hóc búa.",
        color: "#00ff88" 
    },
    {
        id: 4,
        name: "Mystery Coders",
        level: 12,
        members: "9/20",
        rank: 45,
        xp: "4,800",
        description: "Hoạt động bí ẩn, chuyên debug và tìm ra nguồn gốc của mọi bug. Không để lại dấu vết rò rỉ bộ nhớ nào.",
        color: "#ffaa00" 
    }
];


const guildMembersData = [
    { name: "Lê Khánh Đăng", email: "25738141.dang@student.iuh.edu.vn", role: "Chủ Guild", avatarColor: "#ffaa00" },
    { name: "Nguyễn Trọng Nhân", email: "25633451.nhan@student.iuh.edu.vn", role: "Thành viên", avatarColor: "#00e5ff" },
    { name: "Nguyễn Ngọc Thái", email: "25655491.thai@student.iuh.edu.vn", role: "Thành viên", avatarColor: "#b300ff" },
    { name: "Đinh Đại Lâm", email: "16041997.lam@student.iuh.edu.vn", role: "Thành viên", avatarColor: "#00ff88" }
];

// --- ELEMENTS ---
const guildListContainer = document.getElementById('guild-list');
const emptyState = document.getElementById('empty-state');
const detailContent = document.getElementById('detail-content');
const btnJoin = document.getElementById('btn-join');

// Views
const viewExplore = document.getElementById('view-explore');
const viewOverview = document.getElementById('view-overview');
const btnBack = document.getElementById('btn-back');

// Detail elements
const detailName = document.getElementById('detail-name');
const detailLevel = document.getElementById('detail-level');
const detailMembers = document.getElementById('detail-members');
const detailRank = document.getElementById('detail-rank');
const detailXp = document.getElementById('detail-xp');
const detailDescription = document.getElementById('detail-description');
const detailAvatar = document.getElementById('detail-avatar');

// Overview elements
const overviewName = document.getElementById('overview-name');
const overviewAvatar = document.getElementById('overview-avatar');
const overviewMembersCount = document.getElementById('overview-members-count');
const memberListContainer = document.getElementById('member-list-container');
// const overviewProgressBar = document.getElementById('overview-progress-bar');
const overviewLevel = document.getElementById('overview-level');
const overviewXpText = document.getElementById('overview-xp-text');

let currentSelectedGuild = null;

// --- KHỞI TẠO & RENDER ---
function renderGuildList() {
    guildListContainer.innerHTML = '';
    guildsData.forEach(guild => {
        const item = document.createElement('div');
        item.className = 'guild-item';
        item.dataset.id = guild.id;
        
        item.innerHTML = `
            <div class="guild-avatar" style="background-color: ${guild.color};"></div>
            <div class="guild-info">
                <div class="guild-name">${guild.name}</div>
                <div class="guild-meta">
                    <span>Lv.${guild.level}</span>
                    <span>•</span>
                    <span>👥 ${guild.members}</span>
                </div>
            </div>
        `;

        item.addEventListener('click', () => {
            document.querySelectorAll('.guild-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            showGuildDetail(guild);
        });

        guildListContainer.appendChild(item);
    });
}

function showGuildDetail(guild) {
    currentSelectedGuild = guild;
    emptyState.classList.add('hidden');
    detailContent.classList.remove('hidden');

    detailName.textContent = guild.name;
    detailLevel.textContent = `Lv.${guild.level}`;
    detailMembers.textContent = guild.members;
    detailRank.textContent = `#${guild.rank}`;
    detailXp.textContent = guild.xp;
    detailDescription.textContent = guild.description;
    
    // Sử dụng màu đơn sắc cho box avatar và filter drop-shadow cho viền khiên
    detailAvatar.style.backgroundColor = guild.color;
    detailAvatar.style.filter = `drop-shadow(0 0 10px ${guild.color}80)`;

    // Reset lại nút XIN GIA NHẬP nếu đổi sang Guild khác
    resetJoinButton();
}

// --- LOGIC XỬ LÝ NÚT GIA NHẬP ---
function resetJoinButton() {
    btnJoin.textContent = "XIN GIA NHẬP";
    btnJoin.classList.remove('pending');
}

btnJoin.addEventListener('click', () => {
    if (btnJoin.classList.contains('pending')) return;

    // 1. Đổi UI sang trạng thái chờ duyệt
    btnJoin.textContent = "ĐANG CHỜ DUYỆT...";
    btnJoin.classList.add('pending');

    // 2. Giả lập hệ thống xử lý (Delay 1.5 giây) sau đó vào Guild
    setTimeout(() => {
        alert("Chủ Guild đã chấp nhận yêu cầu của bạn!");
        enterGuildOverview(currentSelectedGuild);
    }, 1500);
});

// Nút Tạo Guild (Giả lập)
document.getElementById('btn-create').addEventListener('click', () => {
    alert("Chức năng mở modal Tạo Guild sẽ được gọi ở đây!");
});

// --- LOGIC CHUYỂN SANG VIEW TỔNG QUAN ---
function enterGuildOverview(guild) {
    // Ẩn View khám phá, hiện View tổng quan
    viewExplore.classList.add('hidden');
    viewOverview.classList.remove('hidden');

    // Load data vào View tổng quan
    overviewName.textContent = guild.name;
    overviewAvatar.style.backgroundColor = guild.color;
    
    // Áp dụng drop-shadow để ăn khớp với hình khiên
    overviewAvatar.style.filter = `drop-shadow(0 0 15px ${guild.color}80)`;
    overviewAvatar.style.boxShadow = 'none'; 
    
    // Lấy số thành viên thực tế (Cắt chuỗi "42/50" lấy số "42")
    const count = guild.members.split('/')[0];
    overviewMembersCount.textContent = count;

    // Cập nhật thông tin Level và Kinh nghiệm
    // const xpValue = parseInt(guild.xp.replace(/,/g, ''));
    // const maxXp = 20000;
    // const xpPercent = Math.min((xpValue / maxXp) * 100, 100);
    
    // overviewProgressBar.style.width = `${xpPercent}%`;
    // overviewLevel.textContent = guild.level;
    // overviewXpText.textContent = guild.xp;

    renderGuildMembers();
}

function renderGuildMembers() {
    memberListContainer.innerHTML = '';
    guildMembersData.forEach(member => {
        const item = document.createElement('div');
        item.className = 'member-item';
        
        const roleClass = member.role === "Chủ Guild" ? "role-master" : "role-member";
        const roleIcon = member.role === "Chủ Guild" ? '<img src="../../img/icon/crown.svg" class="icon-role">' : '<div class="icon-role change"></div>';

        item.innerHTML = `
            <div class="member-info-wrapper">
                <div class="member-avatar" style="background-color: ${member.avatarColor}"></div>
                <div>
                    <div class="member-name">${member.name}</div>
                    <div class="member-email">${member.email}</div>
                </div>
            </div>
            <div class="role-badge ${roleClass}">${roleIcon} ${member.role}</div>
        `;
        memberListContainer.appendChild(item);
    });
}


renderGuildList();