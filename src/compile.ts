import { Constraint, Operator, Solver, Strength } from "kiwi.js";
import { Gestalt } from "./gestalt";
import { BBoxTree, getBBoxValues, addBBoxConstraints, makeBBoxVars, bboxVars, BBoxValues, MaybeBBoxValues } from './kiwiBBox';

export type BBoxTreeVV = BBoxTree<{ bboxVars: bboxVars, bboxValues?: MaybeBBoxValues }>;

export type CompiledAST = {
  bboxValues: BBoxTree<BBoxValues>
  encoding: GlyphWithPath
}

export type Relation = {
  left: string,
  right: string,
  gestalt: Gestalt[],
}

export type Glyph = {
  bbox?: MaybeBBoxValues,
  renderFn?: (bbox: BBoxValues) => JSX.Element,
  children?: { [key: string]: Glyph },
  relations?: Relation[]
}

export type GlyphWithPath = {
  path: string,
  bbox?: MaybeBBoxValues,
  renderFn?: (bbox: BBoxValues) => JSX.Element,
  children: { [key: string]: GlyphWithPath },
  relations?: Relation[]
}

export type Mark = {
  bbox: MaybeBBoxValues,
  renderFn: (bbox: BBoxValues) => JSX.Element,
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

/* mutates constraints */
const addGestaltConstraints = (bboxTree: BBoxTreeVV, encoding: GlyphWithPath, constraints: Constraint[]): void => {
  const keys = Object.keys(bboxTree.children);
  keys.forEach((key) => addGestaltConstraints(bboxTree.children[key], encoding.children[key], constraints));

  const relations = encoding.relations === undefined ? [] : encoding.relations;
  relations.forEach(({ left, right, gestalt }: Relation) => gestalt.forEach((g: Gestalt) => {
    const leftBBox = left === "canvas" ? bboxTree.bbox.bboxVars : bboxTree.children[left].bbox.bboxVars;
    const rightBBox = right === "canvas" ? bboxTree.bbox.bboxVars : bboxTree.children[right].bbox.bboxVars;
    constraints.push(g(leftBBox, rightBBox));
  }))
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
  // console.log("step 1.25 complete", constraints)

  // 1.5. add bbox constraints
  addBBoxConstraints(bboxTree, constraints);
  console.log("step 1.5 complete")

  // 2. add gestalt constraints
  addGestaltConstraints(bboxTree, resolvedEncoding, constraints);
  console.log("step 2 complete")

  // 3. solve variables
  const solver = new Solver();
  constraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));
  solver.updateVariables();

  // 4. extract values
  const bboxValues = getBBoxValues(bboxTree);

  return { bboxValues, encoding: resolvedEncoding };
}
