import {Match, getSourceFile, Replacement} from './language';
import {EnableDisableRulesWalker} from './enable-disable-rules';
import {loadRules, loadReporter, loadFormatter} from './loader';
import {
  ICodelyzerOptionsRaw,
  ICodelyzerOptions,
  CodelyzerResult,
    DEFAULT_FORMATTER,
    DEFAULT_REPORTER
} from './config';

export class Codelyzer {
  private fileName: string;
  private source: string;
  private options: ICodelyzerOptions;

  constructor(fileName: string, source: string, options: ICodelyzerOptionsRaw) {
    this.fileName = fileName;
    this.source = source;
    this.options = this.computeFullOptions(options);
  }

  public lint() {
    const matches: Match[] = [];
    const sourceFile = getSourceFile(this.fileName, this.source);
    const options = this.options;
    const enabledRules = this.getRules();
    const formatter = loadFormatter(options.formatter, options.formatters_directories);
    for (let rule of enabledRules) {
      const ruleMatches = rule.apply(sourceFile);
      for (let match of ruleMatches) {
        if (!this.containsMatch(matches, match)) {
          matches.push(match);
        }
      }
    }
    return {
      matches,
      formatter
    };
  }

  public *process(): any {

    const matches: Match[] = [];
    const sourceFile = getSourceFile(this.fileName, this.source);
    const options = this.options;
    const enabledRules = this.getRules();
    const reporter = loadReporter(options.reporter, options.reporters_directories);
    for (let rule of enabledRules) {
      const ruleMatches = rule.apply(sourceFile);
      for (let match of ruleMatches) {
        if (!this.containsMatch(matches, match)) {
          let choices = yield { reporter, match };
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
    const options = this.options;
    // Walk the code first to find all the intervals where rules are disabled
    const rulesWalker = new EnableDisableRulesWalker(sourceFile, {
      disabledIntervals: [],
      ruleName: '',
    });
    rulesWalker.walk(sourceFile);
    const enableDisableRuleMap = rulesWalker.enableDisableRuleMap;
    const configuration = options.rules_config;
    const configuredRules = loadRules(configuration,
        enableDisableRuleMap,
        options.rules_directories);
    return configuredRules.filter((r) => r.isEnabled());
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
      reporters_directories: reporters_directories || [],
      reporter: reporter || DEFAULT_REPORTER,
      formatters_directories: formatters_directories || [],
      formatter: formatter || DEFAULT_FORMATTER
    };
  }
}

