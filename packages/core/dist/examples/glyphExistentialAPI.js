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
import { hSpace, alignCenterY, alignLeft, alignCenterX, vSpace, vAlignCenter } from '../gestalt';
import { text, nil, rect, ellipse } from '../mark';
import { objectMap, objectFilter } from "../objectMap";
var KONT = Symbol("KONT");
export var Glyph;
(function (Glyph) {
    Glyph.mk = function (exRecord_) {
        var _a;
        return (_a = {},
            _a[KONT] = function (kont) { return kont(exRecord_); },
            _a);
    };
    Glyph.fromCompileGlyph = function (g) {
        var _a;
        return Glyph.mk({
            bbox: g.bbox,
            renderFn: g.renderFn,
            glyphs: objectMap(g.children, function (k, v) { return Glyph.fromCompileGlyph(v); }),
            relations: (_a = g.relations) === null || _a === void 0 ? void 0 : _a.map(function (_a) {
                var left = _a.left, right = _a.right, gestalt = _a.gestalt;
                return ({ fields: [left, right], constraints: gestalt });
            })
        });
    };
})(Glyph || (Glyph = {}));
export var GlyphFn;
(function (GlyphFn) {
    GlyphFn.mk = function (exRecord_) {
        var _a;
        return (_a = {},
            _a[KONT] = function (kont) { return kont(exRecord_); },
            _a);
    };
    GlyphFn.inhabited = GlyphFn.mk({
        fieldGlyphs: {},
        relations: [],
    });
})(GlyphFn || (GlyphFn = {}));
var GlyphTests;
(function (GlyphTests) {
    var glyphV3Example = GlyphFn.mk({
        glyphs: {
            "text": Glyph.mk(text({ contents: "hello world!", fontSize: "24px" })),
        },
        relations: [{
                fields: ["$canvas", "$canvas"],
                constraints: [],
            }]
    });
    var objectGlyphExample = GlyphFn.mk({
        glyphs: {
            "text": Glyph.mk(text({ contents: "hello world!", fontSize: "24px" })),
        },
        objectGlyph: GlyphFn.mk(function (d) { return Glyph.mk(text({ contents: "hello world!", fontSize: "24px" })); }),
        relations: [{
                fields: ["$canvas", "text"],
                constraints: [],
            }]
    });
    // const fieldsGlyphExample_: GlyphFn_<number, "text"> = {
    //   glyphs: {
    //     "text": text({ contents: "hello world!", fontSize: "24px" }),
    //   },
    //   relations: [{
    //     fields: ["$canvas", "$canvas"],
    //     constraints: [],
    //   }]
    // }
    // const fieldsGlyphExample: GlyphFn<number> = {
    //   [KONT]: (kont) => kont({
    //     glyphs: {
    //       "text": text({ contents: "hello world!", fontSize: "24px" }),
    //     },
    //     relations: [{
    //       fields: ["$canvas", "$canvas"],
    //       constraints: [],
    //     }]
    //   })
    // }
    var fieldsGlyphExample = GlyphFn.mk({
        glyphs: {
            foo: Glyph.mk(nil()),
        },
        fieldGlyphs: {
            item: GlyphFn.mk(function (d) { return Glyph.mk(nil()); }),
        },
        relations: [
            {
                fields: ["$canvas", "$canvas"],
                constraints: []
            },
            {
                fields: ["foo", "item"],
                constraints: []
            },
        ]
    });
})(GlyphTests || (GlyphTests = {}));
var lowerGlyphRelation = function (gr) { return ({
    left: gr.fields[0].toString(),
    right: gr.fields[1].toString(),
    gestalt: gr.constraints,
}); };
export var lowerGlyph = function (g) {
    var _a;
    var kont = g[KONT];
    var glyph_ = kont(function (x) { return x; });
    return {
        bbox: glyph_.bbox,
        renderFn: glyph_.renderFn,
        children: glyph_.glyphs ? objectMap(glyph_.glyphs, function (k, v) { return lowerGlyph(v); }) : {},
        relations: (_a = glyph_.relations) === null || _a === void 0 ? void 0 : _a.map(lowerGlyphRelation),
    };
};
// loses a bit of type safety b/c we _should_ be able to tell whether the return type is U or U[]
// based on the input, but this type doesn't tell us
// luckily this is only used internally. right???
var mapDataRelation = function (r, f) {
    if (r instanceof Array) {
        return r.map(f);
    }
    else {
        // TODO: this cast seems sus, but it might not be b/c we check for array in the first branch
        return f(r);
    }
};
// for a given relation instance, gather its ref fields so that we can lower them through the
// relation visualizations
// TODO: implementing refs properly will take a bit of thought!!!
// TODO: this function is kind of unsafe b/c it doesn't maintain the relations fields invariant and
// it introduces a $object glyph
export var glyphFnToHostGlyphFn = function (gf) {
    var kont = gf[KONT];
    return kont(function (gf) {
        if (typeof gf === "function") {
            return gf;
        }
        else {
            return function (data) { return Glyph.mk({
                bbox: gf.bbox,
                renderFn: gf.renderFn,
                glyphs: __assign(__assign(__assign(__assign({}, ("fieldGlyphs" in gf ? objectMap(gf.fieldGlyphs, function (k, v) {
                    var loweredGlyphs = mapDataRelation(data[k], glyphFnToHostGlyphFn(v));
                    if (loweredGlyphs instanceof Array) {
                        return Glyph.mk({
                            glyphs: loweredGlyphs.reduce(function (o, g, i) {
                                var _a;
                                return (__assign(__assign({}, o), (_a = {}, _a[i] = g, _a)));
                            }, {})
                        });
                    }
                    else {
                        return loweredGlyphs;
                    }
                }) : {})), (typeof data === "object" ? objectFilter(data, function (k, v) { return (typeof v === "object") && ("$ref" in v); }) : {})), gf.glyphs), ("objectGlyph" in gf ? { "$object": glyphFnToHostGlyphFn(gf.objectGlyph)(data) } : {})),
                relations: gf.relations,
            }); };
        }
    });
};
// TODO: maybe want to use RelationInstances here, but it seems like it's subtle to do that well so
// we will defer it
export var lowerGlyphFn = function (gf) {
    var kont = gf[KONT];
    return kont(function (gf) {
        return function (data) {
            var _a;
            if (typeof gf === "function") {
                // HostGlyphFn
                return lowerGlyph(gf(data));
            }
            else {
                return {
                    bbox: gf.bbox,
                    renderFn: gf.renderFn,
                    children: __assign(__assign(__assign(__assign({}, ("fieldGlyphs" in gf ? objectMap(gf.fieldGlyphs, function (k, v) {
                        var loweredGlyphs = mapDataRelation(data[k], lowerGlyphFn(v));
                        if (loweredGlyphs instanceof Array) {
                            return {
                                children: loweredGlyphs.reduce(function (o, g, i) {
                                    var _a;
                                    return (__assign(__assign({}, o), (_a = {}, _a[i] = g, _a)));
                                }, {})
                            };
                        }
                        else {
                            return loweredGlyphs;
                        }
                    }) : {})), (typeof data === "object" ? objectFilter(data, function (k, v) { return (typeof v === "object") && ("$ref" in v); }) : {})), (gf.glyphs ? objectMap(gf.glyphs, function (_k, v) { return lowerGlyph(v); }) : {})), ("objectGlyph" in gf ? { "$object": lowerGlyphFn(gf.objectGlyph)(data) } : {})),
                    relations: (_a = gf.relations) === null || _a === void 0 ? void 0 : _a.map(lowerGlyphRelation),
                };
            }
        };
    });
};
export var GlyphFnLowerTest;
(function (GlyphFnLowerTest) {
    var dataE2 = { color1: "firebrick", color2: "steelblue", color3: "black", /* "text": "hello world!" */ };
    GlyphFnLowerTest.exampleRelationInterface2 = GlyphFn.mk({
        glyphs: {
            "text": Glyph.mk(text({ contents: "hello world!", fontSize: "24px" })),
        },
        fieldGlyphs: {
            "color1": GlyphFn.mk(function (color1) { return Glyph.mk(rect({ width: 500 / 3, height: 200 / 3, fill: color1 })); }),
            "color2": GlyphFn.mk(function (color2) { return Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 })); }),
            "color3": GlyphFn.mk(function (color3) { return Glyph.mk(ellipse({ rx: 50, ry: 50, fill: color3 })); }),
            // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
        },
        relations: [
            { fields: ["color1", "color2"], constraints: [vSpace(50.), alignCenterX] },
            { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
            { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
            { fields: ["$canvas", "color1"], constraints: [alignLeft] },
        ]
    });
    var marblesData = {
        elements: [1, 2, 3, 4],
    };
    var element = GlyphFn.mk({
        glyphs: {
            "circle": Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" })),
        },
        objectGlyph: GlyphFn.mk(function (n) { return Glyph.mk(text({ contents: n.toString(), fontSize: "24px" })); }),
        relations: [
        // uh oh! no way to write constraints since dataGlyphs is anonymous!!!
        ]
    });
    GlyphFnLowerTest.marbles = GlyphFn.mk({
        glyphs: {
        // "text": text({ text: "hello world!", fontSize: "24px" }),
        },
        fieldGlyphs: {
            elements: element,
            // "color1": (color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 }),
            // "color2": (color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }),
            // "color3": (color3) => ellipse({ rx: 50, ry: 50, fill: color3 }),
            // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
        },
        relations: [
        // e.g. "color1" refers to the bbox of the "color1" glyph defined above
        // { fields: ["text", "color2"], constraints: [vSpace(50.)] },
        // { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
        // { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
        // // this works b/c canvas can have negative coordinates I think? not really sure
        // { fields: ["canvas", "color1"], constraints: [alignLeft] },
        // { fields: ["color1", "color2"], constraints: [alignCenterX] },
        ]
    });
    GlyphFnLowerTest.testLoweredGlyphExample = lowerGlyphFn(GlyphFnLowerTest.exampleRelationInterface2)(dataE2);
    GlyphFnLowerTest.testLoweredGlyphMarbles = lowerGlyphFn(GlyphFnLowerTest.marbles)(marblesData);
})(GlyphFnLowerTest || (GlyphFnLowerTest = {}));
var mkRef = function (foo) { return foo.$ref; };
// TODO: placeholder!
var ref = function (field, path) { return ({
    $ref: true,
    // TODO: can I remove this typecast by inlining addPrefix definition?
    path: "" + field + path,
}); };
export var mkMyRef = function (path) { return ({
    $ref: true,
    path: path,
}); };
//     { curr: ref("elms[0]"), next: ref("elms[1]") },
//     { curr: ref("elms[1]"), next: ref("elms[2]") },
//     { curr: ref("elms[2]"), next: ref("elms[3]") },
var myListExample = {
    elements: [10, 20, 30, 40],
    neighbors: [
        { curr: ref("elements", "[0]"), next: ref("elements", "[1]") },
        { curr: ref("elements", "[1]"), next: ref("elements", "[2]") },
        { curr: ref("elements", "[2]"), next: ref("elements", "[3]") },
    ]
};
var G = Glyph;
var GF = GlyphFn;
var myListGlyphFn = GF.mk({
    fieldGlyphs: {
        "elements": GF.mk(function (element) { return G.mk(rect({ width: element, height: 200 / 3, fill: "black" })); }),
        "neighbors": GF.mk({
            /* TODO: not sure if/how refs should be rendered */
            /* for now we will say it shouldn't be rendered */
            relations: [
                // TODO: not sure why type safety is lost!
                {
                    fields: ["curr", "next"],
                    constraints: [vSpace(10.)],
                }
            ]
        }),
    }
});
export var loweredListGlyphTest = lowerGlyphFn(myListGlyphFn)(myListExample);
// | Ref<any, any>
var parsePath = function (path) { return path.split('/').map(function (s) { return s === ".." ? -1 : !isNaN(parseFloat(s)) ? +s : s; }); };
// O extends Array<unknown>
//   ? Values<{ [K in NumberKeys<O>]: `[${K}]` | `[${K}]${ObjPath<O[K]>}` }>
//   : O extends Record<string, unknown>
//   ? Values<{
//     [K in StringKeys<O>]: ObjPath<O[K]> extends "" ? `.${K}` : `.${K}${ObjPath<O[K]>}`
//   }>
//   : ""
// type PathTree = any;
// type PathTree<T extends BluefishData> = T extends Array<infer _>
//   ? { [key: number]: PathTree<T[number]> }
//   : T extends object
//   ? { [key in keyof T]: PathTree<T[key]> } : T;
// const makePathTree = (data: BluefishData): PathTree => {
//   if (Array.isArray(data)) {
//     return data.reduce((o: PathTree, v, i) => ({
//       ...o, [i]: makePathTree(v)
//     }), {});
//   } else if (typeof data === "object") {
//     return objectMap(data, (k, v) => makePathTree(v));
//   } else {
//     return data;
//   }
// }
// takes a relative path and makes it absolute
// relative path must be of the form (more or less): (../)*([a-z0-9]+/)*
// basically we allow ../, but only at the beginning (for simplicity of implementation)
// and the rest is a local absolute path. neither piece is required
var resolvePath = function (pathList, pathFromRoot) {
    if (pathList.length === 0) {
        return pathFromRoot;
    }
    else {
        var hd = pathList[0], tl = pathList.slice(1);
        if (hd === -1) {
            // step up
            return resolvePath(tl, pathFromRoot.slice(1));
        }
        else {
            // step down
            return resolvePath(tl, __spreadArray([hd], pathFromRoot, true));
        }
    }
};
var makePathsAbsolute = function (data, pathFromRoot) {
    if (pathFromRoot === void 0) { pathFromRoot = []; }
    console.log("current path from root", pathFromRoot);
    if (data === null) {
        return data;
    }
    else if (Array.isArray(data)) { // array/relation
        return data.map(function (d, i) { return makePathsAbsolute(d, __spreadArray([i], pathFromRoot, true)); });
    }
    else if (typeof data === "object" && !("$ref" in data)) { // object/record/instance
        return objectMap(data, function (k, v) { return makePathsAbsolute(v, __spreadArray([k], pathFromRoot, true)); });
    }
    else if (typeof data === "object") { // ref (where the actual work is done!)
        var ref_1 = data;
        console.log("making this ref absolute", ref_1, pathFromRoot);
        var pathList = parsePath(ref_1.path);
        // automatically bump one level up when resolving paths
        var absolutePath = resolvePath(pathList, pathFromRoot.slice(1));
        console.log("absolute path", absolutePath);
        return { $ref: true, path: absolutePath };
    }
    else {
        return data;
    }
};
// TODO: make refs to refs work???
// TODO: 
// TODO: makePathsAbsolute should be called in the compiler I think.
// using this, bounding boxes can be looked up easily
// like lowerGlyphFn, but makes paths absolute
export var compileGlyphFn = function (gf) {
    return function (data) { return lowerGlyphFn(gf)(makePathsAbsolute(data)); };
};
export var GlyphFnCompileTest;
(function (GlyphFnCompileTest) {
    var dataE2 = { color1: "firebrick", color2: "steelblue", color3: "black", /* "text": "hello world!" */ };
    GlyphFnCompileTest.exampleRelationInterface2 = GlyphFn.mk({
        glyphs: {
            "text": Glyph.mk(text({ contents: "hello world!", fontSize: "24px" })),
        },
        fieldGlyphs: {
            "color1": GlyphFn.mk(function (color1) { return Glyph.mk(rect({ width: 500 / 3, height: 200 / 3, fill: color1 })); }),
            "color2": GlyphFn.mk(function (color2) { return Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 })); }),
            "color3": GlyphFn.mk(function (color3) { return Glyph.mk(ellipse({ rx: 50, ry: 50, fill: color3 })); }),
            // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
        },
        relations: [
            { fields: ["color1", "color2"], constraints: [vSpace(50.), alignCenterX] },
            { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
            { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
            { fields: ["$canvas", "color1"], constraints: [alignLeft] },
        ]
    });
    var marblesData = {
        elements: [1, 2, 3, 4],
    };
    var element = GlyphFn.mk({
        glyphs: {
            "circle": Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" })),
        },
        objectGlyph: GlyphFn.mk(function (n) { return Glyph.mk(text({ contents: n.toString(), fontSize: "24px" })); }),
        relations: [
            { fields: ["$object", "circle"], constraints: [alignCenterX, alignCenterY] }
        ]
    });
    GlyphFnCompileTest.marbles = GlyphFn.mk({
        glyphs: {
        // "text": text({ text: "hello world!", fontSize: "24px" }),
        },
        fieldGlyphs: {
            elements: element,
            // "color1": (color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 }),
            // "color2": (color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }),
            // "color3": (color3) => ellipse({ rx: 50, ry: 50, fill: color3 }),
            // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
        },
        relations: [
        // e.g. "color1" refers to the bbox of the "color1" glyph defined above
        // { fields: ["text", "color2"], constraints: [vSpace(50.)] },
        // { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
        // { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
        // // this works b/c canvas can have negative coordinates I think? not really sure
        // { fields: ["canvas", "color1"], constraints: [alignLeft] },
        // { fields: ["color1", "color2"], constraints: [alignCenterX] },
        ]
    });
    GlyphFnCompileTest.testCompiledGlyphFnExample = compileGlyphFn(GlyphFnCompileTest.exampleRelationInterface2)(dataE2);
    GlyphFnCompileTest.testCompiledGlyphFnMarbles = compileGlyphFn(GlyphFnCompileTest.marbles)(marblesData);
    var marblesList = {
        elements: [1, 2, 3, 4],
        neighbors: [
            { curr: mkMyRef("../../elements/0"), next: mkMyRef("../../elements/1") },
            { curr: mkMyRef("../../elements/1"), next: mkMyRef("../../elements/2") },
            { curr: mkMyRef("../../elements/2"), next: mkMyRef("../../elements/3") },
        ]
    };
    GlyphFnCompileTest.marblesListGlyphFn = GlyphFn.mk({
        glyphs: {
        // "text": text({ text: "hello world!", fontSize: "24px" }),
        },
        fieldGlyphs: {
            elements: element,
            neighbors: GF.mk({
                relations: [{ fields: ["curr", "next"], constraints: [hSpace(5), alignCenterY] }]
            })
        },
    });
    GlyphFnCompileTest.testMarblesList = compileGlyphFn(GlyphFnCompileTest.marblesListGlyphFn)(marblesList);
    var marblesListReduced = {
        marble1: 1,
        marble2: 2,
        marble1Ref: mkMyRef("marble1"),
    };
    GlyphFnCompileTest.marblesListReducedGlyphFn = GlyphFn.mk({
        fieldGlyphs: {
            marble1: Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" })),
            marble2: Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" })),
        },
        relations: [{
                fields: ["marble1Ref", "marble2"],
                constraints: [hSpace(5), alignCenterY]
            }]
    });
    GlyphFnCompileTest.testMarblesListReduced = compileGlyphFn(GlyphFnCompileTest.marblesListReducedGlyphFn)(marblesListReduced);
    var marblesListMoreComplex = {
        marbles: [1, 2, 3],
        neighbor: [
            {
                curr: mkMyRef("../../marbles/0"),
                next: mkMyRef("../../marbles/1"),
            },
            {
                curr: mkMyRef("../../marbles/1"),
                next: mkMyRef("../../marbles/2"),
            }
        ]
    };
    GlyphFnCompileTest.marblesListMoreComplexGlyphFn = GlyphFn.mk({
        fieldGlyphs: {
            marbles: element,
            neighbor: Glyph.mk({
                relations: [{
                        fields: ["curr", "next"],
                        constraints: [hSpace(5.) /* TODO: not sure how to remove the specific value here and instead control the size of the entire thing */, alignCenterY]
                    }]
            })
        },
    });
    GlyphFnCompileTest.testMarblesListMoreComplex = compileGlyphFn(GlyphFnCompileTest.marblesListMoreComplexGlyphFn)(marblesListMoreComplex);
    GlyphFnCompileTest.twoSetsOfMarbles = GlyphFn.mk({
        fieldGlyphs: {
            one: GlyphFnCompileTest.marblesListMoreComplexGlyphFn,
            two: GlyphFnCompileTest.marblesListMoreComplexGlyphFn,
        },
        relations: [
            {
                fields: ["one", "two"],
                constraints: [vAlignCenter, vSpace(20)],
            }
        ]
    });
    var twoSetsOfMarblesData = {
        one: {
            marbles: [1, 2, 3],
            neighbor: [
                {
                    curr: mkMyRef("../../marbles/0"),
                    next: mkMyRef("../../marbles/1"),
                },
                {
                    curr: mkMyRef("../../marbles/1"),
                    next: mkMyRef("../../marbles/2"),
                }
            ]
        },
        two: {
            marbles: [10, 20, 30],
            neighbor: [
                {
                    curr: mkMyRef("../../marbles/0"),
                    next: mkMyRef("../../marbles/1"),
                },
                {
                    curr: mkMyRef("../../marbles/1"),
                    next: mkMyRef("../../marbles/2"),
                }
            ]
        },
    };
    GlyphFnCompileTest.testTwoMarbleSets = compileGlyphFn(GlyphFnCompileTest.twoSetsOfMarbles)(twoSetsOfMarblesData);
})(GlyphFnCompileTest || (GlyphFnCompileTest = {}));
//# sourceMappingURL=glyphExistentialAPI.js.map