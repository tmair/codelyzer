export interface Replacement {
  start: number;
  end: number;
  replaceWith: string;
}
export class Fix {
  // User friendly description of the fix
  description: string;
  replacements: Replacement[] = [];
  constructor(private nodeStart: number, private nodeEnd: number) {}
}

