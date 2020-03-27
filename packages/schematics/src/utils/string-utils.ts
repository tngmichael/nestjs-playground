import { plural, singular } from 'pluralize';
import { strings } from '@angular-devkit/core';

export function classifyOne(str: string): string {
  return strings.classify(singular(str));
}

export function classifyMany(str: string): string {
  return strings.classify(plural(str));
}

export function upperCase(str: string): string {
  return str.toUpperCase();
}

export { plural, singular };
