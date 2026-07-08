import { getRandomQuestion } from './questionBank.js';
import {
    QUESTION_TIME_LIMIT_MS,
    MAX_DELAY_MS,
    DAMAGE_PER_CORRECT,
    PLAYER_MAX_HP,
} from './battleConfig.js';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

export class BattleManager {
    constructor(boss, options = {}) {
        this.boss = boss;
        this._questions = options.questions ?? null;
        this._onEnd     = typeof options.onEnd  === 'function' ? options.onEnd  : null;
        this._onFlee    = typeof options.onFlee === 'function' ? options.onFlee : null;

        this._currentQuestion   = null;
        this._lastQuestionIndex = -1;
        this._isProcessing      = false;
        this._sessionId         = 0;

        this._timeLimit         = this.boss.timeLimitMs ?? QUESTION_TIME_LIMIT_MS;
        this._questionStartTime = 0;
        this._countdownTimerId  = null;

        this._playerMaxHp = options.playerMaxHp ?? PLAYER_MAX_HP;
        this._playerHp    = this._playerMaxHp;

        // this._combo = 0; // số câu đúng liên tiếp

        this._ensureOverlay();
        this.boss.reset();
        this._bindBossEvents();
        this._resetUI();
        this._renderBossInfo();
        this._updatePlayerHpBar();
        this._updateComboDisplay();

        document.getElementById('battle-end-btn').onclick  = () => this._close();
        document.getElementById('battle-flee-btn').onclick = () => this._flee();

        this._nextQuestion();
    }

    //Overlay HTML
    _ensureOverlay() {
        if (document.getElementById('battle-overlay')) return;

        const el = document.createElement('div');
        el.id = 'battle-overlay';
        el.className = 'battle-overlay';
        el.innerHTML = `
            <!-- flash overlay khi người chơi bị đánh -->
            <div class="battle-hit-flash" id="battle-hit-flash"></div>

            <!-- BOSS -->
            <div class="battle-boss-card" id="battle-boss-stage">
                <div class="battle-boss-topbar">
                    <div class="battle-boss-identity">
                        <span class="battle-boss-name" id="battle-boss-name"></span>
                        <span class="battle-boss-meta" id="battle-boss-meta"></span>
                    </div>
                    <button class="battle-flee-btn battle-hidden" id="battle-flee-btn" title="Rút lui">
                        <i class="fa-solid fa-person-running"></i>
                    </button>
                </div>

                <div class="battle-boss-hprow">
                    <div class="battle-boss-hpbar">
                        <div class="battle-boss-hpfill" id="battle-boss-hpfill"></div>
                        <div class="battle-boss-hpsegments"></div>
                    </div>
                    <span class="battle-boss-hptext" id="battle-boss-hptext"></span>
                </div>

                <div class="battle-ability-badges" id="battle-ability-badges"></div>

                <div class="battle-boss-art">
                    <div class="battle-boss-art-bg"></div>
                    <img id="battle-boss-img" class="battle-hidden" src="" alt="">
                    <div class="battle-boss-icon" id="battle-boss-icon"></div>
                    <div class="battle-damage-layer" id="battle-damage-layer"></div>
                </div>
            </div>

            <!-- PLAYER + QUIZ -->
            <div class="battle-player-card" id="battle-player-card">
                <div class="battle-player-hprow">
                    <i class="fa-solid fa-heart battle-player-heart"></i>
                    <div class="battle-player-hpbar">
                        <div class="battle-player-hpfill" id="battle-player-hpfill"></div>
                        <div class="battle-player-hpsegments"></div>
                    </div>
                    <span class="battle-player-hptext" id="battle-player-hptext"></span>
                    <div class="battle-player-damage-layer" id="battle-player-damage-layer"></div>
                </div>

                <div class="battle-combo" id="battle-combo"></div>

                <div class="battle-quiz" id="battle-quiz">
                    <div class="battle-quiz-timerrow">
                        <div class="battle-quiz-timer-bar" id="battle-quiz-timer-bar"></div>
                        <span class="battle-quiz-timer-text" id="battle-quiz-timer-text">10</span>
                    </div>
                    <p class="battle-quiz-question" id="battle-quiz-question"></p>
                    <div class="battle-quiz-choices" id="battle-quiz-choices"></div>
                </div>
            </div>

            <!-- KẾT TRẬN -->
            <div class="battle-end-screen" id="battle-end-screen">
                <div class="battle-end-title"    id="battle-end-title"></div>
                <div class="battle-end-subtitle" id="battle-end-subtitle"></div>
                <div class="battle-end-rewards"  id="battle-end-rewards"></div>
                <button class="battle-end-btn"   id="battle-end-btn">Tiếp tục</button>
            </div>
        `;
        document.body.appendChild(el);
    }

