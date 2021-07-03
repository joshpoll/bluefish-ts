import { Mark } from './compile';
import { BBoxValues } from './kiwiBBox';
import measure from './measure';

type RectParams = {
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  fill?: string,
}

export const rect = ({ x, y, width, height, fill }: RectParams): Mark => (
  {
    // return the positioning parameters the user gave us
    bbox: { left: x, top: y, width, height },
    // and the rendering function itself
    renderFn: (bbox: BBoxValues) => {
      return <rect x={bbox.left} y={bbox.top
      } width={bbox.width} height={bbox.height} fill={fill} />
    }
  }
)

type EllipseParams = {
  cx?: number,
  cy?: number,
  rx?: number,
  ry?: number,
  fill?: string,
}

export const ellipse = ({ cx, cy, rx, ry, fill }: EllipseParams): Mark => (
  {
    // return the positioning parameters the user gave us
    bbox: { centerX: cx, centerY: cy, width: rx ? 2 * rx : undefined, height: ry ? 2 * ry : undefined },
    // and the rendering function itself
    renderFn: (bbox: BBoxValues) => {
      return <ellipse cx={bbox.centerX} cy={bbox.centerY} rx={bbox.width / 2} ry={bbox.height / 2} fill={fill} />
    }
  }
)

type TextParams = {
  x?: number,
  y?: number,
  text: string,
  fontFamily?: string,
  fontSize?: string,
  fontStyle?: string,
  fontWeight?: string,
  fill?: string,
}

// TODO: maybe use https://airbnb.io/visx/docs/text?
// TODO: maybe use alignmentBaseline="baseline" to measure the baseline as well?? need to add it as
// a guide
export const text = ({ x, y, text, fontFamily, fontSize, fontStyle, fontWeight, fill }: TextParams): Mark => {
  const measurements = measure("$measuring", <text fontFamily={fontFamily} fontSize={fontSize} fontStyle={fontStyle} fontWeight={fontWeight} fill={fill}>
    {text}
  </text>)
  console.log("measurements", measurements);
  return {
    // return the positioning parameters the user gave us
    bbox: { left: x, bottom: y, width: measurements.width, height: measurements.height },
    // and the rendering function itself
    renderFn: (bbox: BBoxValues) => {
      return <text x={bbox.left} y={bbox.bottom} fontFamily={fontFamily} fontSize={fontSize} fontStyle={fontStyle} fontWeight={fontWeight} fill={fill}>
        {text}
      </text>
    }
  }
}