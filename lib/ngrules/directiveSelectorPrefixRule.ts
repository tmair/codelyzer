import {SelectorRule, COMPONENT_TYPE} from './selectorNameBase';
import {SelectorValidator} from './util/selectorValidator';
import {IDisabledInterval} from '../language';

const FAILURE_STRING = 'The selector of the directive "%s" should have prefix "%s" ($$02-08$$)';

export class Rule extends SelectorRule {
  constructor(ruleName: string, value: any, disabledIntervals: IDisabledInterval[]) {
    super(ruleName, value, disabledIntervals, SelectorValidator.prefix(value[1]), FAILURE_STRING, COMPONENT_TYPE.DIRECTIVE);
  }
}
