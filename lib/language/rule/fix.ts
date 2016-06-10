export interface Replacement {
  start: number;
  end: number;
  replaceWith: string;
}

export class Fix {
  // User friendly description of the fix
  description: string;
  safe: boolean;
  replacements: Replacement[] = [];
  constructor(private nodeStart: number, private nodeEnd: number) {}
  toJS() {
    return {
      safe: this.safe,
      description: this.description
    };
  }
}

