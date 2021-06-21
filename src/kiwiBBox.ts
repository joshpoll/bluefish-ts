import { Constraint, Expression, Operator, Solver, Variable } from 'kiwi.js';

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

export type maybeBboxValues = {
  left?: number,
  right?: number,
  top?: number,
  bottom?: number,
  width?: number,
  height?: number,
  centerX?: number,
  centerY?: number,
}

export type bboxValues = {
  left: number,
  right: number,
  top: number,
  bottom: number,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
}

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

export const makeBBoxConstraints = (bboxVars: bboxVars): Constraint[] => {
  return [
    // TODO: hacking in canvas constraints for now, but they should really go on some canvas object
    // somewhere
    new Constraint(bboxVars.left, Operator.Ge, 0),
    new Constraint(bboxVars.top, Operator.Ge, 0),
    new Constraint(bboxVars.width, Operator.Eq, new Expression(bboxVars.right, [-1, bboxVars.left])),
    new Constraint(bboxVars.height, Operator.Eq, new Expression(bboxVars.bottom, [-1, bboxVars.top])),
    new Constraint(bboxVars.centerX, Operator.Eq, new Expression(bboxVars.left, bboxVars.right).divide(2)),
    new Constraint(bboxVars.centerY, Operator.Eq, new Expression(bboxVars.top, bboxVars.bottom).divide(2)),
  ]
}

// TODO: make this simpler?
export const makeGlyphConstraints = (bboxVars: bboxVars, bboxValues: maybeBboxValues): Constraint[] => {
  const constraints = [];
  if (bboxValues.left !== undefined) {
    constraints.push(new Constraint(bboxVars.left, Operator.Eq, bboxValues.left))
  }
  if (bboxValues.right !== undefined) {
    constraints.push(new Constraint(bboxVars.right, Operator.Eq, bboxValues.right))
  }
  if (bboxValues.top !== undefined) {
    constraints.push(new Constraint(bboxVars.top, Operator.Eq, bboxValues.top))
  }
  if (bboxValues.bottom !== undefined) {
    constraints.push(new Constraint(bboxVars.bottom, Operator.Eq, bboxValues.bottom))
  }
  if (bboxValues.width !== undefined) {
    constraints.push(new Constraint(bboxVars.width, Operator.Eq, bboxValues.width))
  }
  if (bboxValues.height !== undefined) {
    constraints.push(new Constraint(bboxVars.height, Operator.Eq, bboxValues.height))
  }
  if (bboxValues.centerX !== undefined) {
    constraints.push(new Constraint(bboxVars.centerX, Operator.Eq, bboxValues.centerX))
  }
  if (bboxValues.centerY !== undefined) {
    constraints.push(new Constraint(bboxVars.centerY, Operator.Eq, bboxValues.centerY))
  }
  return constraints;
}

export const getBBoxValues = (bboxVars: bboxVars): bboxValues => ({
  left: bboxVars.left.value(),
  right: bboxVars.right.value(),
  top: bboxVars.top.value(),
  bottom: bboxVars.bottom.value(),
  width: bboxVars.width.value(),
  height: bboxVars.height.value(),
  centerX: bboxVars.centerX.value(),
  centerY: bboxVars.centerY.value(),
})