import { constraints as C, marks as M, RelativeBFRef, ShapeValue } from '@bfjs/core';
import { Shape, ref, createShape, render } from '@bfjs/core';
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
      (curr, next) => ({ curr: ref(`../../elements/${curr}`), next: ref(`../../elements/${next}`) })
    ),
});

type MyList<T> = {
  elements: Array<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Array<{
    curr: RelativeBFRef,
    next: RelativeBFRef,
  }>
}

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

export const barChartGlyphFn: ShapeValue = createShape({
  renderFn: M.debug,
  shapes: {
    "rect": M.rect({ width: 200, height: 100, fill: "none", stroke: "black" })
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

export const arrowTestShape = createShape({
  shapes: {
    "circle": M.circle({ r: 5, fill: "steelblue" }),
    "secondBox": M.rect({ width: 100, height: 50, fill: "coral" }),
    "arrow": M.arrow2({ fill: "steelblue" }),
  },
  rels: {
    "circle->secondBox": [C.hSpace(50), C.makeEqual('bottom', 'top')],
    "circle->arrow": [C.makeEqual('centerX', 'left'), C.makeEqual('centerY', 'top')],
    "arrow->secondBox": [C.makeEqual('right', 'left'), C.makeEqual('bottom', 'centerY')],
  }
})

export const arrowExample = render(arrowTestShape);
