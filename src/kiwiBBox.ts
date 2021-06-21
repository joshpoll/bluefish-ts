import { Constraint, Expression, Operator, Solver, Variable } from 'kiwi.js';

export type bbox = string;

export type maybeBboxValues = {
  left?: number,
  right?: number,
  top?: number,
  bottom?: number,
  width?: number,
  height?: number,
}

export type bboxValues = {
  left: number,
  right: number,
  top: number,
  bottom: number,
  width: number,
  height: number,
}

export type bboxVars = {
  left: Variable,
  right: Variable,
  top: Variable,
  bottom: Variable,
  width: Variable,
  height: Variable,
}

export const makeBBoxVars = (bbox: bbox): bboxVars => {
  let left = new Variable(bbox + ".left");
  let right = new Variable(bbox + ".right");
  let top = new Variable(bbox + ".top");
  let bottom = new Variable(bbox + ".bottom");

  let width = new Variable(bbox + ".width");
  let height = new Variable(bbox + ".height");

  return {
    left,
    right,
    top,
    bottom,
    width,
    height
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
  return constraints;
}

export const getBBoxValues = (bboxVars: bboxVars): bboxValues => ({
  left: bboxVars.left.value(),
  right: bboxVars.right.value(),
  top: bboxVars.top.value(),
  bottom: bboxVars.bottom.value(),
  width: bboxVars.width.value(),
  height: bboxVars.height.value(),
})