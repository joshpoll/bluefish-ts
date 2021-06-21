import { Constraint, Expression, Operator } from 'kiwi.js';
import { bboxVars } from './kiwiBBox';

export type Gestalt = (left: bboxVars, right: bboxVars) => Constraint;

// export const alignBottom: Gestalt = '';
// export const alignLeft: Gestalt = '';

export const hSpace = (spacing: number): Gestalt => (left: bboxVars, right: bboxVars) => {
  return new Constraint(
    new Expression(left.right, spacing),
    Operator.Eq,
    new Expression(right.left)
  );
}

export const vSpace = (spacing: number): Gestalt => (left: bboxVars, right: bboxVars) => {
  return new Constraint(
    new Expression(left.bottom, spacing),
    Operator.Eq,
    new Expression(right.top)
  );
}