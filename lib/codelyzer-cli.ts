import * as fs from 'fs';
import * as glob from 'glob';
import {Replacement, Match, Fix} from './language';
import {findConfiguration} from './utils';
import {Codelyzer} from './codelyzer';

const argv = require('yargs').argv;
const inquirer = require('inquirer');
const chalk = require('chalk');

function lint(config, filename: string) {
  const contents = fs.readFileSync(filename, 'utf8');
  const codelyzer = new Codelyzer(filename, contents, config);
  const matches = codelyzer.lint();
//  console.log(result.formatter.format(result.matches));
}

async function lintAndRefactor(config, filename: string) {
  const contents = fs.readFileSync(filename, 'utf8');
  const codelyzer = new Codelyzer(filename, contents, config);
  const generator = codelyzer.process();
  let next;
  next = generator.next();
  while (!next.done) {
    let { reporter, match } = next.value;
    let res = await reporter.report(match, false);
    let currentRes = generator.next(res.refactoring);
    fs.writeFileSync(filename, currentRes.value);
    next = generator.next();
  }
}

function processFile(filename: string) {
  if (!fs.existsSync(filename)) {
    console.error(`Unable to open file: ${filename}`);
    process.exit(1);
  }
  const config = findConfiguration('codelyzer.json', filename);
  if (argv['lint-only']) {
    lint(config, filename);
  } else {
    lintAndRefactor(config, filename);
  }
};

const files = argv._;

for (const file of files) {
  glob.sync(file, { ignore: argv.e }).forEach(processFile);
}

