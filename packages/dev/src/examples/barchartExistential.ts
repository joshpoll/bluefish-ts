import { hSpace, vSpace, alignLeft, alignBottom, alignRight, alignTop, Gestalt, containsShrinkWrap, contains, alignBottomStrong, alignLeftStrong, alignTopStrong, alignRightStrong, vAlignCenter, hAlignCenter } from '@bluefish/gestalt';
import { debug, ellipse, line, nil, rect, text } from '@bluefish/marks';
import { Glyph, GlyphFn, compileGlyphFn, MyList, mkMyRef, lowerGlyphFn, glyphFnToHostGlyphFn } from '@bluefish/core';
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

export const barChartGlyphFn: GlyphFn<Input> = GlyphFn.mk({
  renderFn: debug,
  glyphs: {
    "yAxis": rect({ width: 1., fill: "gray" }),
  },
  fieldGlyphs: {
    data: bars,
    // TODO: the ticks don't actually show up in the right spot b/c of relative coordinates
    // maybe add a way to inherit parent's coordinate system?
    yTicks,
  },
  relations: [
    {
      fields: ["yAxis", "data"],
      constraints: [alignTop, hSpace(5)],
    },
    {
      fields: ["yAxis", "data/elements/0/value" as any],
      constraints: [alignBottom],
    },
    {
      fields: ["yTicks", "yAxis"],
      constraints: [hSpace(0)],
    }
  ]
})

export const chartWithThings: GlyphFn<Input> = GlyphFn.mk({
  glyphs: {
    "title": text({ contents: "Bar chart!", fontSize: "12px" })
  },
  objectGlyph: barChartGlyphFn,
  relations: [{
    fields: ["title", "$object"],
    constraints: [vSpace(25), vAlignCenter],
  }]
})

export const barChart = compileGlyphFn(chartWithThings)({
  data: mkList(data),
  yTicks: mkList(ticks),
});
