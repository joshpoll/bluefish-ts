// // import { Variable, mkVar, AffineExpr, mkAffineConstraint, Constraint, plus, mul, mkEqConstraint,
// // mkConstEqConstraint, weak } from 'indigo-ts';
// import { blue } from 'indigo-ts';
// import _ from 'lodash';
// import { Gestalt } from "./blueGestalt";
// import { BBoxTree, getBBoxValues, makeBBoxVars, bboxVars, BBoxValues, MaybeBBoxValues, BBoxTreeValue, BBoxTreeVV, bboxVarExprs, transformBBox, Transform } from './blueBBoxTransform';
// import { objectFilter, objectMap } from './objectMap';
// import { mkMinMaxConstraint } from 'indigo-ts/dist/blue';

// type AffineExpr = blue.AffineExpr;
// const mul = blue.mul;
// const plus = blue.plus;
// type Variable = blue.Variable;
// const mkAffineConstraint = blue.mkAffineConstraint;
// type Constraint = blue.Constraint;
// const mkConstEqConstraint = blue.mkConstEqConstraint;
// // TODO
// const mkVar = (s: string) => s;

// const neg = (e: AffineExpr): AffineExpr => mul(-1, e);
// const div = (e: AffineExpr, c: number): AffineExpr => mul(1 / c, e);

// const Strength = {
//   required: blue.required,
//   strong: blue.strong,
//   medium: blue.medium,
//   weak: blue.weak,
//   weaker: blue.weaker,
// }

// export type BBoxTreeInherit<T, U> = {
//   isSet: boolean,
//   inheritFrame: boolean,
//   bbox: T, // equals transform(canvas)
//   canvas: T,
//   // if we have the child "own" its transform, we are implicitly assuming it has a single coordinate
//   // space owner that is applying this transform
//   // if we instead have the parent "own" its children's transforms by pushing it into the children
//   // field, then it could be possible that the child exists in multiple places, right? well not
//   // exactly since it's still a tree structure.
//   // I think it is easiest/best for now to have the child own its transform, because recursion is
//   // much easier and bbox used to live here so the change is smaller.
//   transform: Transform<U>,
//   children: { [key: string]: BBoxTreeInherit<T, U> },
// }

// export type BBoxTreeInheritRef<T, U> = {
//   $ref: boolean,
//   isSet: boolean,
//   inheritFrame: boolean,
//   bbox: T, // equals transform(canvas)
//   canvas: T,
//   // if we have the child "own" its transform, we are implicitly assuming it has a single coordinate
//   // space owner that is applying this transform
//   // if we instead have the parent "own" its children's transforms by pushing it into the children
//   // field, then it could be possible that the child exists in multiple places, right? well not
//   // exactly since it's still a tree structure.
//   // I think it is easiest/best for now to have the child own its transform, because recursion is
//   // much easier and bbox used to live here so the change is smaller.
//   transform: Transform<U>,
//   children: { [key: string]: BBoxTreeInheritRef<T, U> },
// }

// export type BBoxTreeVVE =
//   BBoxTreeInheritRef<{ bboxVars: bboxVarExprs, bboxValues?: MaybeBBoxValues }, Variable>

// export type CompiledAST = {
//   // bboxValues: BBoxTree<BBoxValues>
//   bboxValues: BBoxTreeValue,
//   encoding: GlyphWithPathNoRef,
// }

// export type Relation = {
//   left: string,
//   right: string,
//   gestalt: Gestalt[],
// }

// export type Ref = { $ref: true, path: string[] }

// export type Glyph = {
//   isSet: boolean,
//   inheritFrame: boolean,
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   children?: { [key: string]: Glyph },
//   relations?: Relation[]
// } | Ref

// export type GlyphNoRef = {
//   isSet: boolean,
//   inheritFrame: boolean,
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   children?: { [key: string]: GlyphNoRef },
//   relations?: Relation[]
// }

// export type GlyphWithPath = {
//   isSet: boolean,
//   inheritFrame: boolean,
//   pathList: string[],
//   path: string,
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   children?: { [key: string]: GlyphWithPath },
//   relations?: Relation[]
// } | Ref

// export type GlyphWithPathNoRef = {
//   isSet: boolean,
//   inheritFrame: boolean,
//   pathList: string[],
//   path: string,
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   children: { [key: string]: GlyphWithPathNoRef },
// }

// // export type ResolvedGlyph = {
// //   pathList: string[],
// //   path: string,
// //   bbox?: MaybeBBoxValues,
// //   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
// //   children: { [key: string]: ResolvedGlyph },
// //   relations?: Relation[]
// // }

