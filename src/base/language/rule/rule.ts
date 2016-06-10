import {Match} from './match';
import {RefactorRuleWalker} from '../walker/refactor-rule-walker';

import * as ts from 'typescript';

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
  apply(sourceFile: ts.SourceFile): Match[];
  applyWithWalker(walker: RefactorRuleWalker): Match[];
}

