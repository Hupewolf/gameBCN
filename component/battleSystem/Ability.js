// Ability — Khuôn (base class) bắt buộc cho mọi kĩ năng / cơ chế gây nhiễu.
//
// Mỗi cơ chế (glitch, cuồng nộ, triệu hồi,...) phải extend từ Ability và
// BUỘC PHẢI viết lại check(boss). Vì check() ở lớp cha luôn throw Error,
// nên nếu lớp con quên định nghĩa thì gọi tới sẽ báo lỗi ngay -> ép code
// theo khuôn OOP, không tự bịa cấu trúc khác.
//
// start()/stop() có sẵn hành vi mặc định (chỉ log ra console) -> lớp con
// CÓ THỂ ghi đè nếu muốn, không bắt buộc như check().
//
// Cách tạo 1 cơ chế mới, ví dụ trong abilities.js:
//
//   class GlitchEffect extends Ability {
//       constructor() { super('Nhiễu sóng'); }
//       check(boss) { return boss.hp <= boss.maxHp * 0.5; }
//       start() { /* code hiệu ứng glitch */ }
//       stop()  { /* tắt hiệu ứng glitch */ }

export class Ability {
    constructor(name) {
        this.name = name;
        this.isActive = false; // Boss sẽ tự cập nhật cờ này khi check() đổi kết quả
        this.boss = null;      // Boss.addAbility() sẽ gắn ngược lại boss vào đây
    }

    // Điều kiện để cơ chế này kích hoạt. BẮT BUỘC lớp con phải ghi đè.
    // @param {*} boss - thường là chính con Boss đang chứa ability này
    // @returns {boolean}
    
    check(boss) {
        throw new Error(`Ability "${this.name}" chưa định nghĩa hàm check(boss)!`);
    }

    //Được gọi khi check() chuyển từ false -> true (cơ chế bắt đầu kích hoạt)
    start() {
        console.log(this.name + ' kích hoạt');
    }

    //Được gọi khi check() chuyển từ true -> false (cơ chế dừng lại)
    stop() {
        console.log(this.name + ' dừng lại');
    }
}
