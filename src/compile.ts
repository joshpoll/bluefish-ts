import { Constraint, Operator, Solver, Strength } from "kiwi.js";
import { Gestalt } from "./gestalt";
import { BBoxTree, getBBoxValues, addBBoxConstraints, makeBBoxVars, makeGlyphConstraints, bboxVars, bboxValues, maybeBboxValues } from './kiwiBBox';

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

export type GlyphWithPath = {
  path: string,
  bbox?: maybeBboxValues,
  renderFn?: (bbox: bboxValues) => JSX.Element,
  children: { [key: string]: GlyphWithPath },
  relations?: Relation[]
}

export type Mark = {
  bbox: maybeBboxValues,
  renderFn: (bbox: bboxValues) => JSX.Element,
}

/* mutates constraints */
const addChildrenConstraints = (bboxTree: BBoxTree<bboxVars>, encoding: GlyphWithPath, constraints: Constraint[]): void => {
  const keys = Object.keys(bboxTree.children);
  keys.forEach((key) => addChildrenConstraints(bboxTree.children[key], encoding.children[key], constraints));

  const bboxWidthDefined = encoding.bbox !== undefined && encoding.bbox.width !== undefined;
  const bboxHeightDefined = encoding.bbox !== undefined && encoding.bbox.height !== undefined;

  // 2. add bbox shrink-wrap + container constraints
  for (const bboxKey of Object.keys(bboxTree.children)) {
    // only shrink-wrap if width and/or height aren't defined
    if (!bboxWidthDefined) {
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.left, Operator.Eq, bboxTree.bbox.left, Strength.strong));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.right, Operator.Eq, bboxTree.bbox.right, Strength.strong));
    }

    if (!bboxHeightDefined) {
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.top, Operator.Eq, bboxTree.bbox.top, Strength.strong));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bottom, Operator.Eq, bboxTree.bbox.bottom, Strength.strong));
    }

    // add containment constraints always
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.left, Operator.Ge, bboxTree.bbox.left));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.left, Operator.Eq, bboxTree.bbox.left, Strength.strong));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.right, Operator.Le, bboxTree.bbox.right));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.top, Operator.Ge, bboxTree.bbox.top));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bottom, Operator.Le, bboxTree.bbox.bottom));
  }
}

/* mutates constraints */
/* TODO: can I remove `constraints` from this? */
const makeBBoxTree = (encoding: GlyphWithPath, constraints: Constraint[]): BBoxTree<bboxVars> => {
  const children = encoding.children === undefined ? {} : encoding.children;
  const keys = Object.keys(children);
  const compiledChildren: { [key: string]: BBoxTree<bboxVars> } = keys.reduce((o: { [key: string]: BBoxTree<bboxVars> }, glyphKey: any) => (
    {
      ...o, [glyphKey]: makeBBoxTree(children[glyphKey], constraints)
    }
  ), {});

  const bbox = makeBBoxVars(encoding.path);
  // for (const constraint of makeBBoxConstraints(bbox, encoding.bbox)) {
  //   constraints.push(constraint);
  // }

  return {
    bbox,
    children: compiledChildren,
  }
}

const resolvePaths = (path: string, encoding: Glyph): GlyphWithPath => {
  const children = encoding.children === undefined ? {} : encoding.children;
  const compiledChildren: { [key: string]: GlyphWithPath } = Object.keys(children).reduce((o: { [key: string]: Glyph }, glyphKey: any) => (
    {
      ...o, [glyphKey]: resolvePaths(path + "." + glyphKey, children[glyphKey])
    }
  ), {});

  return {
    ...encoding,
    path,
    children: compiledChildren,
  }
}

export default (encoding: Glyph): CompiledAST => {
  const resolvedEncoding = resolvePaths("canvas", encoding);
  const children = resolvedEncoding.children === undefined ? {} : resolvedEncoding.children;
  let keys = Object.keys(children);

  // 1. construct variables
  const constraints: Constraint[] = [];
  let bboxTree = makeBBoxTree(resolvedEncoding, constraints);
  keys = Object.keys(bboxTree.children);
  // console.log("keys", keys);

  // 1.25 add canvas and children constraints
  constraints.push(new Constraint(bboxTree.bbox.left, Operator.Eq, 0));
  constraints.push(new Constraint(bboxTree.bbox.top, Operator.Eq, 0));
  addChildrenConstraints(bboxTree, resolvedEncoding, constraints);
  // console.log("step 1 complete", constraints)

  const solver = new Solver();

  // 1.25. add canvas constraints
  // console.log("step 1.25 complete")

  // 1.5. add bbox constraints
  addBBoxConstraints(bboxTree, resolvedEncoding, constraints);
  console.log("step 1.5 complete")

  constraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));

  // 1.75. Add the constraints specified by the glyph
  const glyphConstraints = keys.map((glyphKey) => makeGlyphConstraints(bboxTree.children[glyphKey].bbox, children[glyphKey].bbox)).flat();
  glyphConstraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));
  console.log("step 1.75 complete")

  // 2. add gestalt constraints
  const relations = resolvedEncoding.relations === undefined ? [] : resolvedEncoding.relations;
  const gestaltConstraints = relations.map(
    ({ left, right, gestalt }: Relation) =>
      gestalt.map((g: Gestalt) => {
        const leftBBox = left === "canvas" ? bboxTree.bbox : bboxTree.children[left].bbox;
        const rightBBox = left === "canvas" ? bboxTree.bbox : bboxTree.children[right].bbox;
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
