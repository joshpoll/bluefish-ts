import { vSpace } from './gestalt';
import { rect } from './mark';

const data = { leftColor: "firebrick", rightColor: "steelblue" };

export default {
  encodings: {
    /* TODO: maybe make RHS a _list_ of glyphs? */
    // leftColor can be primitive or compound data!
    "leftColor": rect({ width: 500 / 3, height: 200 / 3, fill: data.leftColor }),
    "rightColor": rect({ width: 300 / 3, height: 200 / 3, fill: data.rightColor }),
  },
  relations: [
    // leftColor refers to the bbox of the leftColor glyph defined above
    { left: "leftColor", right: "rightColor", gestalt: [vSpace(50.)] }
  ]
}