// // export type ResolvedGlyph = {
// //   bbox?: MaybeBBoxValues,
// //   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
// //   children: { [key: string]: ResolvedGlyph },
// //   relations?: Relation[]
// // }

// // export type ResolvedGlyphWithPath = {
// //   path: string,
// //   bbox?: MaybeBBoxValues,
// //   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
// //   children: { [key: string]: ResolvedGlyphWithPath },
// //   relations?: Relation[]
// // }

// export type Mark = {
//   bbox: MaybeBBoxValues,
//   renderFn: (canvas: BBoxValues, index?: number) => JSX.Element,
// }

// const dimDefined = (dim: keyof BBoxValues) => (bboxTree: BBoxTreeVVE) => {
//   return bboxTree.canvas.bboxValues !== undefined && bboxTree.canvas.bboxValues[dim] !== undefined;
// }

// const widthDefined = dimDefined('width');
// const heightDefined = dimDefined('height');

// /* mutates constraints */
// const addChildrenConstraints = (bboxTree: BBoxTreeVVE, constraints: Constraint[]): void => {
//   const keys = Object.keys(bboxTree.children);
//   keys.forEach((key) => addChildrenConstraints(bboxTree.children[key], constraints));

//   // lightly suggest the origin of the canvas
//   constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.left, 0, Strength.weak));
//   constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.top, 0, Strength.weak));

//   // break ties with competing bbox shrinkwraps from above and below. encourages bounding boxes to
//   // fit their contents
//   constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.width, 0, Strength.strong));
//   constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.height, 0, Strength.strong));

//   // TODO: padding around bbox?
//   // TODO: origin must also be contained in bbox?
//   // TODO: what if height and/or width is defined??? I think maybe we should still require this
//   // constraint, because it's simpler to reason about. Hmm... but what if I want to like make a
//   // 1000x1000 box and then place some stuff randomly inside it? In that case I don't want them to
//   // be linked, right? Maybe require people to specify a background anyway? Otherwise it's difficult
//   // to distinguish between things respecting this containment property and things not.
//   // Maybe just drop the relevant constraints if width or height is specified
//   // Maybe give users a toggle?
//   constraints.push(mkMinMaxConstraint(bboxTree.canvas.bboxVars.left, 'min', Object.values(bboxTree.children).map(c => c.bbox.bboxVars.left)));
//   constraints.push(mkMinMaxConstraint(bbo xTree.canvas.bboxVars.right, 'max', Object.values(bboxTree.children).map(c => c.bbox.bboxVars.right)));
//   constraints.push(mkMinMaxConstraint(bboxTree.canvas.bboxVars.top, 'min', Object.values(bboxTree.children).map(c => c.bbox.bboxVars.top)));
//   constraints.push(mkMinMaxConstraint(bboxTree.canvas.bboxVars.bottom, 'max', Object.values(bboxTree.children).map(c => c.bbox.bboxVars.bottom)));

//   // 2. add canvas shrink-wrap + container constraints
//   for (const bboxKey of Object.keys(bboxTree.children)) {
//     // only shrink-wrap if width and/or height aren't defined
//     if (!widthDefined(bboxTree)) {
//       constraints.push(mkAffineConstraint(bboxTree.children[bboxKey].bbox.bboxVars.left, bboxTree.canvas.bboxVars.left, widthDefined(bboxTree.children[bboxKey]) ? Strength.medium : Strength.medium));
//       constraints.push(mkAffineConstraint(bboxTree.children[bboxKey].bbox.bboxVars.right, bboxTree.canvas.bboxVars.right, widthDefined(bboxTree.children[bboxKey]) ? Strength.medium : Strength.medium));
//     }

//     if (!heightDefined(bboxTree)) {
//       constraints.push(mkAffineConstraint(bboxTree.children[bboxKey].bbox.bboxVars.top, bboxTree.canvas.bboxVars.top, heightDefined(bboxTree.children[bboxKey]) ? Strength.medium : Strength.medium));
//       constraints.push(mkAffineConstraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, bboxTree.canvas.bboxVars.bottom, heightDefined(bboxTree.children[bboxKey]) ? Strength.medium : Strength.medium));
//     }

//     // console.log("constraining", bboxKey, bboxTree.children[bboxKey].bbox.bboxVars);

//     // add containment constraints always
//     constraints.push(mkAffineConstraint(bboxTree.children[bboxKey].bbox.bboxVars.left, 'ge', bboxTree.canvas.bboxVars.left));
//     constraints.push(mkAffineConstraint(bboxTree.children[bboxKey].bbox.bboxVars.right, 'le', bboxTree.canvas.bboxVars.right));
//     constraints.push(mkAffineConstraint(bboxTree.children[bboxKey].bbox.bboxVars.top, 'ge', bboxTree.canvas.bboxVars.top));
//     constraints.push(mkAffineConstraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, 'le', bboxTree.canvas.bboxVars.bottom));
//   }
// }

