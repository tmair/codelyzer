import {IDisabledInterval} from '../language';

import {UsePropertyDecorator} from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  constructor(ruleName: string, value: any, disabledIntervals: IDisabledInterval[]) {
    super({
      decoratorName: 'Output',
      propertyName: 'outputs',
      errorMessage: 'Use the @Output property decorator instead of the outputs property ($$05-12$$)'
    }, ruleName, value, disabledIntervals);
  }
}
