import {Decorator} from 'typescript';

import * as sass from 'node-sass';

import {assertFailure, assertSuccess} from './testHelper';
import {Config} from '../src/angular/config';

describe('no-unused-css', () => {
  describe('valid cases', () => {

    it('should succeed when having valid simple selector', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div bar="{{baz}}" [ngClass]="expr">{{ foo }}</div>',
          styles: [
            \`
            div {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertSuccess('no-unused-css', source);
    });

    describe('complex selectors', () => {

      it('should succeed when having valid complex selector', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section>
                <span><h1>{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1 {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertSuccess('no-unused-css', source);
      });

      it('should succeed when having valid complex selector', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div [class.bar]="true"></div>\`,
            styles: [
              \`
              div.bar {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertSuccess('no-unused-css', source);
      });

      it('should succeed when having valid complex selector', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section>
                <span><h1 id="header">{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1#header {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertSuccess('no-unused-css', source);
      });

      it('should succeed for structural directives when selector matches', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section>
                <span><h1>{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1 {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          
          assertSuccess('no-unused-css', source);
      });

      describe('multiple styles', () => {

        it('should succeed when having valid complex selector', () => {
          let source = `
            @Component({
              selector: 'foobar',
              template: \`<div>
                <section>
                  <span><h1 id="header">{{ foo }}</h1></span>
                </section>
              </div>\`,
              styles: [
                \`
                div h1#header {
                  color: red;
                }
                \`,
                \`
                #header {
                  font-size: 10px;
                }
                \`
              ]
            })
            class Test {
              bar: number;
            }`;
            assertSuccess('no-unused-css', source);
        });

      });

    });

    describe('class setter', () => {
      it('should succeed when having valid complex selector', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section>
                <span><h1 [class.header]="bar">{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1.header {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertSuccess('no-unused-css', source);
      });
    });

    describe('dynamic classes', () => {

      it('should skip components with dynamically set classes', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section class="bar {{baz}}">
                <span><h1 [attr.id]="invalid">{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1#header {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
        assertSuccess('no-unused-css', source);
      });

      it('should skip components with dynamically set classes', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section [ngClass]="{ 'bar': true }">
                <span><h1 id="{{invalid}}">{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1#header {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertSuccess('no-unused-css', source);
      });
    });

  });

  describe('failures', () => {
    it('should fail when having a complex selector that doesn\'t match anything', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <section>
              <span><h1>{{ foo }}</h1></span>
            </section>
          </div>\`,
          styles: [
            \`
            div h2 {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 10,
            character: 12
          },
          endPosition: {
            line: 12,
            character: 12
          }
      });
    });

    it('should fail with multiple styles', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <section>
              <span><h2>{{ foo }}</h2></span>
            </section>
          </div>\`,
          styles: [
            \`
            div h2 {
              color: red;
            }
            \`,
            \`
            h1 {
              color: black;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 15,
            character: 12
          },
          endPosition: {
            line: 17,
            character: 12
          }
      });
    });

   it('should fail when dynamic selector of not the proper type is used', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <section class="bar">
              <span><h1 [attr.id]="bar">{{ foo }}</h1></span>
            </section>
          </div>\`,
          styles: [
            \`
            div section.bar h2 {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 10,
            character: 12
          },
          endPosition: {
            line: 12,
            character: 12
          }
      });
    });

      it('should fail for structural directives when selector does not match', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section>
                <span><h1 *ngIf="true">{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1#header {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertFailure('no-unused-css', source, {
            message: 'Unused styles',
            startPosition: {
              line: 10,
              character: 14
            },
            endPosition: {
              line: 12,
              character: 14
            }
        });
      });

    describe('class setter', () => {

      it('should succeed when having valid complex selector', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section>
                <span><h1 [class.head]="bar">{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1.header {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertFailure('no-unused-css', source, {
            message: 'Unused styles',
            startPosition: {
              line: 10,
              character: 14
            },
            endPosition: {
              line: 12,
              character: 14
            }
        });
      });
    });
  });

  describe('host', () => {

    it('should never fail for :host', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <section>
              <span><h1 [class.header]="bar">{{ foo }}</h1></span>
            </section>
          </div>\`,
          styles: [
            \`
            :host {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertSuccess('no-unused-css', source);
    });

    it('should fail when not matched selectors after :host', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <section>
              <span><h1 [class.header]="bar">{{ foo }}</h1></span>
            </section>
          </div>\`,
          styles: [
            \`
            :host section h2 {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 10,
            character: 12
          },
          endPosition: {
            line: 12,
            character: 12
          }
      });
    });
  });

  describe('deep and >>>', () => {
    it('should ignore deep and match only before it', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <section>
              <span><h1 [class.header]="bar">{{ foo }}</h1></span>
            </section>
          </div>\`,
          styles: [
            \`
            div section /deep/ h2 {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertSuccess('no-unused-css', source);
    });

    it('should match before reaching deep', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <content>
              <span><h1 [class.header]="bar">{{ foo }}</h1></span>
            </content>
          </div>\`,
          styles: [
            \`
            div section /deep/ h2 {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
       assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 10,
            character: 12
          },
          endPosition: {
            line: 12,
            character: 12
          }
      });
    });

    it('should ignore deep and match only before it', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <section>
              <span><h1 [class.header]="bar">{{ foo }}</h1></span>
            </section>
          </div>\`,
          styles: [
            \`
            div section >>> h2 {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertSuccess('no-unused-css', source);
    });

    it('should match before reaching deep', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <content>
              <span><h1 [class.header]="bar">{{ foo }}</h1></span>
            </content>
          </div>\`,
          styles: [
            \`
            div section >>> h2 {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
       assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 10,
            character: 12
          },
          endPosition: {
            line: 12,
            character: 12
          }
      });
    });
  });

  describe('pseudo', () => {

    it('should ignore before and after', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <section>
              <span><h1 [class.header]="bar">{{ foo }}</h1></span>
            </section>
          </div>\`,
          styles: [
            \`
            div section::before {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertSuccess('no-unused-css', source);
    });

    it('should ignore before and after', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: \`<div>
            <section>
              <span><h1 [class.header]="bar">{{ foo }}</h1></span>
            </section>
          </div>\`,
          styles: [
            \`
            div content::before {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 10,
            character: 12
          },
          endPosition: {
            line: 12,
            character: 12
          }
      });
    });
  });

  describe('ViewEncapsulation', () => {
    it('should ignore before and after', () => {
      let source = `
        @Component({
          selector: 'foobar',
          encapsulation: whatever,
          template: \`<div></div>\`,
          styles: [
            \`
            p {
              color: red;
            }
            \`
          ]
        })
        class Test {}`;
        assertSuccess('no-unused-css', source);
    });

    it('should ignore before and after', () => {
      let source = `
        @Component({
          selector: 'foobar',
          encapsulation: ViewEncapsulation.None,
          template: \`<div></div>\`,
          styles: [
            \`
            p {
              color: red;
            }
            \`
          ]
        })
        class Test {}`;
        assertSuccess('no-unused-css', source);
    });

    it('should ignore before and after', () => {
      let source = `
        @Component({
          selector: 'foobar',
          encapsulation: ViewEncapsulation.Native,
          template: \`<div></div>\`,
          styles: [
            \`
            p {
              color: red;
            }
            \`
          ]
        })
        class Test {}`;
        assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 7,
            character: 12
          },
          endPosition: {
            line: 9,
            character: 12
          }
      });
    });

    it('should ignore before and after', () => {
      let source = `
        @Component({
          selector: 'foobar',
          encapsulation: ViewEncapsulation.Emulated,
          template: \`<div></div>\`,
          styles: [
            \`
            p {
              color: red;
            }
            \`
          ]
        })
        class Test {}`;
        assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 7,
            character: 12
          },
          endPosition: {
            line: 9,
            character: 12
          }
      });
    });

    it('should ignore before and after', () => {
      let source = `
        @Component({
          selector: 'foobar',
          encapsulation: prefix.foo.ViewEncapsulation.Emulated,
          template: \`<div></div>\`,
          styles: [
            \`
            p {
              color: red;
            }
            \`
          ]
        })
        class Test {}`;
        assertFailure('no-unused-css', source, {
          message: 'Unused styles',
          startPosition: {
            line: 7,
            character: 12
          },
          endPosition: {
            line: 9,
            character: 12
          }
      });
    });

  });


  it('should work with sass', () => {
    Config.transformStyle = (source: string, url: string, d: Decorator) => {
      const res = sass.renderSync({
        sourceMap: true, data: source, sourceMapEmbed: true
      });
      const code = res.css.toString();
      const base64Map = code.match(/\/\*(.*?)\*\//)[1].replace('# sourceMappingURL=data:application/json;base64,', '');
      const map = JSON.parse(new Buffer(base64Map, 'base64').toString('ascii'));
      return { code, source, map };
    };

    let source = `
    @Component({
      selector: 'hero-cmp',
      template: \`
        <h1>Hello <span>{{ hero.name }}</span></h1>
      \`,
      styles: [
        \`
        h1 {
          spam {
            baz {
              color: red;
            }
          }
        }
        \`
      ]
    })
    class HeroComponent {
      private hero: Hero;
    }`;
    assertFailure('no-unused-css', source, {
      message: 'Unused styles',
      startPosition: {
        line: 9,
        character: 8
      },
      endPosition: {
        line: 13,
        character: 11
      }
    });
    Config.transformStyle = (code: string) => ({ code, map: null });
  });

  describe('inconsistencies with template', () => {

    it('should ignore misspelled template', () => {
      let source = `
      @Component({
        selector: 'hero-cmp',
        templae: \`
          <h1>Hello <span>{{ hero.name }}</span></h1>
        \`,
        styles: [
          \`
          h1 spam {
            color: red;
          }
          \`
        ]
      })
      class HeroComponent {
        private hero: Hero;
      }`;
      assertSuccess('no-unused-css', source);
    });

  });

});
