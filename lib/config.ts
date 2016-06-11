import {Match} from './language';
import {Formatter} from './formatters/formatter';
import {Reporter} from './reporters/reporter';

export const DEFAULT_REPORTER = 'default';
export const DEFAULT_FORMATTER = 'compact';

export interface CodelyzerResult {
  matches: Match[];
  reporter: Reporter;
  formatter: Formatter;
}

export interface ICodelyzerOptionsRaw {
  rules_config?: {[ruleName: string]: any};
  rules_directories?: string[];
  reporter?: string;
  reporters_directories?: string[];
  formatter?: string;
  formatters_directories?: string[];
}

export interface ICodelyzerOptions extends ICodelyzerOptionsRaw {
  rules_config: {[ruleName: string]: any};
  rules_directories: string[];
  reporter: string;
  reporters_directories: string[];
  formatter: string;
  formatters_directories: string[];
}

