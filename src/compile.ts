import { Constraint, Operator, Solver, Strength } from "kiwi.js";
import { Gestalt } from "./gestalt";
import { getBBoxValues, makeBBoxConstraints, makeBBoxVars, makeGlyphConstraints, bboxVars, bboxValues } from './kiwiBBox';
import { Mark } from './mark';

export type CompiledAST = {
  bboxValues: { [key: string]: bboxValues }
  encoding: Encoding
}

export type Relation = {
  left: string,
  right: string,
  gestalt: Gestalt[],
}

export type Encoding = {
  canvas?: {
    width?: number,
    height?: number,
  },
  encodings: { [key: string]: Mark },
  relations: Relation[]
}

type EncodingNoCanvas = {
  bboxVars: any,
  constraints: Constraint[],
  encodings: { [key: string]: Mark },
  relations: Relation[]
}

const compileCanvas = (bboxVars: any, constraints: Constraint[], encoding: Encoding): EncodingNoCanvas => {
  // 1. add canvas bbox
  const canvasBBox = makeBBoxVars("canvas");
  constraints = constraints.concat(makeBBoxConstraints(canvasBBox));

  // 2. add canvas constraints
  constraints = constraints.concat(new Constraint(canvasBBox.left, Operator.Eq, 0));
  constraints = constraints.concat(new Constraint(canvasBBox.top, Operator.Eq, 0));

  let canvasWidthDefined = false;
  let canvasHeightDefined = false;

  if (encoding.canvas !== undefined) {
    if (encoding.canvas.width !== undefined) {
      constraints = constraints.concat(new Constraint(canvasBBox.width, Operator.Eq, encoding.canvas.width))
      canvasWidthDefined = true;
    }
    if (encoding.canvas.height !== undefined) {
      constraints = constraints.concat(new Constraint(canvasBBox.height, Operator.Eq, encoding.canvas.height))
      canvasHeightDefined = true;
    }
  }

  // 3. add canvas shrink-wrap constraints
  for (const bboxKey of Object.keys(bboxVars)) {
    if (!canvasWidthDefined) {
      constraints = constraints.concat([
        new Constraint(bboxVars[bboxKey].left, Operator.Eq, canvasBBox.left, Strength.strong),
        new Constraint(bboxVars[bboxKey].right, Operator.Eq, canvasBBox.right, Strength.strong),
      ])
    }

    if (!canvasWidthDefined) {
      constraints = constraints.concat([
        new Constraint(bboxVars[bboxKey].top, Operator.Eq, canvasBBox.top, Strength.strong),
        new Constraint(bboxVars[bboxKey].bottom, Operator.Eq, canvasBBox.bottom, Strength.strong),
      ])
    }

    constraints = constraints.concat([
      new Constraint(bboxVars[bboxKey].left, Operator.Ge, canvasBBox.left),
      new Constraint(bboxVars[bboxKey].left, Operator.Eq, canvasBBox.left, Strength.strong),
      new Constraint(bboxVars[bboxKey].right, Operator.Le, canvasBBox.right),
      new Constraint(bboxVars[bboxKey].top, Operator.Ge, canvasBBox.top),
      new Constraint(bboxVars[bboxKey].bottom, Operator.Le, canvasBBox.bottom),
    ])
  }

  return {
    bboxVars: { ...bboxVars, canvas: canvasBBox },
    constraints,
    encodings: encoding.encodings,
    relations: encoding.relations,
  }
}

export default (encoding: Encoding): CompiledAST => {
  const keys = Object.keys(encoding.encodings);
  // 1. construct variables
  let bboxVars = keys.reduce((o: any, glyphKey: any) => (
    {
      ...o, [glyphKey]: makeBBoxVars(glyphKey)
    }
  ), {});

  const ast = compileCanvas(bboxVars, [], encoding);
  bboxVars = ast.bboxVars;
  console.log("bboxVars canvas", bboxVars["canvas"]);

  const solver = new Solver();

  // 1.25. add canvas constraints
  ast.constraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));

  // 1.5. add bbox constraints
  const bboxConstraints = keys.map((bboxKey) => makeBBoxConstraints(bboxVars[bboxKey])).flat();
  bboxConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));

  // 1.75. Add the constraints specified by the glyph
  const glyphConstraints = keys.map((glyphKey) => makeGlyphConstraints(bboxVars[glyphKey], encoding.encodings[glyphKey].bboxParams)).flat();
  glyphConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));

  // 2. add gestalt constraints
  const gestaltConstraints = encoding.relations.map(({ left, right, gestalt }: any) => gestalt.map((g: any) => g(bboxVars[left], bboxVars[right]))).flat();
  gestaltConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));

  // 3. solve variables
  solver.updateVariables();
  console.log("bboxVars", bboxVars);

  // 3.5. extract values
  const bboxValues = keys.concat("canvas").reduce((o: any, glyphKey: any) => (
    {
      ...o, [glyphKey]: getBBoxValues(bboxVars[glyphKey])
    }
  ), {});

  return { bboxValues, encoding };
}
