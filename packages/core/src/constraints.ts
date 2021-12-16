import { Constraint, Expression, Operator, Strength, Variable } from 'kiwi.js';
import { bboxVarExprs } from './kiwiBBoxTransform';

export type Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => Constraint;

export const alignTop: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.top,
    Operator.Eq,
    right.top
  )
}

export const alignTopSpace = (spacing: number | Variable = new Variable()): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.top),
    Operator.Eq,
    new Expression(right.top, spacing)
  );
}

export const alignRightSpace = (spacing: number | Variable = new Variable()): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.right),
    Operator.Eq,
    new Expression(right.right, spacing)
  );
}

export const alignBottomSpace = (spacing: number | Variable = new Variable()): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.bottom, spacing),
    Operator.Eq,
    new Expression(right.bottom)
  );
}

export const alignLeftSpace = (spacing: number | Variable = new Variable()): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.left, spacing),
    Operator.Eq,
    new Expression(right.left),
  );
}

export const alignBottom: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.bottom,
    Operator.Eq,
    right.bottom
  )
}

export const alignLeft: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.left,
    Operator.Eq,
    right.left
  )
}

export const alignRight: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.right,
    Operator.Eq,
    right.right
  )
}

export const alignCenterX: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.centerX,
    Operator.Eq,
    right.centerX
  )
}

export const alignCenterY: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.centerY,
    Operator.Eq,
    right.centerY
  )
}

export const hAlignCenter = alignCenterY;
export const vAlignCenter = alignCenterX;

export const hSpace = (spacing: number | Variable = new Variable()): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.right, spacing),
    Operator.Eq,
    new Expression(right.left)
  );
}

export const vSpace = (spacing: number | Variable = new Variable()): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.bottom, spacing),
    Operator.Eq,
    new Expression(right.top)
  );
}

export const containsLeft = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.left,
    Operator.Le,
    right.left,
  )
}

export const containsRight = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.right,
    Operator.Ge,
    right.right,
  )
}

export const containsTop = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.top,
    Operator.Le,
    right.top,
  )
}

export const containsBottom = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.bottom,
    Operator.Ge,
    right.bottom,
  )
}

export const alignTopStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.top,
    Operator.Eq,
    right.top,
    Strength.strong,
  )
}

export const alignBottomStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.bottom,
    Operator.Eq,
    right.bottom,
    Strength.strong,
  )
}

export const alignLeftStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.left,
    Operator.Eq,
    right.left,
    Strength.strong,
  )
}

export const alignRightStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.right,
    Operator.Eq,
    right.right,
    Strength.strong,
  )
}

export const sameWidth: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.width,
    Operator.Eq,
    right.width
  )
}

export const sameHeight: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.height,
    Operator.Eq,
    right.height
  )
}

export const contains: Gestalt[] = [containsLeft, containsRight, containsTop, containsBottom];

export const containsShrinkWrap: Gestalt[] = [...contains, alignLeftStrong, alignRightStrong, alignTopStrong, alignBottomStrong];
