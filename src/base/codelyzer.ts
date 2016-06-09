import {IFormatter} from "./language/formatter/formatter";
import {Match} from "./language/rule/match";
import {getSourceFile} from "./language/utils";
import {
    DEFAULT_CONFIG,
    findConfiguration,
    findConfigurationPath,
    getRelativePath,
    getRulesDirectories,
    loadConfigurationFromPath,
} from "./configuration";
import {EnableDisableRulesWalker} from "./enableDisableRules";
import {findFormatter} from "./formatterLoader";
import {ILinterOptionsRaw, ILinterOptions, LintResult} from "./lint";
import {loadRules} from "./ruleLoader";
import {arrayify} from "./utils";
import {ImportDestructuringSpacing} from '../rules/importDestructuringSpacingRule';

export class Linter {
    public static VERSION = "3.11.0";

    public static findConfiguration = findConfiguration;
    public static findConfigurationPath = findConfigurationPath;
    public static getRulesDirectories = getRulesDirectories;
    public static loadConfigurationFromPath = loadConfigurationFromPath;

    private fileName: string;
    private source: string;
    private options: ILinterOptions;

    constructor(fileName: string, source: string, options: ILinterOptionsRaw) {
        this.fileName = fileName;
        this.source = source;
        this.options = this.computeFullOptions(options);
    }

    public *lint() {
        const matches: Match[] = [];
        const sourceFile = getSourceFile(this.fileName, this.source);

        // walk the code first to find all the intervals where rules are disabled
        const rulesWalker = new EnableDisableRulesWalker(sourceFile, {
            disabledIntervals: [],
            ruleName: "",
        });
        rulesWalker.walk(sourceFile);
        const enableDisableRuleMap = rulesWalker.enableDisableRuleMap;

        const rulesDirectories = this.options.rulesDirectory;
        const configuration = this.options.configuration.rules;
        const configuredRules = [new ImportDestructuringSpacing('import-destructuring-spacing', true, [])];
        const enabledRules = configuredRules.filter((r) => r.isEnabled());
        for (let rule of enabledRules) {
            const ruleMatches = rule.apply(sourceFile);
            for (let ruleMatch of ruleMatches) {
                if (!this.containsMatch(matches, ruleMatch)) {
                  yield ruleMatch;
                }
            }
        }

        console.log(matches);
//        const output = formatter.format(matches);
//        return {
//            failureCount: matches.length,
//            failures: matches,
//            format: this.options.formatter,
//            output: output,
//        };
    }

    private containsMatch(matches: Match[], match: Match) {
        return matches.some(m => m.equals(match));
    }

    private computeFullOptions(options: ILinterOptionsRaw = {}): ILinterOptions {
        if (typeof options !== "object") {
            throw new Error("Unknown Linter options type: " + typeof options);
        }

        let { configuration, formatter, formattersDirectory, rulesDirectory } = options;

        return {
            configuration: configuration || DEFAULT_CONFIG,
            formatter: formatter || "prose",
            formattersDirectory: formattersDirectory,
            rulesDirectory: null
        };
    }
}

