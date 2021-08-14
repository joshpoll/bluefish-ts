import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignBottom, alignRight, alignTop } from '../gestalt';
import { ellipse, rect, text } from '../mark';
import { Glyph, Relation, Mark } from '../compile';
import { BBoxValues, bboxVars } from '../kiwiBBox';
import { Constraint, Operator } from 'kiwi.js';
import * as _ from "lodash";
import { zipWith } from 'lodash';

type Data = { category: string, value: number };

/* https://vega.github.io/vega-lite/examples/bar.html */
export const data: Data[] = [
  { "category": "A", "value": 28 }, { "category": "B", "value": 55 }, { "category": "C", "value": 43 },
  { "category": "D", "value": 91 }, { "category": "E", "value": 81 }, { "category": "F", "value": 53 },
  { "category": "G", "value": 19 }, { "category": "H", "value": 87 }, { "category": "I", "value": 52 }
];

export const bar = (data: Data): Glyph => ({
  /* TODO: the problem with this will be aligning stuff outside the glyph I think. requires guides
  or another way to look inside a glyph */
})

// inching closer to list/set
export const bars = (data: Data[]): Glyph => ({
  children: data
    .reduce((o: { [key: string]: Glyph }, { value }: Data, i) =>
      ({ ...o, [i]: rect({ width: 20., height: value, fill: "steelblue" }) }),
      {}),
  relations: zipWith(
    _.range(data.length - 1),
    _.range(1, data.length),
    (curr, next) => ({ left: curr.toString(), right: next.toString(), gestalt: [alignBottom, hSpace(5.)] })
  ),
})

/* TODO:
   - replace rect with line?
   - add tick marks
   - add coordinate system? similar to observable plot, but on any glyph
   - use a list for bars? need a good way of expressing sets/lists
*/

export const xAxis = (ticks: number[]): Glyph => ({
  children: {
    "axis": rect({ height: 3, fill: "red" }),
    ...ticks
      .reduce((o: { [key: string]: Glyph }, tick: number, i) =>
        ({ ...o, [i]: rect({ width: 3., height: 15., x: tick, fill: "purple" }) }),
        {})
  },
  relations: _.range(ticks.length).map((i) => ({ left: "axis", right: i.toString(), gestalt: [vSpace(3)] })),
})

export const debug = (bbox: BBoxValues): JSX.Element => {
  return <rect x={bbox.left} y={bbox.top
  } width={bbox.width} height={bbox.height} fill="none" stroke="magenta" />
};

export const yAxis = (ticks: number[]): Glyph => ({
  // renderFn: debug,
  children: {
    "axis": rect({ width: 3, fill: "red" }),
    ...ticks
      .reduce((o: { [key: string]: Glyph }, tick: number, i) =>
        ({ ...o, [i]: rect({ width: 15., height: 3., y: tick, fill: "purple" }) }),
        {})
  },
  relations: _.range(ticks.length).map((i) => ({ left: i.toString(), right: "axis", gestalt: [hSpace(3)] }))
})

export const dataGlyph: Glyph = {
  children: {
    // "xAxis": rect({ height: 3, fill: "red" }),
    "xAxis": xAxis([10, 10 + 25, 10 + 25 * 2]),
    // "yAxis": rect({ width: 3, fill: "red" }),
    "yAxis": yAxis([10, 10 + 25, 10 + 25 * 2]),
    "bars": bars(data),
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
      gestalt: [hSpace(0.), alignTop, alignBottom],
    },
  ]
}