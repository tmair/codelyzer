import {Match} from './match';
import {RefactorRuleWalker} from "../walker/refactorRuleWalker";
import * as ts from "typescript";
import {IOptions} from "../../lint";
import {IRule, IDisabledInterval, RuleFailure} from "./rule";

export abstract class AbstractRule implements IRule {
    private value: any;
    private options: IOptions;

    constructor(ruleName: string, value: any, disabledIntervals: IDisabledInterval[]) {
        let ruleArguments: any[] = [];

        if (Array.isArray(value) && value.length > 1) {
            ruleArguments = value.slice(1);
        }

        this.value = value;
        this.options = {
            disabledIntervals: disabledIntervals,
            ruleArguments: ruleArguments,
            ruleName: ruleName,
        };
    }

    public getOptions(): IOptions {
        return this.options;
    }

    public abstract apply(sourceFile: ts.SourceFile): Match[];

    public applyWithWalker(walker: RefactorRuleWalker): Match[] {
        walker.walk(walker.getSourceFile());
        return walker.getMatches();
    }

    public isEnabled(): boolean {
        const value = this.value;

        if (typeof value === "boolean") {
            return value;
        }

        if (Array.isArray(value) && value.length > 0) {
            return value[0];
        }

        return false;
    }
}
