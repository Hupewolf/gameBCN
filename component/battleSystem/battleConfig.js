export const QUESTION_TIME_LIMIT_MS = 10_000;
export const MAX_DELAY_MS           = 3_000;
export const DAMAGE_PER_CORRECT     = 25;
export const PLAYER_MAX_HP          = 100;
export const INSTABILITY_REWARD_PER_WIN = 1;

// color  : giá trị RGB (không có #) dùng trong CSS rgba(var(--battle-accent), opacity)
// icon   : Font Awesome class — thay icon skull mặc định
import { GlitchEffect } from './abilities.js';

export const INCIDENT_BOSS_POOL = [
    // {
    //     name: 'bé boss cute',
    //     hp: 50, level: 1,
    //     playerDamageOnWrong: 10,
    //     timeLimitMs: 10_000,
    //     color: '56, 189, 248',      // sky blue
    //     icon:  'fa-skull',
    // },
    {
        name: 'boss lửa',
        hp: 100, level: 8,
        playerDamageOnWrong: 20,
        timeLimitMs: 10_000,
        color: '251, 146, 60',      // orange
        icon:  'fa-fire',
        // scr: '../../img/character/images-removebg-preview.png',
    },
    {
        name: 'Boss bé bự(con này thì khi máu boss dưới 50% nó có hiệu giật giật)',
        hp: 100, level: 15,
        playerDamageOnWrong: 25,
        timeLimitMs: 10_000,
        color: '192, 38, 211',      // purple
        icon:  'fa-bolt',
        abilities: [
            new GlitchEffect(0.5)
        ]
    },
];
