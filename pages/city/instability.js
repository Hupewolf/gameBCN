// chỉnh chỉ số
const MAX_INSTABILITY = 100; //chỉ số bất ổn tối đa là 100%
const INSTABILITY_INCREASE_INTERVAL_MS = 10_000; // số giây để độ bất ổn tăng 1%
const SPAWN_CHECK_INTERVAL_MS = 10_000;          // số giây để hiện địa điểm bất ổn (nếu còn slot trống)
const MAX_VISIBLE_INCIDENTS = 3;                 // số điểm tối đa điểm bất ổn xuất hiện
const INCIDENT_DURATION_RANGE_MS = [45_000, 90_000]; // thời gian duy trì điểm bất ổn

const INCIDENT_POSITIONS = [
    { top: 30, left: 30 }, // góc trên-trái
    { top: 30, left: 88 }, // góc trên-phải
    { top: 46, left: 14 }, // giữa-trái
    { top: 66, left: 20 }, // dưới-trái
    { top: 60, left: 80 }, // dưới mép-phải
    { top: 60, left: 90 }, // mép phải
];

// đáp án đúng để ở vị trí 0 xong cho nó random
const QUIZ_BANK = [
    {
        question: '1+1=?',
        options: ['2', '1', '3', '67'],
        correct: 0,
    },
    {
        question: 'Ai là người đẹp trai nhất?',
        options: ['Nguyễn Trọng Nhân', 'Văn A', 'Văn B', 'Văn C'],
        correct: 0,
    },
    {
        question: 'bạn Lan là ai?',
        options: ['Lan', 'không biết', 'hmm', 'ai'],
        correct: 0,
    },
    {
        question: 'chọn phương án đúng?',
        options: ['Nhân depzai', 'trái đất hình dẹp', 'biển vị ngọt', 'anhmatemroi'],
        correct: 0,
    },
];

export const InstabilitySystem = {
    _value: 0,
    _incidents: new Map(),
    _activeQuizIndex: null,

    init(startValue = 0) {
        this._renderPanel();
        this._renderMarkers();
        this._renderQuizModal();
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

    _removeIncident(index) {
        const data = this._incidents.get(index);
        if (data) clearInterval(data.intervalId);
        this._incidents.delete(index);
        document.querySelector(`.incident-marker[data-index="${index}"]`)
            ?.classList.remove('incident-marker--visible');
    },

    // Câu trắc nghiệm khi click vào điểm báo động
    _renderQuizModal() {
        if (document.getElementById('quiz-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'quiz-modal';
        modal.className = 'quiz-modal';
        modal.innerHTML = `
            <div class="quiz-modal__box">
                <div class="quiz-modal__header">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>Sự cố bất ổn</span>
                </div>
                <p class="quiz-modal__question" id="quiz-question"></p>
                <div class="quiz-modal__options" id="quiz-options"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this._closeQuiz();
        });
    },

    _onIncidentClick(index) {
        if (!this._incidents.has(index)) return;
        this._openQuiz(index);
    },

    _openQuiz(index) {
        const quiz = QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)];
        const modal = document.getElementById('quiz-modal');
        const questionEl = document.getElementById('quiz-question');
        const optionsEl = document.getElementById('quiz-options');
        if (!modal || !questionEl || !optionsEl) return;

        // Xáo vị trí đáp án mỗi lần mở, để đáp án đúng không phải lúc nào cũng nằm cố định 1 chỗ
        const shuffled = quiz.options
            .map((text, i) => ({ text, isCorrect: i === quiz.correct }))
            .sort(() => Math.random() - 0.5);

        questionEl.textContent = quiz.question;
        optionsEl.innerHTML = '';
        shuffled.forEach(({ text, isCorrect }) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-modal__option';
            btn.textContent = text;
            btn.addEventListener('click', () => this._answerQuiz(index, isCorrect, btn));
            optionsEl.appendChild(btn);
        });

        this._activeQuizIndex = index;
        modal.classList.add('quiz-modal--visible');
    },

    _answerQuiz(index, isCorrect, btnEl) {
        // Khoá hết nút lại để tránh bấm nhiều lần trong lúc đang hiện kết quả
        const optionsEl = document.getElementById('quiz-options');
        optionsEl?.querySelectorAll('.quiz-modal__option').forEach((b) => (b.disabled = true));

        if (isCorrect) {
            // Trả lời ĐÚNG -> điểm báo động biến mất + giảm 1% độ bất ổn
            btnEl.classList.add('quiz-modal__option--correct');
            setTimeout(() => {
                this._closeQuiz();
                this._removeIncident(index);
                this._setValue(this._value - 1);
            }, 400);
        } 
        else {
            // Trả lời SAI -> không trừ %, nhưng điểm báo động vẫn mất luôn (không cho làm lại)
            btnEl.classList.add('quiz-modal__option--wrong');
            setTimeout(() => {
                this._closeQuiz();
                this._removeIncident(index);
            }, 500);
        }
    },

    _closeQuiz() {
        const modal = document.getElementById('quiz-modal');
        modal?.classList.remove('quiz-modal--visible');
        document.getElementById('quiz-options')
            ?.querySelectorAll('.quiz-modal__option')
            .forEach((b) => (b.disabled = false));
        this._activeQuizIndex = null;
    },
};
