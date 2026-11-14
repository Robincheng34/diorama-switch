/* 房间注册表：每个房间文件只做一件事 —— 把自己登记进来 */

const registry = new Map();

/** 已注册房间的实时数组（注册时往里 push，顺序即注册顺序） */
export const ROOMS = [];

export function registerRoom(spec){
  if (!spec || !spec.id) throw new Error('room 需要一个 id');
  const room = Object.freeze({ gx: '50%', gy: '50%', wx: '18%', wy: '44%', accent: '#FFB25C', ...spec });
  if (registry.has(room.id)){
    registry.set(room.id, room);                       /* 重复注册：就地替换，不重复入列 */
    return room.id;
  }
  registry.set(room.id, room);
  ROOMS.push(room);
  return room.id;
}

export function getRoom(id){ return registry.get(id); }
