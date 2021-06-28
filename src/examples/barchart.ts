import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignBottom, alignRight, alignTop } from '../gestalt';
import { ellipse, rect, text } from '../mark';
import { Glyph, Relation } from '../compile';

type Data = { a: string, b: number };

/* https://vega.github.io/vega-lite/examples/bar.html */
export const data: Data[] = [
  { "a": "A", "b": 28 }, { "a": "B", "b": 55 }, { "a": "C", "b": 43 },
  { "a": "D", "b": 91 }, { "a": "E", "b": 81 }, { "a": "F", "b": 53 },
  { "a": "G", "b": 19 }, { "a": "H", "b": 87 }, { "a": "I", "b": 52 }
];

// export const course = (data: Course): Glyph => ({
//   children: {
//     "instructors": text({ text: data.instructors, fontSize: "16x", fontStyle: "italic" }),
//     "name": text({ text: data.name, fontSize: "18x", fontWeight: "bold" }),
//     "num": text({ text: data.num, fontSize: "18x" }),
//   },
//   relations: [
//     {
//       left: "num",
//       right: "name",
//       gestalt: [alignBottom, hSpace(9.5)],
//     },
//     {
//       left: "name",
//       right: "instructors",
//       gestalt: [alignLeft, vSpace(2.)],
//     },
//   ]
// })

export const bars = (data: Data[]): Glyph => ({
  children: {
    "0": rect({ width: 20., height: data[0].b, fill: "steelblue" }),
    "1": rect({ width: 20., height: data[1].b, fill: "steelblue" }),
    "2": rect({ width: 20., height: data[2].b, fill: "steelblue" }),
    "3": rect({ width: 20., height: data[3].b, fill: "steelblue" }),
    "4": rect({ width: 20., height: data[4].b, fill: "steelblue" }),
    "5": rect({ width: 20., height: data[5].b, fill: "steelblue" }),
    "6": rect({ width: 20., height: data[6].b, fill: "steelblue" }),
    "7": rect({ width: 20., height: data[7].b, fill: "steelblue" }),
    "8": rect({ width: 20., height: data[8].b, fill: "steelblue" }),
  },
  relations: [
    {
      left: "0",
      right: "1",
      gestalt: [alignBottom, hSpace(5.)],
    },
    {
      left: "1",
      right: "2",
      gestalt: [alignBottom, hSpace(5.)],
    },
    {
      left: "2",
      right: "3",
      gestalt: [alignBottom, hSpace(5.)],
    },
    {
      left: "3",
      right: "4",
      gestalt: [alignBottom, hSpace(5.)],
    },
    {
      left: "4",
      right: "5",
      gestalt: [alignBottom, hSpace(5.)],
    },
    {
      left: "5",
      right: "6",
      gestalt: [alignBottom, hSpace(5.)],
    },
    {
      left: "6",
      right: "7",
      gestalt: [alignBottom, hSpace(5.)],
    },
    {
      left: "7",
      right: "8",
      gestalt: [alignBottom, hSpace(5.)],
    },
  ]
})

/* TODO:
   - replace rect with line?
   - add tick marks
   - add coordinate system? similar to observable plot, but on any glyph
*/

export const dataGlyph: Glyph = {
  children: {
    "xAxis": rect({ height: 3, fill: "red" }),
    "yAxis": rect({ width: 3, fill: "red" }),
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
