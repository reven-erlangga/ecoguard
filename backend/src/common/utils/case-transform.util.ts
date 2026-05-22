export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

export const toSnakeCase = (str: string): string => {
  // Handle edge cases where string might start with uppercase or have consecutive uppercase
  return str
    .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    .replace(/^_/, ''); // Remove leading underscore if the original string started with an uppercase letter
};

export const transformKeys = (obj: any, transformer: (key: string) => string): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformer));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const transformedKey = transformer(key);
      result[transformedKey] = transformKeys(obj[key], transformer);
      return result;
    }, {} as any);
  }
  return obj;
};

export const keysToCamelCase = (obj: any): any => transformKeys(obj, toCamelCase);
export const keysToSnakeCase = (obj: any): any => transformKeys(obj, toSnakeCase);
