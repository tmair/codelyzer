import {Match} from './language';
import {Formatter} from './formatters/formatter';
import {Reporter} from './reporters/reporter';

export const DEFAULT_REPORTER = 'default';
export const DEFAULT_FORMATTER = 'compact';

export const DEFAULT_REPORTERS_DIR = 'reporters';
export const DEFAULT_FORMATTERS_DIR = 'formatters';

export interface CodelyzerResult {
  matches: Match[];
  reporter: Reporter;
  formatter: Formatter;
}

export interface ICodelyzerRuleOption {
  [ruleName: string]: any[] | boolean;
}

export interface ICodelyzerOptionsRaw {
  rules_config?: ICodelyzerRuleOption;
  rules_directories?: string[];
  reporter?: string;
  reporters_directories?: string[];
  formatter?: string;
  formatters_directories?: string[];
}

export interface ICodelyzerOptions extends ICodelyzerOptionsRaw {
  rules_config: ICodelyzerRuleOption;
  rules_directories: string[];
  reporter: string;
  reporters_directories: string[];
  formatter: string;
  formatters_directories: string[];
}

