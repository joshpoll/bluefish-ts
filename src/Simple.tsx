import { Constraint, Solver, Variable } from 'kiwi.js';
import { vSpace } from './gestalt';
import { makeBBoxVars, makeBBoxConstraints, makeGlyphConstraints, getBBoxValues, bboxValues } from './kiwiBBox';
import { rect } from './mark';

export const data = { leftColor: "firebrick", rightColor: "steelblue" };

export const encoding = {
  // this does what I want more easily so I'll go with that
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    // leftColor can be primitive or compound data!
    "leftColor": rect({ width: 500 / 3, height: 200 / 3, fill: data.leftColor }),
    "rightColor": rect({ width: 300 / 3, height: 200 / 3, fill: data.rightColor }),
  },
  relations: [
    // vSpace(10.)("leftColor", "rightColor")
    // leftColor refers to the bbox of the leftColor glyph defined above
    { left: "leftColor", right: "rightColor", gestalt: [vSpace(50.)] }
  ]
}

export const render = (encoding: any) => {
  const keys = Object.keys(encoding.encodings);
  // 1. construct variables
  const bboxVars = keys.reduce((o: any, glyphKey: any) => (
    {
      ...o, [glyphKey]: makeBBoxVars(glyphKey)
    }
  ), {});

  const solver = new Solver();

  // 1.5. add bbox constraints
  const bboxConstraints = keys.map((bboxKey) => makeBBoxConstraints(bboxVars[bboxKey])).flat();
  bboxConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));

  // 1.75. Add the constraints specified by the glyph
  const glyphConstraints = keys.map((glyphKey) => makeGlyphConstraints(bboxVars[glyphKey], encoding.encodings[glyphKey][0])).flat();
  glyphConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));

  // 2. add gestalt constraints
  const gestaltConstraints = encoding.relations.map(({ left, right, gestalt }: any) => gestalt.map((g: any) => g(bboxVars[left], bboxVars[right]))).flat();
  gestaltConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));

  // 3. solve variables
  solver.updateVariables();
  console.log("bboxVars", bboxVars);

  // 3.5. extract values
  const bboxValues = keys.reduce((o: any, glyphKey: any) => (
    {
      ...o, [glyphKey]: getBBoxValues(bboxVars[glyphKey])
    }
  ), {});

  // 4. render
  return (
    <svg width="800" height="700">
      {keys.map((glyphKey: any, index: number) => (<g key={index}>{encoding.encodings[glyphKey][1](bboxValues[glyphKey])}</g>))}
    </svg>
  )
}
