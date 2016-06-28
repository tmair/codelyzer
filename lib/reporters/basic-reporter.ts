import {Reporter} from './reporter';
import {RuleFailure} from '../language';

export class BasicReporter extends Reporter {
  report(match: RuleFailure): Promise<any> {
    return Promise.resolve([]);
  }
}

