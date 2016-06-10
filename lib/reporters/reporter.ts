import {Match} from '../language';

export abstract class Reporter {
  abstract report(matches: Match): Promise<any>;
}

