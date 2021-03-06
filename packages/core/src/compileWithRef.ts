import { Constraint, Operator, Solver, Strength, Variable, Expression } from 'kiwi.js';
import _ from 'lodash';
import { Gestalt } from "./gestalt";
import { BBoxTree, getBBoxValues, makeBBoxVars, bboxVars, BBoxValues, MaybeBBoxValues, BBoxTreeValue, BBoxTreeVV, bboxVarExprs, transformBBox, Transform } from './kiwiBBoxTransform';
import { objectFilter, objectMap } from './objectMap';
import { ppConstraint } from './ppKiwi';

// non-empty string is a field, empty string is an object
export type DataMap = { [key: string]: string }

export type BBoxTreeInherit<T, U> = {
  dataMap: DataMap,
  isSet: boolean,
  inheritFrame: boolean,
  bbox: T, // equals transform(canvas)
  canvas: T,
  // if we have the child "own" its transform, we are implicitly assuming it has a single coordinate
  // space owner that is applying this transform
  // if we instead have the parent "own" its children's transforms by pushing it into the children
  // field, then it could be possible that the child exists in multiple places, right? well not
  // exactly since it's still a tree structure.
  // I think it is easiest/best for now to have the child own its transform, because recursion is
  // much easier and bbox used to live here so the change is smaller.
  transform: Transform<U>,
  children: { [key: string]: BBoxTreeInherit<T, U> },
}

export type BBoxTreeInheritRef<T, U> = {
  $ref: boolean,
  dataMap: DataMap,
  isSet: boolean,
  inheritFrame: boolean,
  bbox: T, // equals transform(canvas)
  canvas: T,
  // if we have the child "own" its transform, we are implicitly assuming it has a single coordinate
  // space owner that is applying this transform
  // if we instead have the parent "own" its children's transforms by pushing it into the children
  // field, then it could be possible that the child exists in multiple places, right? well not
  // exactly since it's still a tree structure.
  // I think it is easiest/best for now to have the child own its transform, because recursion is
  // much easier and bbox used to live here so the change is smaller.
  transform: Transform<U>,
  children: { [key: string]: BBoxTreeInheritRef<T, U> },
}

export type BBoxTreeVVE =
  BBoxTreeInheritRef<{ bboxVars: bboxVarExprs, bboxValues?: MaybeBBoxValues }, Variable>

export type CompiledAST = {
  // bboxValues: BBoxTree<BBoxValues>
  bboxValues: BBoxTreeValue,
  encoding: GlyphWithPathNoRef,
}

export type Relation = {
  left: string,
  right: string,
  gestalt: Gestalt[],
}

export type Ref = { $ref: true, path: string[] }

export type Glyph = {
  dataMap: DataMap,
  isSet: boolean,
  inheritFrame: boolean,
  bbox?: MaybeBBoxValues,
  renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
  children?: { [key: string]: Glyph },
  relations?: Relation[]
} | Ref

export type GlyphNoRef = {
  dataMap: DataMap,
  isSet: boolean,
  inheritFrame: boolean,
  bbox?: MaybeBBoxValues,
  renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
  children?: { [key: string]: GlyphNoRef },
  relations?: Relation[]
}

export type GlyphWithPath = {
  dataMap: DataMap,
  isSet: boolean,
  inheritFrame: boolean,
  pathList: string[],
  path: string,
  bbox?: MaybeBBoxValues,
  renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
  children?: { [key: string]: GlyphWithPath },
  relations?: Relation[]
} | Ref

export type GlyphWithPathNoRef = {
  dataMap: DataMap,
  isSet: boolean,
  inheritFrame: boolean,
  pathList: string[],
  path: string,
  bbox?: MaybeBBoxValues,
  renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
  children: { [key: string]: GlyphWithPathNoRef },
  relations?: Relation[]
}

// export type ResolvedGlyph = {
//   pathList: string[],
//   path: string,
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   children: { [key: string]: ResolvedGlyph },
//   relations?: Relation[]
// }

// export type ResolvedGlyph = {
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   children: { [key: string]: ResolvedGlyph },
//   relations?: Relation[]
// }

