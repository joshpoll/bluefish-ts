import { Gestalt } from './Encoding';
import { Constraint, Expression, Operator } from 'kiwi.js';

export const alignBottom: Gestalt = '';
export const alignLeft: Gestalt = '';
export const hSpace: (spacing: number) => Gestalt = (_) => '';

export const vSpace = (spacing: number) => (variables: any, left: string, right: string) => {
  return new Constraint(
    new Expression(variables[left].bottom, spacing),
    Operator.Eq,
    new Expression(variables[right].top)
  );
}
