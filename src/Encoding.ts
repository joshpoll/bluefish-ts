export type Mark = any;
export type Gestalt = any;

export type Relation = {
  left: any,
  right: any,
  gestalt: any[]
};
// type Relation = (left: any, right: any) => Gestalt[];

// Default values when one of the fields is not provided is [].
export type Encoding = {
  encodings?: Encoding[],
  relations?: Relation[],
}

// two "pure" forms: Glyph and Relational (names WIP). These are _emergent_ from the more general
// Encoding type

export type Glyph = {
  encodings: Encoding[],
}

export type Relational = {
  relations: Relation[],
}