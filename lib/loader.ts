import * as fs from 'fs';
import {getValidDirectories} from './utils';
import {IRule, IDisabledInterval} from './language';

const camelize = require('underscore.string').camelize;

function loadInternalSymbol(name: string, dirs: string | string[], suffix: string) {
  let Sym;
  let directories = getValidDirectories(dirs);
  for (let dir of directories) {
    if (dir != null) {
      Sym = findSymbol(name, suffix, dir);
      if (Sym !== null) {
        return new Sym;
      }
    }
  }
  return undefined;
}

export function loadFormatter(name: string, formatterDirectories: string | string[]) {
  return loadInternalSymbol(name, formatterDirectories, 'Formatter');
}

export function loadReporter(name: string, reportersDirectories: string | string[]) {
  return loadInternalSymbol(name, reportersDirectories, 'Reporter');
}

export function findSymbol(name: string, suffix: string, symbolsDirectories?: string | string[]) {
  let result;
  let directories = getValidDirectories(symbolsDirectories);
  for (let symbolsDirectory of directories) {
    if (symbolsDirectory != null) {
      result = loadSymbol(symbolsDirectory, name, suffix);
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

function loadSymbol(directory: string, symbolName: string, suffix: string) {
  const camelizedName = transformName(symbolName, suffix);
  if (fs.existsSync(directory)) {
    const symbolModule = require(directory);
    if (symbolModule) {
      return symbolModule.filter(symbol => {
        if (symbol.name === camelizedName || symbol.RULE_NAME === symbolName) {
          return true;
        }
        return false;
      }).pop();
    }
  }
  return undefined;
}

/*
 * We're assuming both lists are already sorted top-down so compare the tops, use the smallest of the two,
 * and build the intervals that way.
 */