// type BBoxTreeInheritWithRef<T, U> = {
//   isSet: boolean,
//   inheritFrame: boolean,
//   bbox: T, // equals transform(canvas)
//   canvas: T,
//   // if we have the child "own" its transform, we are implicitly assuming it has a single coordinate
//   // space owner that is applying this transform
//   // if we instead have the parent "own" its children's transforms by pushing it into the children
//   // field, then it could be possible that the child exists in multiple places, right? well not
//   // exactly since it's still a tree structure.
//   // I think it is easiest/best for now to have the child own its transform, because recursion is
//   // much easier and bbox used to live here so the change is smaller.
//   transform: Transform<U>,
//   children: { [key: string]: BBoxTreeInheritWithRef<T, U> },
// } | Ref

// export type BBoxTreeVVEWithRef = BBoxTreeInheritWithRef<{ bboxVars: bboxVarExprs, bboxValues?: MaybeBBoxValues }, Variable>;
// // export type BBoxTreeVarsWithRef = BBoxTreeWithRef<bboxVars, Variable>;
// // export type BBoxTreeVars = BBoxTree<bboxVars, Variable>;

// const makeBBoxTreeWithRef = (encoding: GlyphWithPath, constraints: Constraint[]): BBoxTreeVVEWithRef => {
//   if ("$ref" in encoding) {
//     return encoding
//   } else {
//     const children = encoding.children === undefined ? {} : encoding.children;
//     const keys = Object.keys(children);
//     const compiledChildren: { [key: string]: BBoxTreeVVEWithRef } = keys.reduce((o: { [key: string]: BBoxTreeVV }, glyphKey: any) => (
//       {
//         ...o, [glyphKey]: makeBBoxTreeWithRef(children[glyphKey], constraints)
//       }
//     ), {});

//     const bbox = {
//       bboxVars: makeBBoxVars(encoding.path),
//       bboxValues: encoding.bbox,
//     };

//     const transform = {
//       translate: {
//         x: mkVar(encoding.path + ".transform" + ".translate" + ".x"),
//         y: mkVar(encoding.path + ".transform" + ".translate" + ".y"),
//       }
//     };

//     constraints.push(mkConstEqConstraint(transform.translate.x, 0, Strength.weak));
//     constraints.push(mkConstEqConstraint(transform.translate.y, 0, Strength.weak));

//     const canvas = {
//       bboxVars: makeBBoxVars(encoding.path + ".canvas"),
//     };

//     return {
//       isSet: encoding.isSet,
//       inheritFrame: encoding.inheritFrame,
//       bbox,
//       transform,
//       canvas,
//       children: compiledChildren,
//     }
//   }
// }

// // const makeBBoxTree = (encoding: ResolvedGlyph): BBoxTreeVV => {
// //   const children = encoding.children === undefined ? {} : encoding.children;
// //   const keys = Object.keys(children);
// //   const compiledChildren: { [key: string]: BBoxTreeVV } = keys.reduce((o: { [key: string]: BBoxTreeVV }, glyphKey: any) => (
// //     {
// //       ...o, [glyphKey]: makeBBoxTree(children[glyphKey])
// //     }
// //   ), {});

// //   const bbox = {
// //     bboxVars: makeBBoxVars(encoding.path),
// //     bboxValues: encoding.bbox,
// //   };

// //   const transform = {
// //     translate: {
// //       x: new Variable(encoding.path + ".transform" + ".translate" + ".x"),
// //       y: new Variable(encoding.path + ".transform" + ".translate" + ".y"),
// //     }
// //   };

// //   const canvas = {
// //     bboxVars: makeBBoxVars(encoding.path + ".canvas"),
// //   };

// //   return {
// //     bbox,
// //     transform,
// //     canvas,
// //     children: compiledChildren,
// //   }
// // }

// const resolvePaths = (path: string, pathList: string[], encoding: Glyph): GlyphWithPath => {
//   if ("$ref" in encoding) {
//     return encoding;
//   } else {
//     const children = encoding.children === undefined ? {} : encoding.children;
//     const compiledChildren: { [key: string]: GlyphWithPath } = Object.keys(children).reduce((o: { [key: string]: Glyph }, glyphKey: any) => (
//       {
//         ...o, [glyphKey]: resolvePaths(path + "." + glyphKey, [...pathList, glyphKey], children[glyphKey])
//       }
//     ), {});

