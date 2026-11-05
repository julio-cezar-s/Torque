export const paraCamel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
