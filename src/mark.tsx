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
    canvas: { left: x, top: y, width, height },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues) => {
      return <rect x={canvas.left} y={canvas.top
      } width={canvas.width} height={canvas.height} fill={fill} />
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
    canvas: { centerX: cx, centerY: cy, width: rx ? 2 * rx : undefined, height: ry ? 2 * ry : undefined },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues) => {
      return <ellipse cx={canvas.centerX} cy={canvas.centerY} rx={canvas.width / 2} ry={canvas.height / 2} fill={fill} />
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
    canvas: { left: x, bottom: y, width: measurements.width, height: measurements.height },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues) => {
      return <text x={canvas.left} y={canvas.bottom} fontFamily={fontFamily} fontSize={fontSize} fontStyle={fontStyle} fontWeight={fontWeight} fill={fill}>
        {text}
      </text>
    }
  }
}