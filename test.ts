import {Replacement} from './src/base/language/rule/fix';
import {Linter} from './src/base/codelyzer';

let sf = `
import {foo, bar} form 'bar';
`
const linter = new Linter('file.ts', sf, {});

const generator = linter.lint();
let next;

while (!(next = generator.next()).done) {
  let replacements: Replacement[] = [];
  next.value.fixes.forEach(f => replacements = replacements.concat(f.replacements));
  let fixed = sf;
  replacements.sort((a, b) => b.start - a.start).forEach(r => {
    fixed = fixed.slice(0, r.start) + r.replaceWith + fixed.slice(r.end);
  });
  console.log('Applyng', next.value.fixes, fixed);
}

