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
    bbox: { top: x, left: y, width, height },
    // and the rendering function itself
    renderFn: (bbox: BBoxValues) => {
      console.log("test rect", bbox);
      return <rect x={x ?? bbox.left} y={y ?? bbox.top
      } width={width ?? bbox.width} height={height ?? bbox.height} fill={fill} />
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
      return <ellipse cx={cx ?? bbox.centerX} cy={cy ?? bbox.centerY} rx={rx ?? bbox.width / 2} ry={ry ?? bbox.height / 2} fill={fill} />
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
      return <text x={x ?? bbox.left} y={y ?? bbox.bottom} fontFamily={fontFamily} fontSize={fontSize} fontStyle={fontStyle} fontWeight={fontWeight} fill={fill}>
        {text}
      </text>
    }
  }
}