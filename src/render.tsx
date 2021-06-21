import { Constraint, Solver } from "kiwi.js";
import { getBBoxValues, makeBBoxConstraints, makeBBoxVars, makeGlyphConstraints } from "./kiwiBBox";

export default (encoding: any) => {
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
