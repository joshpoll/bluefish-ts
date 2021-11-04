import { hSpace, vSpace, alignLeft, alignBottom, alignRight, alignTop, Gestalt, containsShrinkWrap, contains, alignBottomStrong, alignLeftStrong, alignTopStrong, alignRightStrong, vAlignCenter, hAlignCenter, alignTopSpace, sameWidth, sameHeight, alignRightSpace, alignBottomSpace } from '../gestalt';
import { debug, ellipse, line, nil, rect, text } from '../markExistential';
import { Glyph, GlyphFn, compileGlyphFn, MyList, mkMyRef, lowerGlyphFn, glyphFnToHostGlyphFn } from './glyphExistentialAPI';
import { BBoxValues, bboxVars } from '../kiwiBBoxTransform';
import { Constraint, Operator } from 'kiwi.js';
import * as _ from "lodash";
import { zipWith } from 'lodash';
import * as scale from "d3-scale";
import { summarize, tidy, min, max } from '@tidyjs/tidy';

type Data = { category: string, value: number };

/* https://vega.github.io/vega-lite/examples/bar.html */
export const data: Data[] = [
  { "category": "A", "value": 28 }, { "category": "B", "value": 55 }, { "category": "C", "value": 43 },
  { "category": "D", "value": 91 }, { "category": "E", "value": 81 }, { "category": "F", "value": 53 },
  { "category": "G", "value": 19 }, { "category": "H", "value": 87 }, { "category": "I", "value": 52 }
];

const mkList = <T>(elements: T[]): MyList<T> => ({
  elements,
  neighbors:
    zipWith(
      _.range(elements.length - 1),
      _.range(1, elements.length),
      (curr, next) => ({ curr: mkMyRef(`../../elements/${curr}`), next: mkMyRef(`../../elements/${next}`) })
    ),
});

const bar: GlyphFn<Data> = GlyphFn.mk({
  glyphs: {
    "tick": rect({ width: 1., height: 8., fill: "gray" })
  },
  fieldGlyphs: {
    "category": GlyphFn.mk((contents) => text({ contents, fontSize: "12px" })),
    "value": GlyphFn.mk((height) => rect({ width: 20, height, fill: "steelblue" })),
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
})

export const bars: GlyphFn<MyList<Data>> = GlyphFn.mk({
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

const extent = tidy(data, summarize({
  min: min('value'),
  max: max('value'),
}))[0];
const s = scale.scaleLinear().domain([extent.min!, extent.max!]);
const ticks = s.nice().ticks(5);
console.log("ticks", ticks);

type Input = {
  data: MyList<Data>,
  yTicks: MyList<number>,
}

const yTicks: GlyphFn<MyList<number>> = GlyphFn.mk({
  // renderFn: debug,
  fieldGlyphs: {
    elements: GlyphFn.mk((pos) => Glyph.mk({
      /* This bbox use might be a little surprising. Why should it go on tick? It's because of local coordinate systems */
      bbox: {
        // TODO: is there a way to get rid of this negation "hack"? It not very nice
        centerY: extent.max! - pos,
      },
      glyphs: {
        tick: rect({ width: 5, height: 1, fill: "gray" }),
        label: text({ contents: pos.toString(), fontSize: "10px" }),
      },
      relations: [{ fields: ["label", "tick"], constraints: [hSpace(2.), hAlignCenter] }]
    })),
    neighbors: GlyphFn.mk({
      relations: [{ fields: ["curr", "next"], constraints: [alignRight] }]
    })
  }
});

export const barChartGlyphFn: GlyphFn<{}> = GlyphFn.mk({
  renderFn: debug,
  glyphs: {
    "rect": rect({ width: 200, height: 100, fill: "none", stroke: "black" })
  },
})

const lineWidth = 2;
const dimensionWidth = 3;

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

export const example: Glyph = Glyph.mk({
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
})

const measuringGlyph: Glyph = Glyph.mk({
  glyphs: {
    // "rect": rect({ width: 200, height: 100, fill: "none", stroke: "#a3a3a3", strokeWidth: 5 })
    // "ellipse": ellipse({ rx: 100, ry: 50, fill: "coral" }),
    "example": example,
  }
})

export const chartWithThings: GlyphFn<unknown> = GlyphFn.mk({
  glyphs: {
    // "title": text({ contents: "Bounding Boxes in Bluefish", fontSize: "24px" }),
    // "rect": rect({ width: 200, height: 100, fill: "none", stroke: "#a3a3a3", strokeWidth: 5 }),
    "rect": measuringGlyph,
    // "leftLine": rect({ width: lineWidth, fill: "cornflowerblue" }),
    // "leftText": text({ contents: "left", fontSize: "18px" }),
    // "rightLine": rect({ width: lineWidth, fill: "cornflowerblue" }),
    // "rightText": text({ contents: "right", fontSize: "18px" }),
    // "topLine": rect({ height: lineWidth, fill: "cornflowerblue" }),
    // "bottomLine": rect({ height: lineWidth, fill: "cornflowerblue" }),
    // "hCenterLine": rect({ height: lineWidth, fill: "cornflowerblue" }),
    // "vCenterLine": rect({ width: lineWidth, fill: "cornflowerblue" }),
    // "centerXText": text({ contents: "centerX", fontSize: "18px" }),
    // "topText": text({ contents: "top", fontSize: "18px" }),
    // "centerYText": text({ contents: "centerY", fontSize: "18px" }),
    // "bottomText": text({ contents: "bottom", fontSize: "18px" }),
    // "widthLine": rect({ height: dimensionWidth, fill: "firebrick" }),
    // "widthText": text({ contents: "width", fontSize: "18px" }),
    // "heightLine": rect({ width: dimensionWidth, fill: "firebrick" }),
    // "heightText": text({ contents: "height", fontSize: "18px" }),
  },
  relations: [
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
})

export const boundingBox = compileGlyphFn(chartWithThings)({
  data: mkList(data),
  yTicks: mkList(ticks),
});
