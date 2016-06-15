import * as ts from 'typescript';
import {RuleWalker} from '../walker';
import {RuleFailure, IOptions, IRule, IDisabledInterval} from './';

export abstract class AbstractRule implements IRule {
  private options: IOptions;

  constructor(ruleName: string, private value: any, disabledIntervals: IDisabledInterval[]) {
    let ruleArguments: any[] = [];

    if (Array.isArray(value) && value.length > 1) {
      ruleArguments = value.slice(1);
    }

    this.options = {
      disabledIntervals: disabledIntervals,
      ruleArguments: ruleArguments,
      ruleName: ruleName,
    };
  }

  public getOptions(): IOptions {
    return this.options;
  }

  public setDisabledIntervals(di: IDisabledInterval[]) {
    this.options.disabledIntervals = di;
  }

  public abstract apply(sourceFile: ts.SourceFile): RuleFailure[];

  public applyWithWalker(walker: RuleWalker): RuleFailure[] {
    walker.walk(walker.getSourceFile());
    return walker.getMatches();
  }

  public isEnabled(): boolean {
    const value = this.value;

    if (typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }

    return false;
  }
}

