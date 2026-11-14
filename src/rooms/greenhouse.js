/* 温室 —— 逆光 · 热带 · 16㎡
   穹顶逆光，尘土在光柱里浮着，叶子全都是半透明的。
   只 import 这一个文件，就只会有这一间房。 */

import { registerRoom } from './registry.js';

registerRoom({
  id: 'greenhouse',
  name: '温室',
  spec: '逆光 · 热带 · 16㎡',
  gx: '50%', gy: '30%',      /* 灯的位置 */
  wx: '56%', wy: '34%',      /* 窗的方向 */
  accent: '#FFB25C',
  desc: '穹顶逆光，尘土在光柱里浮着，叶子全是半透明的。',
  image: new URL('../../assets/room-greenhouse.jpg', import.meta.url).href,
});
