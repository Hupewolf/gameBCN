import { playerState } from './state/playerState.js';
import { GameHeader }  from './components/GameHeader.js';

// Export để pages dùng, không tự render ở đây
// vì mỗi trang có option khác nhau (showHamburger, v.v.)
export { playerState, GameHeader };
