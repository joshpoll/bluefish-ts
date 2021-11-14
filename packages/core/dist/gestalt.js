var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Constraint, Expression, Operator, Strength, Variable } from 'kiwi.js';
export var alignTop = function (left, right) {
    return new Constraint(left.top, Operator.Eq, right.top);
};
export var alignTopSpace = function (spacing) {
    if (spacing === void 0) { spacing = new Variable(); }
    return function (left, right) {
        return new Constraint(new Expression(left.top), Operator.Eq, new Expression(right.top, spacing));
    };
};
export var alignRightSpace = function (spacing) {
    if (spacing === void 0) { spacing = new Variable(); }
    return function (left, right) {
        return new Constraint(new Expression(left.right), Operator.Eq, new Expression(right.right, spacing));
    };
};
export var alignBottomSpace = function (spacing) {
    if (spacing === void 0) { spacing = new Variable(); }
    return function (left, right) {
        return new Constraint(new Expression(left.bottom, spacing), Operator.Eq, new Expression(right.bottom));
    };
};
export var alignLeftSpace = function (spacing) {
    if (spacing === void 0) { spacing = new Variable(); }
    return function (left, right) {
        return new Constraint(new Expression(left.left, spacing), Operator.Eq, new Expression(right.left));
    };
};
export var alignBottom = function (left, right) {
    return new Constraint(left.bottom, Operator.Eq, right.bottom);
};
export var alignLeft = function (left, right) {
    return new Constraint(left.left, Operator.Eq, right.left);
};
export var alignRight = function (left, right) {
    return new Constraint(left.right, Operator.Eq, right.right);
};
export var alignCenterX = function (left, right) {
    return new Constraint(left.centerX, Operator.Eq, right.centerX);
};
export var alignCenterY = function (left, right) {
    return new Constraint(left.centerY, Operator.Eq, right.centerY);
};
export var hAlignCenter = alignCenterY;
export var vAlignCenter = alignCenterX;
export var hSpace = function (spacing) {
    if (spacing === void 0) { spacing = new Variable(); }
    return function (left, right) {
        return new Constraint(new Expression(left.right, spacing), Operator.Eq, new Expression(right.left));
    };
};
export var vSpace = function (spacing) {
    if (spacing === void 0) { spacing = new Variable(); }
    return function (left, right) {
        return new Constraint(new Expression(left.bottom, spacing), Operator.Eq, new Expression(right.top));
    };
};
export var containsLeft = function (left, right) {
    return new Constraint(left.left, Operator.Le, right.left);
};
export var containsRight = function (left, right) {
    return new Constraint(left.right, Operator.Ge, right.right);
};
export var containsTop = function (left, right) {
    return new Constraint(left.top, Operator.Le, right.top);
};
export var containsBottom = function (left, right) {
    return new Constraint(left.bottom, Operator.Ge, right.bottom);
};
export var alignTopStrong = function (left, right) {
    return new Constraint(left.top, Operator.Eq, right.top, Strength.strong);
};
export var alignBottomStrong = function (left, right) {
    return new Constraint(left.bottom, Operator.Eq, right.bottom, Strength.strong);
};
export var alignLeftStrong = function (left, right) {
    return new Constraint(left.left, Operator.Eq, right.left, Strength.strong);
};
export var alignRightStrong = function (left, right) {
    return new Constraint(left.right, Operator.Eq, right.right, Strength.strong);
};
export var sameWidth = function (left, right) {
    return new Constraint(left.width, Operator.Eq, right.width);
};
export var sameHeight = function (left, right) {
    return new Constraint(left.height, Operator.Eq, right.height);
};
export var contains = [containsLeft, containsRight, containsTop, containsBottom];
export var containsShrinkWrap = __spreadArray(__spreadArray([], contains, true), [alignLeftStrong, alignRightStrong, alignTopStrong, alignBottomStrong], false);
//# sourceMappingURL=gestalt.js.map