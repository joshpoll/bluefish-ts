import _, { zipWith } from "lodash";
import { Glyph } from "../compile";
import { alignBottom, hSpace, vSpace, alignLeft, alignRight, alignTop, Gestalt, alignCenterX } from '../gestalt';
import { rect, text } from "../mark";
import * as population from "./population";
import * as d3Array from "d3-array";
import { filter, groupBy, tidy, map } from '@tidyjs/tidy';

let data = population.data;
data = _.filter(population.data, ({ year }) => year === 2000);
let shrunkData = data.map((d) => ({ ...d, people: d.people / 100_000 }));
let groupedData = d3Array.group(shrunkData, d => d.age);
console.log("grouped data", groupedData);

const tidyGroup =
  tidy(
    data,
    filter(({ year }) => year === 2000),
    map((d) => ({ ...d, people: d.people / 100_000 })),
    groupBy('age' as any, [map((d: any) => d.people)], groupBy.object()),
  );

console.log("tidy group", tidyGroup);

export const bar = (data: number): Glyph => ({
  children: {
    "bar": rect({ width: 20., height: data, fill: "steelblue" }),
  }
})

export const groupedBar = (data: number[]): Glyph => ({
  children: data
    .reduce((o: { [key: string]: Glyph }, x: number, i) =>
      ({ ...o, [i]: bar(x) }),
      {}),
  relations: zipWith(
    _.range(data.length - 1),
    _.range(1, data.length),
    (curr, next) => ({ left: curr.toString(), right: next.toString(), gestalt: [alignBottom, hSpace(1.)] })
  ),
})

/* TODO: make this take in some grouped d3 data and produce some grouped bars */
export const groupedBars = (data: { [key: number]: number[] }): Glyph => ({
  children: Object.keys(data)
    .reduce((o: { [key: string]: Glyph }, key: string, i) =>
      ({ ...o, [i]: groupedBar(data[+key]) }),
      {}),
  relations: zipWith(
    _.range(Object.keys(data).length - 1),
    _.range(1, Object.keys(data).length),
    (curr, next) => ({ left: curr.toString(), right: next.toString(), gestalt: [alignBottom, hSpace(5.)] })
  ),
})

export const listTest = (gestalt: Gestalt[]): Glyph => ({
  children: {
    "0": rect({}),
    "1": rect({}),
    "2": rect({}),
    "3": rect({}),
  },
  relations: zipWith(
    _.range(Object.keys(data).length - 1),
    _.range(1, Object.keys(data).length),
    (curr, next) => ({ left: curr.toString(), right: next.toString(), gestalt })
  ),
})

export const listSugared = (gestalt: Gestalt[]): any => ({
  children: [rect({}), rect({}), rect({}), rect({})],
  gestalt,
})

export const listSugared2 = (gestalt: Gestalt[]): any => ({
  children: {
    "list": [rect({}), rect({}), rect({}), rect({})],
  },
  relations: [
    {
      left: "list",
      right: "list",
      gestalt: [vSpace(3)],
    }],
})

export const setSugared = (gestalt: Gestalt[]): any => ({
  children: {
    "set": [rect({}), rect({}), rect({}), rect({})],
  },
  relations: [
    {
      left: "list",
      right: "list",
      gestalt: [vSpace(3)],
    }],
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
    "bars": groupedBars(tidyGroup),
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

export const chart: Glyph = {
  children: {
    "chart": dataGlyph,
    "title": text({ text: "This is a grouped bar chart", fontSize: "calc(10px + 2vmin)" }),
  },
  relations: [
    {
      left: "title",
      right: "chart",
      gestalt: [vSpace(15.), alignCenterX]
    }
  ]
}

export default chart;
