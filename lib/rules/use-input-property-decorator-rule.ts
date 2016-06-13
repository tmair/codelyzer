import {UsePropertyDecorator} from './propertyDecoratorBase';

import {IDisabledInterval} from '../language';

export class UseInputPropertyDecoratorRule extends UsePropertyDecorator {
  constructor(ruleName: string, value: any, disabledIntervals: IDisabledInterval[]) {
    super({
      decoratorName: 'Input',
      propertyName: 'inputs',
      errorMessage: 'Use the @Input property decorator instead of the inputs property ($$05-12$$)'
    }, ruleName, value, disabledIntervals);
  }
}

