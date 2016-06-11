import {Match} from '../language';

export abstract class Formatter {
  abstract format(matches: Match[]): string;
}

