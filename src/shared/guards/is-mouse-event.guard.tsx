export const isMouseEvent = (
  item: MouseEvent | TouchEvent,
): item is MouseEvent => {
  const events = ['mousedown', 'mousemove', 'mouseup', 'mouseover', 'mouseout'];
  return events.includes(item.type);
};
