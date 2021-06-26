import { Constraint, Operator, Solver, Strength } from "kiwi.js";
import { Gestalt } from "./gestalt";
import { BBoxTree, getBBoxValues, makeBBoxConstraints, makeBBoxVars, makeGlyphConstraints, bboxVars, bboxValues, maybeBboxValues } from './kiwiBBox';

export type CompiledAST = {
  bboxValues: BBoxTree<bboxValues>
  encoding: Glyph
}

export type Relation = {
  left: string,
  right: string,
  gestalt: Gestalt[],
}

export type Glyph = {
  bbox?: maybeBboxValues,
  renderFn?: (bbox: bboxValues) => JSX.Element,
  children?: { [key: string]: Glyph },
  relations?: Relation[]
}

export type Mark = {
  bbox: maybeBboxValues,
  renderFn: (bbox: bboxValues) => JSX.Element,
}

/* mutates constraints */
const addCanvasConstraints = (bboxTree: BBoxTree<bboxVars>, encoding: Glyph, constraints: Constraint[]) => {
  const canvasBBox = bboxTree.bbox;

  // 1. add canvas constraints
  constraints.push(new Constraint(canvasBBox.left, Operator.Eq, 0));
  constraints.push(new Constraint(canvasBBox.top, Operator.Eq, 0));

  let canvasWidthDefined = false;
  let canvasHeightDefined = false;

  if (encoding.bbox !== undefined) {
    if (encoding.bbox.width !== undefined) {
      constraints.push(new Constraint(canvasBBox.width, Operator.Eq, encoding.bbox.width))
      canvasWidthDefined = true;
    }
    if (encoding.bbox.height !== undefined) {
      constraints.push(new Constraint(canvasBBox.height, Operator.Eq, encoding.bbox.height))
      canvasHeightDefined = true;
    }
  }

  // 2. add canvas shrink-wrap constraints
  for (const bboxKey of Object.keys(bboxTree.children)) {
    if (!canvasWidthDefined) {
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.left, Operator.Eq, canvasBBox.left, Strength.strong));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.right, Operator.Eq, canvasBBox.right, Strength.strong));
    }

    if (!canvasHeightDefined) {

      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.top, Operator.Eq, canvasBBox.top, Strength.strong));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bottom, Operator.Eq, canvasBBox.bottom, Strength.strong));
    }

    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.left, Operator.Ge, canvasBBox.left));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.left, Operator.Eq, canvasBBox.left, Strength.strong));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.right, Operator.Le, canvasBBox.right));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.top, Operator.Ge, canvasBBox.top));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bottom, Operator.Le, canvasBBox.bottom));
  }
}

/* mutates constraints */
const makeBBoxTree = (path: string, encoding: Glyph, constraints: Constraint[]): BBoxTree<bboxVars> => {
  const children = encoding.children === undefined ? {} : encoding.children;
  const keys = Object.keys(children);
  const compiledChildren: { [key: string]: BBoxTree<bboxVars> } = keys.reduce((o: { [key: string]: BBoxTree<bboxVars> }, glyphKey: any) => (
    {
      ...o, [glyphKey]: makeBBoxTree(glyphKey, children[glyphKey], constraints)
    }
  ), {});

  const bbox = makeBBoxVars(path);
  for (const constraint of makeBBoxConstraints(bbox)) {
    constraints.push(constraint);
  }

  return {
    bbox,
    children: compiledChildren,
  }
}

const resolvePaths = (path: string, encoding: Glyph): Glyph => {
  const children = encoding.children === undefined ? {} : encoding.children;
  const compiledChildren: { [key: string]: Glyph } = Object.keys(children).reduce((o: { [key: string]: Glyph }, glyphKey: any) => (
    {
      ...o, [path + "." + glyphKey]: resolvePaths(path + "." + glyphKey, children[glyphKey])
    }
  ), {});

  return {
    ...encoding,
    children: compiledChildren,
  }
}

export default (encoding: Glyph): CompiledAST => {
  const resolvedEncoding = resolvePaths("canvas", encoding);
  const children = resolvedEncoding.children === undefined ? {} : resolvedEncoding.children;
  let keys = Object.keys(children);

  // 1. construct variables
  const constraints: Constraint[] = [];
  let bboxTree = makeBBoxTree("canvas", resolvedEncoding, constraints);
  keys = Object.keys(bboxTree.children);
  // console.log("keys", keys);

  addCanvasConstraints(bboxTree, resolvedEncoding, constraints);
  // console.log("step 1 complete", constraints)

  const solver = new Solver();

  // 1.25. add canvas constraints
  constraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));
  // console.log("step 1.25 complete")

  // 1.5. add bbox constraints
  const bboxConstraints = keys.map((bboxKey) => makeBBoxConstraints(bboxTree.children[bboxKey].bbox)).flat();
  bboxConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));
  console.log("step 1.5 complete")

  // 1.75. Add the constraints specified by the glyph
  const glyphConstraints = keys.map((glyphKey) => makeGlyphConstraints(bboxTree.children[glyphKey].bbox, children[glyphKey].bbox)).flat();
  glyphConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));
  console.log("step 1.75 complete")

  // 2. add gestalt constraints
  const relations = resolvedEncoding.relations === undefined ? [] : resolvedEncoding.relations;
  const gestaltConstraints = relations.map(
    ({ left, right, gestalt }: Relation) =>
      gestalt.map((g: Gestalt) => {
        const leftBBox = left === "canvas" ? bboxTree.bbox : bboxTree.children["canvas." + left].bbox;
        const rightBBox = left === "canvas" ? bboxTree.bbox : bboxTree.children["canvas." + right].bbox;
        return g(leftBBox, rightBBox)
      }))
    .flat();
  gestaltConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));
  console.log("step 2 complete")

  // 3. solve variables
  solver.updateVariables();
  // console.log("bboxVars", bboxTree.children);

  // 3.5. extract values
  const bboxValues = getBBoxValues(bboxTree);

  return { bboxValues, encoding: resolvedEncoding };
}
