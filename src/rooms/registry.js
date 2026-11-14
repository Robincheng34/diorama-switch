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
