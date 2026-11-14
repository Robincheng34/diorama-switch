/* 工作间 —— 5600K · 窗朝东 · 12㎡
   琥珀台灯在右手边，窗朝东，清晨六点四十的阳光斜切进来。
   只 import 这一个文件，就只会有这一间房。 */

import { registerRoom } from './registry.js';

registerRoom({
  id: 'work',
  name: '工作间',
  spec: '5600K · 窗朝东 · 12㎡',
  gx: '47%', gy: '52%',      /* 灯的位置 */
  wx: '16%', wy: '44%',      /* 窗的方向 */
  accent: '#FFB25C',
  desc: '清晨六点四十的阳光斜切进来，台灯还熄着。',
  image: new URL('../../assets/room-work.jpg', import.meta.url).href,
});
