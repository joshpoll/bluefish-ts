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
import { Constraint, Operator, Solver, Strength, Variable } from 'kiwi.js';
import { getBBoxValues, addBBoxConstraints, makeBBoxVars, transformBBox } from './kiwiBBoxTransform';
/* mutates constraints */
var addChildrenConstraints = function (bboxTree, constraints) {
    var keys = Object.keys(bboxTree.children);
    keys.forEach(function (key) { return addChildrenConstraints(bboxTree.children[key], constraints); });
    // connect bbox and canvas width and height
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, bboxTree.canvas.bboxVars.width));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, bboxTree.canvas.bboxVars.height));
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
        // add containment constraints always
        constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.left, Operator.Ge, bboxTree.canvas.bboxVars.left));
        constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.right, Operator.Le, bboxTree.canvas.bboxVars.right));
        constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.top, Operator.Ge, bboxTree.canvas.bboxVars.top));
        constraints.push(new Constraint(bboxTree.children[bboxKey].bbox.bboxVars.bottom, Operator.Le, bboxTree.canvas.bboxVars.bottom));
    }
};
var makeBBoxTree = function (encoding) {
    var children = encoding.children === undefined ? {} : encoding.children;
    var keys = Object.keys(children);
    var compiledChildren = keys.reduce(function (o, glyphKey) {
        var _a;
        return (__assign(__assign({}, o), (_a = {}, _a[glyphKey] = makeBBoxTree(children[glyphKey]), _a)));
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
};
var resolvePaths = function (path, encoding) {
    var children = encoding.children === undefined ? {} : encoding.children;
    var compiledChildren = Object.keys(children).reduce(function (o, glyphKey) {
        var _a;
        return (__assign(__assign({}, o), (_a = {}, _a[glyphKey] = resolvePaths(path + "." + glyphKey, children[glyphKey]), _a)));
    }, {});
    return __assign(__assign({}, encoding), { path: path, children: compiledChildren });
};
var resolvePath = function (bboxTree, path) {
    return resolvePathAux(bboxTree, path.split('/'));
};
// TODO: this seems very wrong!
var resolvePathAux = function (bboxTree, path) {
    var head = path[0], tail = path.slice(1);
    // console.log("path", "head", head, "tail", tail);
    if (tail.length === 0) {
        if (head === "canvas") {
            return bboxTree.canvas.bboxVars;
        }
        else {
            return bboxTree.children[head].bbox.bboxVars;
        }
    }
    else {
        // console.log("path", "adding transform", bboxTree.children[head].transform);
        return transformBBox(resolvePathAux(bboxTree.children[head], tail), bboxTree.children[head].transform);
    }
};
/* mutates constraints */
var addGestaltConstraints = function (bboxTree, encoding, constraints) {
    var keys = Object.keys(bboxTree.children);
    keys.forEach(function (key) { return addGestaltConstraints(bboxTree.children[key], encoding.children[key], constraints); });
    var relations = encoding.relations === undefined ? [] : encoding.relations;
    relations.forEach(function (_a) {
        var left = _a.left, right = _a.right, gestalt = _a.gestalt;
        return gestalt.forEach(function (g) {
            var leftBBox = resolvePath(bboxTree, left);
            var rightBBox = resolvePath(bboxTree, right);
            // const leftBBox = left === "canvas" ? bboxTree.canvas.bboxVars : bboxTree.children[left].bbox.bboxVars;
            // const rightBBox = right === "canvas" ? bboxTree.canvas.bboxVars : bboxTree.children[right].bbox.bboxVars;
            constraints.push(g(leftBBox, rightBBox));
        });
    });
};
export default (function (encoding) {
    var resolvedEncoding = resolvePaths("$root", encoding);
    // 1. construct variables
    var constraints = [];
    var bboxTree = makeBBoxTree(resolvedEncoding);
    // 1.25 add canvas and children constraints
    // arbitrarily place origin since the top-level box isn't placed by a parent
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.left, Operator.Eq, 0));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.top, Operator.Eq, 0));
    addChildrenConstraints(bboxTree, constraints);
    // console.log("step 1.25 complete", constraints)
    // 1.5. add bbox constraints
    addBBoxConstraints(bboxTree, constraints);
    console.log("step 1.5 complete");
    // 2. add gestalt constraints
    addGestaltConstraints(bboxTree, resolvedEncoding, constraints);
    console.log("step 2 complete");
    console.log("bboxTree", bboxTree);
    // 3. solve variables
    var solver = new Solver();
    constraints.forEach(function (constraint) { return solver.addConstraint(constraint); });
    solver.updateVariables();
    // 4. extract values
    var bboxValues = getBBoxValues(bboxTree);
    console.log("bboxValues post compile", bboxValues);
    return { bboxValues: bboxValues, encoding: resolvedEncoding };
});
//# sourceMappingURL=compile.js.map