//     return {
//       ...encoding,
//       path,
//       pathList,
//       children: compiledChildren,
//     }
//   }
// }

// const resolveGestaltPathAux = (bboxTree: BBoxTreeVVE, path: string[]): bboxVarExprs => {
//   console.log("gestalt path", path, bboxTree);
//   const [head, ...tail] = path;
//   // console.log("path", "head", head, "tail", tail);

//   if (head !== "$canvas" && !(head in bboxTree.children)) {
//     throw `error in rels path resolution: trying to find ${head} among ${Object.keys(bboxTree.children).join(', ')}. Path remaining: ${path}`;
//   }

//   if (tail.length === 0) {
//     if (head === "$canvas") {
//       return bboxTree.canvas.bboxVars;
//     } else {
//       // console.log("LOOK HERE", `bbox after ref before local
//       // path\n${bboxTree.children[head].bbox.bboxVars.centerX.toString()}`);
//       return bboxTree.children[head].bbox.bboxVars;
//     }
//   } else {
//     // console.log("path", "adding transform", bboxTree.children[head].transform);
//     return transformBBox(resolveGestaltPathAux(bboxTree.children[head], tail), bboxTree.children[head].transform);
//   }
// };

// const isNumeric = (val: string): boolean => {
//   return /^-?\d+$/.test(val);
// }

// const resolveGestaltPathAuxFanOut = (bboxTree: BBoxTreeVVE, path: string[]): bboxVarExprs[] => {
//   console.log("gestalt path", path, bboxTree);
//   const [head, ...tail] = path;
//   // console.log("path", "head", head, "tail", tail);

//   if (head !== "$canvas" && !(head in bboxTree.children)) {
//     throw `error in rels path resolution: trying to find ${head} among ${Object.keys(bboxTree.children).join(', ')}. Path remaining: ${path}`;
//   }

//   if (tail.length === 0) {
//     if (head === "$canvas") {
//       return [bboxTree.canvas.bboxVars];
//     } else {
//       // console.log("LOOK HERE", `bbox after ref before local
//       // path\n${bboxTree.children[head].bbox.bboxVars.centerX.toString()}`);
//       if (bboxTree.children[head].isSet) {
//         return Object.values(bboxTree.children[head].children).map(child => child.bbox.bboxVars);
//       } else {
//         return [bboxTree.children[head].bbox.bboxVars];
//       }
//     }
//   } else {
//     // console.log("path", "adding transform", bboxTree.children[head].transform);
//     // TODO: this check is a hack b/c we don't semantically distinguish between / and [] in paths
//     if (bboxTree.children[head].isSet && !isNumeric(tail[0])) {
//       // do two levels instead of one
//       const children = Object.values(bboxTree.children[head].children)
//         .map(child => resolveGestaltPathAuxFanOut(child, tail)
//           .map(transformedChild => transformBBox(transformedChild, inverseTransformVE(child.transform))))
//         .flat();
//       return children.map(child => transformBBox(child, inverseTransformVE(bboxTree.children[head].transform)));
//     } else {
//       // return transformBBox(resolveGestaltPathAux(bboxTree.children[head], tail), inverseTransformVE(bboxTree.children[head].transform));
//       const children = resolveGestaltPathAuxFanOut(bboxTree.children[head], tail);
//       return children.map(child => transformBBox(child, inverseTransformVE(bboxTree.children[head].transform)));
//     }
//   }
// };

// const resolveGestaltPath = (bboxTree: BBoxTreeVVE, path: string): bboxVarExprs => {
//   return resolveGestaltPathAux(bboxTree, path.split('/'));
// };

// const resolveGestaltPathFanOut = (bboxTree: BBoxTreeVVE, path: string): bboxVarExprs[] => {
//   return resolveGestaltPathAuxFanOut(bboxTree, path.split('/'));
// };

// /* mutates constraints */
// const addGestaltConstraints = (bboxTree: BBoxTreeVVE, encoding: GlyphWithPath, constraints: Constraint[]): void => {
//   if ("$ref" in encoding) {
//     return;
//   } else {
//     const keys = Object.keys(bboxTree.children);
//     keys.forEach((key) => addGestaltConstraints(bboxTree.children[key], encoding.children![key], constraints));

