import { Constraint, Expression, Operator, Solver, Variable } from 'kiwi.js';

export type bbox = string;

type bboxVars = {
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