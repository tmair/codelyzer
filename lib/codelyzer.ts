import {Match} from './language/rule/match';
import {getSourceFile} from './language/utils';
import {
} from './configuration';
import {EnableDisableRulesWalker} from './enable-disable-rules';
import {ICodelyzerOptionsRaw, ICodelyzerOptions, CodelyzerResult} from './config';
import {loadRules} from './rule-loader';
import {ImportDestructuringSpacing} from '../rules/import-destructuring-spacing-rule';

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

    // walk the code first to find all the intervals where rules are disabled
    const rulesWalker = new EnableDisableRulesWalker(sourceFile, {
      disabledIntervals: [],
      ruleName: '',
    });
    rulesWalker.walk(sourceFile);

    const enableDisableRuleMap = rulesWalker.enableDisableRuleMap;

    const configuration = this.options.rules_config;
    const configuredRules = loadRules(configuration,
        enableDisableRuleMap,
        this.options.rules_directories
      );
    //[new ImportDestructuringSpacing('import-destructuring-spacing', true, [])];
    const enabledRules = configuredRules.filter((r) => r.isEnabled());
    for (let rule of enabledRules) {
      const ruleMatches = rule.apply(sourceFile);
      for (let ruleMatch of ruleMatches) {
        if (!this.containsMatch(matches, ruleMatch)) {
          yield ruleMatch;
        }
      }
    }

//    const output = formatter.format(matches);
//    return {
//      failureCount: matches.length,
//      failures: matches,
//      format: this.options.formatter,
//      output: output,
//    };
  }

  private containsMatch(matches: Match[], match: Match) {
    return matches.some(m => m.equals(match));
  }

  private computeFullOptions(options: ICodelyzerOptionsRaw = {}): ICodelyzerOptions {
    if (typeof options !== 'object') {
      throw new Error('Unknown Linter options type: ' + typeof options);
    }

    let { rules_config, rules_directories } = options;

    return {
      rules_config: rules_config || {},
      rules_directories: rules_directories || []
    };
  }
}