//     const relations = encoding.relations === undefined ? [] : encoding.relations;
//     relations.forEach(({ left, right, gestalt }: Relation) => gestalt.forEach((g: Gestalt) => {
//       // console.log("adding gestalt constraint", left, right, gestalt);
//       // const leftBBox = resolveGestaltPath(bboxTree, left);
//       // const rightBBox = resolveGestaltPath(bboxTree, right);
//       const leftBBoxes = [resolveGestaltPath(bboxTree, left)];
//       const rightBBoxes = [resolveGestaltPath(bboxTree, right)];
//       // const leftBBoxes = resolveGestaltPathFanOut(bboxTree, left);
//       // const rightBBoxes = resolveGestaltPathFanOut(bboxTree, right);
//       // console.log("left and right bboxes", bboxTree, leftBBox, rightBBox);
//       // const leftBBox = left === "canvas" ? bboxTree.canvas.bboxVars : bboxTree.children[left].bbox.bboxVars;
//       // const rightBBox = right === "canvas" ? bboxTree.canvas.bboxVars :
//       // bboxTree.children[right].bbox.bboxVars;
//       // console.log("LOOK HERE", "g", g, "leftBBox", leftBBox, "rightBBox", rightBBox);
//       const debugInfos = {
//         g,
//         leftBBoxes,
//         rightBBoxes,
//         leftBBoxesLeft: leftBBoxes.map(left => left.left.toString()),
//         leftBBoxesRight: rightBBoxes.map(right => right.left.toString()),
//       };
//       console.log("LOOK HERE", /* `constraint\n${g(leftBBox, rightBBox).toString()}\n`, */ debugInfos);
//       // console.log(`adding gestalt constraint:\n\n${constr.map(c => c.toString()).join("\n\n")}`);
//       leftBBoxes.forEach(left => rightBBoxes.forEach(right => {
//         console.log("LOOK HERE", g(left, right).toString());
//         constraints.push(g(left, right))
//       }));
//     }))
//   }
// }

// const lookupPath = (rootBboxTreeWithRef: BBoxTreeVVEWithRef, path: string[]): BBoxTreeVVE => {
//   console.log('path in lookupPath', path);
//   const lookupPathAux = (bboxTreeWithRef: BBoxTreeVVEWithRef, path: string[]): BBoxTreeVVE => {
//     // const hd = path[path.length - 1];
//     // const tl = path.slice(0, -1);
//     console.log('path in lookupPathAux', path);
//     const [hd, ...tl] = path;
//     console.log("lookup", hd, tl, bboxTreeWithRef);
//     // we assume the input isn't a ref, because we assert this before recursive calls
//     // the top level could be a ref, but this is extremely unlikely so we ignore it (for now)
//     bboxTreeWithRef = bboxTreeWithRef as Exclude<BBoxTreeVVEWithRef, Ref>;
//     // console.log("current path", hd, tl, bboxTreeWithRef);
//     let child;
//     if (hd in bboxTreeWithRef.children) {
//       child = bboxTreeWithRef.children[hd];
//     } else {
//       console.log('bboxTree', rootBboxTreeWithRef);
//       console.log('local bboxTree', bboxTreeWithRef);
//       throw `error in shape path resolution: trying to find ${hd} among ${Object.keys(bboxTreeWithRef.children).join(', ')}. Path remaining: ${path}`
//     }

//     // `$ref` tells us that the child is a reference
//     // `path` tells us that the child has not yet been resolved, so we need to resolve it first
//     if ("$ref" in child && 'path' in child) {
//       console.log("hit ref in lookup:", child);
//       // throw "error in shape path resolution: hit a reference"
//       // lookup th child reference, and continue as normal
//       child = lookupPath(rootBboxTreeWithRef, child.path);
//       console.log("hit ref in lookup (resolved):", child);
//     }

//     if (tl.length === 0) {
//       return { ...child, $ref: true } as BBoxTreeVVE /* we need a cast here b/c the children of this node may not yet be visited */
//     } else {
//       const bboxTreeVVE = lookupPathAux(child, tl);
//       return {
//         ...bboxTreeVVE,
//         bbox: {
//           bboxVars: transformBBox(bboxTreeVVE.bbox.bboxVars, child.transform),
//         }
//       }
//     }
//   }
//   return lookupPathAux(rootBboxTreeWithRef, path);
// }

// const composeTransformVE = (t1: Transform<Variable | AffineExpr>, t2: Transform<Variable | AffineExpr>): Transform<Variable | AffineExpr> => ({
//   translate: {
//     x: plus(t1.translate.x, t2.translate.x),
//     y: plus(t1.translate.y, t2.translate.y),
//   }
// })

// const inverseTransformVE = (t: Transform<Variable | AffineExpr>): Transform<Variable | AffineExpr> => ({
//   translate: {
//     x: mul(-1, t.translate.x),
//     y: mul(-1, t.translate.y),
//   }
// })

