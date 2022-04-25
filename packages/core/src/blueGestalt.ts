import { bboxVarExprs } from './blueBBoxTransform';
// import { Variable, Constraint, mkAffineConstraint, plus, mkVar, strong } from 'indigo-ts';
import { blue } from 'indigo-ts';
type Constraint = blue.Constraint;
type Variable = blue.Variable;
const mkAffineConstraint = blue.mkAffineConstraint;
const plus = blue.plus;
const strong = blue.strong;
// TODO: figure out how to actually do the variable sharing stuff...
const mkVar = (s: string) => s;

export type Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => Constraint;

export const alignTop: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    right.top
  )
}

export const alignTopSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    plus(right.top, spacing)
  );
}

export const alignRightSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    plus(right.right, spacing)
  );
}

export const alignBottomSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.bottom, spacing),
    right.bottom,
  );
}

export const alignLeftSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.left, spacing),
    right.left,
  );
}

export const alignBottom: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.bottom,
    right.bottom
  )
}

export const alignLeft: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.left,
    right.left
  )
}

export const alignRight: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    right.right
  )
}

export const alignCenterX: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.centerX,
    right.centerX
  )
}

export const alignCenterY: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.centerY,
    right.centerY
  )
}

export const hAlignCenter = alignCenterY;
export const vAlignCenter = alignCenterX;

export const hSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.right, spacing),
    right.left,
  );
}

export const vSpace = (spacing: number | Variable = mkVar('')): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    plus(left.bottom, spacing),
    right.top,
  );
}

export const alignTopStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.top,
    right.top,
    strong,
  )
}

export const alignBottomStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.bottom,
    right.bottom,
    strong,
  )
}

export const alignLeftStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.left,
    right.left,
    strong,
  )
}

export const alignRightStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.right,
    right.right,
    strong,
  )
}

export const sameWidth: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.width,
    right.width
  )
}

export const sameHeight: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
  return mkAffineConstraint(
    left.height,
    right.height
  )
}

// TODO: contains constraint should use max and min somehow...
// export const contains: Gestalt[] = [containsLeft, containsRight, containsTop, containsBottom];

// export const containsShrinkWrap: Gestalt[] = [...contains, alignLeftStrong, alignRightStrong, alignTopStrong, alignBottomStrong];
