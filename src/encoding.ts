import { Variable } from "kiwi.js";
import { makeBBoxVars } from "./kiwiBBox";

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

export const toBBoxes = (e: any): any => {
  let encodings = e.encodings ?? [];
  for (let e of encodings) {
    console.log(makeBBoxVars(e.$path));
  }
}

export const toConstraints = (data: any, e: any): any => {
  let relations = e.relations ?? [];
  for (let r of relations) {
    console.log(r)
    let left = data[r.left].$path;
    let right = data[r.right].$path;
    let variables = {
      leftBox: {
        bottom: new Variable("leftBox.bottom")
      },
      rightBox: {
        top: new Variable("rightBox.top"),
      }
    }
    console.log(r.gestalt[0](variables, left, right))
  }
}