// // NOTE: This mutates the input trees! Make sure you don't need them again.
// const resolveRefs = (rootBboxTreeWithRef: BBoxTreeVVEWithRef, bboxTreeWithRef: BBoxTreeVVEWithRef, path: string[], transform: Transform<Variable | AffineExpr>, constraints: Constraint[]): BBoxTreeVVE => {
//   console.log('resolving refs visiting path', path.slice().reverse(), '$ref' in bboxTreeWithRef ? 'ref' : 'bbox');
//   // console.log("visiting", bboxTreeWithRef, transform);
//   if ("$ref" in bboxTreeWithRef) {
//     console.log("hit ref at", path, "with path", bboxTreeWithRef.path);
//     // const bboxTree = oldLookupPath(rootBboxTreeWithRef, bboxTreeWithRef.path);
//     const bboxTree = lookupPath(rootBboxTreeWithRef, bboxTreeWithRef.path);
//     console.log('resolving refs bbox', bboxTree, transform);
//     // we are using the inverse transform here because we are "moving" the bbox from the $root down to us
//     const bboxVars = transformBBox(bboxTree.bbox.bboxVars, inverseTransformVE(transform));
//     console.log("transformed bboxVars", path, Object.fromEntries(Object.entries(bboxVars).map(([name, value]) => [name, value.toString()])));

//     // we need a fresh transform since the relationship between the canvas and the bbox is different
//     // now.
//     const bboxTransform = {
//       translate: {
//         // TODO: not sure if path is the right thing to use here. At the very least might need to
//         // join it
//         x: mkVar(path + ".transform" + ".translate" + ".x"),
//         y: mkVar(path + ".transform" + ".translate" + ".y"),
//       },
//     };

//     constraints.push(mkConstEqConstraint(bboxTransform.translate.x, 0, Strength.weak));
//     constraints.push(mkConstEqConstraint(bboxTransform.translate.y, 0, Strength.weak));

//     return {
//       ...bboxTree,
//       bbox: {
//         bboxVars,
//       },
//       transform: bboxTransform,
//       // TODO: this might be guaranteed by lookupPath. better safe than sorry
//       $ref: true,
//     }
//   } else {
//     console.log("LOOK HERE (compose)", `${bboxTreeWithRef.transform.translate.x}`);
//     const newTransform = path.length <= 1 ? transform : composeTransformVE(transform, bboxTreeWithRef.transform);
//     // const newTransform = composeTransformVE(transform, bboxTreeWithRef.transform);
//     const compiledChildren: { [key: string]: BBoxTreeVVE } = Object.keys(bboxTreeWithRef.children).reduce((o: { [key: string]: Glyph }, glyphKey: any) => (
//       {
//         ...o, [glyphKey]: resolveRefs(rootBboxTreeWithRef, bboxTreeWithRef.children[glyphKey], [glyphKey, ...path], newTransform, constraints)
//       }
//     ), {});
//     // need this mutation here so that the graph sharing is preserved
//     bboxTreeWithRef.children = compiledChildren;
//     console.log("path", path)
//     console.log("rootBboxTreeWithRef", rootBboxTreeWithRef)
//     console.log("bboxTreeWithRef", bboxTreeWithRef)
//     console.log("compiledChildren", compiledChildren)

//     return {
//       ...bboxTreeWithRef,
//       children: compiledChildren,
//       $ref: false,
//     } as BBoxTreeVVE /* this is safe I swear! */
//   }
// }

// // /* mutates constraints */
// // export const addBBoxValueConstraints = (bboxTree: BBoxTreeVVEWithRef, constraints: Constraint[]): BBoxTreeVVEWithRef => {
// //   if ("$ref" in bboxTree) {
// //     return bboxTree;
// //   } else {
// //     const keys = Object.keys(bboxTree.children);
// //     const children: { [key: string]: BBoxTreeVVEWithRef } = keys.reduce((o: { [key: string]: BBoxTreeVVEWithRef }, glyphKey: any) => (
// //       {
// //         ...o, [glyphKey]: addBBoxValueConstraints(bboxTree.children[glyphKey], constraints)
// //       }
// //     ), {});

// //     if (bboxTree.bbox.bboxValues !== undefined) {
// //       for (const key of Object.keys(bboxTree.bbox.bboxValues) as (keyof BBoxValues)[]) {
// //         if (bboxTree.bbox.bboxValues[key] !== undefined) {
// //           console.log("bbox val constraint", (mkAffineConstraint(bboxTree.bbox.bboxVars[key], bboxTree.bbox.bboxValues[key])).toString())
// //           constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars[key], bboxTree.bbox.bboxValues[key]));
// //         }
// //       }
// //     }

