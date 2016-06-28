import {Reporter} from './reporter';
import {RuleFailure, Fix} from '../language';
import * as chalk from 'chalk';

const inquirer = require('inquirer');

const getFixDescription = (fix: Fix) => {
  return fix.description;
};

const getConfirmMessage = (match: RuleFailure, message: string, filename: string) => {
  const fixes = match.fixes;
  const showFixes = fixes.length > 0;
  return [
    {
      type: 'confirm',
      message: message,
      name: 'refactoring',
    }
  ]
};

export class DefaultReporter extends Reporter {
  report(match: RuleFailure, lintOnly: boolean = false): Promise<any> {
    const fixes = match.fixes;
    const showFixes = fixes.length > 0;
    const filename = match.getFileName();
    let message = chalk.red(match.getFailure());
    if (!showFixes || lintOnly) {
      console.log(message);
      return Promise.resolve([]);
    }
    message += `\n  Do you want to apply the following fixes in "${filename}":\n`
    message += match.fixes.map(f => `\t${f.description}`).join('\n');
    return new Promise((resolve: any, reject: any) => {

      inquirer.prompt(getConfirmMessage(match, message, filename)).then((res: any) => {
        if (res.refactoring) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }
}

