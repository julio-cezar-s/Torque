export const paraSnake = (k) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
