import { Constraint, Operator, Solver, Strength, Variable, Expression } from 'kiwi.js';
import { Gestalt } from "./gestalt";
import { BBoxTree, getBBoxValues, addBBoxConstraints, makeBBoxVars, bboxVars, BBoxValues, MaybeBBoxValues, BBoxTreeValue, BBoxTreeVV, bboxVarExprs, transformBBox } from './kiwiBBoxTransform';

// export type BBoxTreeVV = BBoxTree<{ bboxVars: bboxVars, bboxValues?: MaybeBBoxValues }>;

export type CompiledAST = {
  // bboxValues: BBoxTree<BBoxValues>
  bboxValues: BBoxTreeValue,
  encoding: GlyphWithPath
}

export type Relation = {
  left: string,
  right: string,
  gestalt: Gestalt[],
}

export type Glyph = {
  bbox?: MaybeBBoxValues,
  renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
  children?: { [key: string]: Glyph },
  relations?: Relation[]
}

export type GlyphWithPath = {
  path: string,
  bbox?: MaybeBBoxValues,
  renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
  children: { [key: string]: GlyphWithPath },
  relations?: Relation[]
}

export type Mark = {
  bbox: MaybeBBoxValues,
  renderFn: (canvas: BBoxValues, index?: number) => JSX.Element,
}

/* mutates constraints */
const addChildrenConstraints = (bboxTree: BBoxTreeVV, constraints: Constraint[]): void => {
  const keys = Object.keys(bboxTree.children);
  keys.forEach((key) => addChildrenConstraints(bboxTree.children[key], constraints));

  // connect bbox and canvas width and height
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, bboxTree.canvas.bboxVars.width));
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, bboxTree.canvas.bboxVars.height));

  // lightly suggest the origin of the canvas
  constraints.push(new Constraint(bboxTree.canvas.bboxVars.left, Operator.Eq, 0, Strength.weak));
  constraints.push(new Constraint(bboxTree.canvas.bboxVars.top, Operator.Eq, 0, Strength.weak));

  const canvasWidthDefined = bboxTree.canvas.bboxValues !== undefined && bboxTree.canvas.bboxValues.width !== undefined;
  const canvasHeightDefined = bboxTree.canvas.bboxValues !== undefined && bboxTree.canvas.bboxValues.height !== undefined;

  // 2. add canvas shrink-wrap + container constraints
  for (const bboxKey of Object.keys(bboxTree.children)) {
    // only shrink-wrap if width and/or height aren't defined
    if (!canvasWidthDefined) {
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Eq, bboxTree.canvas.bboxVars.left, Strength.strong));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.right, Operator.Eq, bboxTree.canvas.bboxVars.right, Strength.strong));
    }

    if (!canvasHeightDefined) {
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.top, Operator.Eq, bboxTree.canvas.bboxVars.top, Strength.strong));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, Operator.Eq, bboxTree.canvas.bboxVars.bottom, Strength.strong));
    }

    // add containment constraints always
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Ge, bboxTree.canvas.bboxVars.left));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.right, Operator.Le, bboxTree.canvas.bboxVars.right));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.top, Operator.Ge, bboxTree.canvas.bboxVars.top));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, Operator.Le, bboxTree.canvas.bboxVars.bottom));
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

  const transform = {
    translate: {
      x: new Variable(encoding.path + ".transform" + ".translate" + ".x"),
      y: new Variable(encoding.path + ".transform" + ".translate" + ".y"),
    }
  };

  const canvas = {
    bboxVars: makeBBoxVars(encoding.path + ".canvas"),
  };

  return {
    bbox,
    transform,
    canvas,
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

const resolvePath = (bboxTree: BBoxTreeVV, path: string): bboxVarExprs => {
  return resolvePathAux(bboxTree, path.split('.'));
};

const resolvePathAux = (bboxTree: BBoxTreeVV, path: string[]): bboxVarExprs => {
  const [head, ...tail] = path;
  if (tail.length === 0) {
    if (head === "canvas") {
      return bboxTree.canvas.bboxVars;
    } else {
      return bboxTree.children[head].bbox.bboxVars;
    }
  } else {
    return transformBBox(resolvePathAux(bboxTree.children[head], tail), bboxTree.transform);
  }
};

/* mutates constraints */
const addGestaltConstraints = (bboxTree: BBoxTreeVV, encoding: GlyphWithPath, constraints: Constraint[]): void => {
  const keys = Object.keys(bboxTree.children);
  keys.forEach((key) => addGestaltConstraints(bboxTree.children[key], encoding.children[key], constraints));

  const relations = encoding.relations === undefined ? [] : encoding.relations;
  relations.forEach(({ left, right, gestalt }: Relation) => gestalt.forEach((g: Gestalt) => {
    const leftBBox = resolvePath(bboxTree, left);
    const rightBBox = resolvePath(bboxTree, right);
    // const leftBBox = left === "canvas" ? bboxTree.canvas.bboxVars : bboxTree.children[left].bbox.bboxVars;
    // const rightBBox = right === "canvas" ? bboxTree.canvas.bboxVars : bboxTree.children[right].bbox.bboxVars;
    constraints.push(g(leftBBox, rightBBox));
  }))
}

export default (encoding: Glyph): CompiledAST => {
  const resolvedEncoding = resolvePaths("$root", encoding);

  // 1. construct variables
  const constraints: Constraint[] = [];
  let bboxTree = makeBBoxTree(resolvedEncoding);

  // 1.25 add canvas and children constraints
  // arbitrarily place origin since the top-level box isn't placed by a parent
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

  console.log("bboxTree", bboxTree);

  // 3. solve variables
  const solver = new Solver();
  constraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));
  solver.updateVariables();

  // 4. extract values
  const bboxValues = getBBoxValues(bboxTree);

  return { bboxValues, encoding: resolvedEncoding };
}
