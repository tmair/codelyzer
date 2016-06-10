import {Match, getSourceFile, Replacement} from './language';
import {EnableDisableRulesWalker} from './enable-disable-rules';
import {ICodelyzerOptionsRaw, ICodelyzerOptions, CodelyzerResult, DEFAULT_REPORTER} from './config';
import {loadRules, loadReporter} from './loader';

export class Codelyzer {
  private fileName: string;
  private source: string;
  private options: ICodelyzerOptions;

  constructor(fileName: string, source: string, options: ICodelyzerOptionsRaw) {
    this.fileName = fileName;
    this.source = source;
    this.options = this.computeFullOptions(options);
  }

  public *process() {
    const matches: Match[] = [];
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

    const reporter = loadReporter(options.reporter, options.reporters_directories);
    const enabledRules = configuredRules.filter((r) => r.isEnabled());
    for (let rule of enabledRules) {
      const ruleMatches = rule.apply(sourceFile);
      for (let match of ruleMatches) {
        if (!this.containsMatch(matches, match)) {
          yield { reporter, match };
        }
      }
    }
  }

  private containsMatch(matches: Match[], match: Match) {
    return matches.some(m => m.equals(match));
  }

  private computeFullOptions(options: ICodelyzerOptionsRaw = {}): ICodelyzerOptions {
    if (typeof options !== 'object') {
      throw new Error('Unknown Linter options type: ' + typeof options);
    }

    let { rules_config, rules_directories, reporter, reporters_directories } = options;

    return {
      rules_config: rules_config || {},
      rules_directories: rules_directories || [],
      reporters_directories: reporters_directories || [],
      reporter: reporter || DEFAULT_REPORTER
    };
  }
}

