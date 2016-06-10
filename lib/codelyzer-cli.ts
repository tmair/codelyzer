import * as fs from 'fs';
import * as glob from 'glob';
import {Replacement, Fix} from './language/rule/fix';
import {Codelyzer} from './codelyzer';
import {findConfiguration} from './utils';

const argv = require('yargs').argv;
const inquirer = require('inquirer');
const chalk = require('chalk');

const getFixDescription = (fix: Fix, contents: string) => {
  return fix.description;
};

const getConfirmMessage = (fixes: Fix[], filename: string, contents: string) => {
  return [
    {
      type: 'checkbox',
      message: `Which fixes do you want to apply in in file ${filename}:`,
      name: 'refactoring',
      choices: fixes.map(f => {
        return {
          name: getFixDescription(f, contents)
        };
      })
    }
  ]
};

export const processFile = (filename: string) => {
  if (!fs.existsSync(filename)) {
    console.error(`Unable to open file: ${filename}`);
    process.exit(1);
  }
  const contents = fs.readFileSync(filename, 'utf8');
  const configuration = findConfiguration('codelyzer.json', filename);

  const codelyzer = new Codelyzer(filename, contents, configuration);

  const generator = codelyzer.process();

  let next;
  let fixed;

  while (!(next = generator.next()).done) {
    let replacements: Replacement[] = [];
    next.value.fixes.forEach(f => replacements = replacements.concat(f.replacements));
    fixed = contents;
    inquirer.prompt(getConfirmMessage(next.value.fixes, filename, contents))
      .then(() => {
        replacements.sort((a, b) => b.start - a.start)
          .forEach(r => {
            fixed = fixed.slice(0, r.start) + r.replaceWith + fixed.slice(r.end);
          });
        fs.writeFileSync(filename, fixed);
      });
  }
};

const files = argv._;

for (const file of files) {
  glob.sync(file, { ignore: argv.e }).forEach(processFile);
}

