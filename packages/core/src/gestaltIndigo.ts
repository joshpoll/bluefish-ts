import { bboxVarExprs } from './indigoBBoxTransform';
import { Variable, Constraint, mkAffineConstraint, plus, mkVar, strong } from 'indigo-ts';

export type Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => Constraint;

export const alignTop: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    'eq',
    right.top
  )
}

export const alignTopSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    'eq',
    plus(right.top, spacing)
  );
}

export const alignRightSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    'eq',
    plus(right.right, spacing)
  );
}

export const alignBottomSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.bottom, spacing),
    'eq',
    right.bottom,
  );
}

export const alignLeftSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.left, spacing),
    'eq',
    right.left,
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

export const hAlignCenter = alignCenterY;
export const vAlignCenter = alignCenterX;

export const hSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.right, spacing),
    'eq',
    right.left,
  );
}

export const vSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.bottom, spacing),
    'eq',
    right.top,
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
    strong,
  )
}

export const alignBottomStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.bottom,
    'eq',
    right.bottom,
    strong,
  )
}

export const alignLeftStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.left,
    'eq',
    right.left,
    strong,
  )
}

export const alignRightStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    'eq',
    right.right,
    strong,
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

export const contains: Gestalt[] = [containsLeft, containsRight, containsTop, containsBottom];

export const containsShrinkWrap: Gestalt[] = [...contains, alignLeftStrong, alignRightStrong, alignTopStrong, alignBottomStrong];
