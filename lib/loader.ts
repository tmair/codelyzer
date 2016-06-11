import * as fs from 'fs';
import {getValidDirectories} from './utils';
import {IRule, IDisabledInterval} from './language';

const camelize = require('underscore.string').camelize;

interface SymbolEqualityPredicate {
  (ctr: any):  boolean;
}

function loadInternalSymbol(name: string, dirs: string | string[], predicate: SymbolEqualityPredicate) {
  let Sym;
  let directories = getValidDirectories(dirs);
  for (let dir of directories) {
    if (dir != null) {
      Sym = findSymbol(name, dir, predicate);
      if (Sym !== null) {
        return Sym;
      }
    }
  }
  return undefined;
}

export function loadRule(name: string, rulesDirectories: string | string[]) {
  return loadInternalSymbol(name, rulesDirectories, (ctr: any) => {
    return ctr.name === transformName(name, 'Rule') || ctr.RULE_NAME === name;
  });
}

export function loadFormatter(name: string, formatterDirectories: string | string[]) {
  let Formatter = loadInternalSymbol(name, formatterDirectories, (ctr: any) => {
    return ctr.name === transformName(name, 'Formatter') || ctr.FORMATTER_NAME === name;
  });
  return new Formatter;
}

export function loadReporter(name: string, reportersDirectories: string | string[]) {
  let Reporter = loadInternalSymbol(name, reportersDirectories, (ctr: any) => {
    return ctr.name === transformName(name, 'Reporter') || ctr.REPORTER_NAME === name;
  });
  return new Reporter;
}

export function findSymbol(name: string, symbolsDirectories: string | string[], predicate: SymbolEqualityPredicate) {
  let result;
  let directories = getValidDirectories(symbolsDirectories);
  for (let symbolsDirectory of directories) {
    if (symbolsDirectory != null) {
      result = loadSymbol(symbolsDirectory, name, predicate);
      if (result != null) {
        return result;
      }
    }
  }
  return undefined;
}

function transformName(name: string, suffix: string) {
  const nameMatch = name.match(/^([-_]*)(.*?)([-_]*)$/);
  let result = name;
  if (nameMatch !== null) {
    result = nameMatch[1] + camelize(nameMatch[2]) + nameMatch[3];
  }
  return result[0].toUpperCase() + result.substring(1, name.length) + suffix;
}

function loadSymbol(directory: string, symbolName: string, predicate: SymbolEqualityPredicate) {
  if (fs.existsSync(directory)) {
    const symbolModule = require(directory);
    if (symbolModule) {
      return symbolModule.filter(symbol =>  predicate(symbol)).pop();
    }
  }
  return undefined;
}

/*
 * We're assuming both lists are already sorted top-down so compare the tops, use the smallest of the two,
 * and build the intervals that way.
 */

