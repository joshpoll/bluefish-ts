import { hSpace, vSpace, alignCenterX, alignTop } from '../gestalt';
import { rect } from '../mark';
import { Glyph } from '../compile';

const data = { color1: "firebrick", color2: "steelblue", color3: "black" };

const top: Glyph = {
  children: {
    "leftRect": rect({ width: 200, height: 100, fill: data.color1 }),
    "rightRect": rect({ width: 500 / 3, height: 100 / 3, fill: data.color2 }),
  },
  relations: [
    {
      left: "leftRect",
      right: "rightRect",
      gestalt: [alignTop, hSpace(50.)],
    }
  ]
}

const bottom: Glyph = {
  children: {
    "rect": rect({ width: 100, height: 100, fill: data.color3 }),
  },
}

export const pathTest: Glyph = {
  children: {
    "top": top,
    "bottom": bottom,
  },
  relations: [
    {
      left: "top/rightRect",
      right: "bottom/rect",
      gestalt: [alignCenterX, vSpace(30.)],
    }
  ]
}
