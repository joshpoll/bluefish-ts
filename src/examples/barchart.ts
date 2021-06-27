import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignBottom } from '../gestalt';
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

export const dataGlyph: Glyph = {
  children: {
    "0": rect({ width: 20., height: data[0].b, fill: "steelblue" }),
    "1": rect({ width: 20., height: data[1].b, fill: "steelblue" }),
    "2": rect({ width: 20., height: data[2].b, fill: "steelblue" }),
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
  ]
}
