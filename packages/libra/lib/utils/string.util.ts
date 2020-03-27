import { plural, singular } from 'pluralize';

export const decapitalize = (str: string): string => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

export const join = (arr: Array<string>): string =>
  arr.filter(Boolean).join('\n');

export const addIndent = (str: string | string[]): string =>
  join(
    (Array.isArray(str) ? str : str.split('\n'))
      .filter(Boolean)
      .map((str) => `  ${str}`),
  );

export { plural, singular };
