import {IDisabledInterval} from '../language';
import {UsePropertyDecorator} from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  constructor(ruleName: string, value: any, disabledIntervals: IDisabledInterval[]) {
    super({
      decoratorName: ['HostBindings', 'HostListeners'],
      propertyName: 'host',
      errorMessage: 'Use @HostBindings and @HostListeners instead of the host property ($$06-03$$)'
    }, ruleName, value, disabledIntervals);
  }
}
