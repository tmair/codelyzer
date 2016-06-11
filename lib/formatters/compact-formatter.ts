import * as chalk from 'chalk';
import {Match} from '../language';
import {Formatter} from './formatter';

export class CompactFormatter extends Formatter {
  format(matches: Match[]): string {
    return matches
      .reduce((accum: string, current: Match) => accum + this.formatMatch(current), '');
  }
  private formatMatch(match: Match) {
    const l = match.getStartPosition().getLineAndCharacter();
    return `(${l.line + 1}, ${l.character + 1})${match.getFileName()}: ${chalk.yellow(match.getFailure())}\n`
  }
}

