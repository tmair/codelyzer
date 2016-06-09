import {Match} from './match';
import {RefactorRuleWalker} from "../walker/refactorRuleWalker";

import * as ts from "typescript";

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

export class RuleFailurePosition {
  private position: number;
  private lineAndCharacter: ts.LineAndCharacter;

  constructor(position: number, lineAndCharacter: ts.LineAndCharacter) {
    this.position = position;
    this.lineAndCharacter = lineAndCharacter;
  }

  public getPosition() {
    return this.position;
  }

  public getLineAndCharacter() {
    return this.lineAndCharacter;
  }

  public toJson() {
    return {
      character: this.lineAndCharacter.character,
      line: this.lineAndCharacter.line,
      position: this.position,
    };
  }

  public equals(ruleFailurePosition: RuleFailurePosition) {
    const ll = this.lineAndCharacter;
    const rr = ruleFailurePosition.lineAndCharacter;

    return this.position === ruleFailurePosition.position
      && ll.line === rr.line
      && ll.character === rr.character;
  }
}

export class RuleFailure {
  private fileName: string;
  private startPosition: RuleFailurePosition;
  private endPosition: RuleFailurePosition;

  constructor(private sourceFile: ts.SourceFile,
        private start: number,
        private end: number,
        private failure: string,
        private ruleName: string) {}

  public getFileName() {
    return this.fileName;
  }

  public getRuleName() {
    return this.ruleName;
  }

  public getStartPosition(): RuleFailurePosition {
    return this.startPosition;
  }

  public getEndPosition(): RuleFailurePosition {
    return this.endPosition;
  }

  public getFailure() {
    return this.failure;
  }

  public toJson(): any {
    return {
      endPosition: this.endPosition.toJson(),
      failure: this.failure,
      name: this.fileName,
      ruleName: this.ruleName,
      startPosition: this.startPosition.toJson(),
    };
  }

  public equals(ruleFailure: RuleFailure) {
    return this.failure  === ruleFailure.getFailure()
      && this.fileName === ruleFailure.getFileName()
      && this.startPosition.equals(ruleFailure.getStartPosition())
      && this.endPosition.equals(ruleFailure.getEndPosition());
  }

  private createFailurePosition(position: number) {
    const lineAndCharacter = this.sourceFile.getLineAndCharacterOfPosition(position);
    return new RuleFailurePosition(position, lineAndCharacter);
  }
}

