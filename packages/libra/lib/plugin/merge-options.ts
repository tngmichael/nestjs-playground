import { isString } from '@nestjs/common/utils/shared.utils';

export interface PluginOptions {
  typeFileNameSuffix?: string | string[];
}

const defaultOptions: PluginOptions = {
  typeFileNameSuffix: [
    // '.input.ts',
    // '.args.ts',
    '.entity.ts',
  ],
};

export const mergePluginOptions = (
  options: Record<string, any> = {},
): PluginOptions => {
  if (isString(options.typeFileNameSuffix)) {
    options.typeFileNameSuffix = [options.typeFileNameSuffix];
  }
  return {
    ...defaultOptions,
    ...options,
  };
};
