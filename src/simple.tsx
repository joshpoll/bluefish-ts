import { hSpace, vSpace, alignCenterY } from './gestalt';
import { ellipse, rect } from './mark';

const data = { color1: "firebrick", color2: "steelblue", color3: "black" };

export default {
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    // leftColor can be primitive or compound data!
    "top": rect({ width: 500 / 3, height: 200 / 3, fill: data.color1 }),
    "bottom": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data.color2 }),
    "right": ellipse({ rx: 50, ry: 50, fill: data.color3 }),
  },
  relations: [
    // "top" refers to the bbox of the "top" glyph defined above
    { left: "top", right: "bottom", gestalt: [vSpace(50.)] },
    { left: "top", right: "right", gestalt: [hSpace(50.), alignCenterY] },
  ]
}