// export type ResolvedGlyphWithPath = {
//   path: string,
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   children: { [key: string]: ResolvedGlyphWithPath },
//   relations?: Relation[]
// }

export type Mark = {
  bbox: MaybeBBoxValues,
  renderFn: (canvas: BBoxValues, index?: number) => JSX.Element,
}

const dimDefined = (dim: keyof BBoxValues) => (bboxTree: BBoxTreeVVE) => {
  return bboxTree.canvas.bboxValues !== undefined && bboxTree.canvas.bboxValues[dim] !== undefined;
}

const widthDefined = dimDefined('width');
const heightDefined = dimDefined('height');

/* mutates constraints */
const addChildrenConstraints = (bboxTree: BBoxTreeVVE, constraints: Constraint[]): void => {
  const keys = Object.keys(bboxTree.children);
  keys.forEach((key) => addChildrenConstraints(bboxTree.children[key], constraints));

  // lightly suggest the origin of the canvas
  constraints.push(new Constraint(bboxTree.canvas.bboxVars.left, Operator.Eq, 0, Strength.weak));
  constraints.push(new Constraint(bboxTree.canvas.bboxVars.top, Operator.Eq, 0, Strength.weak));

  // break ties with competing bbox shrinkwraps from above and below. encourages bounding boxes to
  // fit their contents
  constraints.push(new Constraint(bboxTree.canvas.bboxVars.width, Operator.Eq, 0, Strength.strong));
  constraints.push(new Constraint(bboxTree.canvas.bboxVars.height, Operator.Eq, 0, Strength.strong));

  // 2. add canvas shrink-wrap + container constraints
  for (const bboxKey of Object.keys(bboxTree.children)) {
    // only shrink-wrap if width and/or height aren't defined
    if (!widthDefined(bboxTree)) {
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Eq, bboxTree.canvas.bboxVars.left, widthDefined(bboxTree.children[bboxKey]) ? Strength.medium : Strength.medium));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.right, Operator.Eq, bboxTree.canvas.bboxVars.right, widthDefined(bboxTree.children[bboxKey]) ? Strength.medium : Strength.medium));
    }

    if (!heightDefined(bboxTree)) {
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.top, Operator.Eq, bboxTree.canvas.bboxVars.top, heightDefined(bboxTree.children[bboxKey]) ? Strength.medium : Strength.medium));
      constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, Operator.Eq, bboxTree.canvas.bboxVars.bottom, heightDefined(bboxTree.children[bboxKey]) ? Strength.medium : Strength.medium));
    }

    // console.log("constraining", bboxKey, bboxTree.children[bboxKey].bbox.bboxVars);

    // add containment constraints always
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Ge, bboxTree.canvas.bboxVars.left));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.right, Operator.Le, bboxTree.canvas.bboxVars.right));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.top, Operator.Ge, bboxTree.canvas.bboxVars.top));
    constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, Operator.Le, bboxTree.canvas.bboxVars.bottom));
  }
}

type BBoxTreeInheritWithRef<T, U> = {
  dataMap: DataMap,
  isSet: boolean,
  inheritFrame: boolean,
  bbox: T, // equals transform(canvas)
  canvas: T,
  // if we have the child "own" its transform, we are implicitly assuming it has a single coordinate
  // space owner that is applying this transform
  // if we instead have the parent "own" its children's transforms by pushing it into the children
  // field, then it could be possible that the child exists in multiple places, right? well not
  // exactly since it's still a tree structure.
  // I think it is easiest/best for now to have the child own its transform, because recursion is
  // much easier and bbox used to live here so the change is smaller.
  transform: Transform<U>,
  children: { [key: string]: BBoxTreeInheritWithRef<T, U> },
} | Ref

export type BBoxTreeVVEWithRef = BBoxTreeInheritWithRef<{ bboxVars: bboxVarExprs, bboxValues?: MaybeBBoxValues }, Variable>;
// export type BBoxTreeVarsWithRef = BBoxTreeWithRef<bboxVars, Variable>;
// export type BBoxTreeVars = BBoxTree<bboxVars, Variable>;

