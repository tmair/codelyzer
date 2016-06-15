import {RuleFailure, AbstractRule, getSourceFile, Fix, Replacement, IDisabledInterval} from './language';
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
    const matches: RuleFailure[] = [];
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
    const matches: RuleFailure[] = [];
    const enabledRules = this.getRules();
    let sourceFile = getSourceFile(this.fileName, this.source);
    for (let rule of enabledRules) {
      // Workaround. Will not work if the fixes have intersection.
      // In the perfect scenario we need to yiled on each found match.
      const ruleMatches = this.sortMatches(rule.apply(sourceFile));
      for (let match of ruleMatches) {
        if (!this.containsMatch(matches, match)) {
          let choices = yield { match };
          let fixes = this.getFixes(match, choices);
          if (fixes.length > 0) {
            fixes.forEach(r =>
              this.source = this.source.slice(0, r.start) + r.replaceWith + this.source.slice(r.end));
          }
          yield this.source;
          sourceFile = getSourceFile(this.fileName, this.source);
        }
      }
    }
  }

  private getFixes(match: RuleFailure, choices: string[]) {
    return match.fixes
      .filter(f => choices.indexOf(f.description) >= 0)
      // Already sorted
      .reduce((accum, f) => accum.concat(f.replacements), []);
  }

  private sortMatches(matches: RuleFailure[]) {
    const sortReplacements = (fix: Fix): Fix => {
      fix.replacements = fix.replacements.sort((a, b) => b.start - a.start);
      return fix;
    };
    const sortFixes = (match: RuleFailure): RuleFailure => {
      match.fixes.forEach(sortReplacements);
      match.fixes = match.fixes.sort((a, b) => b.replacements[0].start - a.replacements[0].start);
      return match;
    };
    const nofixes = matches.filter((m: RuleFailure) => !m.fixes.length);
    return nofixes.concat(matches
      .filter((m: RuleFailure) => m.fixes.length > 0)
      .sort((a, b) => b.fixes[0].replacements[0].start - a.fixes[0].replacements[0].start));
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

  private containsMatch(matches: RuleFailure[], match: RuleFailure) {
    return matches.some(m => m.equals(match));
  }
}

