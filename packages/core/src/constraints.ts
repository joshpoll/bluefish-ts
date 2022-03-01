import { Constraint, Expression, Operator, Strength, Variable } from 'kiwi.js';
import { bboxVarExprs } from './kiwiBBoxTransform';

export type Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => Constraint;

export const alignTop: Gestalt = (left: bboxVarExprs, right: bboxVarExprs, strength?: number) => {
  return new Constraint(
    left.top,
    Operator.Eq,
    right.top,
    strength,
  )
}

export const alignTopSpace = (spacing: number | Variable = new Variable(), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.top),
    Operator.Eq,
    new Expression(right.top, spacing),
    strength,
  );
}

export const alignRightSpace = (spacing: number | Variable = new Variable(), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.right),
    Operator.Eq,
    new Expression(right.right, spacing),
    strength,
  );
}

export const alignBottomSpace = (spacing: number | Variable = new Variable(), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.bottom, spacing),
    Operator.Eq,
    new Expression(right.bottom),
    strength,
  );
}

export const alignLeftSpace = (spacing: number | Variable = new Variable(), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.left, spacing),
    Operator.Eq,
    new Expression(right.left),
    strength,
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

export const alignCenterXStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.centerX,
    Operator.Eq,
    right.centerX,
    Strength.strong,
  )
}

export const alignCenterYStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.centerY,
    Operator.Eq,
    right.centerY,
    Strength.strong,
  )
}

export const hAlignCenter = alignCenterY;
export const vAlignCenter = alignCenterX;

export const alignCenter = alignCenterX;
export const alignMiddle = alignCenterY;

export const hAlignCenterStrong = alignCenterYStrong;
export const vAlignCenterStrong = alignCenterXStrong;

export const alignCenterStrong = alignCenterXStrong;
export const alignMiddleStrong = alignCenterYStrong;

export const hSpace = (spacing: number | Variable = new Variable(), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.right, spacing),
    Operator.Eq,
    new Expression(right.left),
    strength,
  );
}

export const vSpace = (spacing: number | Variable = new Variable(), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    new Expression(left.bottom, spacing),
    Operator.Eq,
    new Expression(right.top),
    strength,
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

export const sameWidthStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.width,
    Operator.Eq,
    right.width,
    Strength.strong,
  )
}

export const sameHeightStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.height,
    Operator.Eq,
    right.height,
    Strength.strong,
  )
}

export const contains: Gestalt[] = [containsLeft, containsRight, containsTop, containsBottom];

export const containsShrinkWrap: Gestalt[] = [...contains, alignLeftStrong, alignRightStrong, alignTopStrong, alignBottomStrong];

// used for circles
export const eqWidthHeight = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.width,
    Operator.Eq,
    right.height,
  )
}

export const makeEqual = (leftDim: keyof bboxVarExprs, rightDim: keyof bboxVarExprs) =>
  (left: bboxVarExprs, right: bboxVarExprs) => {
    return new Constraint(
      left[leftDim],
      Operator.Eq,
      right[rightDim],
    )
  }

export const eqWidthHeightStrong = (left: bboxVarExprs, right: bboxVarExprs) => {
  return new Constraint(
    left.width,
    Operator.Eq,
    right.height,
    Strength.strong,
  )
}

export const makeEqualStrong = (leftDim: keyof bboxVarExprs, rightDim: keyof bboxVarExprs) =>
  (left: bboxVarExprs, right: bboxVarExprs) => {
    return new Constraint(
      left[leftDim],
      Operator.Eq,
      right[rightDim],
      Strength.strong,
    )
  }