const makeBBoxTreeWithRef = (encoding: GlyphWithPath): BBoxTreeVVEWithRef => {
  if ("$ref" in encoding) {
    return encoding
  } else {
    const children = encoding.children === undefined ? {} : encoding.children;
    const keys = Object.keys(children);
    const compiledChildren: { [key: string]: BBoxTreeVVEWithRef } = keys.reduce((o: { [key: string]: BBoxTreeVV }, glyphKey: any) => (
      {
        ...o, [glyphKey]: makeBBoxTreeWithRef(children[glyphKey])
      }
    ), {});

    const bbox = {
      bboxVars: makeBBoxVars(encoding.path),
      bboxValues: encoding.bbox,
    };

    const transform = {
      translate: {
        x: new Variable(encoding.path + ".transform" + ".translate" + ".x"),
        y: new Variable(encoding.path + ".transform" + ".translate" + ".y"),
      }
    };

    const canvas = {
      bboxVars: makeBBoxVars(encoding.path + ".canvas"),
    };

    return {
      dataMap: encoding.dataMap,
      isSet: encoding.isSet,
      inheritFrame: encoding.inheritFrame,
      bbox,
      transform,
      canvas,
      children: compiledChildren,
    }
  }
}

// const makeBBoxTree = (encoding: ResolvedGlyph): BBoxTreeVV => {
//   const children = encoding.children === undefined ? {} : encoding.children;
//   const keys = Object.keys(children);
//   const compiledChildren: { [key: string]: BBoxTreeVV } = keys.reduce((o: { [key: string]: BBoxTreeVV }, glyphKey: any) => (
//     {
//       ...o, [glyphKey]: makeBBoxTree(children[glyphKey])
//     }
//   ), {});

//   const bbox = {
//     bboxVars: makeBBoxVars(encoding.path),
//     bboxValues: encoding.bbox,
//   };

//   const transform = {
//     translate: {
//       x: new Variable(encoding.path + ".transform" + ".translate" + ".x"),
//       y: new Variable(encoding.path + ".transform" + ".translate" + ".y"),
//     }
//   };

//   const canvas = {
//     bboxVars: makeBBoxVars(encoding.path + ".canvas"),
//   };

//   return {
//     bbox,
//     transform,
//     canvas,
//     children: compiledChildren,
//   }
// }

const resolvePaths = (path: string, pathList: string[], encoding: Glyph): GlyphWithPath => {
  if ("$ref" in encoding) {
    return encoding;
  } else {
    const children = encoding.children === undefined ? {} : encoding.children;
    const compiledChildren: { [key: string]: GlyphWithPath } = Object.keys(children).reduce((o: { [key: string]: Glyph }, glyphKey: any) => (
      {
        ...o, [glyphKey]: resolvePaths(path + "." + glyphKey, [...pathList, glyphKey], children[glyphKey])
      }
    ), {});

    return {
      ...encoding,
      path,
      pathList,
      children: compiledChildren,
    }
  }
}

const resolveGestaltPathAux = (bboxTree: BBoxTreeVVE, path: string[]): bboxVarExprs => {
  console.log("gestalt path", path, bboxTree);
  const [head, ...tail] = path;
  // console.log("path", "head", head, "tail", tail);

  if (head !== "$canvas" && !(head in bboxTree.children)) {
    throw `error in rels path resolution: trying to find ${head} among ${Object.keys(bboxTree.children).join(', ')}. Path remaining: ${path}`;
  }

  if (tail.length === 0) {
    if (head === "$canvas") {
      return bboxTree.canvas.bboxVars;
    } else {
      // console.log("LOOK HERE", `bbox after ref before local
      // path\n${bboxTree.children[head].bbox.bboxVars.centerX.toString()}`);
      return bboxTree.children[head].bbox.bboxVars;
    }
  } else {
    // console.log("path", "adding transform", bboxTree.children[head].transform);
    return transformBBox(resolveGestaltPathAux(bboxTree.children[head], tail), bboxTree.children[head].transform);
  }
};

const isNumeric = (val: string): boolean => {
  return /^-?\d+$/.test(val);
}

