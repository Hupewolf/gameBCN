// Boss — định nghĩa 1 con boss: máu, kĩ năng (abilities), trạng thái sống/chết.
//
// Boss extends EventTarget để bắn ra các event ('damage', 'death',
// 'abilityStart', 'abilityStop'). Nhờ vậy, MỘT hành động (vd: trúng đòn)
// có thể kích hoạt NHIỀU việc cùng lúc ở phía UI (số sát thương bay lên,
// ảnh boss giật giật, tiếng chém,...) mà Boss không cần biết UI là gì —
// đúng kiểu "sự kiện chạy hết cả đống cùng lúc" mà anh nói.
//
// Cách dùng:
//   const boss = new Boss('Quỷ ghê lém', 200, { level: 25 });
//   boss.addAbility(new GlitchEffect());
//   boss.addEventListener('damage', (e) => console.log(e.detail));
//   boss.addEventListener('death', () => console.log('Boss đã chết'));
//   boss.takeDamage(25)

export class Boss extends EventTarget {
    
    // @param {string} name
    // @param {number} hp
    // @param {{level?:number, zone?:string, image?:string, rewards?:object}} options
    
    constructor(name, hp, options = {}) {
        super();
        this.name = name;
        this.hp = this.maxHp = hp;

        this.level = options.level ?? 1;
        this.zone = options.zone ?? '';
        this.image = options.image ?? '';
        this.rewards = options.rewards ?? {};

        this.abilities = [];
        this.status = 'alive'; // 'alive' | 'dead'

        // Chỉ số dùng trong trận đấu — BattleManager đọc từ đây
        this.playerDamageOnWrong = options.playerDamageOnWrong ?? 15;
        this.timeLimitMs         = options.timeLimitMs ?? null;
        this.color               = options.color ?? '220, 38, 38'; // RGB string cho CSS var
        this.icon                = options.icon  ?? 'fa-skull';
    }

    // Thêm 1 kĩ năng/cơ chế (instance của Ability hoặc lớp con) vào boss 
    addAbility(ability) {
        ability.boss = this;
        this.abilities.push(ability);
        return this; // cho phép chain: boss.addAbility(a).addAbility(b)
    }

    
    // Soát lại toàn bộ kĩ năng sau mỗi hành động (nhận damage, hết giờ,...).
    // Chỉ gọi start()/stop() đúng 1 lần tại thời điểm check() ĐỔI kết quả
    // (false->true hoặc true->false), tránh việc start() bị gọi lặp lại
    // liên tục mỗi lần updateMechanics() chạy.
    // @param {*} context - dữ liệu để ability.check() xét điều kiện, mặc định là chính boss
    
    updateMechanics(context = this) {
        this.abilities.forEach((ability) => {
            const shouldBeActive = !!ability.check(context);

            if (shouldBeActive && !ability.isActive) {
                ability.isActive = true;
                ability.start();
                this.dispatchEvent(new CustomEvent('abilityStart', { detail: { ability } }));
            } else if (!shouldBeActive && ability.isActive) {
                ability.isActive = false;
                ability.stop();
                this.dispatchEvent(new CustomEvent('abilityStop', { detail: { ability } }));
            }
        });
    }

    
    // Nhận sát thương. Máu không bao giờ bị âm (clamp về 0).
    // Sau khi trừ máu: bắn event 'damage' (UI tự lo phần hiển thị),
    // soát lại abilities, rồi mới kiểm tra sống/chết.
    
    takeDamage(amount) {
        if (this.status === 'dead') return; // boss chết rồi thì bỏ qua, không trừ máu chồng chéo

        const dmg = Math.max(0, Math.round(amount));
        this.hp = Math.max(0, this.hp - dmg); // chặn không cho âm máu

        this.dispatchEvent(new CustomEvent('damage', {
            detail: { amount: dmg, hp: this.hp, maxHp: this.maxHp },
        }));

        this.updateMechanics();
        this._checkStatus();
    }

    //Hồi máu (dùng nếu sau này có cơ chế boss tự hồi) — không vượt quá maxHp
    heal(amount) {
        if (this.status === 'dead') return;
        this.hp = Math.min(this.maxHp, this.hp + Math.max(0, Math.round(amount)));
        this.dispatchEvent(new CustomEvent('heal', { detail: { hp: this.hp, maxHp: this.maxHp } }));
    }

    
    // Kiểm tra trạng thái sống/chết. Chỉ bắn event 'death' đúng 1 LẦN
    // tại thời điểm chuyển từ alive -> dead (nếu đã dead thì bỏ qua,
    // không lặp lại việc remove/drop đồ nhiều lần).
    
    _checkStatus() {
        const isDead = this.hp <= 0;

        if (isDead && this.status !== 'dead') {
            this.status = 'dead';
            this.dispatchEvent(new CustomEvent('death', { detail: { boss: this } }));
        } else if (!isDead) {
            this.status = 'alive';
        }
        // Nếu vừa dead vừa hp > 0 thì không rơi vào nhánh nào -> giữ nguyên trạng thái cũ
    }

    //Reset lại trạng thái để đánh lại từ đầu (vd: thua/thắng rồi vào lại trận)
    reset() {
        this.hp = this.maxHp;
        this.status = 'alive';
        this.abilities.forEach((ability) => {
            if (ability.isActive) {
                ability.isActive = false;
                ability.stop();
            }
        });
    }
}
