import {assertFailure, assertSuccess} from './testHelper';

describe('no-forward-ref', () => {
    describe('invalid function call', ()=> {
	it('should fail when we are calling forwardRef in constructor', () => {
	    let source = `
	    class Test {
		constructor(@Inject(forwardRef(()=>NameService)) nameService) {}
	    }
	    class NameService {}`;
	    assertFailure('no-forward-ref', source, {
		message: 'Avoid using forwardRef in class "Test"',
		startPosition: {
		    line: 2,
		    character: 36
		},
		endPosition: {
		    line: 2,
		    character: 63
		}
	    });
	});
	it('should fail when we are calling forwardRef in Component directives array', () => {
	    let source = `
	    @Component({
		directives: [forwardRef(()=>NameService)]
	    })
	    class Test {}
	    class NameService {}`;
	    assertFailure('no-forward-ref', source, {
		message: 'Avoid using forwardRef in class "Test"',
		startPosition: {
		    line: 2,
		    character: 29
		},
		endPosition: {
		    line: 2,
		    character: 56
		}
	    });
	});
    });
    describe('valid function call', ()=> {
	it('should succeed, when we are not calling forwardRef', () => {
	    let source = `
		class Test {
		    constructor() {
			this.test();
		    }
		    test(){
		    }
		}`;
	    assertSuccess('no-forward-ref', source);
	});
    })
});