// //     return {
// //       isSet: bboxTree.isSet,
// //       inheritFrame: bboxTree.inheritFrame,
// //       bbox: bboxTree.bbox,
// //       // TODO: I don't think canvas has any pre-defined values so nothing is lost here by deleting them?
// //       canvas: bboxTree.canvas,
// //       children,
// //       transform: bboxTree.transform,
// //     }
// //   }
// // }

// /* mutates constraints */
// export const addBBoxValueConstraints = (bboxTree: BBoxTreeVVEWithRef, constraints: Constraint[]): void => {
//   if ("$ref" in bboxTree) {
//     return;
//   } else {
//     Object.values(bboxTree.children).map((child) => addBBoxValueConstraints(child, constraints))
//     if (bboxTree.bbox.bboxValues !== undefined) {
//       for (const key of Object.keys(bboxTree.bbox.bboxValues) as (keyof BBoxValues)[]) {
//         if (bboxTree.bbox.bboxValues[key] !== undefined) {
//           console.log("bbox val constraint", (mkAffineConstraint(bboxTree.bbox.bboxVars[key], bboxTree.bbox.bboxValues[key]!)).toString())
//           constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars[key], bboxTree.bbox.bboxValues[key]!));
//         }
//       }
//     }
//   }
// }

// /* mutates constraints */
// export const addBBoxConstraintsWithRef = (bboxTree: BBoxTreeVVEWithRef, constraints: Constraint[]): void => {
//   if ("$ref" in bboxTree) {
//     return;
//   } else {
//     const keys = Object.keys(bboxTree.children);
//     keys.forEach((key) => addBBoxConstraintsWithRef(bboxTree.children[key], constraints));

//     constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.width, plus(bboxTree.bbox.bboxVars.right, neg(bboxTree.bbox.bboxVars.left))));
//     constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.height, plus(bboxTree.bbox.bboxVars.bottom, neg(bboxTree.bbox.bboxVars.top))));
//     constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerX, div(plus(bboxTree.bbox.bboxVars.left, bboxTree.bbox.bboxVars.right), 2)));
//     constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerY, div(plus(bboxTree.bbox.bboxVars.top, bboxTree.bbox.bboxVars.bottom), 2)));

//     constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.width, plus(bboxTree.canvas.bboxVars.right, neg(bboxTree.canvas.bboxVars.left))));
//     constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.height, plus(bboxTree.canvas.bboxVars.bottom, neg(bboxTree.canvas.bboxVars.top))));
//     constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.centerX, div(plus(bboxTree.canvas.bboxVars.left, bboxTree.canvas.bboxVars.right), 2)));
//     constraints.push(mkAffineConstraint(bboxTree.canvas.bboxVars.centerY, div(plus(bboxTree.canvas.bboxVars.top, bboxTree.canvas.bboxVars.bottom), 2)));

//     // // bbox = transform(canvas)
//     // constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.width, new Expression(bboxTree.canvas.bboxVars.width)));
//     // constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.height, new Expression(bboxTree.canvas.bboxVars.height)));
//     // constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerX, new Expression(bboxTree.canvas.bboxVars.centerX, bboxTree.transform.translate.x)));
//     // constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerY, new Expression(bboxTree.canvas.bboxVars.centerY, bboxTree.transform.translate.y)));
//   }
// }

// /* mutates constraints */
// export const addTransformConstraints = (bboxTree: BBoxTreeVVE, constraints: Constraint[], name = "$root"): void => {
//   console.log("got here 1", bboxTree);
//   const keys = Object.keys(bboxTree.children);
//   keys.forEach((key) => addTransformConstraints(bboxTree.children[key], constraints, name + "/" + key));

//   console.log("got here 2");

//   // bbox = transform(canvas)
//   const constr = [];
//   constr.push(mkAffineConstraint(bboxTree.bbox.bboxVars.width, bboxTree.canvas.bboxVars.width));
//   constr.push(mkAffineConstraint(bboxTree.bbox.bboxVars.height, bboxTree.canvas.bboxVars.height));
//   constr.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerX, plus(bboxTree.canvas.bboxVars.centerX, bboxTree.transform.translate.x)));
//   constr.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerY, plus(bboxTree.canvas.bboxVars.centerY, bboxTree.transform.translate.y)));
//   // console.log("pretty printed constraints", constraints.map((c) => c.toString()).join("\n"));
//   // console.log(`adding transform constraints to "${name}":\n\n${constr.map(c => c.toString()).join("\n\n")}`);
//   constraints.push(...constr);
//   // constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.width, new Expression(bboxTree.canvas.bboxVars.width)));
//   // constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.height, new Expression(bboxTree.canvas.bboxVars.height)));
//   // constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerX, new Expression(bboxTree.canvas.bboxVars.centerX, bboxTree.transform.translate.x)));
//   // constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.centerY, new Expression(bboxTree.canvas.bboxVars.centerY, bboxTree.transform.translate.y)));
//   console.log("got here 3");
//   if (bboxTree.inheritFrame) {
//     // bbox and canvas should be the same (no transformation applied!)
//     constraints.push(mkAffineConstraint(bboxTree.transform.translate.x, 0));
//     constraints.push(mkAffineConstraint(bboxTree.transform.translate.y, 0));
//   }
//   console.log("got here 4");
// }

