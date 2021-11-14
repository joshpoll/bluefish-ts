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
import { jsx as _jsx } from "react/jsx-runtime";
import { hSpace, alignBottom } from '../gestalt';
import { rect } from '../mark';
import * as _ from "lodash";
import { zipWith } from 'lodash';
import * as scale from "d3-scale";
import { summarize, tidy, min, max } from '@tidyjs/tidy';
/* https://vega.github.io/vega-lite/examples/bar.html */
export var data = [
    { "category": "A", "value": 28 }, { "category": "B", "value": 55 }, { "category": "C", "value": 43 },
    { "category": "D", "value": 91 }, { "category": "E", "value": 81 }, { "category": "F", "value": 53 },
    { "category": "G", "value": 19 }, { "category": "H", "value": 87 }, { "category": "I", "value": 52 }
];
export var bar = function (data) { return ({
/* TODO: the problem with this will be aligning stuff outside the glyph I think. requires guides
or another way to look inside a glyph */
}); };
// inching closer to list/set
export var bars = function (data) { return ({
    children: data
        .reduce(function (o, _a, i) {
        var _b;
        var value = _a.value;
        return (__assign(__assign({}, o), (_b = {}, _b[i] = rect({ width: 20., height: value, fill: "steelblue" }), _b)));
    }, {}),
    relations: zipWith(_.range(data.length - 1), _.range(1, data.length), function (curr, next) { return ({ left: curr.toString(), right: next.toString(), gestalt: [alignBottom, hSpace(5.)] }); }),
}); };
/* TODO:
   - replace rect with line?
   - add tick marks
   - add coordinate system? similar to observable plot, but on any glyph
   - use a list for bars? need a good way of expressing sets/lists
*/
export var xAxis = function (ticks) { return ({
    renderFn: debug,
    children: ticks
        .reduce(function (o, tick, i) {
        var _a;
        return (__assign(__assign({}, o), (_a = {}, _a[i] = rect({ width: 3., height: 15., x: tick, fill: "purple" }), _a)));
    }, {})
}); };
export var debug = function (bbox) {
    return _jsx("rect", { x: bbox.left, y: bbox.top, width: bbox.width, height: bbox.height, fill: "none", stroke: "magenta" }, void 0);
};
export var yAxis = function (ticks) { return ({
    // renderFn: debug,
    children: __assign({ "axis": rect({ width: 3, fill: "red" }) }, ticks
        .reduce(function (o, tick, i) {
        var _a;
        return (__assign(__assign({}, o), (_a = {}, _a[i] = rect({ width: 15., height: 3., y: tick, fill: "purple" }), _a)));
    }, {})),
    relations: _.range(ticks.length).map(function (i) { return ({ left: i.toString(), right: "axis", gestalt: [hSpace(3)] }); })
}); };
var extent = tidy(data, summarize({
    min: min('value'),
    max: max('value'),
}))[0];
var s = scale.scaleLinear().domain([extent.min, extent.max]);
var ticks = s.nice().ticks(5);
console.log("ticks", ticks);
export var dataGlyph = {
    children: {
        // TODO: this is buggy, but not if used for xAxis!!!!
        "yAxis": xAxis(ticks),
        // "bars": bars(data),
    },
    // relations: [
    //   {
    //     left: "yAxis",
    //     right: "bars",
    //     gestalt: [hSpace(0.), alignTop, alignBottom],
    //   },
    // ]
};
//# sourceMappingURL=reducebug.js.map