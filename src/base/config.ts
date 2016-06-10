import * as linter from './codelyzer';
import * as rules from './rules';
import {Match} from './language/rule/match';

export * from './language/rule/rule';
export * from './enable-disable-rules';
export * from './rule-loader';
export * from './language/utils';
export * from './language/language-service-host';
export * from './language/walker';

export var Configuration = configuration;
export var Linter = linter;
export var Rules = rules;
export var Test = test;

export interface CodelyzerResult {
  failureCount: number;
  matches: Match[];
  appliedFixes: string[];
  output: string;
}

export interface ICodelyzerOptionsRaw {
  rules_config?: {[ruleName: string]: any};
  rules_directories?: string[];
}

export interface ICodelyzerOptions extends ICodelyzerOptionsRaw {
  rules_config: {[ruleName: string]: any};
  rules_directories: string[];
}

