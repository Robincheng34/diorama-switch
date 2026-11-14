/* 赛博间 —— 霓虹 · 湿沥青 · 12㎡
   窗外在下雨，霓虹落在湿沥青上，屋里只有一盏琥珀台灯。
   只 import 这一个文件，就只会有这一间房。 */

import { registerRoom } from './registry.js';

registerRoom({
  id: 'cyber',
  name: '赛博间',
  spec: '霓虹 · 湿沥青 · 12㎡',
  gx: '78%', gy: '52%',      /* 灯的位置 */
  wx: '18%', wy: '42%',      /* 窗的方向 */
  accent: '#FFB25C',
  desc: '窗外在下雨，霓虹落在湿沥青上，屋里只有一盏琥珀台灯。',
  image: new URL('../../assets/room-cyber.jpg', import.meta.url).href,
});
