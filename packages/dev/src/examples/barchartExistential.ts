import { hSpace, vSpace, alignLeft, alignBottom, alignRight, alignTop, Gestalt, containsShrinkWrap, contains, alignBottomStrong, alignLeftStrong, alignTopStrong, alignRightStrong, vAlignCenter, hAlignCenter } from '@bfjs/constraints';
import { debug, ellipse, line, nil, rect, text } from '@bfjs/marks';
import { render, createShape, createShapeFn, HostShapeFn, MyList, mkMyRef } from '@bfjs/core';
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

const bar: HostShapeFn<Data> = createShapeFn({
  shapes: {
    "tick": rect({ width: 1., height: 8., fill: "gray" })
  },
  fields: {
    "category": createShapeFn((contents) => text({ contents, fontSize: "12px" })),
    "value": createShapeFn((height) => rect({ width: 20, height, fill: "steelblue" })),
  },
  rels: {
    "value->tick": [vSpace(5), vAlignCenter],
    "tick->category": [vSpace(1), vAlignCenter],
  }
})

export const bars: HostShapeFn<MyList<Data>> = createShapeFn({
  fields: {
    elements: bar,
    neighbors: createShapeFn({
      rels: {
        "curr/value->next/value": [alignBottom, hSpace(0)],
      }
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

const yTicks: HostShapeFn<MyList<number>> = createShapeFn({
  // renderFn: debug,
  fields: {
    elements: createShapeFn((pos) => createShape({
      /* This bbox use might be a little surprising. Why should it go on tick? It's because of local coordinate systems */
      bbox: {
        // TODO: is there a way to get rid of this negation "hack"? It not very nice
        centerY: extent.max! - pos,
      },
      shapes: {
        tick: rect({ width: 5, height: 1, fill: "gray" }),
        label: text({ contents: pos.toString(), fontSize: "10px" }),
      },
      rels: {
        "label->tick": [hSpace(2.), hAlignCenter],
      }
    })),
    neighbors: createShapeFn({
      rels: {
        "curr->next": [alignRight],
      }
    })
  }
});

export const barChartGlyphFn: HostShapeFn<Input> = createShapeFn({
  renderFn: debug,
  shapes: {
    "yAxis": rect({ width: 1., fill: "gray" }),
  },
  fields: {
    data: bars,
    // TODO: the ticks don't actually show up in the right spot b/c of relative coordinates
    // maybe add a way to inherit parent's coordinate system?
    yTicks,
  },
  rels: {
    "yAxis->data": [alignTop, hSpace(5)],
    "yAxis->data/elements/0/value": [alignBottom],
    "yTicks->yAxis": [hSpace(0)],
  }
})

export const chartWithThings: HostShapeFn<Input> = createShapeFn({
  shapes: {
    "title": text({ contents: "Bar chart!", fontSize: "12px" })
  },
  object: barChartGlyphFn,
  rels: {
    "title->$object": [vSpace(25), vAlignCenter],
  }
})

export const barChart = render({
  data: mkList(data),
  yTicks: mkList(ticks),
}, chartWithThings);
