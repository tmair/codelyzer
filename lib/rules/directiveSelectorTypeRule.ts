import {SelectorRule, COMPONENT_TYPE} from './selectorNameBase';
import {SelectorValidator} from './util/selectorValidator';
import {IDisabledInterval} from '../language';

// TODO change the code
const FAILURE_STRING = 'The selector of the directive "%s" should be used as %s ($$02-06$$)';

export class Rule extends SelectorRule {
  constructor(ruleName: string, value: any, disabledIntervals: IDisabledInterval[]) {
    super(ruleName, value, disabledIntervals, SelectorValidator[value[1]], FAILURE_STRING, COMPONENT_TYPE.DIRECTIVE);
  }
}