const resolveGestaltPathAuxFanOut = (bboxTree: BBoxTreeVVE, path: string[]): bboxVarExprs[] => {
  console.log("gestalt path", path, bboxTree);
  const [head, ...tail] = path;
  // console.log("path", "head", head, "tail", tail);

  if (head !== "$canvas" && !(head in bboxTree.children)) {
    throw `error in rels path resolution: trying to find ${head} among ${Object.keys(bboxTree.children).join(', ')}. Path remaining: ${path}`;
  }

  if (tail.length === 0) {
    if (head === "$canvas") {
      return [bboxTree.canvas.bboxVars];
    } else {
      // console.log("LOOK HERE", `bbox after ref before local
      // path\n${bboxTree.children[head].bbox.bboxVars.centerX.toString()}`);
      if (bboxTree.children[head].isSet) {
        return Object.values(bboxTree.children[head].children).map(child => child.bbox.bboxVars);
      } else {
        return [bboxTree.children[head].bbox.bboxVars];
      }
    }
  } else {
    // console.log("path", "adding transform", bboxTree.children[head].transform);
    // TODO: this check is a hack b/c we don't semantically distinguish between / and [] in paths
    if (bboxTree.children[head].isSet && !isNumeric(tail[0])) {
      // do two levels instead of one
      const children = Object.values(bboxTree.children[head].children)
        .map(child => resolveGestaltPathAuxFanOut(child, tail)
          .map(transformedChild => transformBBox(transformedChild, inverseTransformVE(child.transform))))
        .flat();
      return children.map(child => transformBBox(child, inverseTransformVE(bboxTree.children[head].transform)));
    } else {
      // return transformBBox(resolveGestaltPathAux(bboxTree.children[head], tail), inverseTransformVE(bboxTree.children[head].transform));
      const children = resolveGestaltPathAuxFanOut(bboxTree.children[head], tail);
      return children.map(child => transformBBox(child, inverseTransformVE(bboxTree.children[head].transform)));
    }
  }
};

const resolveGestaltPath = (bboxTree: BBoxTreeVVE, path: string): bboxVarExprs => {
  return resolveGestaltPathAux(bboxTree, path.split('/'));
};

const resolveGestaltPathFanOut = (bboxTree: BBoxTreeVVE, path: string): bboxVarExprs[] => {
  return resolveGestaltPathAuxFanOut(bboxTree, path.split('/'));
};

/* mutates constraints */
const addGestaltConstraints = (bboxTree: BBoxTreeVVE, encoding: GlyphWithPath, constraints: Constraint[]): void => {
  if ("$ref" in encoding) {
    return;
  } else {
    const keys = Object.keys(bboxTree.children);
    keys.forEach((key) => addGestaltConstraints(bboxTree.children[key], encoding.children![key], constraints));

    const relations = encoding.relations === undefined ? [] : encoding.relations;
    relations.forEach(({ left, right, gestalt }: Relation) => gestalt.forEach((g: Gestalt) => {
      // console.log("adding gestalt constraint", left, right, gestalt);
      // const leftBBox = resolveGestaltPath(bboxTree, left);
      // const rightBBox = resolveGestaltPath(bboxTree, right);
      const leftBBoxes = [resolveGestaltPath(bboxTree, left)];
      const rightBBoxes = [resolveGestaltPath(bboxTree, right)];
      // const leftBBoxes = resolveGestaltPathFanOut(bboxTree, left);
      // const rightBBoxes = resolveGestaltPathFanOut(bboxTree, right);
      // console.log("left and right bboxes", bboxTree, leftBBox, rightBBox);
      // const leftBBox = left === "canvas" ? bboxTree.canvas.bboxVars : bboxTree.children[left].bbox.bboxVars;
      // const rightBBox = right === "canvas" ? bboxTree.canvas.bboxVars :
      // bboxTree.children[right].bbox.bboxVars;
      // console.log("LOOK HERE", "g", g, "leftBBox", leftBBox, "rightBBox", rightBBox);
      const debugInfos = {
        g,
        leftBBoxes,
        rightBBoxes,
        leftBBoxesLeft: leftBBoxes.map(left => left.left.toString()),
        leftBBoxesRight: rightBBoxes.map(right => right.left.toString()),
      };
      console.log("LOOK HERE", /* `constraint\n${g(leftBBox, rightBBox).toString()}\n`, */ debugInfos);
      // console.log(`adding gestalt constraint:\n\n${constr.map(c => c.toString()).join("\n\n")}`);
      leftBBoxes.forEach(left => rightBBoxes.forEach(right => {
        console.log("LOOK HERE", g(left, right).toString());
        constraints.push(g(left, right))
      }));
    }))
  }
}