// const removeRefs = (encoding: GlyphWithPath): GlyphWithPathNoRef | null => {
//   if ("$ref" in encoding) {
//     return null;
//   } else {
//     const children = encoding.children ? encoding.children : {};
//     return {
//       ...encoding,
//       children: objectFilter(objectMap(children, (k, v) => removeRefs(v)), (k, v) => v !== null) as { [key: string]: GlyphWithPathNoRef },
//     }
//   }
// }

// // remove children from all refs. this is useful b/c it ensures we don't visit things more than once
// // by entering into the children of a ref.
// const removeRefChildren = (bboxTree: BBoxTreeVVE): BBoxTreeVVE => {
//   if (bboxTree.$ref) {
//     return {
//       ...bboxTree,
//       children: {},
//     }
//   } else {
//     return {
//       ...bboxTree,
//       children: objectMap(bboxTree.children, (_k, child) => removeRefChildren(child))
//     }
//   }
// }

// export default (encoding: Glyph): CompiledAST => {
//   const encodingWithPaths = resolvePaths("$root", ["$root"], encoding);

//   // 0. construct variables
//   const constraints: Constraint[] = [];
//   // let bboxTreeWithRef = makeBBoxTreeWithRef(encodingWithPaths);
//   // const resolvedEncoding = resolveRefs(bboxTreeWithRef, encodingWithPaths);
//   // let bboxTree = makeBBoxTree(resolvedEncoding);

//   const bboxTreeRef = makeBBoxTreeWithRef(encodingWithPaths, constraints);
//   addBBoxValueConstraints(bboxTreeRef, constraints);
//   console.log("bboxTreeRef", bboxTreeRef);

//   // :bbox tree has refs and only vars

//   // 1. add bbox and canvas constraints
//   addBBoxConstraintsWithRef(bboxTreeRef, constraints);
//   console.log("addBBoxConstraintsWithRef complete");

//   const bboxTree = resolveRefs(bboxTreeRef, bboxTreeRef, ["$root"], { translate: { x: 0, y: 0 } }, constraints);
//   const bboxTreeNoRefChildren = removeRefChildren(bboxTree);

//   // 2. add transform constraints
//   addTransformConstraints(bboxTreeNoRefChildren, constraints);

//   // 3. add $root bbox origin constraints
//   // arbitrarily place origin since the top-level box isn't placed by a parent
//   constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.left, 0));
//   constraints.push(mkAffineConstraint(bboxTree.bbox.bboxVars.top, 0));

//   // 4. children constraints
//   addChildrenConstraints(bboxTreeNoRefChildren, constraints);
//   console.log("addChildrenConstraints complete");

//   // 5. add gestalt constraints
//   addGestaltConstraints(bboxTree, encodingWithPaths, constraints);
//   console.log("addGestaltConstraints complete")

//   console.log("bboxTree", bboxTree);
//   // console.log("bboxTree and constraints pre compile", bboxTree, constraints);

//   // 6. solve variables
//   // console.log("constraints[0]", constraints[0]);
//   // console.log("pretty printed constraints[0]", ppConstraint(constraints[0]));
//   // console.log("pretty printed constraints[0]", constraints[0].toString());
//   console.log('blue constraints', constraints.map((c) => c.toString()));
//   // console.log("pretty printed constraints", constraints
//   // .map((c) => c.toString())
//   // .filter((s) => s.includes("$root.elements."))
//   // .join("\n"));
//   // indigo.solve(constraints);
//   const solution = blue.layeredSolve(constraints);

//   // 7. extract values
//   const bboxValues = getBBoxValues(solution, bboxTree);
//   console.log("bboxValues post compile", bboxValues);

//   const encodingWithoutRefs = removeRefs(encodingWithPaths);
//   if (encodingWithoutRefs === null) throw "error: the top-level glyph was a ref"

//   return { bboxValues, encoding: encodingWithoutRefs };
// }

export { }