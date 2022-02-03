import * as C from './constraints';
import { BBoxValues } from './kiwiBBoxTransform';
import { measureText } from './measureText';
import { createShape, Shape } from './shapeAPI';

type Rect = React.SVGProps<SVGRectElement> & Partial<{
  x: number,
  y: number,
  width: number,
  height: number,
}>

// TODO: incorporate stroke and strokeWidth into bounding box computations
export const rect = (params: Rect): Shape => createShape(
  {
    // return the positioning parameters the user gave us
    bbox: { left: params.x, top: params.y, width: params.width, height: params.height },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues, index?: number) => {
      return <rect {...params} key={index} x={canvas.left} y={canvas.top
      } width={canvas.width} height={canvas.height} />
    }
  }
)

type Ellipse = React.SVGProps<SVGEllipseElement> & Partial<{
  cx: number,
  cy: number,
  rx: number,
  ry: number,
}>

export const ellipse = (params: Ellipse): Shape => createShape(
  {
    // return the positioning parameters the user gave us
    bbox: { centerX: params.cx, centerY: params.cy, width: params.rx ? 2 * params.rx : undefined, height: params.ry ? 2 * params.ry : undefined },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues, index?: number) => {
      return <ellipse {...params} key={index} cx={canvas.centerX} cy={canvas.centerY} rx={canvas.width / 2} ry={canvas.height / 2} />
    }
  }
)

type Circle = React.SVGProps<SVGCircleElement> & Partial<{
  cx: number,
  cy: number,
  r: number,
}>

export const circle = (params: Circle): Shape => createShape(
  {
    // return the positioning parameters the user gave us
    bbox: { centerX: params.cx, centerY: params.cy, width: params.r ? 2 * params.r : undefined, height: params.r ? 2 * params.r : undefined },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues, index?: number) => {
      return <circle {...params} key={index} cx={canvas.centerX} cy={canvas.centerY} r={canvas.width / 2} />
    },
    rels: {
      "$canvas->$canvas": [C.eqWidthHeight],
    }
  }
)

type Text = React.SVGProps<SVGTextElement>
  & { contents: string }
  & Partial<{
    x: number,
    y: number,
  }>

// TODO: use 'alphabetic' baseline in renderer? may need to figure out displacement again
// TODO: maybe use https://airbnb.io/visx/docs/text?
// TODO: maybe use alignmentBaseline="baseline" to measure the baseline as well?? need to add it as
// a guide
// TODO: very close to good alignment, but not quite there. Can I use more of the canvas
// measurements somehow?
export const text = (params: Text): Shape => {
  params = { fontFamily: "sans-serif", fontSize: "12px", fontWeight: "normal", ...params }
  const { contents, ...textParams } = params;
  const { fontStyle, fontWeight, fontSize, fontFamily } = textParams;
  const measurements = measureText(contents, `${fontStyle ?? ""} ${fontWeight ?? ""} ${fontSize ?? ""} ${fontFamily ?? ""}`);
  return createShape({
    // return the positioning parameters the user gave us
    bbox: { left: params.x, top: params.y, width: measurements.width, height: measurements.fontHeight },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues, index?: number) => {
      return <text {...textParams} key={index} x={canvas.left} y={canvas.bottom - measurements.fontDescent}>
        {contents}
      </text>
    }
  })
}

type Line = React.SVGProps<SVGLineElement>
  & Partial<{
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  }>

// NOTE: a line is assumed to have no width. If you want to reason about width, use a rectangle.
// (This is because width is really hard to work with for rotated lines, and it isn't very useful
// for that anyway since we are using AABBs.)
export const line = (params: Line): Shape => {
  params = { strokeWidth: 1, ...params };
  return createShape({
    // return the positioning parameters the user gave us
    bbox: { left: params.x1, top: params.y1, right: params.x2, bottom: params.y2 },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues, index?: number) => {
      return <line {...params} key={index} x1={canvas.left} x2={canvas.right} y1={canvas.top} y2={canvas.bottom} />
    }
  });
}

type Arrow = Line

// a wrapper around a line that exposes the start and end points
// TODO: also add arrowheads here!
export const arrow = (params: Arrow): Shape => {
  return createShape({
    shapes: {
      "start": nil(),
      "line": line(params),
      "end": nil(),
    },
    rels: {
      "start->line": [C.alignLeft, C.alignTop],
      "line->end": [C.alignRight, C.alignBottom],
    }
  });
}

// box.center = line.top

// box->line: [C.alignTop, C.alignLeft]

// box->arrow/start: [C.alignCenter]

export const nil = (): Shape => createShape(
  {
    bbox: { width: 0., height: 0, },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues, index?: number) => {
      return <></>
    }
  }
)

// an invisible mark useful for specifying locations.
// TODO: maybe this shouldn't be a mark, but something closer measurements like width, height, top,
// bottom, etc.?
type LocParams = {
  x?: number,
  y?: number,
}

export const loc = ({ x, y }: LocParams): Shape => createShape(
  {
    bbox: { centerX: x, centerY: y, width: 0., height: 0, },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues, index?: number) => {
      return <></>
    }
  }
)

type HTML = React.SVGProps<SVGForeignObjectElement>
  & { html: JSX.Element }
  & Partial<{
    x: number,
    y: number,
    width: number,
    height: number,
  }>

export const html = (params: HTML): Shape => {
  const { html, ...foParams } = params;
  return createShape({
    bbox: { left: foParams.x, top: foParams.y, width: foParams.width, height: foParams.height },
    renderFn: (canvas: BBoxValues, index?: number) => {
      return <foreignObject {...foParams} key={index} x={canvas.left} y={canvas.top} width={canvas.width} height={canvas.height}>
        {/* @ts-ignore - xmlns is not a recognized field here */}
        <html xmlns={"http://www.w3.org/1999/xhtml"}>
          {html}
        </html>
      </foreignObject >
    }
  })
}

export const debug = (canvas: BBoxValues): JSX.Element =>
  (<rect x={canvas.left} y={canvas.top} width={canvas.width} height={canvas.height} fill="none" stroke="magenta" />);
