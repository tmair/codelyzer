import * as fs from 'fs';
import * as glob from 'glob';
import {Replacement, Match, Fix} from './language';
import {findConfiguration} from './utils';
import {Codelyzer} from './codelyzer';

const argv = require('yargs').argv;
const inquirer = require('inquirer');
const chalk = require('chalk');

function getFixes(match: Match, choses: string[]) {
  let replacements: Replacement[] = [];
  match.fixes
    .filter(f => choses.indexOf(f.description) >= 0)
    .forEach(f => replacements = replacements.concat(f.replacements));
  return replacements.sort((a, b) => b.start - a.start)
}

async function processFile(filename: string) {
  if (!fs.existsSync(filename)) {
    console.error(`Unable to open file: ${filename}`);
    process.exit(1);
  }
  const contents = fs.readFileSync(filename, 'utf8');
  const configuration = findConfiguration('codelyzer.json', filename);
  const codelyzer = new Codelyzer(filename, contents, configuration);
  const generator = codelyzer.process();

  let next;
  let fixed = contents;

  next = generator.next();
  while (!next.done) {
    let { reporter, match } = next.value;
    let res = await reporter.report(match);
    let fixes = getFixes(match, res.refactoring);
    if (fixes.length > 0) {
      fixes.forEach(r => fixed = fixed.slice(0, r.start) + r.replaceWith + fixed.slice(r.end));
      console.log(`Writing in file: "${chalk.yellow(filename)}."`);
    }
    fs.writeFileSync(filename, fixed);
    next = generator.next();
  }
};

const files = argv._;

for (const file of files) {
  glob.sync(file, { ignore: argv.e }).forEach(processFile);
}

