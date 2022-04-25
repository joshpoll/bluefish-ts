import { Constraint, mkAffineConstraint, plus, Variable, mkVar, strong } from 'indigo-ts';
import { bboxVarExprs } from './indigoBBoxTransform';

const Strength = {
  strong: strong,
}

type Operator = 'le' | 'eq' | 'ge';

export type Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => Constraint;

export const alignTop: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    'eq',
    right.top
  )
}

export const alignTopSpace = (spacing: number | Variable = mkVar(''), strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    operator ?? 'eq',
    plus(right.top, spacing),
    strength,
  );
}

export const alignRightSpace = (spacing: number | Variable = mkVar(''), strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    operator ?? 'eq',
    plus(right.right, spacing),
    strength,
  );
}

export const alignBottomSpace = (spacing: number | Variable = mkVar(''), strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.bottom, spacing),
    operator ?? 'eq',
    right.bottom,
    strength,
  );
}

export const alignLeftSpace = (spacing: number | Variable = mkVar(''), strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.left, spacing),
    operator ?? 'eq',
    right.left,
    strength,
  );
}

export const alignBottom: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.bottom,
    'eq',
    right.bottom
  )
}

export const alignLeft: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.left,
    'eq',
    right.left
  )
}

export const alignRight: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    'eq',
    right.right
  )
}

export const alignCenterX: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.centerX,
    'eq',
    right.centerX
  )
}

export const alignCenterY: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.centerY,
    'eq',
    right.centerY
  )
}

export const alignCenterXStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.centerX,
    'eq',
    right.centerX,
    Strength.strong,
  )
}

export const alignCenterYStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.centerY,
    'eq',
    right.centerY,
    Strength.strong,
  )
}

export const alignCenterXOptions = (strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.centerX,
    operator ?? 'eq',
    right.centerX,
    strength,
  )
}

export const alignCenterYOptions = (strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.centerY,
    operator ?? 'eq',
    right.centerY,
    strength,
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

export const hAlignCenterOptions = alignCenterYOptions;
export const vAlignCenterOptions = alignCenterXOptions;

export const alignCenterOptions = alignCenterXOptions;
export const alignMiddleOptions = alignCenterYOptions;

export const hSpace = (spacing: number | Variable = mkVar(''), strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.right, spacing),
    operator ?? 'eq',
    right.left,
    strength,
  );
}

export const vSpace = (spacing: number | Variable = mkVar(''), strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.bottom, spacing),
    operator ?? 'eq',
    right.top,
    strength,
  );
}

export const containsLeft = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.left,
    'le',
    right.left,
  )
}

export const containsRight = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    'ge',
    right.right,
  )
}

export const containsTop = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    'le',
    right.top,
  )
}

export const containsBottom = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.bottom,
    'ge',
    right.bottom,
  )
}

export const alignTopStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    'eq',
    right.top,
    Strength.strong,
  )
}

export const alignBottomStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.bottom,
    'eq',
    right.bottom,
    Strength.strong,
  )
}

export const alignLeftStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.left,
    'eq',
    right.left,
    Strength.strong,
  )
}

export const alignRightStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    'eq',
    right.right,
    Strength.strong,
  )
}

export const alignTopOptions = (strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    operator ?? 'eq',
    right.top,
    strength,
  )
}

export const alignBottomOptions = (strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.bottom,
    operator ?? 'eq',
    right.bottom,
    strength,
  )
}

export const alignLeftOptions = (strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.left,
    operator ?? 'eq',
    right.left,
    strength,
  )
}

export const alignRightOptions = (strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    operator ?? 'eq',
    right.right,
    strength,
  )
}

export const sameWidth: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.width,
    'eq',
    right.width
  )
}

export const sameHeight: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.height,
    'eq',
    right.height
  )
}

export const sameWidthStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.width,
    'eq',
    right.width,
    Strength.strong,
  )
}

export const sameHeightStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.height,
    'eq',
    right.height,
    Strength.strong,
  )
}

export const sameWidthOptions = (strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.width,
    operator ?? 'eq',
    right.width,
    strength,
  )
}

export const sameHeightOptions = (strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.height,
    operator ?? 'eq',
    right.height,
    strength,
  )
}

export const contains: Gestalt[] = [containsLeft, containsRight, containsTop, containsBottom];

export const containsShrinkWrap: Gestalt[] = [...contains, alignLeftStrong, alignRightStrong, alignTopStrong, alignBottomStrong];

// used for circles
export const eqWidthHeight = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.width,
    'eq',
    right.height,
  )
}

export const makeEqual = (leftDim: keyof bboxVarExprs, rightDim: keyof bboxVarExprs, strength?: number, operator?: Operator) =>
  (left: bboxVarExprs, right: bboxVarExprs) => {
    return mkAffineConstraint(
      left[leftDim],
      operator ?? 'eq',
      right[rightDim],
      strength,
    )
  }

export const eqWidthHeightStrong = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.width,
    'eq',
    right.height,
    Strength.strong,
  )
}

export const eqWidthHeightOptions = (strength?: number, operator?: Operator): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.width,
    operator ?? 'eq',
    right.height,
    Strength.strong,
  )
}
