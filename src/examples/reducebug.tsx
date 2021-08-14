import { hSpace, alignLeft } from '../gestalt';
import { rect } from '../mark';
import { Glyph } from '../compile';
import * as _ from "lodash";
import { BBoxValues } from '../kiwiBBox';

export const debug = (bbox: BBoxValues): JSX.Element => {
  return <rect x={bbox.left} y={bbox.top
  } width={bbox.width} height={bbox.height} fill="none" stroke="magenta" strokeWidth="2" />
};

export const xAxis = (): Glyph => ({
  renderFn: debug,
  children: {
    "0": rect({ x: 10, width: 20, height: 20, fill: "steelblue" }),
  },
})

export const dataGlyph: Glyph = {
  children: {
    // x must be _exactly_ 15 (i.e. == yAxis width) or else unsat!
    // TODO: narrow this down even more! why does this implication hold?
    "xAxis": xAxis(),
    // "yAxis": rect({ width: 15., fill: "purple" }),
  },
  // relations: [
  //   {
  //     left: "yAxis",
  //     right: "xAxis",
  //     gestalt: [hSpace(0.)],
  //   },
  // ]
}
