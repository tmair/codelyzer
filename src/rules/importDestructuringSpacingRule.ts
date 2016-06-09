import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
import {AbstractRule} from '../base/language/rule/abstractRule';
import {RefactorRuleWalker} from '../base/language/walker/refactorRuleWalker';
import {Match} from '../base/language/rule/match';
import {Fix} from '../base/language/rule/fix';

export class ImportDestructuringSpacing extends AbstractRule {
  public static FAILURE_STRING = 'You need to leave whitespaces inside of the import statement\'s curly braces ($$03-05$$)';

  public apply(sourceFile: ts.SourceFile): Match[] {
    return this.applyWithWalker(new ImportDestructuringSpacingWalker(sourceFile, this.getOptions()));
  }
}

// The walker takes care of all the work.
class ImportDestructuringSpacingWalker extends RefactorRuleWalker {
  private scanner: ts.Scanner;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);
    this.scanner = ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, sourceFile.text);
  }

  public visitImportDeclaration(node: ts.ImportDeclaration) {
    const importClause = node.importClause;
    if (importClause != null && importClause.namedBindings != null) {
      const text = importClause.namedBindings.getText();

      let start = importClause.namedBindings.getStart();
      let width = importClause.namedBindings.getWidth();
      let fix = new Fix(start, start + width);
      fix.replacements = [{
        start: start,
        end: start + width,
        replaceWith: text.replace('{', '{ ').replace('}', ' }')
      }];

      if (!this.checkForWhiteSpace(text)) {
        this.addMatch(this.createMatch([fix], importClause.namedBindings.getStart(), importClause.namedBindings.getWidth(), ImportDestructuringSpacing.FAILURE_STRING));
      }
    }
    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }

  private checkForWhiteSpace(text: string) {
    return /{\s[^]*\s}/.test(text);
  }
}