    _resetUI() {
        const overlay = document.getElementById('battle-overlay');
        const endScreen = document.getElementById('battle-end-screen');
        overlay?.classList.add('battle-overlay--visible');
        endScreen?.classList.remove('battle-end-screen--visible', 'battle-end-screen--win', 'battle-end-screen--lose');
        document.getElementById('battle-quiz')?.classList.remove('battle-quiz--hidden');
        document.getElementById('battle-flee-btn')?.classList.remove('battle-hidden');
        document.getElementById('battle-player-card')?.classList.remove('battle-player-card--urgent');
    }

    //Boss theming
    _renderBossInfo() {
        // CSS custom property → toàn bộ màu accent thay đổi theo boss
        document.getElementById('battle-overlay')
            .style.setProperty('--battle-accent', this.boss.color);

        document.getElementById('battle-boss-name').textContent = this.boss.name;
        document.getElementById('battle-boss-meta').textContent =
            `Lv.${this.boss.level}${this.boss.zone ? '  ·  ' + this.boss.zone : ''}`;
        document.getElementById('battle-ability-badges').innerHTML = '';

        // icon riêng mỗi boss
        const iconEl = document.getElementById('battle-boss-icon');
        if (iconEl) iconEl.innerHTML = `<i class="fa-solid ${this.boss.icon ?? 'fa-skull'}"></i>`;

        const img = document.getElementById('battle-boss-img');
        if (this.boss.image) {
            img.src = this.boss.image;
            img.classList.remove('battle-hidden');
            iconEl?.classList.add('battle-hidden');
        } else {
            img.removeAttribute('src');
            img.classList.add('battle-hidden');
            iconEl?.classList.remove('battle-hidden');
        }

        this._updateBossHpBar();
    }

    _updateBossHpBar() {
        const pct = Math.max(0, (this.boss.hp / this.boss.maxHp) * 100);
        document.getElementById('battle-boss-hpfill').style.width = `${pct}%`;
        document.getElementById('battle-boss-hptext').textContent = `${this.boss.hp} / ${this.boss.maxHp}`;
    }

    //Boss events → nhiều hành động cùng lúc 
    _bindBossEvents() {
        if (this.boss.__battleManagerBound) return;
        this.boss.__battleManagerBound = true;
        this.boss.addEventListener('damage',       (e) => this._onBossDamage(e));
        this.boss.addEventListener('death',        ()  => this._onBossDeath());
        this.boss.addEventListener('abilityStart', (e) => this._onAbilityToggle(e.detail.ability, true));
        this.boss.addEventListener('abilityStop',  (e) => this._onAbilityToggle(e.detail.ability, false));
    }

    _onBossDamage(e) {
        this._updateBossHpBar();
        this._spawnBossDamageNumber(e.detail.amount);
        this._shakeBoss();
        this._playHitSound();
    }

    _spawnBossDamageNumber(amount) {
        const layer = document.getElementById('battle-damage-layer');
        if (!layer) return;
        const span = document.createElement('span');
        span.className   = 'battle-damage-number battle-damage-number--boss';
        span.textContent = `-${amount}`;
        span.style.left  = `${32 + Math.random() * 36}%`;
        layer.appendChild(span);
        span.addEventListener('animationend', () => span.remove());
    }

    _shakeBoss() {
        const target = document.getElementById('battle-boss-img')?.classList.contains('battle-hidden')
            ? document.getElementById('battle-boss-icon')
            : document.getElementById('battle-boss-img');
        if (!target) return;
        target.classList.remove('battle-boss-img--hit');
        void target.offsetWidth;
        target.classList.add('battle-boss-img--hit');
    }

    _playHitSound() {
        // new Audio('../../audio/hit.mp3').play().catch(() => {});
    }

    _onAbilityToggle(ability, isActive) {
        const wrap = document.getElementById('battle-ability-badges');
        if (!wrap) return;
        const id  = `ability-badge-${ability.name}`;
        let badge = document.getElementById(id);
        if (isActive && !badge) {
            badge = document.createElement('span');
            badge.id = id;
            badge.className  = 'battle-ability-badge';
            badge.textContent = ability.name;
            wrap.appendChild(badge);
        } else if (!isActive) {
            badge?.remove();
        }
    }

    _onBossDeath() {
        this._isProcessing = true;
        this._stopCountdown();
        document.getElementById('battle-quiz')?.classList.add('battle-quiz--hidden');
        document.getElementById('battle-flee-btn')?.classList.add('battle-hidden');

        const rewards    = this.boss.rewards ?? {};
        const rewardText = Object.entries(rewards)
            .map(([k, v]) => `${k.toUpperCase()} +${v}`).join('  ·  ');

        const endScreen = document.getElementById('battle-end-screen');
        endScreen?.classList.add('battle-end-screen--visible', 'battle-end-screen--win');
        document.getElementById('battle-end-title').textContent   = 'Chiến thắng';
        document.getElementById('battle-end-subtitle').textContent = `${this.boss.name} đã bị đánh bại!`;
        document.getElementById('battle-end-rewards').textContent  = rewardText;
    }

