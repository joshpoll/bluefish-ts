/* util function for mapping over objects */
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
// TODO: some version of TypeScript or ESLint or Babel or whatever doesn't like exporting this as a
// const arrow fn
export function objectMap(o, f) {
    return Object.entries(o).reduce(function (o, _a) {
        var _b;
        var key = _a[0], val = _a[1];
        return (__assign(__assign({}, o), (_b = {}, _b[key] = f(key, val), _b)));
    }, {});
}
// TODO: this type is really weak
export function objectFilter(o, f) {
    return Object.entries(o).reduce(function (o, _a) {
        var _b;
        var key = _a[0], val = _a[1];
        return f(key, val) ? (__assign(__assign({}, o), (_b = {}, _b[key] = val, _b))) : o;
    }, {});
}
//# sourceMappingURL=objectMap.js.map