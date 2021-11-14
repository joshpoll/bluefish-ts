import { hSpace, vSpace, alignLeft, alignBottom, alignRight, alignTop, vAlignCenter, hAlignCenter, sameWidth, alignRightSpace, alignBottomSpace, alignLeftSpace } from '../gestalt';
import { debug, ellipse, rect, text } from '../markExistential';
import { Glyph, GlyphFn, compileGlyphFn, mkMyRef } from './glyphExistentialAPI';
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
var mkList = function (elements) { return ({
    elements: elements,
    neighbors: zipWith(_.range(elements.length - 1), _.range(1, elements.length), function (curr, next) { return ({ curr: mkMyRef("../../elements/" + curr), next: mkMyRef("../../elements/" + next) }); }),
}); };
var bar = GlyphFn.mk({
    glyphs: {
        "tick": rect({ width: 1., height: 8., fill: "gray" })
    },
    fieldGlyphs: {
        "category": GlyphFn.mk(function (contents) { return text({ contents: contents, fontSize: "12px" }); }),
        "value": GlyphFn.mk(function (height) { return rect({ width: 20, height: height, fill: "steelblue" }); }),
    },
    relations: [
        {
            fields: ["value", "tick"],
            constraints: [vSpace(5), vAlignCenter],
        },
        {
            fields: ["tick", "category"],
            constraints: [vSpace(1), vAlignCenter],
        },
    ]
});
export var bars = GlyphFn.mk({
    fieldGlyphs: {
        elements: bar,
        neighbors: GlyphFn.mk({
            relations: [{ fields: ["curr/value", "next/value"], constraints: [alignBottom, hSpace(0)] }]
        })
    }
});
/* TODO:
   - replace rect with line?
   - add coordinate system? similar to observable plot, but on any glyph
*/
var extent = tidy(data, summarize({
    min: min('value'),
    max: max('value'),
}))[0];
var s = scale.scaleLinear().domain([extent.min, extent.max]);
var ticks = s.nice().ticks(5);
console.log("ticks", ticks);
var yTicks = GlyphFn.mk({
    // renderFn: debug,
    fieldGlyphs: {
        elements: GlyphFn.mk(function (pos) { return Glyph.mk({
            /* This bbox use might be a little surprising. Why should it go on tick? It's because of local coordinate systems */
            bbox: {
                // TODO: is there a way to get rid of this negation "hack"? It not very nice
                centerY: extent.max - pos,
            },
            glyphs: {
                tick: rect({ width: 5, height: 1, fill: "gray" }),
                label: text({ contents: pos.toString(), fontSize: "10px" }),
            },
            relations: [{ fields: ["label", "tick"], constraints: [hSpace(2.), hAlignCenter] }]
        }); }),
        neighbors: GlyphFn.mk({
            relations: [{ fields: ["curr", "next"], constraints: [alignRight] }]
        })
    }
});
export var barChartGlyphFn = GlyphFn.mk({
    renderFn: debug,
    glyphs: {
        "rect": rect({ width: 200, height: 100, fill: "none", stroke: "black" })
    },
});
var lineWidth = 2;
var dimensionWidth = 3;
// export const chartWithThings: GlyphFn<{}> = GlyphFn.mk({
//   glyphs: {
//     "title": text({ contents: "Bounding Boxes in Bluefish", fontSize: "24px" }),
//     "rect": rect({ width: 200, height: 100, fill: "none", stroke: "#a3a3a3", strokeWidth: 5 }),
//     "leftLine": rect({ width: lineWidth, height: 130, fill: "cornflowerblue" }),
//     "leftText": text({ contents: "left", fontSize: "18px" }),
//     "rightLine": rect({ width: lineWidth, height: 130, fill: "cornflowerblue" }),
//     "rightText": text({ contents: "right", fontSize: "18px" }),
//     "topLine": rect({ height: lineWidth, fill: "cornflowerblue" }),
//     "bottomLine": rect({ height: lineWidth, fill: "cornflowerblue" }),
//     "hCenterLine": rect({ height: lineWidth, fill: "cornflowerblue" }),
//     "vCenterLine": rect({ width: lineWidth, height: 130, fill: "cornflowerblue" }),
//     "centerXText": text({ contents: "centerX", fontSize: "18px" }),
//     "topText": text({ contents: "top", fontSize: "18px" }),
//     "centerYText": text({ contents: "centerY", fontSize: "18px" }),
//     "bottomText": text({ contents: "bottom", fontSize: "18px" }),
//     "widthLine": rect({ height: dimensionWidth, fill: "firebrick" }),
//     "widthText": text({ contents: "width", fontSize: "18px" }),
//     "heightLine": rect({ width: dimensionWidth, fill: "firebrick" }),
//     "heightText": text({ contents: "height", fontSize: "18px" }),
//   },
//   relations: [
//     {
//       fields: ["title", "rect"],
//       constraints: [vSpace(50), vAlignCenter],
//     },
//     {
//       fields: ["rect", "leftLine"],
//       constraints: [alignBottomSpace(10), alignLeft],
//     },
//     {
//       fields: ["rect", "rightLine"],
//       constraints: [alignBottomSpace(10), alignRight],
//     },
//     {
//       fields: ["rect", "topLine"],
//       constraints: [alignRightSpace(-10), alignTop],
//     },
//     {
//       fields: ["rect", "bottomLine"],
//       constraints: [alignRightSpace(-10), alignBottom],
//     },
//     {
//       fields: ["rect", "hCenterLine"],
//       constraints: [hAlignCenter, alignRightSpace(-10)],
//     },
//     {
//       fields: ["rect", "vCenterLine"],
//       constraints: [alignBottomSpace(10), vAlignCenter],
//     },
//     {
//       fields: ["leftLine", "leftText"],
//       constraints: [hSpace(5)]
//     },
//     {
//       fields: ["rightLine", "rightText"],
//       constraints: [hSpace(5)]
//     },
//     {
//       fields: ["vCenterLine", "centerXText"],
//       constraints: [hSpace(5)]
//     },
//     {
//       fields: ["leftText", "rect"],
//       constraints: [vSpace(7.5)]
//     },
//     {
//       fields: ["rightText", "rect"],
//       constraints: [vSpace(7.5)]
//     },
//     {
//       fields: ["centerXText", "rect"],
//       constraints: [vSpace(7.5)]
//     },
//     {
//       fields: ["topText", "topLine"],
//       constraints: [hSpace(5), hAlignCenter]
//     },
//     {
//       fields: ["centerYText", "hCenterLine"],
//       constraints: [hSpace(5), hAlignCenter]
//     },
//     {
//       fields: ["bottomText", "bottomLine"],
//       constraints: [hSpace(5), hAlignCenter]
//     },
//     {
//       fields: ["topText", "rect"],
//       constraints: [hSpace(25)]
//     },
//     {
//       fields: ["centerYText", "rect"],
//       constraints: [hSpace(25)]
//     },
//     {
//       fields: ["bottomText", "rect"],
//       constraints: [hSpace(25)]
//     },
//     {
//       fields: ["widthLine", "widthText"],
//       constraints: [vSpace(5), vAlignCenter],
//     },
//     {
//       fields: ["heightLine", "heightText"],
//       constraints: [hSpace(5), hAlignCenter],
//     },
//     {
//       fields: ["rect", "widthLine"],
//       constraints: [vSpace(15), vAlignCenter, sameWidth],
//     },
//     {
//       fields: ["rect", "heightLine"],
//       constraints: [hSpace(15), hAlignCenter, sameHeight],
//     },
//     {
//       fields: ["widthLine", "widthText"],
//       constraints: [vSpace(5), vAlignCenter],
//     },
//     {
//       fields: ["heightLine", "heightText"],
//       constraints: [hSpace(5), hAlignCenter],
//     },
//   ]
// })
export var example = Glyph.mk({
    glyphs: {
        /* TODO: maybe make RHS a _list_ of glyphs? */
        "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: "firebrick" }),
        "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "steelblue" }),
        "rightEllipse": ellipse({ rx: 50, ry: 50, fill: "black" }),
        "some text": text({ contents: "hello world!", fontSize: "calc(10px + 2vmin)" }),
    },
    relations: [
        // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
        { fields: ["topRect", "bottomEllipse"], constraints: [vSpace(50.), vAlignCenter] },
        { fields: ["topRect", "rightEllipse"], constraints: [hSpace(50.), hAlignCenter] },
        { fields: ["rightEllipse", "some text"], constraints: [vSpace(50.), vAlignCenter] },
        { fields: ["$canvas", "topRect"], constraints: [alignLeft] },
    ]
});
var measuringGlyph = Glyph.mk({
    glyphs: {
        // "rect": rect({ width: 200, height: 100, fill: "none", stroke: "#a3a3a3", strokeWidth: 5 })
        // "ellipse": ellipse({ rx: 100, ry: 50, fill: "coral" }),
        "example": example,
    }
});
var hSpaceGuide = Glyph.mk({
    glyphs: {
        "leftEdge": rect({ width: 2, height: 10, fill: "firebrick" }),
        "rightEdge": rect({ width: 2, height: 10, fill: "firebrick" }),
        "middle": rect({ height: 2, fill: "firebrick" }),
    },
    relations: [
        {
            fields: ["leftEdge", "middle"],
            constraints: [alignLeft, hAlignCenter],
        },
        {
            fields: ["rightEdge", "middle"],
            constraints: [alignRight, hAlignCenter],
        },
        {
            fields: ["middle", "$canvas"],
            constraints: [sameWidth],
        },
    ]
});
var alignBottomGuide = Glyph.mk({
    glyphs: {
        "middle": rect({ height: 2, fill: "firebrick" }),
    },
});
export var chartWithThings = GlyphFn.mk({
    glyphs: {
        "leftRect": rect({ width: 75, height: 200, fill: "steelblue" }),
        "rightRect": rect({ width: 50, height: 100, fill: "cornflowerblue" }),
        "hSpaceGuide": hSpaceGuide,
        "hSpaceAnnotation": text({ contents: "hSpace(50)", fontSize: "6px" }),
        "alignBottomGuide": rect({ height: 2, fill: "firebrick" }),
        "alignBottomAnnotation": text({ contents: "alignBottom", fontSize: "6px" }),
    },
    relations: [
        {
            fields: ["leftRect", "rightRect"],
            constraints: [hSpace(50), alignBottom],
        },
        {
            fields: ["leftRect", "hSpaceGuide"],
            constraints: [hSpace(5)],
        },
        {
            fields: ["hSpaceGuide", "rightRect"],
            constraints: [hSpace(5), alignTop],
        },
        {
            fields: ["hSpaceAnnotation", "hSpaceGuide/middle"],
            constraints: [vAlignCenter, vSpace(-3)],
        },
        {
            fields: ["alignBottomGuide", "leftRect"],
            constraints: [alignBottomSpace(-5)],
        },
        {
            fields: ["alignBottomGuide", "alignBottomAnnotation"],
            constraints: [vSpace(5), vAlignCenter],
        },
        {
            fields: ["alignBottomGuide", "leftRect"],
            constraints: [alignLeftSpace(5)],
        },
        {
            fields: ["alignBottomGuide", "rightRect"],
            constraints: [alignRightSpace(5)],
        },
        // {
        //   fields: ["title", "rect"],
        //   constraints: [vSpace(50), vAlignCenter],
        // },
        // {
        //   fields: ["rect", "leftLine"],
        //   constraints: [alignBottomSpace(10), alignLeft],
        // },
        // {
        //   fields: ["rect", "rightLine"],
        //   constraints: [alignBottomSpace(10), alignRight],
        // },
        // {
        //   fields: ["rect", "topLine"],
        //   constraints: [alignRightSpace(-10), alignTop],
        // },
        // {
        //   fields: ["rect", "bottomLine"],
        //   constraints: [alignRightSpace(-10), alignBottom],
        // },
        // {
        //   fields: ["rect", "hCenterLine"],
        //   constraints: [hAlignCenter, alignRightSpace(-10)],
        // },
        // {
        //   fields: ["rect", "vCenterLine"],
        //   constraints: [alignBottomSpace(10), vAlignCenter],
        // },
        // {
        //   fields: ["leftLine", "leftText"],
        //   constraints: [hSpace(5), alignTopSpace(-10)]
        // },
        // {
        //   fields: ["rightLine", "rightText"],
        //   constraints: [hSpace(5), alignTopSpace(-10)]
        // },
        // {
        //   fields: ["vCenterLine", "centerXText"],
        //   constraints: [hSpace(5), alignTopSpace(-10)]
        // },
        // {
        //   fields: ["leftText", "rect"],
        //   constraints: [vSpace(7.5)]
        // },
        // {
        //   fields: ["rightText", "rect"],
        //   constraints: [vSpace(7.5)]
        // },
        // {
        //   fields: ["centerXText", "rect"],
        //   constraints: [vSpace(7.5)]
        // },
        // {
        //   fields: ["topText", "topLine"],
        //   constraints: [hSpace(5), hAlignCenter]
        // },
        // {
        //   fields: ["centerYText", "hCenterLine"],
        //   constraints: [hSpace(5), hAlignCenter]
        // },
        // {
        //   fields: ["bottomText", "bottomLine"],
        //   constraints: [hSpace(5), hAlignCenter]
        // },
        // {
        //   fields: ["topText", "rect"],
        //   constraints: [hSpace(25)]
        // },
        // {
        //   fields: ["centerYText", "rect"],
        //   constraints: [hSpace(25)]
        // },
        // {
        //   fields: ["bottomText", "rect"],
        //   constraints: [hSpace(25)]
        // },
        // {
        //   fields: ["widthLine", "widthText"],
        //   constraints: [vSpace(5), vAlignCenter],
        // },
        // {
        //   fields: ["heightLine", "heightText"],
        //   constraints: [hSpace(5), hAlignCenter],
        // },
        // {
        //   fields: ["rect", "widthLine"],
        //   constraints: [vSpace(15), vAlignCenter, sameWidth],
        // },
        // {
        //   fields: ["rect", "heightLine"],
        //   constraints: [hSpace(15), hAlignCenter, sameHeight],
        // },
        // {
        //   fields: ["widthLine", "widthText"],
        //   constraints: [vSpace(5), vAlignCenter],
        // },
        // {
        //   fields: ["heightLine", "heightText"],
        //   constraints: [hSpace(5), hAlignCenter],
        // },
    ]
});
export var constraintExample = compileGlyphFn(chartWithThings)({
    data: mkList(data),
    yTicks: mkList(ticks),
});
//# sourceMappingURL=constraintexample.js.map