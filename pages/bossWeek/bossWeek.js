// bossWeek.js — Trang "Boss Tuần" (mở từ blockMarker Hoạt Động > Khiêu Chiến Boss).
// Tái sử dụng nguyên bộ Boss/BattleConfig/questionBank đã code cho battleSystem,
// chỉ viết lại phần UI để khớp layout trang riêng (có cột Phần thưởng + Bảng xếp hạng).

import { playerState, GameHeader } from '../../share/main.js';
import { Boss } from '../../component/battleSystem/Boss.js';
import { INCIDENT_BOSS_POOL } from '../../component/battleSystem/battleConfig.js';
import { getRandomQuestion } from '../../component/battleSystem/questionBank.js';
import {
    QUESTION_TIME_LIMIT_MS,
    MAX_DELAY_MS,
    DAMAGE_PER_CORRECT,
    PLAYER_MAX_HP,
} from '../../component/battleSystem/battleConfig.js';

const $ = (id) => document.getElementById(id);
const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

// Cùng API account dùng ở login.js / personalItem.js — lưu sát thương boss tuần vào values.bossWeekDamage
const API_URL = 'https://6a53c0628547b9f7111bc89e.mockapi.io/accounts/test/testManage';

// Fallback nếu gọi API bảng xếp hạng bị lỗi
const LEADERBOARD_FALLBACK = [
    { name: 'NB', damage: 123_450_000 },
    { name: 'Q.Chi', damage: 98_760_000 },
    { name: 'Quân', damage: 87_650_000 },
    { name: 'Huy', damage: 65_320_000 },
];

// Mock cấu hình rương thưởng theo mốc sát thương — sau này đổi theo rewards thật của boss
const REWARD_CHESTS = [
    { icon: 'fa-solid fa-box', tier: 'bronze', label: 'x1' },
    { icon: 'fa-solid fa-gift', tier: 'silver', label: 'x2' },
    { icon: 'fa-solid fa-gifts', tier: 'gold', label: 'x3' },
    { icon: 'fa-solid fa-crown', tier: 'purple', label: 'x5' },
];

const formatDamage = (n) => `${(n / 1_000_000).toFixed(2)}M`;

