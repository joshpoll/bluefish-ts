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
import _, { zipWith } from "lodash";
import { alignBottom, hSpace, vSpace, alignLeft, alignRight, alignTop } from '../gestalt';
import { rect, text } from "../mark";
import * as population from "./population";
import * as d3Array from "d3-array";
import { filter, groupBy, tidy, map } from '@tidyjs/tidy';
var data = population.data;
data = _.filter(population.data, function (_a) {
    var year = _a.year;
    return year === 2000;
});
var shrunkData = data.map(function (d) { return (__assign(__assign({}, d), { people: d.people / 100000 })); });
var groupedData = d3Array.group(shrunkData, function (d) { return d.age; });
console.log("grouped data", groupedData);
var tidyGroup = tidy(data, filter(function (_a) {
    var year = _a.year;
    return year === 2000;
}), map(function (d) { return (__assign(__assign({}, d), { people: d.people / 100000 })); }), groupBy('age', [map(function (d) { return d.people; })], groupBy.object()));
console.log("tidy group", tidyGroup);
export var bar = function (data) { return ({
    children: {
        "bar": rect({ width: 20., height: data, fill: "steelblue" }),
    }
}); };
export var groupedBar = function (data) { return ({
    children: data
        .reduce(function (o, x, i) {
        var _a;
        return (__assign(__assign({}, o), (_a = {}, _a[i] = bar(x), _a)));
    }, {}),
    relations: zipWith(_.range(data.length - 1), _.range(1, data.length), function (curr, next) { return ({ left: curr.toString(), right: next.toString(), gestalt: [alignBottom, hSpace(1.)] }); }),
}); };
/* TODO: make this take in some grouped d3 data and produce some grouped bars */
export var groupedBars = function (data) { return ({
    children: Object.keys(data)
        .reduce(function (o, key, i) {
        var _a;
        return (__assign(__assign({}, o), (_a = {}, _a[i] = groupedBar(data[+key]), _a)));
    }, {}),
    relations: zipWith(_.range(Object.keys(data).length - 1), _.range(1, Object.keys(data).length), function (curr, next) { return ({ left: curr.toString(), right: next.toString(), gestalt: [alignBottom, hSpace(5.)] }); }),
}); };
export var listTest = function (gestalt) { return ({
    children: {
        "0": rect({}),
        "1": rect({}),
        "2": rect({}),
        "3": rect({}),
    },
    relations: zipWith(_.range(Object.keys(data).length - 1), _.range(1, Object.keys(data).length), function (curr, next) { return ({ left: curr.toString(), right: next.toString(), gestalt: gestalt }); }),
}); };
export var listSugared = function (gestalt) { return ({
    children: [rect({}), rect({}), rect({}), rect({})],
    gestalt: gestalt,
}); };
export var listSugared2 = function (gestalt) { return ({
    children: {
        "list": [rect({}), rect({}), rect({}), rect({})],
    },
    relations: [
        {
            left: "list",
            right: "list",
            gestalt: [vSpace(3)],
        }
    ],
}); };
export var setSugared = function (gestalt) { return ({
    children: {
        "set": [rect({}), rect({}), rect({}), rect({})],
    },
    relations: [
        {
            left: "list",
            right: "list",
            gestalt: [vSpace(3)],
        }
    ],
}); };
/*

input:
{
  nodes,
  links,
}

output:
{
  list(list(nodes)),
  edges
}

encoding
{

}

*/
/* TODO:
   - replace rect with line?
   - add tick marks
   - add coordinate system? similar to observable plot, but on any glyph
   - use a list for bars? need a good way of expressing sets/lists
*/
export var xAxis = function (ticks) { return ({
    children: __assign({ "axis": rect({ height: 3, fill: "red" }) }, ticks
        .reduce(function (o, tick, i) {
        var _a;
        return (__assign(__assign({}, o), (_a = {}, _a[i] = rect({ width: 3., height: 15., x: tick, fill: "purple" }), _a)));
    }, {})),
    relations: _.range(ticks.length).map(function (i) { return ({ left: "axis", right: i.toString(), gestalt: [vSpace(3)] }); }),
}); };
export var yAxis = function (ticks) { return ({
    children: __assign({ "axis": rect({ width: 3, fill: "red" }) }, ticks
        .reduce(function (o, tick, i) {
        var _a;
        return (__assign(__assign({}, o), (_a = {}, _a[i] = rect({ width: 15., height: 3., y: tick, fill: "purple" }), _a)));
    }, {})),
    relations: _.range(ticks.length).map(function (i) { return ({ left: i.toString(), right: "axis", gestalt: [hSpace(3)] }); })
}); };
export var dataGlyph = {
    children: {
        // "xAxis": rect({ height: 3, fill: "red" }),
        "xAxis": xAxis([10, 10 + 25, 10 + 25 * 2]),
        // "yAxis": rect({ width: 3, fill: "red" }),
        "yAxis": yAxis([10, 10 + 25, 10 + 25 * 2]),
        "bars": groupedBars(tidyGroup),
    },
    relations: [
        {
            left: "bars",
            right: "xAxis",
            gestalt: [vSpace(0.), alignLeft, alignRight],
        },
        {
            left: "yAxis",
            right: "bars",
            gestalt: [hSpace(0), alignTop, alignBottom],
        },
    ]
};
export var chart = {
    children: {
        "chart": dataGlyph,
        "title": text({ contents: "This is a grouped bar chart", fontSize: "calc(10px + 2vmin)" }),
    },
    relations: [
        {
            left: "title",
            right: "chart",
            gestalt: [vSpace(15.), alignRight]
        }
    ]
};
export default chart;
//# sourceMappingURL=groupedbarchart.js.map