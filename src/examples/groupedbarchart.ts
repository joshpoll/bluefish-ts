import _, { zipWith } from "lodash";
import { Glyph } from "../compile";
import { alignBottom, hSpace, vSpace, alignLeft, alignRight, alignTop } from "../gestalt";
import { rect } from "../mark";
import * as population from "./population";
import * as d3Array from "d3-array";

let data = population.data;
data = _.filter(population.data, ({ year }) => year === 2000);
let groupedData = d3Array.group(data, d => d.age);

// inching closer to list/set
export const bars = (data: number[]): Glyph => ({
  children: data
    .reduce((o: { [key: string]: Glyph }, x: number, i) =>
      ({ ...o, [i]: rect({ width: 20., height: x, fill: "steelblue" }) }),
      {}),
  relations: zipWith(
    _.range(data.length - 1),
    _.range(1, data.length),
    (curr, next) => ({ left: curr.toString(), right: next.toString(), gestalt: [alignBottom, hSpace(5.)] })
  ),
})

/* TODO: make this take in some grouped d3 data and produce some grouped bars */
export const groupedBars = (data: number[]): Glyph => ({
  children: data
    .reduce((o: { [key: string]: Glyph }, x: number, i) =>
      ({ ...o, [i]: rect({ width: 20., height: x, fill: "steelblue" }) }),
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

export const yAxis = (ticks: number[]): Glyph => ({
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
    "bars": bars(data.map(({ people }) => people / 100_000)),
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
      gestalt: [hSpace(0), alignTop, alignBottom],
    },
  ]
}

export default dataGlyph;
