// import { debug, ellipse, line, nil, rect, text } from '@bfjs/marks';
import { render, createShape, createShapeFn, HostShapeFn, MyList, mkMyRef, Shape, marks as M, constraints as C } from '@bfjs/core';
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
  inheritFrame: true,
  shapes: {
    "origin": M.loc({ x: 0, y: 0 }),
    "tick": M.rect({ width: 1., height: 8., fill: "gray" })
  },
  fields: {
    "category": createShapeFn((contents) => M.text({ contents, fontSize: "12px" })),
    "value": createShapeFn((height) => M.rect({ width: 20, height, fill: "steelblue" })),
  },
  rels: {
    "value->tick": [C.vSpace(5), C.vAlignCenter],
    "tick->category": [C.vSpace(1), C.vAlignCenter],
    "value->origin": [C.alignBottom],
  }
})

export const bars: HostShapeFn<MyList<Data>> = createShapeFn({
  inheritFrame: true,
  fields: {
    elements: bar,
    neighbors: createShapeFn({
      rels: {
        "curr/value->next/value": [C.alignBottom, C.hSpace(0)],
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
  shapes: {
    "origin": M.loc({ x: 0, y: 0, }),
    // "originText": M.text({ contents: "O-ticks", x: 0, y: 0, fontSize: "18px", fill: "red" }),
  },
  fields: {
    elements: createShapeFn((pos) => createShape({
      /* This bbox use might be a little surprising. Why should it go on tick? It's because of local coordinate systems */
      bbox: {
        // TODO: is there a way to get rid of this negation "hack"? It not very nice
        // centerY: extent.max! - pos,
        centerY: -pos,
      },
      shapes: {
        tick: M.rect({ width: 5, height: 1, fill: "gray" }),
        label: M.text({ contents: pos.toString(), fontSize: "10px" }),
      },
      rels: {
        "label->tick": [C.hSpace(2.), C.hAlignCenter],
      }
    })),
    neighbors: createShapeFn({
      rels: {
        "curr->next": [C.alignRight],
      }
    })
  }
});

export const yAxis: HostShapeFn<MyList<number>> = createShapeFn({
  inheritFrame: true,
  shapes: {
    "origin": M.loc({ x: 0, y: 0, }),
    // "originText": M.text({ contents: "O-axis", x: 0, y: 0, fontSize: "12px", fill: "red" }),
    "yAxis": M.rect({ width: 1, fill: "gray" }),
  },
  object: yTicks,
  rels: {
    "$object->yAxis": [C.hSpace(0)],
    "origin->yAxis": [C.alignBottom],
  }
});

export const barChartShapeFn: HostShapeFn<Input> = createShapeFn({
  renderFn: M.debug,
  shapes: {
    "origin": M.loc({ x: 0, y: 0, }),
    // origin: M.text({ contents: "O", x: 0, y: 0, fontSize: "18px", fill: "red" })
  },
  fields: {
    data: bars,
    yTicks: yAxis,
  },
  rels: {
    "yTicks->data": [C.hSpace(5)],
    "origin->data/elements/0/origin": [C.alignMiddle, C.alignCenter],
  }
})

export const chartWithThings: HostShapeFn<Input> = createShapeFn({
  shapes: {
    "title": M.text({ contents: "Bar chart!", fontSize: "12px" })
  },
  object: barChartShapeFn,
  rels: {
    "title->$object": [C.vSpace(25), C.vAlignCenter],
  }
})

export const barChart = render({
  data: mkList(data),
  yTicks: mkList(ticks),
}, chartWithThings);
