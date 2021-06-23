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

export type bboxValues = { [key in keyof bboxVars]: number }
export type maybeBboxValues = Partial<bboxValues>

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

export const makeGlyphConstraints = (bboxVars: bboxVars, bboxValues: maybeBboxValues): Constraint[] => {
  const constraints = [];
  for (const key of Object.keys(bboxVars) as (keyof bboxVars)[]) {
    if (bboxValues[key] !== undefined) {
      constraints.push(new Constraint(bboxVars[key], Operator.Eq, bboxValues[key]));
    }
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