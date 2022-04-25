import { Operator, Solver } from 'kiwi.js';
import { Variable, mkVar, plus, mul, value, AffineExpr, AffineConstraint, Constraint, mkAffineConstraint } from 'indigo-ts';
import { BBoxTreeVVE } from './compileWithRefIndigo';

const evaluate = (e: AffineExpr): number => {
  if (typeof e === 'number') {
    console.log('evaluate', e);
    return e;
  } else if ('v' in e) {
    console.log('evaluate', e, value(e as Variable));
    return value(e as Variable);
  } else if (e.type === 'plus') {
    console.log('evaluate', e.exprs.map(evaluate).reduce((a, b) => a + b, 0));
    return e.exprs.map(evaluate).reduce((a, b) => a + b, 0);
  } else if (e.type === 'mul') {
    console.log('evaluate', e.scalar * evaluate(e.expr));
    return e.scalar * evaluate(e.expr);
  } else {
    throw 'never';
  }
}

const neg = (e: AffineExpr): AffineExpr => mul(-1, e);
const div = (e: AffineExpr, c: number): AffineExpr => mul(1 / c, e);

export type BBoxTreeVV = BBoxTree<{ bboxVars: bboxVars, bboxValues?: MaybeBBoxValues }, Variable>;

export type BBoxTreeValue = BBoxTree<BBoxValues, number>;

// like kiwiBBox, but uses canvas + transform instead of canvas + bbox
// canvas + transform = bbox
// this is useful because it allows us to reference other bboxes in the tree by composing transforms

export type bbox = string;

export type bboxVars = {
  left: Variable,
  right: Variable,
  top: Variable,
  bottom: Variable,
  width: Variable,
  height: Variable,
  centerX: Variable,
  centerY: Variable,
}

export type bboxVarExprs = {
  left: Variable | AffineExpr,
  right: Variable | AffineExpr,
  top: Variable | AffineExpr,
  bottom: Variable | AffineExpr,
  width: Variable | AffineExpr,
  height: Variable | AffineExpr,
  centerX: Variable | AffineExpr,
  centerY: Variable | AffineExpr,
}

export const transformBBox = (bbox: bboxVarExprs, transform: Transform<Variable | AffineExpr>): bboxVarExprs => ({
  left: plus(bbox.left, transform.translate.x),
  right: plus(bbox.right, transform.translate.x),
  top: plus(bbox.top, transform.translate.y),
  bottom: plus(bbox.bottom, transform.translate.y),
  width: bbox.width,
  height: bbox.height,
  centerX: plus(bbox.centerX, transform.translate.x),
  centerY: plus(bbox.centerY, transform.translate.y),
})

export type BBoxValues = { [key in keyof bboxVars]: number }
export type MaybeBBoxValues = Partial<BBoxValues> | undefined

export const makeBBoxVars = (bbox: bbox): bboxVars => {
  const left = mkVar(bbox + ".left");
  const right = mkVar(bbox + ".right");
  const top = mkVar(bbox + ".top");
  const bottom = mkVar(bbox + ".bottom");

  const width = mkVar(bbox + ".width");
  const height = mkVar(bbox + ".height");


  const centerX = mkVar(bbox + ".centerX");
  const centerY = mkVar(bbox + ".centerY");

  return {
    left,
    right,
    top,
    bottom,
    width,
    height,
    centerX,
    centerY,
  }
}

