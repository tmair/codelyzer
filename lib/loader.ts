import * as fs from 'fs';
import {getValidDirectories} from './utils';
import {IRule, IDisabledInterval} from './language';

const camelize = require('underscore.string').camelize;

export interface SymbolEqualityPredicate {
  (ctr: any, name?: string):  boolean;
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
  return loadInternalSymbol(name, rulesDirectories, (ctr: any, symbolName?: string) => {
    const normalized = transformName(name, 'Rule');
    return ctr.name === normalized || ctr.RULE_NAME === name || symbolName === normalized;
  });
}

export function loadFormatter(name: string, formatterDirectories: string | string[]) {
  let Formatter = loadInternalSymbol(name, formatterDirectories, (ctr: any, symbolName?: string) => {
    const normalized = transformName(name, 'Formatter');
    return ctr.name === normalized || ctr.FORMATTER_NAME === name || symbolName === normalized;
  });
  return new Formatter;
}

export function loadReporter(name: string, reportersDirectories: string | string[]) {
  let Reporter = loadInternalSymbol(name, reportersDirectories, (ctr: any, symbolName?: string) => {
    const normalized = transformName(name, 'Reporter');
    return ctr.name === normalized || ctr.REPORTER_NAME === name || symbolName === normalized;
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
      const symbol = Object.keys(symbolModule)
        .map(name => { return { name, symbol: symbolModule[name] }})
        .filter(({name, symbol}) => predicate(symbol, name))
        .pop();
      if (!symbol) {
        throw new Error(`Cannot find ${symbolName}`);
      } else {
        return symbol.symbol;
      }
    }
  }
  return undefined;
}

/*
 * We're assuming both lists are already sorted top-down so compare the tops, use the smallest of the two,
 * and build the intervals that way.
 */