/* Doesn't work because must account for refs. so this is folded into the main function */
// const findField = (field: string, bboxTreeWithRef: BBoxTreeVVE): BBoxTreeVVE | null => {
//   if (field in bboxTreeWithRef.dataMap) {
//     const child = bboxTreeWithRef.dataMap[field];
//     return bboxTreeWithRef.children[child];
//   } else if ('' in bboxTreeWithRef.dataMap) {
//     // pass-through
//     const child = bboxTreeWithRef.dataMap[''];
//     return findField(field, bboxTreeWithRef.children[child]);
//   } else {
//     return null
//   }
// }

const lookupPath = (rootBboxTreeWithRef: BBoxTreeVVEWithRef, path: string[]): BBoxTreeVVE => {
  console.log('path in lookupPath', path);
  const lookupPathAux = (bboxTreeWithRef: BBoxTreeVVEWithRef, path: string[]): BBoxTreeVVE => {
    // const hd = path[path.length - 1];
    // const tl = path.slice(0, -1);
    console.log('path in lookupPathAux', path);
    let [hd, ...tl] = path;
    console.log("lookup", hd, tl, bboxTreeWithRef);
    // we assume the input isn't a ref, because we assert this before recursive calls
    // the top level could be a ref, but this is extremely unlikely so we ignore it (for now)
    bboxTreeWithRef = bboxTreeWithRef as Exclude<BBoxTreeVVEWithRef, Ref>;
    // console.log("current path", hd, tl, bboxTreeWithRef);
    // let child;
    // if (hd in bboxTreeWithRef.children) {
    //   child = bboxTreeWithRef.children[hd];
    // } else {
    //   console.log('bboxTree', rootBboxTreeWithRef);
    //   console.log('local bboxTree', bboxTreeWithRef);
    //   throw `error in shape path resolution: trying to find ${hd} among ${Object.keys(bboxTreeWithRef.children).join(', ')}. Path remaining: ${path}`
    // }
    let child;
    if (hd in bboxTreeWithRef.dataMap) {
      const childName = bboxTreeWithRef.dataMap[hd];
      child = bboxTreeWithRef.children[childName];
    } else if ('' in bboxTreeWithRef.dataMap) {
      // pass-through
      const childName = bboxTreeWithRef.dataMap[''];
      child = bboxTreeWithRef.children[childName];
      // this ensures we keep looking for the hd element
      tl = [hd, ...tl];
    } else {
      console.log('bboxTree', rootBboxTreeWithRef);
      console.log('local bboxTree', bboxTreeWithRef);
      throw `error in shape path resolution: trying to find ${hd} among ${Object.keys(bboxTreeWithRef.children).join(', ')}. Path remaining: ${path}`
    }

    // `$ref` tells us that the child is a reference
    // `path` tells us that the child has not yet been resolved, so we need to resolve it first
    if ("$ref" in child && 'path' in child) {
      console.log("hit ref in lookup:", child);
      // throw "error in shape path resolution: hit a reference"
      // lookup th child reference, and continue as normal
      child = lookupPath(rootBboxTreeWithRef, child.path);
      console.log("hit ref in lookup (resolved):", child);
    }

    if (tl.length === 0) {
      return { ...child, $ref: true } as BBoxTreeVVE /* we need a cast here b/c the children of this node may not yet be visited */
    } else {
      const bboxTreeVVE = lookupPathAux(child, tl);
      return {
        ...bboxTreeVVE,
        bbox: {
          bboxVars: transformBBox(bboxTreeVVE.bbox.bboxVars, child.transform),
        }
      }
    }
  }
  return lookupPathAux(rootBboxTreeWithRef, path);
}

const composeTransformVE = (t1: Transform<Variable | Expression>, t2: Transform<Variable | Expression>): Transform<Variable | Expression> => ({
  translate: {
    x: new Expression(t1.translate.x, t2.translate.x),
    y: new Expression(t1.translate.y, t2.translate.y),
  }
})