    //Máu người chơi 
    _updatePlayerHpBar() {
        const pct  = Math.max(0, (this._playerHp / this._playerMaxHp) * 100);
        const fill = document.getElementById('battle-player-hpfill');
        if (fill) {
            fill.style.width = `${pct}%`;
            fill.classList.toggle('battle-player-hpfill--low', pct < 30);
        }
        document.getElementById('battle-player-hptext').textContent =
            `${this._playerHp} / ${this._playerMaxHp}`;
    }

    /** Trả về true nếu người chơi chết */
    _playerTakeDamage(amount) {
        const dmg      = Math.max(0, Math.round(amount));
        this._playerHp = Math.max(0, this._playerHp - dmg);

        this._flashPlayerHit();
        this._spawnPlayerDamageNumber(dmg);
        this._updatePlayerHpBar();

        if (this._playerHp <= 0) { this._onPlayerDeath(); return true; }
        return false;
    }

    // Flash đỏ toàn màn hình khi bị đánh
    _flashPlayerHit() {
        const flash = document.getElementById('battle-hit-flash');
        if (!flash) return;
        flash.classList.remove('battle-hit-flash--active');
        void flash.offsetWidth;
        flash.classList.add('battle-hit-flash--active');
        flash.addEventListener('animationend', () =>
            flash.classList.remove('battle-hit-flash--active'), { once: true });
    }

    // Số damage bay lên khỏi HP bar người chơi
    _spawnPlayerDamageNumber(amount) {
        const layer = document.getElementById('battle-player-damage-layer');
        if (!layer) return;
        const span = document.createElement('span');
        span.className   = 'battle-damage-number battle-damage-number--player';
        span.textContent = `-${amount}`;
        layer.appendChild(span);
        span.addEventListener('animationend', () => span.remove());
    }

    _onPlayerDeath() {
        this._isProcessing = true;
        this._stopCountdown();
        document.getElementById('battle-quiz')?.classList.add('battle-quiz--hidden');
        document.getElementById('battle-flee-btn')?.classList.add('battle-hidden');

        const endScreen = document.getElementById('battle-end-screen');
        endScreen?.classList.add('battle-end-screen--visible', 'battle-end-screen--lose');
        document.getElementById('battle-end-title').textContent   = 'Thất bại';
        document.getElementById('battle-end-subtitle').textContent = 'Bạn đã bị đánh bại...';
        document.getElementById('battle-end-rewards').textContent  = '';
    }

    //Combo counter
    _updateComboDisplay() {
        const el = document.getElementById('battle-combo');
        if (!el) return;
        if (this._combo >= 2) {
            el.textContent = `${this._combo}× COMBO`;
            el.className   = 'battle-combo battle-combo--active';
            if (this._combo >= 5) el.classList.add('battle-combo--hot');
        } else {
            el.textContent = '';
            el.className   = 'battle-combo';
        }
    }

    //Đóng overlay
    _close() {
        this._stopCountdown();
        document.getElementById('battle-overlay')?.classList.remove('battle-overlay--visible');
        document.getElementById('battle-end-screen')?.classList.remove('battle-end-screen--visible');
        if (this._onEnd) this._onEnd(this.boss);
    }

    _flee() {
        this.boss.reset();
        this._stopCountdown();
        document.getElementById('battle-overlay')?.classList.remove('battle-overlay--visible');
        document.getElementById('battle-end-screen')?.classList.remove('battle-end-screen--visible');
        if (this._onFlee) this._onFlee(this.boss);
    }

    forceClose() {
        this.boss.reset();

        this._stopCountdown();

        document.getElementById('battle-overlay')
            ?.classList.remove('battle-overlay--visible');

        document.getElementById('battle-end-screen')
            ?.classList.remove('battle-end-screen--visible');
    }

    //Câu hỏi
    _pickQuestion() {
        if (Array.isArray(this._questions) && this._questions.length) {
            const pool = this._questions;
            let idx = 0;
            if (pool.length > 1) {
                do { idx = Math.floor(Math.random() * pool.length); }
                while (idx === this._lastQuestionIndex);
            }
            this._lastQuestionIndex = idx;
            return { ...pool[idx], _index: idx };
        }
        const q = getRandomQuestion(this._lastQuestionIndex);
        if (q) this._lastQuestionIndex = q._index;
        return q;
    }

