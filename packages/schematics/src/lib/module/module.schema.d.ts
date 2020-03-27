import { Path } from '@angular-devkit/core';

export interface ModuleOptions {
  name: string;
  path?: string | Path;
  module?: Path;
  skipImport?: boolean;
  metadata?: string;
  type?: string;
  language?: string;
  sourceRoot?: string;
  flat?: boolean;
}
