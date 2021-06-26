import { bboxValues, maybeBboxValues } from './kiwiBBox';
import measure from './measure';

export type Mark = {
  bboxParams: maybeBboxValues,
  renderFn: (bbox: bboxValues) => JSX.Element,
}

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
    bboxParams: { top: x, left: y, width, height },
    // and the rendering function itself
    renderFn: (bbox: bboxValues) => {
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
    bboxParams: { centerX: cx, centerY: cy, width: rx ? 2 * rx : undefined, height: ry ? 2 * ry : undefined },
    // and the rendering function itself
    renderFn: (bbox: bboxValues) => {
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
  return {
    // return the positioning parameters the user gave us
    bboxParams: { left: x, bottom: y, width: measurements.width, height: measurements.height },
    // and the rendering function itself
    renderFn: (bbox: bboxValues) => {
      return <text x={x ?? bbox.left} y={y ?? bbox.bottom} fontFamily={fontFamily} fontSize={fontSize} fontStyle={fontStyle} fontWeight={fontWeight} fill={fill}>
        {text}
      </text>
    }
  }
}