import {Match, AbstractRule, getSourceFile, Replacement, IDisabledInterval} from './language';
import {EnableDisableRulesWalker} from './enable-disable-rules';
import {
  ICodelyzerOptionsRaw,
  ICodelyzerOptions,
  ICodelyzerRuleOption,
  CodelyzerResult,
  DEFAULT_FORMATTER,
  DEFAULT_REPORTER,
  DEFAULT_FORMATTERS_DIR,
  DEFAULT_REPORTERS_DIR
} from './config';

import {buildDisabledIntervalsFromSwitches} from './utils';

export class Codelyzer {
  constructor(private fileName: string,
      private source: string,
      private rules: AbstractRule[]) {}

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
    let replacements: Replacement[] = [];
    match.fixes
      .filter(f => choices.indexOf(f.description) >= 0)
      .forEach(f => replacements = replacements.concat(f.replacements));
    return replacements.sort((a, b) => b.start - a.start)
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
    // Produces side-effect
    this.rules.forEach((rule: AbstractRule) => {
      let ruleName = rule.getOptions().ruleName;
      const all = 'all'; // make the linter happy until we can turn it on and off
      const allList = (all in enableDisableRuleMap ? enableDisableRuleMap[all] : []);
      const ruleSpecificList = (ruleName in enableDisableRuleMap ? enableDisableRuleMap[ruleName] : []);
      const disabledIntervals = buildDisabledIntervalsFromSwitches(ruleSpecificList, allList);
      rule.setDisabledIntervals(disabledIntervals);
    });
    return this.rules.filter((r) => r.isEnabled());
  }

  private containsMatch(matches: Match[], match: Match) {
    return matches.some(m => m.equals(match));
  }

  private computeFullOptions(options: ICodelyzerOptionsRaw = {}): ICodelyzerOptions {
    if (typeof options !== 'object') {
      throw new Error('Unknown Linter options type: ' + typeof options);
    }

    let {
      rules_config,
      rules_directories,
      reporter,
      reporters_directories,
      formatter,
      formatters_directories
    } = options;

    return {
      rules_config: rules_config || {},
      rules_directories: rules_directories || [],
      reporters_directories: reporters_directories || [DEFAULT_REPORTERS_DIR],
      reporter: reporter || DEFAULT_REPORTER,
      formatters_directories: formatters_directories || [DEFAULT_FORMATTERS_DIR],
      formatter: formatter || DEFAULT_FORMATTER
    };
  }
}


