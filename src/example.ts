import { Mark } from './encoding';
import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignTop } from './gestalt';
import { ellipse, rect, text } from './mark';
import { Encoding, Relation } from './render';

const data = { color1: "firebrick", color2: "steelblue", color3: "black" };

const data2 = { color1: "firebrick", color2: "steelblue", color3: "black", text: "hello world!" };

export const example: Encoding = {
  /* canvas: {
    width: 800,
    height: 700,
  }, */
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: data.color1 }),
    "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data.color2 }),
    "rightEllipse": ellipse({ rx: 50, ry: 50, fill: data.color3 }),
    "some text": text({ text: "hello world!", fontSize: "calc(10px + 2vmin)" }),
  },
  relations: [
    // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
    { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.)] },
    { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
    { left: "rightEllipse", right: "some text", gestalt: [vSpace(50.), alignCenterX] },
    { left: "canvas", right: "topRect", gestalt: [alignLeft] },
  ]
}

const $data: any = "";

type ExampleData = { color1: string, color2: string, color3: string, text: string };

export const example2 = (data: ExampleData) => ({
  /* canvas: {
    width: 800,
    height: 700,
  }, */
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: { data: data.color1 } as any }),
    "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: { data: data.color2 } as any }),
    "rightEllipse": ellipse({ rx: 50, ry: 50, fill: { data: data.color3 } as any }),
    "some text": text({ text: { data: data.text } as any, fontSize: "calc(10px + 2vmin)" }),
  },
  relations: [
    // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
    // { left: "color1", right: "color2", gestalt: [vSpace(50.)] },
    // { left: "color1", right: "color3", gestalt: [hSpace(50.), alignCenterY] },
    // { left: "color3", right: "text", gestalt: [vSpace(50.), alignCenterX] },
    // { left: "canvas", right: "color1", gestalt: [alignLeft] },
    { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.)] },
    { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
    { left: "rightEllipse", right: "some text", gestalt: [vSpace(50.), alignCenterX] },
    { left: "canvas", right: "topRect", gestalt: [alignLeft] },
  ]
})

export type MyEncoding<T> = {
  data: T,
  canvas?: {
    width?: number,
    height?: number,
  },
  encodings: { [key: string]: Mark },
  relations: Relation[]
}

export const example3 = (data: ExampleData): MyEncoding<ExampleData> => ({
  data,
  /* canvas: {
    width: 800,
    height: 700,
  }, */
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: { data: "color1" } as any }),
    "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: { data: "color2" } as any }),
    "rightEllipse": ellipse({ rx: 50, ry: 50, fill: { data: "color3" } as any }),
    "some text": text({ text: { data: "text" } as any, fontSize: "calc(10px + 2vmin)" }),
  },
  relations: [
    // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
    // { left: "color1", right: "color2", gestalt: [vSpace(50.)] },
    // { left: "color1", right: "color3", gestalt: [hSpace(50.), alignCenterY] },
    // { left: "color3", right: "text", gestalt: [vSpace(50.), alignCenterX] },
    // { left: "canvas", right: "color1", gestalt: [alignLeft] },
    { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.)] },
    { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
    { left: "rightEllipse", right: "some text", gestalt: [vSpace(50.), alignCenterX] },
    { left: "canvas", right: "topRect", gestalt: [alignLeft] },
  ]
})

type ExampleData2 = { color1: string, color2: string, color3: string, textData: { text: string, fontSize: string } };

export const example4: Encoding = {
  /* canvas: {
    width: 800,
    height: 700,
  }, */
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    "color1": rect({ width: 500 / 3, height: 200 / 3, fill: {} as any }),
    "color2": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: {} as any }),
    "color3": ellipse({ rx: 50, ry: 50, fill: {} as any }),
    "textData": text({ text: { $path: "text" } as any, fontSize: { $path: "fontSize" } as any }),
  },
  relations: [
    // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
    { left: "color1", right: "color2", gestalt: [vSpace(50.)] },
    { left: "color1", right: "color3", gestalt: [hSpace(50.), alignCenterY] },
    { left: "color3", right: "textData", gestalt: [vSpace(50.), alignCenterX] },
    { left: "canvas", right: "color1", gestalt: [alignLeft] },
    // { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.)] },
    // { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
    // { left: "rightEllipse", right: "some text", gestalt: [vSpace(50.), alignCenterX] },
    // { left: "canvas", right: "topRect", gestalt: [alignLeft] },
  ]
}
