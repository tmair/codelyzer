import {RuleFailure, AbstractRule, getSourceFile, Fix, Replacement, IDisabledInterval} from './language';
import {Reporter} from './reporters/reporter';
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
  private rejectedFixes: RuleFailure[];

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

  public process(reporter: Reporter) {
    const enabledRules = this.getRules();
    return this.processRule(reporter, enabledRules, 0);
  }

  private processRule(reporter: Reporter, rules: AbstractRule[], current: number = 0): Promise<any> {
    if (current >= rules.length) {
      return Promise.resolve(this.source);
    }
    console.log(current, rules.length);
    return new Promise((resolve: any) => {
      this.processHelper(rules[current], reporter)
        .then(() => {
          return this.processRule(reporter, rules, 0);
        }, () => {
          return this.processRule(reporter, rules, current + 1);
        }).then(() => {
          console.log('Done?');
          resolve(this.source)
        });
    });
  }

  private processHelper(rule: AbstractRule, reporter: Reporter): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      let sourceFile = getSourceFile(this.fileName, this.source);
      const ruleMatches = rule.apply(sourceFile, (failure: RuleFailure) => {
        if (failure && !this.failureRejected(failure)) {
          reporter.report(failure)
            .then(() => {
              this.getFixes(failure.fixes).forEach(r =>
                this.source = this.source.slice(0, r.start) + r.replaceWith + this.source.slice(r.end));
              resolve(this.source);
            })
            .catch(() => {
              this.rejectedFixes.push(failure);
              reject(this.source);
            });
        } else {
          resolve(this.source);
        }
      });
    });
  }

  private failureRejected(failure: RuleFailure) {
    // Will get tricky to track failures on pieces of
    // code which have been auto-fixed.
    return false;
  }

  private getFixes(fixes: Fix[]) {
    return fixes
      // Already sorted
      .reduce((accum, f) => accum.concat(f.replacements), []);
  }

  private sortFixes(match: RuleFailure) {
    const sortReplacements = (fix: Fix): Fix => {
      fix.replacements = fix.replacements.sort((a, b) => b.start - a.start);
      return fix;
    };
    const sortFixes = (match: RuleFailure): RuleFailure => {
      match.fixes.forEach(sortReplacements);
      match.fixes = match.fixes.sort((a, b) => b.replacements[0].start - a.replacements[0].start);
      return match;
    };
    sortFixes(match);
    return match;
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

