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
import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft } from '../gestalt';
import { ellipse, nil, rect, text } from '../mark';
import { zipWith } from 'lodash';
import _ from 'lodash';
import { objectMap } from '../objectMap';
var data = { color1: "firebrick", color2: "steelblue", color3: "black" };
var example = {
    /* bbox: {
      width: 800,
      height: 700,
    }, */
    children: {
        /* TODO: maybe make RHS a _list_ of glyphs? */
        "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: data.color1 }),
        "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data.color2 }),
        "rightEllipse": ellipse({ rx: 50, ry: 50, fill: data.color3 }),
        "some text": text({ contents: "hello world!", fontSize: "calc(10px + 2vmin)" }),
    },
    relations: [
        // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
        { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.)] },
        { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
        { left: "rightEllipse", right: "some text", gestalt: [vSpace(50.), alignCenterX] },
        { left: "canvas", right: "topRect", gestalt: [alignLeft] },
    ]
};
// TODO: is there a nicer way to handle 0-length lists?
var glyphArrayToGlyph = function (glyphArray) {
    var _a;
    if (glyphArray.data.length === 0) {
        return nil();
    }
    else {
        return {
            bbox: glyphArray.bbox,
            renderFn: glyphArray.renderFn,
            children: glyphArray.data
                .reduce(function (o, data, i) {
                var _a;
                return (__assign(__assign({}, o), (_a = {}, _a[i] = glyphArray.childGlyphs(data, i), _a)));
            }, {}),
            relations: __spreadArray(__spreadArray([], zipWith(_.range(glyphArray.data.length - 1), _.range(1, glyphArray.data.length), function (curr, next) { return ({ left: curr.toString(), right: next.toString(), gestalt: glyphArray.listGestalt }); }), true), (_a = glyphArray.relations) !== null && _a !== void 0 ? _a : [], true)
        };
    }
};
var glyphEToGlyph = function (ge) { return ({
    children: ge.glyphs,
    relations: ge.gestalt,
}); };
var glyphRelationEToGlyphArray = function (ge) { return ({
    data: ge.data,
    childGlyphs: function (d) {
        if (ge.render === undefined) {
            return nil();
        }
        else {
            var rendered = ge.render(d);
            return glyphEToGlyph(rendered);
        }
    },
    listGestalt: [],
}); };
export var exampleRelationInterface = glyphArrayToGlyph(glyphRelationEToGlyphArray({
    data: [{ color1: "firebrick", color2: "steelblue", color3: "black", text: "hello world!" }],
    render: function (ri) { return ({
        glyphs: {
            "color1": rect({ width: 500 / 3, height: 200 / 3, fill: ri.color1 }),
            "color2": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: ri.color2 }),
            "color3": ellipse({ rx: 50, ry: 50, fill: ri.color3 }),
            "text": text({ contents: ri.text, fontSize: "calc(10px + 2vmin)" }),
        },
        gestalt: [
            // e.g. "color1" refers to the bbox of the "color1" glyph defined above
            { left: "color1", right: "color2", gestalt: [vSpace(50.)] },
            { left: "color1", right: "color3", gestalt: [hSpace(50.), alignCenterY] },
            { left: "color3", right: "text", gestalt: [vSpace(50.), alignCenterX] },
            { left: "canvas", right: "color1", gestalt: [alignLeft] },
        ]
    }); }
}));
var mkComplexGlyph = function (complexGlyph_) { return function (cont) { return cont(complexGlyph_); }; };
var dataE2 = { color1: "firebrick", color2: "steelblue", color3: "black", /* "text": "hello world!" */ };
export var exampleRelationInterface2 = ({
    glyphs: {
        "text": text({ contents: "hello world!", fontSize: "24px" }),
    },
    dataGlyphs: {
        "color1": function (color1) { return rect({ width: 500 / 3, height: 200 / 3, fill: color1 }); },
        "color2": function (color2) { return ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }); },
        "color3": function (color3) { return ellipse({ rx: 50, ry: 50, fill: color3 }); },
        // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
    },
    relations: [
        // e.g. "color1" refers to the bbox of the "color1" glyph defined above
        { fields: ["color1", "color2"], constraints: [vSpace(50.)] },
        { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
        { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
        { fields: ["canvas", "color1"], constraints: [alignLeft] },
    ]
});
// TODO: pass the data in
// TODO: for each field, convert its collection of instances into a glyph (or if it's a singleton,
// keep it top-level)
export var exampleRelationInterface2Lowered = function (data) { return ({
    children: {
        "color1": rect({ width: 500 / 3, height: 200 / 3, fill: data.color1 }),
        "color2": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data.color2 }),
        "color3": ellipse({ rx: 50, ry: 50, fill: data.color3 }),
        "text": text({ contents: data.text, fontSize: "calc(10px + 2vmin)" }),
    },
    relations: [
        // e.g. "color1" refers to the bbox of the "color1" glyph defined above
        { left: "color1", right: "color2", gestalt: [vSpace(50.)] },
        { left: "color1", right: "color3", gestalt: [hSpace(50.), alignCenterY] },
        { left: "color3", right: "text", gestalt: [vSpace(50.), alignCenterX] },
        { left: "canvas", right: "color1", gestalt: [alignLeft] },
    ]
}); };
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
export var loweredGlyphTest = lowerGlyphE2(exampleRelationInterface2)(dataE2);
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
// const myListExample2 = {
//   elements: [ref("foo", "[0]"), ref("foo", "[1]"), ref("foo", "[2]"),],
//   neighbors: [
//     { curr: elements[0], next: ref("elements", "[1]") },
//     { curr: ref("elements", "[1]"), next: ref("elements", "[2]") },
//     { curr: ref("elements", "[2]"), next: ref("elements", "[3]") },
//   ],
// }
// declare function render<T>(data: T, glyph: GlyphE2<T>): JSX.Element
// render(myListExample, MyListGlyphE2);
// type myTable<T> = {
//   elements: RelationE2<T>,
//   rows: RelationE2<{
//     curr: Ref<"elements", RelationE2<T>>, next: Ref<"elements", RelationE2<T>>
//   }>,
//   cols: RelationE2<{
//     curr: Ref<"elements", RelationE2<T>>, next: Ref<"elements", RelationE2<T>>
//   }>,
// }
// export const MyTableGlyphE2: GlyphE2<myTable<number>> = ({
//   glyphs: {
//     "elements": (element) => rect({ width: element, height: 200 / 3, fill: "black" }),
//     "rows": ({
//       glyphs: {},
//       gestalt: [{
//         left: "curr",
//         right: "next",
//         rels: [hSpace(10.)]
//       }]
//     }),
//     "cols": ({
//       glyphs: {},
//       gestalt: [{
//         left: "curr",
//         right: "next",
//         rels: [vSpace(10.)]
//       }]
//     }),
//   }
// })
// const myTableExample: myTable<number> = {
//   elements: [1, 2, 4, 1],
//   rows: [
//     { curr: ref("elements", "[0]"), next: ref("elements", "[1]") },
//     { curr: ref("elements", "[2]"), next: ref("elements", "[3]") },
//   ],
//   cols: [
//     { curr: ref("elements", "[0]"), next: ref("elements", "[2]") },
//     { curr: ref("elements", "[1]"), next: ref("elements", "[3]") },
//   ],
// }
// render(myTableExample, MyTableGlyphE2);
//# sourceMappingURL=exampleRelationInterface.js.map