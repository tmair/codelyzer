import * as ts from 'typescript';
import {Fix} from './fix';

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


export class Match {
  fixes: Fix[];
  sourceFile: ts.SourceFile;
  fileName: string;
  startPosition: RuleFailurePosition;
  endPosition: RuleFailurePosition;
  failure: string;
  ruleName: string;

  constructor(fixes: Fix[],
              sourceFile: ts.SourceFile,
              start: number,
              end: number,
              failure: string,
              ruleName: string) {
      this.fixes = fixes;
      this.sourceFile = sourceFile;
      this.fileName = sourceFile.fileName;
      this.startPosition = this.createFailurePosition(start);
      this.endPosition = this.createFailurePosition(end);
      this.failure = failure;
      this.ruleName = ruleName;
  }
  private createFailurePosition(position: number) {
      const lineAndCharacter = this.sourceFile.getLineAndCharacterOfPosition(position);
      return new RuleFailurePosition(position, lineAndCharacter);
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

  public equals(match: Match) {
    return this.failure === match.failure &&
      this.startPosition.equals(match.startPosition) &&
      this.endPosition.equals(match.endPosition);
  }
}