const inverseTransformVE = (t: Transform<Variable | Expression>): Transform<Variable | Expression> => ({
  translate: {
    x: new Expression([-1, t.translate.x]),
    y: new Expression([-1, t.translate.y]),
  }
})

// NOTE: This mutates the input trees! Make sure you don't need them again.
const resolveRefs = (rootBboxTreeWithRef: BBoxTreeVVEWithRef, bboxTreeWithRef: BBoxTreeVVEWithRef, path: string[], transform: Transform<Variable | Expression>): BBoxTreeVVE => {
  console.log('resolving refs visiting path', path.slice().reverse(), '$ref' in bboxTreeWithRef ? 'ref' : 'bbox');
  // console.log("visiting", bboxTreeWithRef, transform);
  if ("$ref" in bboxTreeWithRef) {
    console.log("hit ref at", path, "with path", bboxTreeWithRef.path);
    // const bboxTree = oldLookupPath(rootBboxTreeWithRef, bboxTreeWithRef.path);
    const bboxTree = lookupPath(rootBboxTreeWithRef, bboxTreeWithRef.path);
    console.log('resolving refs bbox', bboxTree, transform);
    // we are using the inverse transform here because we are "moving" the bbox from the $root down to us
    const bboxVars = transformBBox(bboxTree.bbox.bboxVars, inverseTransformVE(transform));
    console.log("transformed bboxVars", path, Object.fromEntries(Object.entries(bboxVars).map(([name, value]) => [name, value.toString()])));

    // we need a fresh transform since the relationship between the canvas and the bbox is different
    // now.
    const bboxTransform = {
      translate: {
        // TODO: not sure if path is the right thing to use here. At the very least might need to
        // join it
        x: new Variable(path + ".transform" + ".translate" + ".x"),
        y: new Variable(path + ".transform" + ".translate" + ".y"),
      },
    };

    return {
      ...bboxTree,
      bbox: {
        bboxVars,
      },
      transform: bboxTransform,
      // TODO: this might be guaranteed by lookupPath. better safe than sorry
      $ref: true,
    }
  } else {
    console.log("LOOK HERE (compose)", `${bboxTreeWithRef.transform.translate.x}`);
    const newTransform = path.length <= 1 ? transform : composeTransformVE(transform, bboxTreeWithRef.transform);
    // const newTransform = composeTransformVE(transform, bboxTreeWithRef.transform);
    const compiledChildren: { [key: string]: BBoxTreeVVE } = Object.keys(bboxTreeWithRef.children).reduce((o: { [key: string]: Glyph }, glyphKey: any) => (
      {
        ...o, [glyphKey]: resolveRefs(rootBboxTreeWithRef, bboxTreeWithRef.children[glyphKey], [glyphKey, ...path], newTransform)
      }
    ), {});
    // need this mutation here so that the graph sharing is preserved
    bboxTreeWithRef.children = compiledChildren;
    console.log("path", path)
    console.log("rootBboxTreeWithRef", rootBboxTreeWithRef)
    console.log("bboxTreeWithRef", bboxTreeWithRef)
    console.log("compiledChildren", compiledChildren)

    return {
      ...bboxTreeWithRef,
      children: compiledChildren,
      $ref: false,
    } as BBoxTreeVVE /* this is safe I swear! */
  }
}

// /* mutates constraints */
// export const addBBoxValueConstraints = (bboxTree: BBoxTreeVVEWithRef, constraints: Constraint[]): BBoxTreeVVEWithRef => {
//   if ("$ref" in bboxTree) {
//     return bboxTree;
//   } else {
//     const keys = Object.keys(bboxTree.children);
//     const children: { [key: string]: BBoxTreeVVEWithRef } = keys.reduce((o: { [key: string]: BBoxTreeVVEWithRef }, glyphKey: any) => (
//       {
//         ...o, [glyphKey]: addBBoxValueConstraints(bboxTree.children[glyphKey], constraints)
//       }
//     ), {});

