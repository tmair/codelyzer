import * as ts from 'typescript';
import {Fix} from './fix';

export class MatchPosition {
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

  public toJS() {
    return {
      character: this.lineAndCharacter.character,
      line: this.lineAndCharacter.line,
      position: this.position,
    };
  }

  public equals(ruleFailurePosition: MatchPosition) {
    const ll = this.lineAndCharacter;
    const rr = ruleFailurePosition.lineAndCharacter;

    return this.position === ruleFailurePosition.position
        && ll.line === rr.line
        && ll.character === rr.character;
  }
}


export class Match {
  startPosition: MatchPosition;
  endPosition: MatchPosition;

  constructor(private fixes: Fix[],
              private sourceFile: ts.SourceFile,
              private start: number,
              private end: number,
              private failure: string,
              private ruleName: string) {
      this.startPosition = this.createFailurePosition(start);
      this.endPosition = this.createFailurePosition(end);
  }
  private createFailurePosition(position: number) {
    const lineAndCharacter = this.sourceFile.getLineAndCharacterOfPosition(position);
    return new MatchPosition(position, lineAndCharacter);
  }
  public getStartPosition(): MatchPosition {
    return this.startPosition;
  }

  public getEndPosition(): MatchPosition {
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

  public hasFix() {
    return this.fixes && this.fixes.length > 0;
  }
}

