// InstabilitySystem — chỉ số "Độ bất ổn" của thành phố + các điểm bất ổn
// random xuất hiện trên bản đồ. Bấm vào 1 điểm bất ổn -> mở trận đấu trắc
// nghiệm thật (Boss/BattleManager) chứ không còn quiz 1 câu kiểu cũ nữa.

import { Boss } from '../../component/battleSystem/Boss.js';
import { BattleManager } from '../../component/battleSystem/BattleManager.js';
import { INCIDENT_BOSS_POOL, INSTABILITY_REWARD_PER_WIN } from '../../component/battleSystem/battleConfig.js';

// chỉnh chỉ số
const MAX_INSTABILITY = 100;
const INSTABILITY_INCREASE_INTERVAL_MS = 10_000;
const SPAWN_CHECK_INTERVAL_MS = 10_000;
const MAX_VISIBLE_INCIDENTS = 3;
const INCIDENT_DURATION_RANGE_MS = [45_000, 90_000];

const INCIDENT_POSITIONS = [
    { top: 30, left: 30 }, // góc trên-trái
    { top: 30, left: 88 }, // góc trên-phải
    { top: 46, left: 14 }, // giữa-trái
    { top: 66, left: 20 }, // dưới-trái
    { top: 60, left: 80 }, // dưới mép-phải
    { top: 60, left: 90 }, // mép phải
];

export const InstabilitySystem = {
    _value: 0,
    _incidents: new Map(),
    _activeIncidentIndex: null,
    _currentBattle: null,

    init(startValue = 0) {
        this._renderPanel();
        this._renderMarkers();
        this._setValue(startValue);

        setInterval(() => this._setValue(this._value + 1), INSTABILITY_INCREASE_INTERVAL_MS);
        setInterval(() => this._trySpawnIncident(), SPAWN_CHECK_INTERVAL_MS);
    },

    //thanh độ bất ổn
    _renderPanel() {
        if (document.getElementById('instability-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'instability-panel';
        panel.className = 'instability-panel';
        panel.innerHTML = `
            <div class="instability-panel__head">
                <span class="instability-panel__label">ĐỘ BẤT ỔN</span>
            </div>
            <div class="instability-panel__value" id="instability-value">0%</div>
            <div class="instability-panel__track">
                <div class="instability-panel__fill" id="instability-fill" style="width:0%"></div>
            </div>
        `;
        document.body.appendChild(panel);
    },

    _setValue(value) {
        this._value = Math.max(0, Math.min(MAX_INSTABILITY, value));
        document.getElementById('instability-value')?.replaceChildren(`${this._value}%`);
        const fill = document.getElementById('instability-fill');
        if (fill) fill.style.width = `${this._value}%`;
    },

    // 6 địa điểm độ bất ổn
    _renderMarkers() {
        const map = document.querySelector('.map');
        if (!map) return;

        INCIDENT_POSITIONS.forEach((pos, index) => {
            const marker = document.createElement('div');
            marker.className = 'incident-marker';
            marker.dataset.index = String(index);
            marker.style.top = `${pos.top}%`;
            marker.style.left = `${pos.left}%`;
            marker.innerHTML = `
                <div class="incident-marker__circle">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="incident-marker__timer">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span class="incident-marker__time-text">00:00:00</span>
                </div>
            `;
            marker.addEventListener('click', () => this._onIncidentClick(index));
            map.appendChild(marker);
        });
    },

    _hiddenPositionIndexes() {
        return INCIDENT_POSITIONS.map((_, i) => i).filter((i) => !this._incidents.has(i));
    },

    _trySpawnIncident() {
        if (this._incidents.size >= MAX_VISIBLE_INCIDENTS) return;

        const hidden = this._hiddenPositionIndexes();
        if (!hidden.length) return;

        const index = hidden[Math.floor(Math.random() * hidden.length)];
        const el = document.querySelector(`.incident-marker[data-index="${index}"]`);
        if (!el) return;

        const [min, max] = INCIDENT_DURATION_RANGE_MS;
        const duration = Math.floor(min + Math.random() * (max - min));
        const endsAt = Date.now() + duration;

        const tick = () => {
            const remaining = endsAt - Date.now();
            if (remaining <= 0) {
                this._removeIncident(index); // hết giờ -> tự biến mất (không trừ % bất ổn)
                return;
            }
            this._updateTimerText(el, remaining);
        };
        tick();
        const intervalId = setInterval(tick, 1000);

        this._incidents.set(index, { intervalId, endsAt });
        el.classList.add('incident-marker--visible');
    },

    _updateTimerText(el, ms) {
        const totalSeconds = Math.ceil(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        const pad = (n) => String(n).padStart(2, '0');
        const span = el.querySelector('.incident-marker__time-text');
        if (span) span.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    },

    // Hết giờ HOẶC đánh thắng đều gọi vào đây để dọn marker đi.
    // Nếu marker đang bị đánh (đang mở BattleManager) mà bị hết giờ giữa trận
    // thì ép đóng trận đấu lại luôn (forceClose), tránh kẹt overlay.
    _removeIncident(index) {
        const data = this._incidents.get(index);
        if (data) clearInterval(data.intervalId);
        this._incidents.delete(index);
        document.querySelector(`.incident-marker[data-index="${index}"]`)
            ?.classList.remove('incident-marker--visible');

        if (this._activeIncidentIndex === index) {
            this._activeIncidentIndex = null;
            this._currentBattle?.forceClose();
            this._currentBattle = null;
        }
    },

    // Bấm vào điểm bất ổn -> mở 1 trận đấu thật qua BattleManager
    _onIncidentClick(index) {
    if (!this._incidents.has(index)) return;
    if (this._activeIncidentIndex !== null) return;
    const data = this._incidents.get(index);
    clearInterval(data.intervalId);
    data.intervalId = null;
    this._startIncidentBattle(index);
},

    _startIncidentBattle(index) {
        this._activeIncidentIndex = index;

        // Random 1 loại boss từ pool — mỗi điểm bất ổn có thể khác nhau
        const cfg = INCIDENT_BOSS_POOL[Math.floor(Math.random() * INCIDENT_BOSS_POOL.length)];

        const incidentBoss = new Boss(cfg.name, cfg.hp, {
            level: cfg.level,
            zone: 'Khu vực bất ổn',

            playerDamageOnWrong: cfg.playerDamageOnWrong,
            timeLimitMs: cfg.timeLimitMs,

            color: cfg.color,
            icon: cfg.icon,
            image: cfg.image,
            rewards: cfg.rewards
        });
        cfg.abilities?.forEach(ability => {
            incidentBoss.addAbility(ability);
        });

        this._currentBattle = new BattleManager(incidentBoss, {
            onEnd:  () => this._onIncidentResolved(index, true),
            onFlee: () => this._onIncidentResolved(index, false),
        });
    },

    _onIncidentResolved(index, won) {
        this._activeIncidentIndex = null;
        this._currentBattle = null;
        this._removeIncident(index);

        if (won) {
            this._setValue(this._value - INSTABILITY_REWARD_PER_WIN);
        }
        // Thua/rút lui -> không trừ %, điểm bất ổn vẫn mất (không cho đánh lại y như cũ)
    },
};
