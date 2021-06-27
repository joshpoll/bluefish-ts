import { Constraint, Operator, Solver, Strength } from "kiwi.js";
import { Gestalt } from "./gestalt";
import { BBoxTree, getBBoxValues, addBBoxConstraints, makeBBoxVars, bboxVars, bboxValues, maybeBboxValues } from './kiwiBBox';

export type BBoxTreeVV = BBoxTree<{ bboxVars: bboxVars, bboxValues?: maybeBboxValues }>;

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
const addChildrenConstraints = (bboxTree: BBoxTreeVV, constraints: Constraint[]): void => {
  const keys = Object.keys(bboxTree.children);
  keys.forEach((key) => addChildrenConstraints(bboxTree.children[key], constraints));

  const bboxWidthDefined = bboxTree.bbox.bboxValues !== undefined && bboxTree.bbox.bboxValues.width !== undefined;
  const bboxHeightDefined = bboxTree.bbox.bboxValues !== undefined && bboxTree.bbox.bboxValues.height !== undefined;

  // 2. add bbox shrink-wrap + container constraints
  for (const bboxKey of Object.keys(bboxTree.children)) {
    // only shrink-wrap if width and/or height aren't defined
    if (!bboxWidthDefined) {
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Eq, bboxTree.bbox.bboxVars.left, Strength.strong));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.right, Operator.Eq, bboxTree.bbox.bboxVars.right, Strength.strong));
    }

    if (!bboxHeightDefined) {
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.top, Operator.Eq, bboxTree.bbox.bboxVars.top, Strength.strong));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, Operator.Eq, bboxTree.bbox.bboxVars.bottom, Strength.strong));
    }

    // add containment constraints always
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Ge, bboxTree.bbox.bboxVars.left));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Eq, bboxTree.bbox.bboxVars.left, Strength.strong));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.right, Operator.Le, bboxTree.bbox.bboxVars.right));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.top, Operator.Ge, bboxTree.bbox.bboxVars.top));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, Operator.Le, bboxTree.bbox.bboxVars.bottom));
  }
}

const makeBBoxTree = (encoding: GlyphWithPath): BBoxTreeVV => {
  const children = encoding.children === undefined ? {} : encoding.children;
  const keys = Object.keys(children);
  const compiledChildren: { [key: string]: BBoxTreeVV } = keys.reduce((o: { [key: string]: BBoxTreeVV }, glyphKey: any) => (
    {
      ...o, [glyphKey]: makeBBoxTree(children[glyphKey])
    }
  ), {});

  const bbox = {
    bboxVars: makeBBoxVars(encoding.path),
    bboxValues: encoding.bbox,
  };

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
  let bboxTree = makeBBoxTree(resolvedEncoding);
  keys = Object.keys(bboxTree.children);
  // console.log("keys", keys);

  // 1.25 add canvas and children constraints
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.left, Operator.Eq, 0));
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.top, Operator.Eq, 0));
  addChildrenConstraints(bboxTree, constraints);
  // console.log("step 1 complete", constraints)

  const solver = new Solver();

  // 1.25. add canvas constraints
  // console.log("step 1.25 complete")

  // 1.5. add bbox constraints
  addBBoxConstraints(bboxTree, constraints);
  console.log("step 1.5 complete")

  constraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));

  // 2. add gestalt constraints
  const relations = resolvedEncoding.relations === undefined ? [] : resolvedEncoding.relations;
  const gestaltConstraints = relations.map(
    ({ left, right, gestalt }: Relation) =>
      gestalt.map((g: Gestalt) => {
        const leftBBox = left === "canvas" ? bboxTree.bbox.bboxVars : bboxTree.children[left].bbox.bboxVars;
        const rightBBox = left === "canvas" ? bboxTree.bbox.bboxVars : bboxTree.children[right].bbox.bboxVars;
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
