// questionBank.js — Ngân hàng câu hỏi trắc nghiệm dùng cho gameLoop trận đấu.
// Đây là dữ liệu mẫu, sau này có thể đổi getRandomQuestion() để gọi API thật.

export const questionBank = [
    {
        question: '1+1?',
        choices: ['2', '3', '4', '5'],
        correctIndex: 0,
    },
    {
        question: 'a..c?',
        choices: ['g', 'b', 's', 'l'],
        correctIndex: 1,
    },
    {
        question: 'hihi tìm?',
        choices: ['haha', 'bubu', 'hihi', 'dede'],
        correctIndex: 2,
    },
    {
        question: '"hở?',
        choices: ['.', 'câu này đúng', '..', 'f'],
        correctIndex: 1,
    },
    {
        question: 'Nhân?',
        choices: [
            '?',
            '!',
            "Nhân",
            '...',
        ],
        correctIndex: 2,
    },
];

// Lấy ngẫu nhiên 1 câu hỏi khác với câu trước đó (tránh ra trùng câu liên tiếp).
// @param {number} excludeIndex - index câu hỏi vừa hỏi trước đó, mặc định -1 (không loại trừ)
// @returns {{question:string, choices:string[], correctIndex:number, _index:number} | null}

export function getRandomQuestion(excludeIndex = -1) {
    if (questionBank.length === 0) return null;

    let idx = 0;
    if (questionBank.length === 1) {
        idx = 0;
    } else {
        do {
            idx = Math.floor(Math.random() * questionBank.length);
        } while (idx === excludeIndex);
    }

    return { ...questionBank[idx], _index: idx };
}
