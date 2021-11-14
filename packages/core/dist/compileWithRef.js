var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Constraint, Operator, Solver, Strength, Variable, Expression } from 'kiwi.js';
import { getBBoxValues, makeBBoxVars, transformBBox } from './kiwiBBoxTransform';
import { objectFilter, objectMap } from './objectMap';
/* mutates constraints */
var addChildrenConstraints = function (bboxTree, constraints) {
    var keys = Object.keys(bboxTree.children);
    keys.forEach(function (key) { return addChildrenConstraints(bboxTree.children[key], constraints); });
    // lightly suggest the origin of the canvas
    constraints.push(new Constraint(bboxTree.canvas.bboxVars.left, Operator.Eq, 0, Strength.weak));
    constraints.push(new Constraint(bboxTree.canvas.bboxVars.top, Operator.Eq, 0, Strength.weak));
    var canvasWidthDefined = bboxTree.canvas.bboxValues !== undefined && bboxTree.canvas.bboxValues.width !== undefined;
    var canvasHeightDefined = bboxTree.canvas.bboxValues !== undefined && bboxTree.canvas.bboxValues.height !== undefined;
    // 2. add canvas shrink-wrap + container constraints
    for (var _i = 0, _a = Object.keys(bboxTree.children); _i < _a.length; _i++) {
        var bboxKey = _a[_i];
        // only shrink-wrap if width and/or height aren't defined
        if (!canvasWidthDefined) {
            constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Eq, bboxTree.canvas.bboxVars.left, Strength.strong));
            constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.right, Operator.Eq, bboxTree.canvas.bboxVars.right, Strength.strong));
        }
        if (!canvasHeightDefined) {
            constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.top, Operator.Eq, bboxTree.canvas.bboxVars.top, Strength.strong));
            constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, Operator.Eq, bboxTree.canvas.bboxVars.bottom, Strength.strong));
        }
        // console.log("constraining", bboxKey, bboxTree.children[bboxKey].bbox.bboxVars);
        // add containment constraints always
        constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Ge, bboxTree.canvas.bboxVars.left));
        constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.right, Operator.Le, bboxTree.canvas.bboxVars.right));
        constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.top, Operator.Ge, bboxTree.canvas.bboxVars.top));
        constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, Operator.Le, bboxTree.canvas.bboxVars.bottom));
    }
};
// export type BBoxTreeVarsWithRef = BBoxTreeWithRef<bboxVars, Variable>;
// export type BBoxTreeVars = BBoxTree<bboxVars, Variable>;
var makeBBoxTreeWithRef = function (encoding) {
    if ("$ref" in encoding) {
        return encoding;
    }
    else {
        var children_1 = encoding.children === undefined ? {} : encoding.children;
        var keys = Object.keys(children_1);
        var compiledChildren = keys.reduce(function (o, glyphKey) {
            var _a;
            return (__assign(__assign({}, o), (_a = {}, _a[glyphKey] = makeBBoxTreeWithRef(children_1[glyphKey]), _a)));
        }, {});
        var bbox = {
            bboxVars: makeBBoxVars(encoding.path),
            bboxValues: encoding.bbox,
        };
        var transform = {
            translate: {
                x: new Variable(encoding.path + ".transform" + ".translate" + ".x"),
                y: new Variable(encoding.path + ".transform" + ".translate" + ".y"),
            }
        };
        var canvas = {
            bboxVars: makeBBoxVars(encoding.path + ".canvas"),
        };
        return {
            bbox: bbox,
            transform: transform,
            canvas: canvas,
            children: compiledChildren,
        };
    }
};
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
var resolvePaths = function (path, pathList, encoding) {
    if ("$ref" in encoding) {
        return encoding;
    }
    else {
        var children_2 = encoding.children === undefined ? {} : encoding.children;
        var compiledChildren = Object.keys(children_2).reduce(function (o, glyphKey) {
            var _a;
            return (__assign(__assign({}, o), (_a = {}, _a[glyphKey] = resolvePaths(path + "." + glyphKey, __spreadArray(__spreadArray([], pathList, true), [glyphKey], false), children_2[glyphKey]), _a)));
        }, {});
        return __assign(__assign({}, encoding), { path: path, pathList: pathList, children: compiledChildren });
    }
};
// TODO: this seems very wrong!
var resolveGestaltPathAux = function (bboxTree, path) {
    console.log("gestalt path", path, bboxTree);
    var head = path[0], tail = path.slice(1);
    // console.log("path", "head", head, "tail", tail);
    if (tail.length === 0) {
        if (head === "$canvas") {
            return bboxTree.canvas.bboxVars;
        }
        else {
            return bboxTree.children[head].bbox.bboxVars;
        }
    }
    else {
        // console.log("path", "adding transform", bboxTree.children[head].transform);
        return transformBBox(resolveGestaltPathAux(bboxTree.children[head], tail), bboxTree.children[head].transform);
    }
};
var resolveGestaltPath = function (bboxTree, path) {
    return resolveGestaltPathAux(bboxTree, path.split('/'));
};
// const resolveGestaltPath = (bboxTree: BBoxTreeVVE, name: string): bboxVarExprs => {
//   if (name === "$canvas") {
//     return bboxTree.canvas.bboxVars;
//   } else {
//     return bboxTree.children[name].bbox.bboxVars;
//   }
// }
/* mutates constraints */
var addGestaltConstraints = function (bboxTree, encoding, constraints) {
    if ("$ref" in encoding) {
        return;
    }
    else {
        var keys = Object.keys(bboxTree.children);
        keys.forEach(function (key) { return addGestaltConstraints(bboxTree.children[key], encoding.children[key], constraints); });
        var relations = encoding.relations === undefined ? [] : encoding.relations;
        relations.forEach(function (_a) {
            var left = _a.left, right = _a.right, gestalt = _a.gestalt;
            return gestalt.forEach(function (g) {
                // console.log("adding gestalt constraint", left, right, gestalt);
                var leftBBox = resolveGestaltPath(bboxTree, left);
                var rightBBox = resolveGestaltPath(bboxTree, right);
                // console.log("left and right bboxes", bboxTree, leftBBox, rightBBox);
                // const leftBBox = left === "canvas" ? bboxTree.canvas.bboxVars : bboxTree.children[left].bbox.bboxVars;
                // const rightBBox = right === "canvas" ? bboxTree.canvas.bboxVars : bboxTree.children[right].bbox.bboxVars;
                constraints.push(g(leftBBox, rightBBox));
            });
        });
    }
};
var lookupPath = function (bboxTreeWithRef, path) {
    var _a, _b;
    var hd = path[path.length - 1];
    var tl = path.slice(0, -1);
    // console.log("current path", hd, tl, bboxTreeWithRef);
    if (tl.length === 0) {
        if ("$ref" in bboxTreeWithRef) {
            throw "error: reference to a reference is not yet implemented";
        }
        else {
            // TODO: this is brittle
            var child = (_a = bboxTreeWithRef.children[hd]) !== null && _a !== void 0 ? _a : bboxTreeWithRef.children["$object"].children[hd];
            if ("$ref" in child) {
                throw "error: unexpected ref along path";
            }
            else {
                // return {
                //   ...child,
                //   children: {}, // avoids complexities like circular dependencies
                // }
                // TODO: this cast is unsafe if the child contains refs of its own
                return child;
            }
        }
    }
    else {
        if ("$ref" in bboxTreeWithRef) {
            throw "error: found reference along path to glyph";
        }
        else {
            // TODO: I feel like I'm checking for refs too many times here!
            // TODO: this is brittle
            var child = (_b = bboxTreeWithRef.children[hd]) !== null && _b !== void 0 ? _b : bboxTreeWithRef.children["$object"].children[hd];
            if ("$ref" in child) {
                throw "error: unexpected ref along path";
            }
            else {
                var bboxTreeVVE = lookupPath(child, tl);
                return __assign(__assign({}, bboxTreeVVE), { bbox: {
                        // we use the inverse transform here b/c we are "moving" the bbox up to the $root
                        bboxVars: transformBBox(bboxTreeVVE.bbox.bboxVars, inverseTransformVE(child.transform)),
                    } });
            }
        }
    }
};
var composeTransformVE = function (t1, t2) { return ({
    translate: {
        x: new Expression(t1.translate.x, t2.translate.x),
        y: new Expression(t1.translate.y, t2.translate.y),
    }
}); };
var inverseTransformVE = function (t) { return ({
    translate: {
        x: new Expression([-1, t.translate.x]),
        y: new Expression([-1, t.translate.y]),
    }
}); };
var resolveRefs = function (rootBboxTreeWithRef, bboxTreeWithRef, path, transform) {
    // console.log("visiting", bboxTreeWithRef, transform);
    if ("$ref" in bboxTreeWithRef) {
        console.log("hit ref at", path, "with path", bboxTreeWithRef.path);
        var bboxTree = lookupPath(rootBboxTreeWithRef, bboxTreeWithRef.path);
        // console.log("bboxTree here", bboxTree, transform);
        // we are using the transform here because we are "moving" the bbox from the $root down to us
        var bboxVars = transformBBox(bboxTree.bbox.bboxVars, transform);
        // we need a fresh transform since the relationship between the canvas and the bbox is different
        // now.
        var bboxTransform = {
            translate: {
                // TODO: not sure if path is the right thing to use here. At the very least might need to
                // join it
                x: new Variable(path + ".transform" + ".translate" + ".x"),
                y: new Variable(path + ".transform" + ".translate" + ".y"),
            },
        };
        return __assign(__assign({}, bboxTree), { bbox: {
                bboxVars: bboxVars,
            }, transform: bboxTransform });
    }
    else {
        var newTransform_1 = composeTransformVE(transform, bboxTreeWithRef.transform);
        var compiledChildren = Object.keys(bboxTreeWithRef.children).reduce(function (o, glyphKey) {
            var _a;
            return (__assign(__assign({}, o), (_a = {}, _a[glyphKey] = resolveRefs(rootBboxTreeWithRef, bboxTreeWithRef.children[glyphKey], __spreadArray([glyphKey], path, true), newTransform_1), _a)));
        }, {});
        return __assign(__assign({}, bboxTreeWithRef), { children: compiledChildren });
    }
};
/* mutates constraints */
export var addBBoxValueConstraints = function (bboxTree, constraints) {
    if ("$ref" in bboxTree) {
        return bboxTree;
    }
    else {
        var keys = Object.keys(bboxTree.children);
        var children = keys.reduce(function (o, glyphKey) {
            var _a;
            return (__assign(__assign({}, o), (_a = {}, _a[glyphKey] = addBBoxValueConstraints(bboxTree.children[glyphKey], constraints), _a)));
        }, {});
        if (bboxTree.bbox.bboxValues !== undefined) {
            for (var _i = 0, _a = Object.keys(bboxTree.bbox.bboxValues); _i < _a.length; _i++) {
                var key = _a[_i];
                if (bboxTree.bbox.bboxValues[key] !== undefined) {
                    constraints.push(new Constraint(bboxTree.bbox.bboxVars[key], Operator.Eq, bboxTree.bbox.bboxValues[key]));
                }
            }
        }
        return {
            bbox: bboxTree.bbox,
            // TODO: I don't think canvas has any pre-defined values so nothing is lost here by deleting them?
            canvas: bboxTree.canvas,
            children: children,
            transform: bboxTree.transform,
        };
    }
};
/* mutates constraints */
export var addBBoxConstraintsWithRef = function (bboxTree, constraints) {
    if ("$ref" in bboxTree) {
        return;
    }
    else {
        var keys = Object.keys(bboxTree.children);
        keys.forEach(function (key) { return addBBoxConstraintsWithRef(bboxTree.children[key], constraints); });
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
};
/* mutates constraints */
export var addTransformConstraints = function (bboxTree, constraints) {
    var keys = Object.keys(bboxTree.children);
    keys.forEach(function (key) { return addTransformConstraints(bboxTree.children[key], constraints); });
    // bbox = transform(canvas)
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.width)));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.height)));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerX, bboxTree.transform.translate.x)));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.centerY, bboxTree.transform.translate.y)));
};
var removeRefs = function (encoding) {
    if ("$ref" in encoding) {
        return null;
    }
    else {
        var children = encoding.children ? encoding.children : {};
        return __assign(__assign({}, encoding), { children: objectFilter(objectMap(children, function (k, v) { return removeRefs(v); }), function (k, v) { return v !== null; }) });
    }
};
export default (function (encoding) {
    var encodingWithPaths = resolvePaths("$root", ["$root"], encoding);
    // 0. construct variables
    var constraints = [];
    // let bboxTreeWithRef = makeBBoxTreeWithRef(encodingWithPaths);
    // const resolvedEncoding = resolveRefs(bboxTreeWithRef, encodingWithPaths);
    // let bboxTree = makeBBoxTree(resolvedEncoding);
    var bboxTreeVVRef = makeBBoxTreeWithRef(encodingWithPaths);
    var bboxTreeRef = addBBoxValueConstraints(bboxTreeVVRef, constraints);
    console.log("bboxTreeRef", bboxTreeRef);
    // :bbox tree has refs and only vars
    // 1. add bbox and canvas constraints
    addBBoxConstraintsWithRef(bboxTreeRef, constraints);
    console.log("addBBoxConstraintsWithRef complete");
    var bboxTree = resolveRefs(bboxTreeRef, bboxTreeRef, ["$root"], { translate: { x: new Expression(0), y: new Expression(0) } });
    // 2. add transform constraints
    addTransformConstraints(bboxTree, constraints);
    // 3. add $root bbox origin constraints
    // arbitrarily place origin since the top-level box isn't placed by a parent
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.left, Operator.Eq, 0));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.top, Operator.Eq, 0));
    // 4. children constraints
    addChildrenConstraints(bboxTree, constraints);
    console.log("addChildrenConstraints complete");
    // 5. add gestalt constraints
    addGestaltConstraints(bboxTree, encodingWithPaths, constraints);
    console.log("addGestaltConstraints complete");
    console.log("bboxTree", bboxTree);
    // 6. solve variables
    var solver = new Solver();
    constraints.forEach(function (constraint) { return solver.addConstraint(constraint); });
    solver.updateVariables();
    // 7. extract values
    var bboxValues = getBBoxValues(bboxTree);
    console.log("bboxValues post compile", bboxValues);
    var encodingWithoutRefs = removeRefs(encodingWithPaths);
    if (encodingWithoutRefs === null)
        throw "error: the top-level glyph was a ref";
    return { bboxValues: bboxValues, encoding: encodingWithoutRefs };
});
//# sourceMappingURL=compileWithRef.js.map