import { BBoxValues, bboxVarExprs } from './kiwiBBoxTransform';
import { render, createShape, Relation, Shape, ShapeFn, ShapeValue, compileShapeValue } from './indigoShapeAPI';
import * as constraints from './indigoConstraints';
import * as marks from './indigoMarks';

import { BFPrimitive, BFObject, BFArray, RelativePath, AbsolutePath, Ref, RelativeBFRef, BFRef, BFValue, RelativeBFValue, AbsoluteBFValue, ref, makePathsAbsolute } from './absoluteDataPaths';

export {
  createShape,
  render,
  constraints,
  marks,
  ref,
  makePathsAbsolute,
  compileShapeValue,
}

export type {
  Shape,
  ShapeFn,
  BBoxValues,
  bboxVarExprs,
  Relation,
  BFPrimitive,
  BFObject,
  BFArray,
  RelativePath,
  AbsolutePath,
  Ref,
  RelativeBFRef,
  BFRef,
  BFValue,
  RelativeBFValue,
  AbsoluteBFValue,
  ShapeValue,
}
