import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignTop, Gestalt } from '../gestalt';
import { ellipse, rect, text } from '../mark';
import { Glyph, Mark, Relation } from '../compile';


type Data = { color1: string, color2: string, color3: string };
const data = { color1: "firebrick", color2: "steelblue", color3: "black" };

export const example: Glyph = {
  /* bbox: {
    width: 800,
    height: 700,
  }, */
  children: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: data.color1 }),
    "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data.color2 }),
    "rightEllipse": ellipse({ rx: 50, ry: 50, fill: data.color3 }),
    "some text": text({ text: "hello world!", fontSize: "calc(10px + 2vmin)" }),
  },
  relations: [
    // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
    { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.), alignCenterX] },
    { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
    { left: "rightEllipse", right: "some text", gestalt: [vSpace(50.), alignCenterX] },
    { left: "canvas", right: "topRect", gestalt: [alignLeft] },
  ]
}

/* experimental interface (NYI) below */

type ExampleData2 = { color1: string, color2: string, color3: string, textData: { text: string, fontSize: string } };

export const data2: ExampleData2 = { color1: "firebrick", color2: "steelblue", color3: "black", textData: { text: "hello world!", fontSize: "calc(10px + 2vmin)" } };

type MyRelation2<L, R> = {
  left: L | "canvas",
  right: R | "canvas",
  gestalt: Gestalt[],
}

type MyEncoding2<T> = {
  canvas?: {
    width?: number,
    height?: number,
  },
  // [key in keyof T & string] is a more aggressive type, but then you _must_ implement all!
  encodings: { [key in keyof T & string]?: (data: T[key]) => Mark },
  relations: MyRelation2<keyof T, keyof T>[]
}

export const example2: MyEncoding2<ExampleData2> = ({
  /* canvas: {
    width: 800,
    height: 700,
  }, */
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    "color1": (data) => rect({ width: 500 / 3, height: 200 / 3, fill: data }),
    "color2": (data) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data }),
    "color3": (data) => ellipse({ rx: 50, ry: 50, fill: data }),
    "textData": (data) => text({ text: data.text, fontSize: data.fontSize }),
  },
  relations: [
    { left: "color1", right: "color2", gestalt: [vSpace(50.)] },
    { left: "color1", right: "color3", gestalt: [hSpace(50.), alignCenterY] },
    { left: "color3", right: "textData", gestalt: [vSpace(50.), alignCenterX] },
    { left: "canvas", right: "color1", gestalt: [alignLeft] },
  ]
})
