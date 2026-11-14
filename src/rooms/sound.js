/* 声音间 —— 2700K · 台灯在右 · 8㎡
   李子紫吸音墙上挂满唱片，整间房只有一盏灯亮着。
   只 import 这一个文件，就只会有这一间房。 */

import { registerRoom } from './registry.js';

registerRoom({
  id: 'sound',
  name: '声音间',
  spec: '2700K · 台灯在右 · 8㎡',
  gx: '79%', gy: '54%',      /* 灯的位置 */
  wx: '13%', wy: '40%',      /* 窗的方向 */
  accent: '#FFB25C',
  desc: '李子紫吸音墙上挂满唱片，整间房只有一盏灯亮着。',
  image: new URL('../../assets/room-sound.jpg', import.meta.url).href,
});
