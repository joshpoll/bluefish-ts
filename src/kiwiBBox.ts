import { Constraint, Expression, Operator, Solver, Variable } from 'kiwi.js';
import { BBoxTreeVV, GlyphWithPath } from './compile';

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

  if (bboxTree.canvas.bboxValues !== undefined) {
    for (const key of Object.keys(bboxTree.canvas.bboxValues) as (keyof BBoxValues)[]) {
      if (bboxTree.canvas.bboxValues[key] !== undefined) {
        constraints.push(new Constraint(bboxTree.canvas.bboxVars[key], Operator.Eq, bboxTree.canvas.bboxValues[key]));
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
}

export type BBoxTree<T> = {
  bbox: T,
  canvas: T,
  children: { [key: string]: BBoxTree<T> },
}

export const getBBoxValues = (bboxVars: BBoxTreeVV): BBoxTree<BBoxValues> => {
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
    children: Object.keys(bboxVars.children).reduce((o: { [key: string]: BBoxTree<BBoxValues> }, glyphKey: any) => ({
      ...o, [glyphKey]: getBBoxValues(bboxVars.children[glyphKey])
    }), {})
  }
}
