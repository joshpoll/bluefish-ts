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
import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft } from '../gestalt';
import { ellipse, rect, text } from '../mark';
import { objectMap } from '../objectMap';
var mkComplexGlyph = function (complexGlyph_) { return function (cont) { return cont(complexGlyph_); }; };
// loses a bit of type safety b/c we _should_ be able to tell whether the return type is U or U[]
// based on the input, but this type doesn't tell us
// luckily this is only used internally. right???
var mapRelation = function (r, f) {
    if (r instanceof Array) {
        return r.map(f);
    }
    else {
        // TODO: this cast seems sus, but it might not be b/c we check for array in the first branch
        return f(r);
    }
};
export var lowerGlyphE2 = function (g) {
    if (typeof g === "function") {
        // mark case
        return g;
    }
    else {
        return function (data) {
            var _a;
            return ({
                children: __assign(__assign({}, g.glyphs), objectMap(g.dataGlyphs, function (k, v) {
                    // apply the appropriate data function (mark or glyph)
                    // then if the input is an array, group its elements
                    // TODO: is there a simpler way to do this?
                    if (typeof v === "function") {
                        // mark case. just apply the mark function to the data
                        var relationMarks = mapRelation(data[k], v);
                        if (relationMarks instanceof Array) {
                            return {
                                children: relationMarks.reduce(function (o, m, i) {
                                    var _a;
                                    return (__assign(__assign({}, o), (_a = {}, _a[i] = m, _a)));
                                }, {})
                            };
                        }
                        else {
                            return relationMarks;
                        }
                    }
                    else {
                        // glyphe2 case. lower the glyphe2 to a glyph function, then apply it to the data
                        var relationGlyphs = mapRelation(data[k], lowerGlyphE2(v));
                        if (relationGlyphs instanceof Array) {
                            return {
                                children: relationGlyphs.reduce(function (o, g, i) {
                                    var _a;
                                    return (__assign(__assign({}, o), (_a = {}, _a[i] = g, _a)));
                                }, {})
                            };
                        }
                        else {
                            return relationGlyphs;
                        }
                    }
                })),
                /* {
                  // map over g's dataGlyphs fields and apply the corresponding functions to data[field] (unwrapping
                  // array as necessary)
                  // if it's an array, make a new glyph with "0", "1", "2", ... as fields
                }, */
                relations: (_a = g.relations) === null || _a === void 0 ? void 0 : _a.map(function (r) { return ({
                    left: r.fields[0].toString(),
                    right: r.fields[1].toString(),
                    gestalt: r.constraints,
                }); })
            });
        };
    }
};
var ref = function (prefix, path) { return ({ $ref: true, path: (prefix + path) }); };
export var MyListGlyphE2 = ({
    dataGlyphs: {
        "elements": function (element) { return rect({ width: element, height: 200 / 3, fill: "black" }); },
        "neighbors": ({
            /* TODO: not sure if/how refs should be rendered */
            /* for now we will say it shouldn't be rendered */
            dataGlyphs: {},
            relations: [{
                    fields: ["curr", "next"],
                    constraints: [vSpace(10.)]
                }]
        }),
    }
});
var myListExample = {
    elements: [1, 2, 4, 1],
    neighbors: [
        { curr: ref("elements", "[0]"), next: ref("elements", "[1]") },
        { curr: ref("elements", "[1]"), next: ref("elements", "[2]") },
        { curr: ref("elements", "[2]"), next: ref("elements", "[3]") },
    ],
};
var dataE2 = { obj1: ["firebrick"], obj2: "steelblue", obj3: "black", };
export var exampleRelationInterface2 = ({
    glyphs: {
        "text": text({ contents: "hello world!", fontSize: "calc(10px + 2vmin)" }),
    },
    dataGlyphs: {
        "obj1": function (obj1) { return rect({ width: 500 / 3, height: 200 / 3, fill: obj1 }); },
        "obj2": function (obj2) { return ellipse({ rx: 300 / 6, ry: 200 / 6, fill: obj2 }); },
        "obj3": function (obj3) { return ellipse({ rx: 50, ry: 50, fill: obj3 }); },
    },
    relations: [
        // e.g. "color1" refers to the bbox of the "color1" glyph defined above
        { fields: ["obj1", "obj2"], constraints: [vSpace(50.)] },
        { fields: ["obj1", "obj3"], constraints: [hSpace(50.), alignCenterY] },
        { fields: ["obj3", "text"], constraints: [vSpace(50.), alignCenterX] },
        { fields: ["canvas", "obj1"], constraints: [alignLeft] },
    ]
});
export var loweredGlyphTest = lowerGlyphE2(exampleRelationInterface2)(dataE2);
//# sourceMappingURL=starterCode.js.map