import { Constraint, Expression, Operator } from 'kiwi.js';
import { bboxVars } from './kiwiBBox';

export type Gestalt = any;

export const alignBottom: Gestalt = '';
export const alignLeft: Gestalt = '';
export const hSpace: (spacing: number) => Gestalt = (_) => '';

export const vSpace = (spacing: number) => (left: bboxVars, right: bboxVars) => {
  return new Constraint(
    new Expression(left.bottom, spacing),
    Operator.Eq,
    new Expression(right.top)
  );
}
