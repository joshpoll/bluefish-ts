import { hSpace, vSpace, alignCenterY } from './gestalt';
import { ellipse, rect } from './mark';

const data = { color1: "firebrick", color2: "steelblue", color3: "black" };

export default {
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: data.color1 }),
    "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data.color2 }),
    "rightEllipse": ellipse({ rx: 50, ry: 50, fill: data.color3 }),
  },
  relations: [
    // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
    { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.)] },
    { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
  ]
}