    _nextQuestion() {
        const q = this._pickQuestion();
        if (!q) return;
        this._currentQuestion = q;
        this._renderQuestion(q);
        this._startCountdown();
    }

    _renderQuestion(q) {
        const questionEl = document.getElementById('battle-quiz-question');
        questionEl.classList.remove('battle-quiz-question--in');
        void questionEl.offsetWidth;
        questionEl.textContent = q.question;
        questionEl.classList.add('battle-quiz-question--in');

        const choicesEl = document.getElementById('battle-quiz-choices');
        choicesEl.innerHTML = '';
        q.choices.forEach((choice, idx) => {
            const btn = document.createElement('button');
            btn.className = 'battle-quiz-choice-btn';
            btn.innerHTML = `
                <span class="battle-choice-label">${CHOICE_LABELS[idx] ?? idx + 1}</span>
                <span class="battle-choice-text">${choice}</span>
            `;
            btn.addEventListener('click', () => this.onPlayerAction(idx));
            choicesEl.appendChild(btn);
        });
    }

    _markChoices(correctIndex, selectedIndex) {
        document.querySelectorAll('.battle-quiz-choice-btn').forEach((btn, idx) => {
            if (idx === correctIndex)       btn.classList.add('battle-quiz-choice-btn--correct');
            else if (idx === selectedIndex) btn.classList.add('battle-quiz-choice-btn--wrong');
        });
    }

    _lockChoices(locked) {
        document.querySelectorAll('.battle-quiz-choice-btn')
            .forEach(btn => { btn.disabled = locked; });
    }

    //Countdown
    _startCountdown() {
        this._stopCountdown();
        this._questionStartTime = Date.now();

        const bar  = document.getElementById('battle-quiz-timer-bar');
        const text = document.getElementById('battle-quiz-timer-text');

        if (bar) {
            bar.style.animationDuration = `${this._timeLimit}ms`;
            bar.classList.remove('battle-quiz-timer-bar--run', 'battle-quiz-timer-bar--urgent');
            void bar.offsetWidth;
            bar.classList.add('battle-quiz-timer-bar--run');
        }
        if (text) text.textContent = Math.ceil(this._timeLimit / 1000);

        const sessionId = this._sessionId;
        this._countdownTimerId = setInterval(() => {
            if (sessionId !== this._sessionId) { this._stopCountdown(); return; }

            const remaining = Math.max(0, this._timeLimit - (Date.now() - this._questionStartTime));
            if (text) text.textContent = Math.ceil(remaining / 1000);

            const isUrgent = remaining < 3_000;
            bar?.classList.toggle('battle-quiz-timer-bar--urgent', isUrgent);
            // Pulse toàn bộ player card khi sắp hết giờ
            document.getElementById('battle-player-card')
                ?.classList.toggle('battle-player-card--urgent', isUrgent);

            if (remaining <= 0) {
                this._stopCountdown();
                if (!this._isProcessing) this._gameLoop(-1, sessionId);
            }
        }, 100);
    }

    _stopCountdown() {
        if (this._countdownTimerId !== null) {
            clearInterval(this._countdownTimerId);
            this._countdownTimerId = null;
        }
        document.getElementById('battle-quiz-timer-bar')
            ?.classList.remove('battle-quiz-timer-bar--run');
        document.getElementById('battle-player-card')
            ?.classList.remove('battle-player-card--urgent');
    }

    //Game loop
    onPlayerAction(selectedIndex) {
        this._gameLoop(selectedIndex, this._sessionId);
    }

    async _gameLoop(selectedIndex, sessionId) {
        if (this._isProcessing) return;
        this._isProcessing = true;

        const elapsed = Date.now() - this._questionStartTime;
        const ratio   = Math.min(1, elapsed / this._timeLimit);
        const delay   = Math.round(ratio * MAX_DELAY_MS);

        this._stopCountdown();

        const q         = this._currentQuestion;
        const isTimeout = selectedIndex === -1;
        const isCorrect = !isTimeout && selectedIndex === q.correctIndex;

        // 1. UPDATE
        this._markChoices(q.correctIndex, isTimeout ? null : selectedIndex);

        if (isCorrect) {
            this._combo++;
            this._updateComboDisplay();
            this.boss.takeDamage(DAMAGE_PER_CORRECT);
            if (this.boss.status === 'dead') return;
        } else {
            this._combo = 0;
            this._updateComboDisplay();
            const playerDied = this._playerTakeDamage(this.boss.playerDamageOnWrong);
            if (playerDied) return;
        }

        // 2. RENDER
        this._lockChoices(true);

        // 3. DELAY
        if (delay > 0) await new Promise(r => setTimeout(r, delay));
        if (sessionId !== this._sessionId) return;

        // 4. CHUYỂN CẢNH
        this._nextQuestion();
        this._isProcessing = false;
    }
}
