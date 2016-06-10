import {Reporter} from './reporter';
import {Match, Fix} from '../language';
const inquirer = require('inquirer');
const chalk = require('chalk');

const getFixDescription = (fix: Fix) => {
  return fix.description;
};

const getConfirmMessage = (match: Match, message: string, filename: string) => {
  const fixes = match.fixes;
  const showFixes = fixes.length > 0;
  return [
    {
      type: 'checkbox',
      message: message,
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
  report(match: Match, lintOnly: boolean = false): Promise<any> {
    const fixes = match.fixes;
    const showFixes = fixes.length > 0;
    const filename = match.getFileName();
    let message = chalk.red(match.getFailure());
    if (!showFixes || lintOnly) {
      console.log(message);
      return Promise.resolve([]);
    }
    message += `\n  Which fixes do you want to apply in in file "${filename}":`
    return inquirer.prompt(getConfirmMessage(match, message, filename));
  }
}

