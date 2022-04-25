// // import { Constraint, mkAffineConstraint, plus, Variable, mkVar, strong } from 'indigo-ts';
// import { blue } from 'indigo-ts';
// import { bboxVarExprs } from './blueBBoxTransform';

// type Constraint = blue.Constraint;
// const mkAffineConstraint = blue.mkAffineConstraint;
// const plus = blue.plus;
// type Variable = blue.Variable;
// const mkVar = (s: string) => s;

// const Strength = {
//   strong: blue.strong,
// }

// export type Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => Constraint;

// export const alignTop: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.top,
//     right.top
//   )
// }

// export const alignTopSpace = (spacing: number | Variable = mkVar(''), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.top,
//     plus(right.top, spacing),
//     strength,
//   );
// }

// export const alignRightSpace = (spacing: number | Variable = mkVar(''), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.right,
//     plus(right.right, spacing),
//     strength,
//   );
// }

// export const alignBottomSpace = (spacing: number | Variable = mkVar(''), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     plus(left.bottom, spacing),
//     right.bottom,
//     strength,
//   );
// }

// export const alignLeftSpace = (spacing: number | Variable = mkVar(''), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     plus(left.left, spacing),
//     right.left,
//     strength,
//   );
// }

// export const alignBottom: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.bottom,
//     right.bottom
//   )
// }

// export const alignLeft: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.left,
//     right.left
//   )
// }

// export const alignRight: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.right,
//     right.right
//   )
// }

// export const alignCenterX: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.centerX,
//     right.centerX
//   )
// }

// export const alignCenterY: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.centerY,
//     right.centerY
//   )
// }

// export const alignCenterXStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.centerX,
//     right.centerX,
//     Strength.strong,
//   )
// }

// export const alignCenterYStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.centerY,
//     right.centerY,
//     Strength.strong,
//   )
// }

// export const alignCenterXOptions = (strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.centerX,
//     right.centerX,
//     strength,
//   )
// }

// export const alignCenterYOptions = (strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.centerY,
//     right.centerY,
//     strength,
//   )
// }

// export const hAlignCenter = alignCenterY;
// export const vAlignCenter = alignCenterX;

// export const alignCenter = alignCenterX;
// export const alignMiddle = alignCenterY;

// export const hAlignCenterStrong = alignCenterYStrong;
// export const vAlignCenterStrong = alignCenterXStrong;

// export const alignCenterStrong = alignCenterXStrong;
// export const alignMiddleStrong = alignCenterYStrong;

// export const hAlignCenterOptions = alignCenterYOptions;
// export const vAlignCenterOptions = alignCenterXOptions;

// export const alignCenterOptions = alignCenterXOptions;
// export const alignMiddleOptions = alignCenterYOptions;

// export const hSpace = (spacing: number | Variable = mkVar(''), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     plus(left.right, spacing),
//     right.left,
//     strength,
//   );
// }

// export const vSpace = (spacing: number | Variable = mkVar(''), strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     plus(left.bottom, spacing),
//     right.top,
//     strength,
//   );
// }

// // export const containsLeft = (left: bboxVarExprs, right: bboxVarExprs) => {
// //   return mkAffineConstraint(
// //     left.left,
// //     'le',
// //     right.left,
// //   )
// // }

// // export const containsRight = (left: bboxVarExprs, right: bboxVarExprs) => {
// //   return mkAffineConstraint(
// //     left.right,
// //     'ge',
// //     right.right,
// //   )
// // }

// // export const containsTop = (left: bboxVarExprs, right: bboxVarExprs) => {
// //   return mkAffineConstraint(
// //     left.top,
// //     'le',
// //     right.top,
// //   )
// // }

// // export const containsBottom = (left: bboxVarExprs, right: bboxVarExprs) => {
// //   return mkAffineConstraint(
// //     left.bottom,
// //     'ge',
// //     right.bottom,
// //   )
// // }

// export const alignTopStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.top,
//     right.top,
//     Strength.strong,
//   )
// }

// export const alignBottomStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.bottom,
//     right.bottom,
//     Strength.strong,
//   )
// }

// export const alignLeftStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.left,
//     right.left,
//     Strength.strong,
//   )
// }

// export const alignRightStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.right,
//     right.right,
//     Strength.strong,
//   )
// }

// export const alignTopOptions = (strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.top,
//     right.top,
//     strength,
//   )
// }

// export const alignBottomOptions = (strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.bottom,
//     right.bottom,
//     strength,
//   )
// }

// export const alignLeftOptions = (strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.left,
//     right.left,
//     strength,
//   )
// }

// export const alignRightOptions = (strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.right,
//     right.right,
//     strength,
//   )
// }

// export const sameWidth: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.width,
//     right.width
//   )
// }

// export const sameHeight: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.height,
//     right.height
//   )
// }

// export const sameWidthStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.width,
//     right.width,
//     Strength.strong,
//   )
// }

// export const sameHeightStrong: Gestalt = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.height,
//     right.height,
//     Strength.strong,
//   )
// }

// export const sameWidthOptions = (strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.width,
//     right.width,
//     strength,
//   )
// }

// export const sameHeightOptions = (strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.height,
//     right.height,
//     strength,
//   )
// }

// export const sameSize: Gestalt[] = [sameWidth, sameHeight];
// export const sameBox: Gestalt[] = [...sameSize, alignCenter, alignMiddle];

// // export const contains: Gestalt[] = [containsLeft, containsRight, containsTop, containsBottom];

// // export const containsShrinkWrap: Gestalt[] = [...contains, alignLeftStrong, alignRightStrong, alignTopStrong, alignBottomStrong];

// // used for circles
// export const eqWidthHeight = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.width,
//     right.height,
//   )
// }

// export const makeEqual = (leftDim: keyof bboxVarExprs, rightDim: keyof bboxVarExprs, strength?: number) =>
//   (left: bboxVarExprs, right: bboxVarExprs) => {
//     return mkAffineConstraint(
//       left[leftDim],
//       right[rightDim],
//       strength,
//     )
//   }

// export const eqWidthHeightStrong = (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.width,
//     right.height,
//     Strength.strong,
//   )
// }

// export const eqWidthHeightOptions = (strength?: number): Gestalt => (left: bboxVarExprs, right: bboxVarExprs) => {
//   return mkAffineConstraint(
//     left.width,
//     right.height,
//     Strength.strong,
//   )
// }

export { }