//     if (bboxTree.bbox.bboxValues !== undefined) {
//       for (const key of Object.keys(bboxTree.bbox.bboxValues) as (keyof BBoxValues)[]) {
//         if (bboxTree.bbox.bboxValues[key] !== undefined) {
//           console.log("bbox val constraint", (new Constraint(bboxTree.bbox.bboxVars[key], Operator.Eq, bboxTree.bbox.bboxValues[key])).toString())
//           constraints.push(new Constraint(bboxTree.bbox.bboxVars[key], Operator.Eq, bboxTree.bbox.bboxValues[key]));
//         }
//       }
//     }

//     return {
//       isSet: bboxTree.isSet,
//       inheritFrame: bboxTree.inheritFrame,
//       bbox: bboxTree.bbox,
//       // TODO: I don't think canvas has any pre-defined values so nothing is lost here by deleting them?
//       canvas: bboxTree.canvas,
//       children,
//       transform: bboxTree.transform,
//     }
//   }
// }

/* mutates constraints */
export const addBBoxValueConstraints = (bboxTree: BBoxTreeVVEWithRef, constraints: Constraint[]): void => {
  if ("$ref" in bboxTree) {
    return;
  } else {
    Object.values(bboxTree.children).map((child) => addBBoxValueConstraints(child, constraints))
    if (bboxTree.bbox.bboxValues !== undefined) {
      for (const key of Object.keys(bboxTree.bbox.bboxValues) as (keyof BBoxValues)[]) {
        if (bboxTree.bbox.bboxValues[key] !== undefined) {
          console.log("bbox val constraint", (new Constraint(bboxTree.bbox.bboxVars[key], Operator.Eq, bboxTree.bbox.bboxValues[key])).toString())
          constraints.push(new Constraint(bboxTree.bbox.bboxVars[key], Operator.Eq, bboxTree.bbox.bboxValues[key]));
        }
      }
    }
  }
}

/* mutates constraints */
export const addBBoxConstraintsWithRef = (bboxTree: BBoxTreeVVEWithRef, constraints: Constraint[]): void => {
  if ("$ref" in bboxTree) {
    return;
  } else {
    const keys = Object.keys(bboxTree.children);
    keys.forEach((key) => addBBoxConstraintsWithRef(bboxTree.children[key], constraints));

    constraints.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.right, [-1, bboxTree.bbox.bboxVars.left])));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.bottom, [-1, bboxTree.bbox.bboxVars.top])));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.left, bboxTree.bbox.bboxVars.right).divide(2)));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.top, bboxTree.bbox.bboxVars.bottom).divide(2)));

    constraints.push(new Constraint(bboxTree.canvas.bboxVars.width, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.right, [-1, bboxTree.canvas.bboxVars.left])));
    constraints.push(new Constraint(bboxTree.canvas.bboxVars.height, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.bottom, [-1, bboxTree.canvas.bboxVars.top])));
    constraints.push(new Constraint(bboxTree.canvas.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.left, bboxTree.canvas.bboxVars.right).divide(2)));
    constraints.push(new Constraint(bboxTree.canvas.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.top, bboxTree.canvas.bboxVars.bottom).divide(2)));

    // // bbox = transform(canvas)
    // constraints.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.width)));
    // constraints.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.height)));
    // constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerX, bboxTree.transform.translate.x)));
    // constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerY, bboxTree.transform.translate.y)));
  }
}

/* mutates constraints */
export const addTransformConstraints = (bboxTree: BBoxTreeVVE, constraints: Constraint[], name = "$root"): void => {
  console.log("got here 1", bboxTree);
  const keys = Object.keys(bboxTree.children);
  keys.forEach((key) => addTransformConstraints(bboxTree.children[key], constraints, name + "/" + key));

  console.log("got here 2");

  // bbox = transform(canvas)
  const constr = [];
  constr.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.width)));
  constr.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.height)));
  constr.push(new Constraint(bboxTree.bbox.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerX, bboxTree.transform.translate.x)));
  constr.push(new Constraint(bboxTree.bbox.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerY, bboxTree.transform.translate.y)));
  // console.log("pretty printed constraints", constraints.map((c) => c.toString()).join("\n"));
  // console.log(`adding transform constraints to "${name}":\n\n${constr.map(c => c.toString()).join("\n\n")}`);
  constraints.push(...constr);
  // constraints.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.width)));
  // constraints.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.height)));
  // constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerX, bboxTree.transform.translate.x)));
  // constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerY, bboxTree.transform.translate.y)));
  console.log("got here 3");
  if (bboxTree.inheritFrame) {
    // bbox and canvas should be the same (no transformation applied!)
    constraints.push(new Constraint(bboxTree.transform.translate.x, Operator.Eq, 0));
    constraints.push(new Constraint(bboxTree.transform.translate.y, Operator.Eq, 0));
  }
  console.log("got here 4");
}

