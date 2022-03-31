import { TextProps, useText } from '@visx/text';
import * as C from './constraints';
import { BBoxValues } from './kiwiBBoxTransform';
import { measureText } from './measureText';
import { createShape, ShapeValue } from './unifiedShapeAPIFinal';
// import XArrow from 'react-xarrows';

type Rect = React.SVGProps<SVGRectElement> & Partial<{
  x: number,
  y: number,
  width: number,
  height: number,
}>

// TODO: incorporate stroke and strokeWidth into bounding box computations
export const rect = (params: Rect): ShapeValue => createShape(
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

export const ellipse = (params: Ellipse): ShapeValue => createShape(
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

export const circle = (params: Circle): ShapeValue => createShape(
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
export const text = (params: Text): ShapeValue => {
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
export const line = (params: Line): ShapeValue => {
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
export const arrow = (params: Arrow): ShapeValue => {
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

// https://stackoverflow.com/a/61756305
// set rotation on transform
function rotateBegin(pathCoords: { x: number; y: number }[]) {
  const endPoint = pathCoords[1];
  const startPoint = pathCoords[0];
  const angleDeg = determineRotationAngle(endPoint, startPoint);
  return `rotate(${angleDeg}, ${startPoint.x}, ${startPoint.y})`;
}

function rotateEnd(pathCoords: { x: number; y: number }[]) {
  const endPoint = pathCoords[pathCoords.length - 1];
  const startPoint = pathCoords[pathCoords.length - 2];
  const angleDeg = determineRotationAngle(endPoint, startPoint);
  return `rotate(${angleDeg}, ${endPoint.x}, ${endPoint.y})`;
}

function determineRotationAngle(endPoint: { x: number; y: number }, startPoint: { x: number; y: number }) {
  const deltaX = Math.abs(endPoint.x - startPoint.x);
  const deltaY = endPoint.y - startPoint.y;
  return Math.atan2(deltaY, deltaX) * 180 / Math.PI + 180; // invert by turning 180 degrees
}

function determineRotationAngleRadians(endPoint: { x: number; y: number }, startPoint: { x: number; y: number }) {
  const deltaX = Math.abs(endPoint.x - startPoint.x);
  const deltaY = endPoint.y - startPoint.y;
  return Math.atan2(deltaY, deltaX);
}

function getPolygonCoords(coords: { x: number; y: number }, index: number) {
  const { x, y } = coords;
  const p1 = `${x} ${y}`;
  const p2 = `${x + 7.5} ${y + 5}`;
  const p3 = `${x + 7.5} ${y - 5}`;
  return `${p1}, ${p2}, ${p3}`;
}

type Arrow2 = Omit<Rect, 'x' | 'y' | 'width' | 'height'> & {
  x1?: number,
  y1?: number,
  x2?: number,
  y2?: number,
}

/* <rect id={startId} x={canvas.left} y={canvas.top} width={10} height={10} /* visibility={'hidden'} */
// <rect id={endId} x={canvas.right} y={canvas.bottom} width={10} height={10} /* visibility={'hidden'} */ /> */}
/* XArrow doesn't work b/c it puts the result in a div! And when I take it out of the div it still doesn't work. */
/* <XArrow start={startId} end={endId} /> */
export const arrow2 = (params: Arrow2): ShapeValue => {
  params = { strokeWidth: 1, ...params };
  return createShape({
    // return the positioning parameters the user gave us
    bbox: { left: params.x1, top: params.y1, right: params.x2, bottom: params.y2 },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues, index?: number) => {
      // const rotationAngleRadians = determineRotationAngleRadians({ x: canvas.right, y: canvas.bottom }, { x: canvas.left, y: canvas.top });
      const start = { x: canvas.left, y: canvas.top };
      const end = { x: canvas.right, y: canvas.bottom };
      const length = Math.sqrt((canvas.left - canvas.right) ** 2 + (canvas.top - canvas.bottom) ** 2)
      const width = 5;
      const arrowHeadHeight = 7.5;
      // TODO: need to add controls for which arrowhead to show
      // TODO: need to be able to control arrowhead size
      // NOTE: the weird +1 and -1 gets rid of a white-line artifact between the rect and the arrowhead.
      return <g>
        {/* < line {...params} key={index} x1={canvas.left} x2={canvas.right - arrowHeadHeight * Math.cos(rotationAngleRadians)} y1={canvas.top} y2={canvas.bottom - arrowHeadHeight * Math.sin(rotationAngleRadians)} /> */}
        {/* <rect x={canvas.left - length / 2 + 7.5} y={canvas.top - width / 2} width={length} height={20} transform={rotateBegin([start, end])} /> */}
        {/* <rect fill="magenta" x={canvas.right} y={canvas.bottom - width / 2} width={length} height={width} /> */}
        {/* <polygon fill={params.fill} points={getPolygonCoords(start, 0)} transform={rotateBegin([start, end])} /> */}
        <polygon fill={params.fill} points={getPolygonCoords(end, 1)} transform={rotateEnd([start, end])} />
        <rect {...params} x={Math.floor(canvas.right + arrowHeadHeight) - 1} y={canvas.bottom - width / 2} width={Math.ceil(length - arrowHeadHeight) + 1} height={width} transform={rotateEnd([start, end])} />
      </g>
    }
  });
}

// box.center = line.top

// box->line: [C.alignTop, C.alignLeft]

// box->arrow/start: [C.alignCenter]

export const nil = (): ShapeValue => createShape(
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

export const loc = ({ x, y }: LocParams): ShapeValue => createShape(
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

export const html = (params: HTML): ShapeValue => {
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

type Image = React.SVGProps<SVGImageElement>
  & Partial<{
    x: number,
    y: number,
    width: number,
    height: number,
  }>

export const image = (params: Image): ShapeValue => createShape(
  {
    // return the positioning parameters the user gave us
    bbox: { left: params.x, top: params.y, width: params.width, height: params.height },
    // and the rendering function itself
    renderFn: (canvas: BBoxValues, index?: number) => {
      return <image {...params} key={index} x={canvas.left} y={canvas.top
      } width={canvas.width} height={canvas.height} />
    }
  }
)

// type VisxText = TextProps
//   & { contents: string }
//   & Partial<{
//     x: number,
//     y: number,
//   }>

// // TODO: use 'alphabetic' baseline in renderer? may need to figure out displacement again
// // TODO: maybe use https://airbnb.io/visx/docs/text?
// // TODO: maybe use alignmentBaseline="baseline" to measure the baseline as well?? need to add it as
// // a guide
// // TODO: very close to good alignment, but not quite there. Can I use more of the canvas
// // measurements somehow?
// export const visxText = (params: VisxText): ShapeValue => {
//   const { contents, ...textParams } = params;

//   const {
//     dx = 0,
//     dy = 0,
//     textAnchor = 'start',
//     innerRef,
//     innerTextRef,
//     verticalAnchor,
//     angle,
//     lineHeight = '1em',
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     scaleToFit = false,
//     capHeight,
//     width,
//     ...textProps
//   } = textParams;

//   const { /* x = 0,  */fontSize } = textProps;
//   const { wordsByLines, startDy, transform } = useText(textParams);

//   // TODO: need to determine whether width is known or not and update accordingly

//   return createShape({
//     bbox: {
//       left: params.x,
//       top: params.y,
//       width,
//       // TODO: height,
//     },
//     renderFn: (canvas: BBoxValues, index?: number) => {
//       return <g x={canvas.left} y={canvas.top} key={index}>
//         {wordsByLines.length > 0 ? (
//           <text ref={innerTextRef} fontSize={fontSize} transform={transform} {...textProps} textAnchor={textAnchor}>
//             {wordsByLines.map((line, index) => (
//               <tspan key={index} /* x={x} */ dy={index === 0 ? startDy : lineHeight}>
//                 {line.words.join(' ')}
//               </tspan>
//             ))}
//           </text>
//         ) : null}
//       </g>
//     },
//   });

//   return createShape({
//     // return the positioning parameters the user gave us
//     bbox: { left: params.x, top: params.y, width: measurements.width, height: measurements.fontHeight },
//     // and the rendering function itself
//     renderFn: (canvas: BBoxValues, index?: number) => {
//       return <text {...textParams} key={index} x={canvas.left} y={canvas.bottom - measurements.fontDescent}>
//         {contents}
//       </text>
//     }
//   })
// }