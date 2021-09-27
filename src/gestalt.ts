import { Constraint, Expression, Operator } from 'kiwi.js';
import { bboxVarExprs } from './kiwiBBoxTransform';

export type Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => Constraint;

export const alignTop: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.top,
    Operator.Eq,
    right.top
  )
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

export const hSpace = (spacing: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.right, spacing),
    Operator.Eq,
    new Expression(right.left)
  );
}

export const vSpace = (spacing: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.bottom, spacing),
    Operator.Eq,
    new Expression(right.top)
  );
}