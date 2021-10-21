import { Constraint, Expression, Operator, Solver, Variable } from 'kiwi.js';
import { BBoxTreeVVE } from './compileWithRef';

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
  left: Variable | Expression,
  right: Variable | Expression,
  top: Variable | Expression,
  bottom: Variable | Expression,
  width: Variable | Expression,
  height: Variable | Expression,
  centerX: Variable | Expression,
  centerY: Variable | Expression,
}

export const transformBBox = (bbox: bboxVarExprs, transform: Transform<Variable | Expression>): bboxVarExprs => ({
  left: bbox.left.plus(transform.translate.x),
  right: bbox.right.plus(transform.translate.x),
  top: bbox.top.plus(transform.translate.y),
  bottom: bbox.bottom.plus(transform.translate.y),
  width: bbox.width,
  height: bbox.height,
  centerX: bbox.centerX.plus(transform.translate.x),
  centerY: bbox.centerY.plus(transform.translate.y),
})

export type BBoxValues = { [key in keyof bboxVars]: number }
export type MaybeBBoxValues = Partial<BBoxValues> | undefined

export const makeBBoxVars = (bbox: bbox): bboxVars => {
  const left = new Variable(bbox + ".left");
  const right = new Variable(bbox + ".right");
  const top = new Variable(bbox + ".top");
  const bottom = new Variable(bbox + ".bottom");

  const width = new Variable(bbox + ".width");
  const height = new Variable(bbox + ".height");


  const centerX = new Variable(bbox + ".centerX");
  const centerY = new Variable(bbox + ".centerY");

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
        constraints.push(new Constraint(bboxTree.bbox.bboxVars[key], Operator.Eq, bboxTree.bbox.bboxValues[key]));
      }
    }
  }

  constraints.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.right, [-1, bboxTree.bbox.bboxVars.left])));
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.bottom, [-1, bboxTree.bbox.bboxVars.top])));
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.left, bboxTree.bbox.bboxVars.right).divide(2)));
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.top, bboxTree.bbox.bboxVars.bottom).divide(2)));

  constraints.push(new Constraint(bboxTree.canvas.bboxVars.width, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.right, [-1, bboxTree.canvas.bboxVars.left])));
  constraints.push(new Constraint(bboxTree.canvas.bboxVars.height, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.bottom, [-1, bboxTree.canvas.bboxVars.top])));
  constraints.push(new Constraint(bboxTree.canvas.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.left, bboxTree.canvas.bboxVars.right).divide(2)));
  constraints.push(new Constraint(bboxTree.canvas.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.top, bboxTree.canvas.bboxVars.bottom).divide(2)));

  // bbox = transform(canvas)
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.width)));
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.height)));
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerX, bboxTree.transform.translate.x)));
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerY, bboxTree.transform.translate.y)));
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

export const getBBoxValues = (bboxVars: BBoxTreeVV | BBoxTreeVVE): BBoxTreeValue => {
  console.log("canvas x y", bboxVars.canvas.bboxVars.left.value(), bboxVars.canvas.bboxVars.top.value(), "\ntranslate x y", bboxVars.transform.translate.x.value(), bboxVars.transform.translate.y.value(), "\nbbox x y", bboxVars.bbox.bboxVars.left.value(), bboxVars.bbox.bboxVars.top.value());
  return {
    bbox: {
      left: bboxVars.bbox.bboxVars.left.value(),
      right: bboxVars.bbox.bboxVars.right.value(),
      top: bboxVars.bbox.bboxVars.top.value(),
      bottom: bboxVars.bbox.bboxVars.bottom.value(),
      width: bboxVars.bbox.bboxVars.width.value(),
      height: bboxVars.bbox.bboxVars.height.value(),
      centerX: bboxVars.bbox.bboxVars.centerX.value(),
      centerY: bboxVars.bbox.bboxVars.centerY.value(),
    },
    transform: {
      translate: {
        x: bboxVars.transform.translate.x.value(),
        y: bboxVars.transform.translate.y.value(),
      }
    },
    canvas: {
      left: bboxVars.canvas.bboxVars.left.value(),
      right: bboxVars.canvas.bboxVars.right.value(),
      top: bboxVars.canvas.bboxVars.top.value(),
      bottom: bboxVars.canvas.bboxVars.bottom.value(),
      width: bboxVars.canvas.bboxVars.width.value(),
      height: bboxVars.canvas.bboxVars.height.value(),
      centerX: bboxVars.canvas.bboxVars.centerX.value(),
      centerY: bboxVars.canvas.bboxVars.centerY.value(),
    },
    children: Object.keys(bboxVars.children).reduce((o: { [key: string]: BBoxTreeValue }, glyphKey: any) => ({
      ...o, [glyphKey]: getBBoxValues(bboxVars.children[glyphKey])
    }), {})
  }
}
