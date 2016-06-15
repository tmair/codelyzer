import * as ts from 'typescript';

import {RuleFailure} from './match';
import {RuleWalker} from '../walker';

export interface IOptions {
  ruleArguments?: any[];
  ruleName: string;
  disabledIntervals: IDisabledInterval[];
}

export interface IDisabledInterval {
  startPosition: number;
  endPosition: number;
}

export interface IRule {
  getOptions(): IOptions;
  isEnabled(): boolean;
  apply(sourceFile: ts.SourceFile): RuleFailure[];
  applyWithWalker(walker: RuleWalker): RuleFailure[];
}

