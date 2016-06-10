import {Reporter} from './reporter';
import {Match, Fix} from '../language';
const inquirer = require('inquirer');

const getFixDescription = (fix: Fix) => {
  return fix.description;
};

const getConfirmMessage = (fixes: Fix[], filename: string) => {
  return [
    {
      type: 'checkbox',
      message: `Which fixes do you want to apply in in file "${filename}":`,
      name: 'refactoring',
      choices: fixes.map(f => {
        return {
          name: getFixDescription(f)
        };
      })
    }
  ]
};

export class DefaultReporter extends Reporter {
  report(match: Match): Promise<any> {
    return inquirer.prompt(getConfirmMessage(match.fixes, match.getFileName()));
  }
}

