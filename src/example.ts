import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignTop } from './gestalt';
import { ellipse, rect, text } from './mark';
import { Encoding } from './render';

const data = { color1: "firebrick", color2: "steelblue", color3: "black" };

export const example: Encoding = {
  canvas: {
    width: 800,
    height: 700,
  },
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: data.color1 }),
    "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data.color2 }),
    "rightEllipse": ellipse({ rx: 50, ry: 50, fill: data.color3 }),
    "some text": text({ text: "hello world!" }),
  },
  relations: [
    // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
    { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.)] },
    { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
    { left: "rightEllipse", right: "some text", gestalt: [vSpace(50.), alignCenterX] },
    { left: "canvas", right: "topRect", gestalt: [alignLeft] },
  ]
}
