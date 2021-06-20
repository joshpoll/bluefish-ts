import { Constraint, Solver, Variable } from 'kiwi.js';
import { vSpace } from './Gestalt';
import { bboxVars, makeBBoxVars, makeBBoxConstraints, makeGlyphConstraints, getBBoxValues, bboxValues } from './KiwiBBox';

export const data = { leftColor: "red", rightColor: "blue" };

export const rect = (data: any, colorPath: string) => (
  <rect width="300" height="100" fill={data[colorPath]} />
)

type RectParams = {
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  fill?: string,
}

export const rect2 = ({ x, y, width, height, fill }: RectParams) => {
  return [
    // return the positioning parameters the user gave us
    { top: x, left: y, width, height },
    // and the rendering function itself
    (bbox: bboxValues) => {
      return <rect x={x ?? bbox.left} y={y ?? bbox.top} width={width ?? bbox.width} height={height ?? bbox.height} fill={fill} />
    }]
}

export const encoding = {
  encodings: [
    rect(data, "leftColor"),
    rect(data, "rightColor"),
  ],

  // this does what I want more easily so I'll go with that
  encodings2: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    // leftColor can be primitive or compound data!
    "leftColor": rect2({ width: 50., height: 10., fill: data.leftColor }),
    "rightColor": rect2({ width: 30., height: 10., fill: data.rightColor }),
  },
  relations: [
    // vSpace(10.)("leftColor", "rightColor")
    // leftColor refers to the bbox of the leftColor glyph defined above
    { left: "leftColor", right: "rightColor", gestalt: [vSpace(10.)] }
  ]
}

export const render = (encoding: any) => {
  const keys = Object.keys(encoding.encodings2);
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
  const glyphConstraints = keys.map((glyphKey) => makeGlyphConstraints(bboxVars[glyphKey], encoding.encodings2[glyphKey][0])).flat();
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
      {keys.map((glyphKey: any, index: number) => (<g key={index}>{encoding.encodings2[glyphKey][1](bboxValues[glyphKey])}</g>))}
    </svg>
  )
}

/*
STEPS:
1. construct variables
2. add gestalt constraints
3. solve variables
4. render

*/