const BossWeekPage = {
    boss: null,
    _playerMaxHp: PLAYER_MAX_HP,
    _playerHp: PLAYER_MAX_HP,
    _myDamage: 0,

    _userData: null, // account hiện tại (localStorage) — dùng để cộng dồn + lưu sát thương lên API
    _leaderboardTop: LEADERBOARD_FALLBACK,

    _currentQuestion: null,
    _lastQuestionIndex: -1,
    _isProcessing: false,
    _sessionId: 0,

    _timeLimit: QUESTION_TIME_LIMIT_MS,
    _questionStartTime: 0,
    _countdownTimerId: null,
    _endTimeTimerId: null,

    init() {
        GameHeader.render(playerState, { showHamburger: true });

        this._userData = this._loadUserData();
        this._myDamage = this._getSavedDamage();

        $('bw-back-btn')?.addEventListener('click', () => {
            window.location.href = '../city/city.html';
        });
        $('bw-end-btn')?.addEventListener('click', () => this._close());

        this._pickBoss();
        this._bindBossEvents();
        this._renderBossInfo();
        this._updatePlayerHpBar();
        // this._renderRewards();
        this._renderLeaderboard();
        this._startEndTimeCountdown();

        this._nextQuestion();
    },

    // === Random 1 trong 2 con boss đã code sẵn ở battleConfig.js (INCIDENT_BOSS_POOL) ===
    // Boss tuần máu vô hạn (không có trạng thái "chết") — chỉ dùng để tích luỹ sát thương cho bảng xếp hạng.
    _pickBoss() {
        const cfg = INCIDENT_BOSS_POOL[Math.floor(Math.random() * INCIDENT_BOSS_POOL.length)];

        this.boss = new Boss(cfg.name, Infinity, {
            level: cfg.level,
            zone: 'Khu vực bất ổn',
            playerDamageOnWrong: cfg.playerDamageOnWrong,
            timeLimitMs: cfg.timeLimitMs,
            color: cfg.color,
            icon: cfg.icon,
            image: cfg.image,
            rewards: cfg.rewards,
        });
        cfg.abilities?.forEach((ability) => this.boss.addAbility(ability));
    },

    _bindBossEvents() {
        this.boss.addEventListener('damage', (e) => this._onBossDamage(e));
        this.boss.addEventListener('abilityStart', (e) => this._onAbilityToggle(e.detail.ability, true));
        this.boss.addEventListener('abilityStop', (e) => this._onAbilityToggle(e.detail.ability, false));
    },

    // ===== Boss info / hiệu ứng máu (vô hạn) =====
    _renderBossInfo() {
        $('battle-overlay')?.style.setProperty('--battle-accent', this.boss.color);
        $('bw-boss-name').textContent = this.boss.name;
        this._updateBossHpBar();
    },

    _updateBossHpBar() {
        // Máu vô hạn -> thanh luôn đầy, chỉ còn là hiệu ứng thị giác khi bị đánh trúng
        const fill = $('bw-boss-hpfill');
        if (fill) fill.style.width = '100%';
        const text = $('bw-boss-hptext');
        if (text) text.textContent = '∞';
    },

    _pulseBossHp() {
        const box = $('bw-boss-hp-float');
        if (!box) return;
        box.classList.remove('bw-boss-hp-float--hit');
        void box.offsetWidth; // reset animation
        box.classList.add('bw-boss-hp-float--hit');
    },

    _onBossDamage(e) {
        this._pulseBossHp();
        this._myDamage += e.detail.amount;
        this._updateMyLeaderboardRow();
        this._saveDamage(e.detail.amount);
    },

    _onAbilityToggle(ability, isActive) {
        // GlitchEffect ghi thẳng vào #battle-overlay -> section .bw-left đang mang id đó
        // nên hiệu ứng nhiễu sóng của boss "bé bự" tự động chạy trên section này.
        if (!isActive) return;
        setTimeout(() => {}, 0); // giữ chỗ nếu sau này cần thêm badge kĩ năng ở trang này
    },

    // ===== Player HP =====
    _updatePlayerHpBar() {
        const pct = Math.max(0, (this._playerHp / this._playerMaxHp) * 100);
        const fill = $('bw-player-hpfill');
        if (fill) {
            fill.style.width = `${pct}%`;
            fill.classList.toggle('bw-player-hpfill--low', pct < 30);
        }
        $('bw-player-hptext').textContent = `${this._playerHp} / ${this._playerMaxHp}`;
    },

    _playerTakeDamage(amount) {
        this._playerHp = Math.max(0, this._playerHp - Math.max(0, Math.round(amount)));
        this._updatePlayerHpBar();
        if (this._playerHp <= 0) { this._onPlayerDeath(); return true; }
        return false;
    },

    _onPlayerDeath() {
        this._isProcessing = true;
        this._stopCountdown();
        $('bw-quiz')?.classList.add('bw-hidden');
        $('bw-end-screen')?.classList.add('bw-end-screen--visible', 'bw-end-screen--lose');
        $('bw-end-title').textContent = 'Bạn đã gục ngã';
        $('bw-end-subtitle').textContent = `Sát thương đã gây: ${formatDamage(this._myDamage)}. Thử lại nhé!`;
    },

    _close() {
        window.location.reload();
    },

    // ===== Trắc nghiệm (logic giống BattleManager, UI riêng cho trang này) =====
    _pickQuestion() {
        const q = getRandomQuestion(this._lastQuestionIndex);
        if (q) this._lastQuestionIndex = q._index;
        return q;
    },

    _nextQuestion() {
        const q = this._pickQuestion();
        if (!q) return;
        this._currentQuestion = q;
        this._renderQuestion(q);
        this._startCountdown();
    },

    _renderQuestion(q) {
        $('bw-quiz-question').textContent = q.question;
        const choicesEl = $('bw-quiz-choices');
        choicesEl.innerHTML = '';
        q.choices.forEach((choice, idx) => {
            const btn = document.createElement('button');
            btn.className = 'bw-quiz-choice-btn';
            btn.innerHTML = `
                <span class="bw-choice-label">${CHOICE_LABELS[idx] ?? idx + 1}</span>
                <span class="bw-choice-text">${choice}</span>
            `;
            btn.addEventListener('click', () => this._onPlayerAction(idx));
            choicesEl.appendChild(btn);
        });
    },

    _markChoices(correctIndex, selectedIndex) {
        document.querySelectorAll('.bw-quiz-choice-btn').forEach((btn, idx) => {
            if (idx === correctIndex) btn.classList.add('bw-quiz-choice-btn--correct');
            else if (idx === selectedIndex) btn.classList.add('bw-quiz-choice-btn--wrong');
        });
    },

    _lockChoices(locked) {
        document.querySelectorAll('.bw-quiz-choice-btn').forEach((btn) => { btn.disabled = locked; });
    },

    _startCountdown() {
        this._stopCountdown();
        this._questionStartTime = Date.now();

        const bar = $('bw-quiz-timer-bar');
        const text = $('bw-quiz-timer-text');
        if (bar) {
            bar.style.animationDuration = `${this._timeLimit}ms`;
            bar.classList.remove('bw-quiz-timer-bar--run', 'bw-quiz-timer-bar--urgent');
            void bar.offsetWidth;
            bar.classList.add('bw-quiz-timer-bar--run');
        }
        if (text) text.textContent = Math.ceil(this._timeLimit / 1000);

        const sessionId = this._sessionId;
        this._countdownTimerId = setInterval(() => {
            if (sessionId !== this._sessionId) { this._stopCountdown(); return; }
            const remaining = Math.max(0, this._timeLimit - (Date.now() - this._questionStartTime));
            if (text) text.textContent = Math.ceil(remaining / 1000);
            bar?.classList.toggle('bw-quiz-timer-bar--urgent', remaining < 3_000);
            if (remaining <= 0) {
                this._stopCountdown();
                if (!this._isProcessing) this._gameLoop(-1, sessionId);
            }
        }, 100);
    },

    _stopCountdown() {
        if (this._countdownTimerId !== null) {
            clearInterval(this._countdownTimerId);
            this._countdownTimerId = null;
        }
        $('bw-quiz-timer-bar')?.classList.remove('bw-quiz-timer-bar--run');
    },

    _onPlayerAction(selectedIndex) {
        this._gameLoop(selectedIndex, this._sessionId);
    },

    async _gameLoop(selectedIndex, sessionId) {
        if (this._isProcessing) return;
        this._isProcessing = true;

        const elapsed = Date.now() - this._questionStartTime;
        const ratio = Math.min(1, elapsed / this._timeLimit);
        const delay = Math.round(ratio * MAX_DELAY_MS);

        this._stopCountdown();

        const q = this._currentQuestion;
        const isTimeout = selectedIndex === -1;
        const isCorrect = !isTimeout && selectedIndex === q.correctIndex;

        this._markChoices(q.correctIndex, isTimeout ? null : selectedIndex);

        if (isCorrect) {
            this.boss.takeDamage(DAMAGE_PER_CORRECT);
        } else {
            const playerDied = this._playerTakeDamage(this.boss.playerDamageOnWrong);
            if (playerDied) return;
        }

        this._lockChoices(true);

        if (delay > 0) await new Promise((r) => setTimeout(r, delay));
        if (sessionId !== this._sessionId) return;

        this._nextQuestion();
        this._isProcessing = false;
    },

    // ===== Phần thưởng =====
    // _renderRewards() {
    //     const wrap = $('bw-rewards');
    //     if (!wrap) return;
    //     wrap.innerHTML = REWARD_CHESTS.map((chest) => `
    //         <div class="bw-chest bw-chest--${chest.tier}">
    //             <div class="bw-chest__icon"><i class="${chest.icon}"></i></div>
    //             <span class="bw-chest__label">${chest.label}</span>
    //         </div>
    //     `).join('');
    // },

    // ===== Sát thương của tôi — cộng dồn + lưu vào account (localStorage + API) =====
    _loadUserData() {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    },

    _getSavedDamage() {
        if (!this._userData) return 0;
        return this._userData.values?.bossWeekDamage ?? this._userData.bossWeekDamage ?? 0;
    },

    async _saveDamage(amount) {
        if (!this._userData) return; // chưa đăng nhập -> chỉ tính damage trong phiên, không lưu lại

        if (this._userData.values) {
            this._userData.values.bossWeekDamage = (this._userData.values.bossWeekDamage ?? 0) + amount;
        } else {
            this._userData.bossWeekDamage = (this._userData.bossWeekDamage ?? 0) + amount;
        }
        localStorage.setItem('currentUser', JSON.stringify(this._userData));

        try {
            await fetch(`${API_URL}/${this._userData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this._userData),
            });
        } catch (error) {
            console.error('Lỗi khi lưu sát thương boss tuần:', error);
        }
    },

    // ===== Bảng xếp hạng sát thương — tổng hợp từ toàn bộ account trên API =====
    async _renderLeaderboard() {
        const wrap = $('bw-leaderboard');
        if (wrap) wrap.innerHTML = `<div class="bw-lb-row"><span class="bw-lb-name">Đang tải bảng xếp hạng...</span></div>`;

        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Lỗi mạng khi tải bảng xếp hạng');
            const accounts = await res.json();

            this._leaderboardTop = accounts
                .map((acc) => ({
                    id: acc.id,
                    name: acc.name || 'Ẩn danh',
                    damage: acc.values?.bossWeekDamage ?? acc.bossWeekDamage ?? 0,
                }))
                .filter((row) => row.damage > 0)
                .sort((a, b) => b.damage - a.damage)
                .slice(0, 10);
        } catch (error) {
            console.error('Lỗi khi tải bảng xếp hạng sát thương:', error);
            this._leaderboardTop = LEADERBOARD_FALLBACK;
        }

        this._paintLeaderboard();
    },

    _paintLeaderboard() {
        const wrap = $('bw-leaderboard');
        if (!wrap) return;

        const topRows = this._leaderboardTop.map((row, idx) => `
            <div class="bw-lb-row">
                <span class="bw-lb-rank bw-lb-rank--${idx + 1}">${idx + 1}</span>
                <span class="bw-lb-name">${row.name}</span>
                <span class="bw-lb-damage">${formatDamage(row.damage)}</span>
            </div>
        `).join('');

        const myRank = this._userData
            ? this._leaderboardTop.findIndex((row) => row.id === this._userData.id) + 1
            : 0;

        wrap.innerHTML = `
            ${topRows}
            <div class="bw-lb-row bw-lb-row--me" id="bw-lb-me-row">
                <span class="bw-lb-rank">${myRank > 0 ? myRank : '99+'}</span>
                <span class="bw-lb-name">${playerState.name}</span>
                <span class="bw-lb-damage" id="bw-lb-me-damage">${formatDamage(this._myDamage)}</span>
            </div>
        `;
    },

    _updateMyLeaderboardRow() {
        const el = $('bw-lb-me-damage');
        if (el) el.textContent = formatDamage(this._myDamage);
    },

    // ===== Đếm ngược ngày reset boss tuần (mốc 00:00 thứ 2 tuần sau) =====
    _startEndTimeCountdown() {
        const getNextResetMs = () => {
            const now = new Date();
            const day = now.getDay(); // 0 = CN
            const daysUntilMonday = (8 - day) % 7 || 7;
            const next = new Date(now);
            next.setDate(now.getDate() + daysUntilMonday);
            next.setHours(0, 0, 0, 0);
            return next.getTime();
        };

        const endsAt = getNextResetMs();
        const tick = () => {
            const remain = Math.max(0, endsAt - Date.now());
            const totalSec = Math.floor(remain / 1000);
            const d = Math.floor(totalSec / 86_400);
            const h = String(Math.floor((totalSec % 86_400) / 3600)).padStart(2, '0');
            const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
            const s = String(totalSec % 60).padStart(2, '0');
            const el = $('bw-endtime-value');
            if (el) el.textContent = `${d}D ${h}:${m}:${s}`;
        };
        tick();
        this._endTimeTimerId = setInterval(tick, 1000);
    },
};

document.addEventListener('DOMContentLoaded', () => BossWeekPage.init());
