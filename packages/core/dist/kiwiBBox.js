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
import { Constraint, Expression, Operator, Variable } from 'kiwi.js';
export var makeBBoxVars = function (bbox) {
    var left = new Variable(bbox + ".left");
    var right = new Variable(bbox + ".right");
    var top = new Variable(bbox + ".top");
    var bottom = new Variable(bbox + ".bottom");
    var width = new Variable(bbox + ".width");
    var height = new Variable(bbox + ".height");
    var centerX = new Variable(bbox + ".centerX");
    var centerY = new Variable(bbox + ".centerY");
    return {
        left: left,
        right: right,
        top: top,
        bottom: bottom,
        width: width,
        height: height,
        centerX: centerX,
        centerY: centerY,
    };
};
/* mutates constraints */
export var addBBoxConstraints = function (bboxTree, constraints) {
    var keys = Object.keys(bboxTree.children);
    keys.forEach(function (key) { return addBBoxConstraints(bboxTree.children[key], constraints); });
    if (bboxTree.bbox.bboxValues !== undefined) {
        for (var _i = 0, _a = Object.keys(bboxTree.bbox.bboxValues); _i < _a.length; _i++) {
            var key = _a[_i];
            if (bboxTree.bbox.bboxValues[key] !== undefined) {
                constraints.push(new Constraint(bboxTree.bbox.bboxVars[key], Operator.Eq, bboxTree.bbox.bboxValues[key]));
            }
        }
    }
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.width, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.right, [-1, bboxTree.bbox.bboxVars.left])));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.height, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.bottom, [-1, bboxTree.bbox.bboxVars.top])));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.left, bboxTree.bbox.bboxVars.right).divide(2)));
    constraints.push(new Constraint(bboxTree.bbox.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.bbox.bboxVars.top, bboxTree.bbox.bboxVars.bottom).divide(2)));
    constraints.push(new Constraint(bboxTree.canvas.bboxVars.width, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.right, [-1, bboxTree.canvas.bboxVars.left])));
    constraints.push(new Constraint(bboxTree.canvas.bboxVars.height, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.bottom, [-1, bboxTree.canvas.bboxVars.top])));
    constraints.push(new Constraint(bboxTree.canvas.bboxVars.centerX, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.left, bboxTree.canvas.bboxVars.right).divide(2)));
    constraints.push(new Constraint(bboxTree.canvas.bboxVars.centerY, Operator.Eq, new Expression(bboxTree.canvas.bboxVars.top, bboxTree.canvas.bboxVars.bottom).divide(2)));
};
export var getBBoxValues = function (bboxVars) {
    return {
        bbox: {
            left: bboxVars.bbox.bboxVars.left.value(),
            right: bboxVars.bbox.bboxVars.right.value(),
            top: bboxVars.bbox.bboxVars.top.value(),
            bottom: bboxVars.bbox.bboxVars.bottom.value(),
            width: bboxVars.bbox.bboxVars.width.value(),
            height: bboxVars.bbox.bboxVars.height.value(),
            centerX: bboxVars.bbox.bboxVars.centerX.value(),
            centerY: bboxVars.bbox.bboxVars.centerY.value(),
        },
        canvas: {
            left: bboxVars.canvas.bboxVars.left.value(),
            right: bboxVars.canvas.bboxVars.right.value(),
            top: bboxVars.canvas.bboxVars.top.value(),
            bottom: bboxVars.canvas.bboxVars.bottom.value(),
            width: bboxVars.canvas.bboxVars.width.value(),
            height: bboxVars.canvas.bboxVars.height.value(),
            centerX: bboxVars.canvas.bboxVars.centerX.value(),
            centerY: bboxVars.canvas.bboxVars.centerY.value(),
        },
        children: Object.keys(bboxVars.children).reduce(function (o, glyphKey) {
            var _a;
            return (__assign(__assign({}, o), (_a = {}, _a[glyphKey] = getBBoxValues(bboxVars.children[glyphKey]), _a)));
        }, {})
    };
};
//# sourceMappingURL=kiwiBBox.js.map