/* mutates constraints */
export const addBBoxConstraints = (bboxTree: BBoxTreeVV, constraints: Constraint[]): void => {
  const keys = Object.keys(bboxTree.children);
  keys.forEach((key) => addBBoxConstraints(bboxTree.children[key], constraints));

  if (bboxTree.bbox.bboxValues !== undefined) {
    for (const key of Object.keys(bboxTree.bbox.bboxValues) as (keyof BBoxValues)[]) {
      if (bboxTree.bbox.bboxValues[key] !== undefined) {
        constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars[key], 'eq', bboxTree.bbox.bboxValues[key]!));
      }
    }
  }

  constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.width, 'eq', plus(bboxTree.bbox.bboxVars.right, neg(bboxTree.bbox.bboxVars.left))));
  constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.height, 'eq', plus(bboxTree.bbox.bboxVars.bottom, neg(bboxTree.bbox.bboxVars.top))));
  constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerX, 'eq', div(plus(bboxTree.bbox.bboxVars.left, bboxTree.bbox.bboxVars.right), 2)));
  constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerY, 'eq', div(plus(bboxTree.bbox.bboxVars.top, bboxTree.bbox.bboxVars.bottom), 2)));

  constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.width, 'eq', plus(bboxTree.canvas.bboxVars.right, neg(bboxTree.canvas.bboxVars.left))));
  constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.height, 'eq', plus(bboxTree.canvas.bboxVars.bottom, neg(bboxTree.canvas.bboxVars.top))));
  constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.centerX, 'eq', div(plus(bboxTree.canvas.bboxVars.left, bboxTree.canvas.bboxVars.right), 2)));
  constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.centerY, 'eq', div(plus(bboxTree.canvas.bboxVars.top, bboxTree.canvas.bboxVars.bottom), 2)));

  // bbox = transform(canvas)
  constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.width, 'eq', bboxTree.canvas.bboxVars.width));
  constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.height, 'eq', bboxTree.canvas.bboxVars.height));
  constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerX, 'eq', plus(bboxTree.canvas.bboxVars.centerX, bboxTree.transform.translate.x)));
  constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerY, 'eq', plus(bboxTree.canvas.bboxVars.centerY, bboxTree.transform.translate.y)));
}

export type Transform<T> = {
  translate: {
    x: T,
    y: T,
  }
}

export type BBoxTree<T, U> = {
  bbox: T, // equals transform(canvas)
  canvas: T,
  // if we have the child "own" its transform, we are implicitly assuming it has a single coordinate
  // space owner that is applying this transform
  // if we instead have the parent "own" its children's transforms by pushing it into the children
  // field, then it could be possible that the child exists in multiple places, right? well not
  // exactly since it's still a tree structure.
  // I think it is easiest/best for now to have the child own its transform, because recursion is
  // much easier and bbox used to live here so the change is smaller.
  transform: Transform<U>,
  children: { [key: string]: BBoxTree<T, U> },
}

// TODO: I think this needs to throw away refs b/c they shouldn't be rendered
export const getBBoxValues = (bboxVars: BBoxTreeVV | BBoxTreeVVE): BBoxTreeValue => {
  console.log("bboxVar children", bboxVars.children);
  console.log("canvas x y", evaluate(bboxVars.canvas.bboxVars.left), evaluate(bboxVars.canvas.bboxVars.top), "\ntranslate x y", evaluate(bboxVars.transform.translate.x), evaluate(bboxVars.transform.translate.y), "\nbbox x y", evaluate(bboxVars.bbox.bboxVars.left), evaluate(bboxVars.bbox.bboxVars.top));
  return {
    bbox: {
      left: evaluate(bboxVars.bbox.bboxVars.left),
      right: evaluate(bboxVars.bbox.bboxVars.right),
      top: evaluate(bboxVars.bbox.bboxVars.top),
      bottom: evaluate(bboxVars.bbox.bboxVars.bottom),
      width: evaluate(bboxVars.bbox.bboxVars.width),
      height: evaluate(bboxVars.bbox.bboxVars.height),
      centerX: evaluate(bboxVars.bbox.bboxVars.centerX),
      centerY: evaluate(bboxVars.bbox.bboxVars.centerY),
    },
    transform: {
      translate: {
        x: evaluate(bboxVars.transform.translate.x),
        y: evaluate(bboxVars.transform.translate.y),
      }
    },
    canvas: {
      left: evaluate(bboxVars.canvas.bboxVars.left),
      right: evaluate(bboxVars.canvas.bboxVars.right),
      top: evaluate(bboxVars.canvas.bboxVars.top),
      bottom: evaluate(bboxVars.canvas.bboxVars.bottom),
      width: evaluate(bboxVars.canvas.bboxVars.width),
      height: evaluate(bboxVars.canvas.bboxVars.height),
      centerX: evaluate(bboxVars.canvas.bboxVars.centerX),
      centerY: evaluate(bboxVars.canvas.bboxVars.centerY),
    },
    children: Object.keys(bboxVars.children).reduce((o: { [key: string]: BBoxTreeValue }, glyphKey: any) => ({
      ...o, [glyphKey]: getBBoxValues(bboxVars.children[glyphKey])
    }), {})
  }
}
