import {Match, AbstractRule, getSourceFile, Replacement, IDisabledInterval} from './language';
import {EnableDisableRulesWalker} from './enable-disable-rules';
import {
  ICodelyzerOptionsRaw,
  ICodelyzerOptions,
  ICodelyzerRuleOption,
  CodelyzerResult
} from './config';

import {buildDisabledIntervalsFromSwitches} from './utils';

export interface RuleConfig {
  rule: any;
  options: any;
}

export interface RulesMap {
  [ruleName: string]: RuleConfig;
}

export class Codelyzer {
  constructor(private fileName: string,
      private source: string,
      private rulesMap: RulesMap) {}

  public lint() {
    const matches: Match[] = [];
    const sourceFile = getSourceFile(this.fileName, this.source);
    const enabledRules = this.getRules();
    for (let rule of enabledRules) {
      const ruleMatches = rule.apply(sourceFile);
      for (let match of ruleMatches) {
        if (!this.containsMatch(matches, match)) {
          matches.push(match);
        }
      }
    }
    return matches;
  }

  public *process(): any {
    const matches: Match[] = [];
    const sourceFile = getSourceFile(this.fileName, this.source);
    const enabledRules = this.getRules();
    for (let rule of enabledRules) {
      const ruleMatches = rule.apply(sourceFile);
      for (let match of ruleMatches) {
        if (!this.containsMatch(matches, match)) {
          let choices = yield { match };
          let fixes = this.getFixes(match, choices);
          if (fixes.length > 0) {
            fixes.forEach(r =>
              this.source = this.source.slice(0, r.start) + r.replaceWith + this.source.slice(r.end));
          }
          yield this.source;
        }
      }
    }
  }

  private getFixes(match: Match, choices: string[]) {
    return match.fixes
      .filter(f => choices.indexOf(f.description) >= 0)
      .reduce((accum, f) => accum.concat(f.replacements), [])
      .sort((a, b) => b.start - a.start)
  }

  private getRules() {
    const sourceFile = getSourceFile(this.fileName, this.source);
    // Walk the code first to find all the intervals where rules are disabled
    const rulesWalker = new EnableDisableRulesWalker(sourceFile, {
      disabledIntervals: [],
      ruleName: '',
    });
    rulesWalker.walk(sourceFile);
    const enableDisableRuleMap = rulesWalker.enableDisableRuleMap;
    const result: AbstractRule[] = [];
    // Produces side-effect
    Object.keys(this.rulesMap).forEach((ruleName: string) => {
      let Rule = this.rulesMap[ruleName].rule;
      let options = this.rulesMap[ruleName].options;
      const all = 'all'; // make the linter happy until we can turn it on and off
      const allList = (all in enableDisableRuleMap ? enableDisableRuleMap[all] : []);
      const ruleSpecificList = (ruleName in enableDisableRuleMap ? enableDisableRuleMap[ruleName] : []);
      const disabledIntervals = buildDisabledIntervalsFromSwitches(ruleSpecificList, allList);
      result.push(new Rule(ruleName, options, disabledIntervals));
    });
    return result.filter((r) => r.isEnabled());
  }

  private containsMatch(matches: Match[], match: Match) {
    return matches.some(m => m.equals(match));
  }
}

