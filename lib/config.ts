import {Match} from './language';
import {Reporter} from './reporters/reporter';

export const DEFAULT_REPORTER = 'default';

export interface CodelyzerResult {
  matches: Match[];
  reporter: Reporter;
}

export interface ICodelyzerOptionsRaw {
  rules_config?: {[ruleName: string]: any};
  rules_directories?: string[];
  reporter?: string;
  reporters_directories?: string[];
}

export interface ICodelyzerOptions extends ICodelyzerOptionsRaw {
  rules_config: {[ruleName: string]: any};
  rules_directories: string[];
  reporter: string;
  reporters_directories: string[];
}

