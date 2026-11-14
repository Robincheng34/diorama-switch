/* diorama-switch · 一间房，一枚开关
   Copyright (C) 2026 Robincheng34

   本程序是自由软件：你可以依据自由软件基金会发布的 GNU 通用公共许可证
   第三版（或任何更新版本）的条款重新分发和/或修改它。完整条款见 LICENSE。
*/
/* 房间注册表：每个房间文件只做一件事 —— 把自己登记进来 */
const registry = new Map();

export function registerRoom(spec){
  if (!spec || !spec.id) throw new Error('room 需要一个 id');
  registry.set(spec.id, Object.freeze({
    gx: '50%', gy: '50%', wx: '18%', wy: '44%', accent: '#FFB25C', ...spec
  }));
  return spec.id;
}

export function getRoom(id){ return registry.get(id); }
export const ROOMS = new Proxy([], {
  get(_, k){
    const list = [...registry.values()];
    if (k === 'length') return list.length;
    if (typeof k === 'string' && /^\d+$/.test(k)) return list[Number(k)];
    return list[k];
  }
});
