export interface Replacement {
  start: number;
  end: number;
  replaceWith: string;
}
export class Fix {
  replacements: Replacement[] = [];
  constructor(private nodeStart: number, private nodeEnd: number) {}
}

