import { Constraint, Expression, Operator, Solver, Variable } from 'kiwi.js';
import { GlyphWithPath } from './compile';

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

export type bboxValues = { [key in keyof bboxVars]: number }
export type maybeBboxValues = Partial<bboxValues> | undefined

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
export const addBBoxConstraints = (bboxTree: BBoxTree<bboxVars>, encoding: GlyphWithPath, constraints: Constraint[]): void => {
  const keys = Object.keys(bboxTree.children);
  keys.forEach((key) => addBBoxConstraints(bboxTree.children[key], encoding.children[key], constraints));

  if (encoding.bbox !== undefined) {
    for (const key of Object.keys(encoding.bbox) as (keyof bboxValues)[]) {
      if (encoding.bbox[key] !== undefined) {
        constraints.push(new Constraint(bboxTree.bbox[key], Operator.Eq, encoding.bbox[key]));
      }
    }
  }

  constraints.push(new Constraint(bboxTree.bbox.width, Operator.Eq, new Expression(bboxTree.bbox.right, [-1, bboxTree.bbox.left])));
  constraints.push(new Constraint(bboxTree.bbox.height, Operator.Eq, new Expression(bboxTree.bbox.bottom, [-1, bboxTree.bbox.top])));
  constraints.push(new Constraint(bboxTree.bbox.centerX, Operator.Eq, new Expression(bboxTree.bbox.left, bboxTree.bbox.right).divide(2)));
  constraints.push(new Constraint(bboxTree.bbox.centerY, Operator.Eq, new Expression(bboxTree.bbox.top, bboxTree.bbox.bottom).divide(2)));
}

export const makeGlyphConstraints = (bboxVars: bboxVars, bboxValues: maybeBboxValues): Constraint[] => {
  const constraints = [];
  if (bboxValues !== undefined) {
    for (const key of Object.keys(bboxVars) as (keyof bboxVars)[]) {
      if (bboxValues[key] !== undefined) {
        constraints.push(new Constraint(bboxVars[key], Operator.Eq, bboxValues[key]));
      }
    }
  }

  return constraints;
}

export type BBoxTree<T> = {
  bbox: T,
  children: { [key: string]: BBoxTree<T> },
}

export const getBBoxValues = (bboxVars: BBoxTree<bboxVars>): BBoxTree<bboxValues> => {
  return {
    bbox: {
      left: bboxVars.bbox.left.value(),
      right: bboxVars.bbox.right.value(),
      top: bboxVars.bbox.top.value(),
      bottom: bboxVars.bbox.bottom.value(),
      width: bboxVars.bbox.width.value(),
      height: bboxVars.bbox.height.value(),
      centerX: bboxVars.bbox.centerX.value(),
      centerY: bboxVars.bbox.centerY.value(),
    },
    children: Object.keys(bboxVars.children).reduce((o: { [key: string]: BBoxTree<bboxValues> }, glyphKey: any) => ({
      ...o, [glyphKey]: getBBoxValues(bboxVars.children[glyphKey])
    }), {})
  }
}
