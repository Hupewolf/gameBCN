// ==========================================================================
// DialogueSystem — Hệ thống cốt truyện / hộp thoại (visual novel style)
// Chuyển từ demo Cottruyen_1.html sang dạng component dùng chung cho cả game.
// Cách dùng ở bất kỳ trang nào:
//
//   import { DialogueSystem } from '../../component/dialogueSystem/dialogue.js';
//
//   DialogueSystem.play([
//       { speaker: 'Hệ Thống', text: '...', avatar: '' },
//       { speaker: 'Nyx', text: '...', avatar: '../../img/characters/nyx.png' },
//   ], () => {
//       console.log('Cốt truyện kết thúc, làm gì tiếp theo thì code ở đây');
//   });
// ==========================================================================

export const DialogueSystem = {
    _index: 0,
    _data: [],
    _initialized: false,
    _onEndCallback: null,

    init() {
        if (this._initialized) return;
        this._render();
        this._bindEvents();
        this._initialized = true;
    },

    _render() {
        if (document.getElementById('dialogue-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'dialogue-overlay';
        overlay.className = 'dialogue-overlay';
        overlay.innerHTML = `
            <button class="dialogue-skip-btn" id="dialogue-skip-btn">Bỏ qua ✕</button>

            <div class="dialogue-character-stage">
                <img id="dialogue-character-avatar" class="dialogue-character-avatar dialogue-hidden" src="">
            </div>

            <div class="dialogue-box" id="dialogue-box">
                <div class="dialogue-speaker" id="dialogue-speaker">SYSTEM</div>
                <div class="dialogue-text" id="dialogue-text"></div>
                <div class="dialogue-next-indicator">▼</div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    _bindEvents() {
        // Click vào hộp thoại để qua câu tiếp theo
        document.getElementById('dialogue-box')
            ?.addEventListener('click', () => this._next());

        // Nút bỏ qua toàn bộ cốt truyện
        document.getElementById('dialogue-skip-btn')
            ?.addEventListener('click', (e) => {
                e.stopPropagation();
                this._end();
            });
    },

    /**
     * Bắt đầu chạy 1 mạch cốt truyện.
     * @param {Array<{speaker:string, text:string, avatar?:string}>} lines
     * @param {Function} [onEnd] callback chạy khi cốt truyện kết thúc (hoặc bị bỏ qua)
     */
    play(lines, onEnd) {
        if (!this._initialized) this.init();

        this._data = Array.isArray(lines) ? lines : [];
        this._index = 0;
        this._onEndCallback = typeof onEnd === 'function' ? onEnd : null;

        document.getElementById('dialogue-overlay')?.classList.add('dialogue-overlay--visible');
        this._renderLine();
    },

    _next() {
        this._index++;
        this._renderLine();
    },

    _renderLine() {
        if (this._index >= this._data.length) {
            this._end();
            return;
        }

        const line = this._data[this._index];
        const speakerEl = document.getElementById('dialogue-speaker');
        const textEl = document.getElementById('dialogue-text');
        const avatarEl = document.getElementById('dialogue-character-avatar');

        if (speakerEl) speakerEl.textContent = line.speaker || '';
        if (textEl) textEl.textContent = line.text || '';
        if (!avatarEl) return;

        if (line.avatar) {
            // Có ảnh nhân vật -> hiện ra
            avatarEl.src = line.avatar;
            avatarEl.classList.remove('dialogue-hidden', 'dialogue-character--fade');
        } 
        
        else {
            // Không có ảnh (lời dẫn/hệ thống) -> mờ dần rồi ẩn hẳn
            avatarEl.classList.add('dialogue-character--fade');
            setTimeout(() => {
                if (avatarEl.classList.contains('dialogue-character--fade')) {
                    avatarEl.classList.add('dialogue-hidden');
                }
            }, 300);
        }
        
    },

    _end() {
        document.getElementById('dialogue-overlay')?.classList.remove('dialogue-overlay--visible');
        document.getElementById('dialogue-character-avatar')?.classList.add('dialogue-hidden');

        const cb = this._onEndCallback;
        this._onEndCallback = null;
        if (cb) cb();
    },
};


