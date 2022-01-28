import { Constraint, Operator, Solver, Strength, Variable, Expression } from 'kiwi.js';

export const ppOperator = (o: Operator): string => {
  switch (o) {
    case Operator.Eq:
      return "==";
    case Operator.Ge:
      return ">=";
    case Operator.Le:
      return "<=";
    default:
      throw `Invalid operator ${o}`
  }
}

export const ppStrength = (s: Strength): string => {
  switch (s) {
    case Strength.required:
      return "required"
    case Strength.strong:
      return "strong"
    case Strength.medium:
      return "medium"
    case Strength.weak:
      return "weak"
    default:
      return s.toString()
  }
}

export const ppConstraint = (c: Constraint): string => {
  return `${c.expression().toString()} ${ppOperator(c.op())} (${ppStrength(c.strength())})`;
}
