import * as fs from 'fs';
import * as path from 'path';
import {getRulesDirectories} from './utils';
import {IRule, IDisabledInterval} from './language/rule/rule';

const camelize = require('underscore.string').camelize;

export interface IEnableDisablePosition {
  isEnabled: boolean;
  position: number;
}

export function loadRules(ruleConfiguration: {[name: string]: any},
              enableDisableRuleMap: {[rulename: string]: IEnableDisablePosition[]},
              rulesDirectories?: string[]): IRule[] {
  const rules: IRule[] = [];
  const notFoundRules: string[] = [];

  for (const ruleName in ruleConfiguration) {
    if (ruleConfiguration.hasOwnProperty(ruleName)) {
      const ruleValue = ruleConfiguration[ruleName];
      const Rule = findRule(ruleName, rulesDirectories);
      if (Rule == null) {
        notFoundRules.push(ruleName);
      } else {
        const all = 'all'; // make the linter happy until we can turn it on and off
        const allList = (all in enableDisableRuleMap ? enableDisableRuleMap[all] : []);
        const ruleSpecificList = (ruleName in enableDisableRuleMap ? enableDisableRuleMap[ruleName] : []);
        const disabledIntervals = buildDisabledIntervalsFromSwitches(ruleSpecificList, allList);
        rules.push(new Rule(ruleName, ruleValue, disabledIntervals));
      }
    }
  }

  if (notFoundRules.length > 0) {
    const ERROR_MESSAGE = `
      Could not find implementations for the following rules specified in the configuration:
      ${notFoundRules.join('\n')}
      Try upgrading Codelyzer and/or ensuring that you have all necessary custom rules installed.
    `;
    throw new Error(ERROR_MESSAGE);
  } else {
    return rules;
  }
}

export function findRule(name: string, rulesDirectories?: string | string[]) {
  let camelizedName = transformName(name);

  let Rule;
  let directories = getRulesDirectories(rulesDirectories);

  for (let rulesDirectory of directories) {
    if (rulesDirectory != null) {
      Rule = loadRule(rulesDirectory, camelizedName);
      if (Rule != null) {
        return Rule;
      }
    }
  }

  return undefined;
}

function transformName(name: string) {
  const nameMatch = name.match(/^([-_]*)(.*?)([-_]*)$/);
  let result = name;
  if (nameMatch !== null) {
    result = nameMatch[1] + camelize(nameMatch[2]) + nameMatch[3];
  }
  return result[0].toUpperCase() + result.substring(1, name.length);
}

function loadRule(directory: string, ruleName: string) {
  if (fs.existsSync(directory)) {
    const ruleModule = require(directory);
    if (ruleModule) {
      return ruleModule.filter(rule => {
        if (rule.name === ruleName) {
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
function buildDisabledIntervalsFromSwitches(ruleSpecificList: IEnableDisablePosition[], allList: IEnableDisablePosition[]) {
  let isCurrentlyDisabled = false;
  let disabledStartPosition: number;
  const disabledIntervalList: IDisabledInterval[] = [];
  let i = 0;
  let j = 0;

  while (i < ruleSpecificList.length || j < allList.length) {
    const ruleSpecificTopPositon = (i < ruleSpecificList.length ? ruleSpecificList[i].position : Infinity);
    const allTopPositon = (j < allList.length ? allList[j].position : Infinity);
    let newPositionToCheck: IEnableDisablePosition;
    if (ruleSpecificTopPositon < allTopPositon) {
      newPositionToCheck = ruleSpecificList[i];
      i++;
    } else {
      newPositionToCheck = allList[j];
      j++;
    }

    // we're currently disabled and enabling, or currently enabled and disabling -- a switch
    if (newPositionToCheck.isEnabled === isCurrentlyDisabled) {
      if (!isCurrentlyDisabled) {
        // start a new interval
        disabledStartPosition = newPositionToCheck.position;
        isCurrentlyDisabled = true;
      } else {
        // we're currently disabled and about to enable -- end the interval
        disabledIntervalList.push({
          endPosition: newPositionToCheck.position,
          startPosition: disabledStartPosition,
        });
        isCurrentlyDisabled = false;
      }
    }
  }

  if (isCurrentlyDisabled) {
    // we started an interval but didn't finish one -- so finish it with an Infinity
    disabledIntervalList.push({
      endPosition: Infinity,
      startPosition: disabledStartPosition,
    });
  }

  return disabledIntervalList;
}