const removeRefs = (encoding: GlyphWithPath): GlyphWithPathNoRef | null => {
  if ("$ref" in encoding) {
    return null;
  } else {
    const children = encoding.children ? encoding.children : {};
    return {
      ...encoding,
      children: objectFilter(objectMap(children, (k, v) => removeRefs(v)), (k, v) => v !== null) as { [key: string]: GlyphWithPathNoRef },
    }
  }
}

// remove children from all refs. this is useful b/c it ensures we don't visit things more than once
// by entering into the children of a ref.
const removeRefChildren = (bboxTree: BBoxTreeVVE): BBoxTreeVVE => {
  if (bboxTree.$ref) {
    return {
      ...bboxTree,
      children: {},
    }
  } else {
    return {
      ...bboxTree,
      children: objectMap(bboxTree.children, (_k, child) => removeRefChildren(child))
    }
  }
}

export default (encoding: Glyph): CompiledAST => {
  const encodingWithPaths = resolvePaths("$root", ["$root"], encoding);

  // 0. construct variables
  const constraints: Constraint[] = [];
  // let bboxTreeWithRef = makeBBoxTreeWithRef(encodingWithPaths);
  // const resolvedEncoding = resolveRefs(bboxTreeWithRef, encodingWithPaths);
  // let bboxTree = makeBBoxTree(resolvedEncoding);

  const bboxTreeRef = makeBBoxTreeWithRef(encodingWithPaths);
  addBBoxValueConstraints(bboxTreeRef, constraints);
  console.log("bboxTreeRef", bboxTreeRef);

  // :bbox tree has refs and only vars

  // 1. add bbox and canvas constraints
  addBBoxConstraintsWithRef(bboxTreeRef, constraints);
  console.log("addBBoxConstraintsWithRef complete");

  const bboxTree = resolveRefs(bboxTreeRef, bboxTreeRef, ["$root"], { translate: { x: new Expression(0), y: new Expression(0) } });
  const bboxTreeNoRefChildren = removeRefChildren(bboxTree);

  // 2. add transform constraints
  addTransformConstraints(bboxTreeNoRefChildren, constraints);

  // 3. add $root bbox origin constraints
  // arbitrarily place origin since the top-level box isn't placed by a parent
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.left, Operator.Eq, 0));
  constraints.push(new Constraint(bboxTree.bbox.bboxVars.top, Operator.Eq, 0));

  // 4. children constraints
  addChildrenConstraints(bboxTreeNoRefChildren, constraints);
  console.log("addChildrenConstraints complete");

  // 5. add gestalt constraints
  addGestaltConstraints(bboxTree, encodingWithPaths, constraints);
  console.log("addGestaltConstraints complete")

  console.log("bboxTree", bboxTree);
  // console.log("bboxTree and constraints pre compile", bboxTree, constraints);

  // 6. solve variables
  const solver = new Solver();
  constraints.forEach((constraint: Constraint) => solver.addConstraint(constraint));
  // console.log("constraints[0]", constraints[0]);
  // console.log("pretty printed constraints[0]", ppConstraint(constraints[0]));
  // console.log("pretty printed constraints[0]", constraints[0].toString());
  console.log("pretty printed constraints", constraints
    .map((c) => c.toString())
    .filter((s) => s.includes("$root.elements."))
    .join("\n"));
  solver.updateVariables();

  // 7. extract values
  const bboxValues = getBBoxValues(bboxTree);
  console.log("bboxValues post compile", bboxValues);

  const encodingWithoutRefs = removeRefs(encodingWithPaths);
  if (encodingWithoutRefs === null) throw "error: the top-level glyph was a ref"

  return { bboxValues, encoding: encodingWithoutRefs };
}
