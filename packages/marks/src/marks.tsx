import { Shape, BBoxValues, createShape, constraints as C } from '@bfjs/core';
import { measureText } from './measureText';

// type RectParams = {
//   x?: number,
//   y?: number,
//   width?: number,
//   height?: number,
//   fill?: string,
//   stroke?: string,
//   strokeWidth?: number,
// }

// // TODO: incorporate stroke and strokeWidth into bounding box computations
// export const rect = ({ x, y, width, height, fill, stroke, strokeWidth }: RectParams): Shape => createShape(
//   {
//     // return the positioning parameters the user gave us
//     bbox: { left: x, top: y, width, height },
//     // and the rendering function itself
//     renderFn: (canvas: BBoxValues, index?: number) => {
//       return <rect key={index} x={canvas.left} y={canvas.top
//       } width={canvas.width} height={canvas.height} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
//     }
//   }
// )

// type EllipseParams = {
//   cx?: number,
//   cy?: number,
//   rx?: number,
//   ry?: number,
//   fill?: string,
// }

// export const ellipse = ({ cx, cy, rx, ry, fill }: EllipseParams): Shape => createShape(
//   {
//     // return the positioning parameters the user gave us
//     bbox: { centerX: cx, centerY: cy, width: rx ? 2 * rx : undefined, height: ry ? 2 * ry : undefined },
//     // and the rendering function itself
//     renderFn: (canvas: BBoxValues, index?: number) => {
//       return <ellipse key={index} cx={canvas.centerX} cy={canvas.centerY} rx={canvas.width / 2} ry={canvas.height / 2} fill={fill} />
//     }
//   }
// )

// type CircleParams = {
//   cx?: number,
//   cy?: number,
//   r?: number,
//   fill?: string,
// }

// export const circle = ({ cx, cy, r, fill }: CircleParams): Shape => createShape(
//   {
//     // return the positioning parameters the user gave us
//     bbox: { centerX: cx, centerY: cy, width: r ? 2 * r : undefined, height: r ? 2 * r : undefined },
//     // and the rendering function itself
//     renderFn: (canvas: BBoxValues, index?: number) => {
//       return <circle key={index} cx={canvas.centerX} cy={canvas.centerY} r={canvas.width / 2} fill={fill} />
//     },
//     rels: {
//       "$canvas->$canvas": [C.eqWidthHeight],
//     }
//   }
// )

// type TextParams = {
//   x?: number,
//   y?: number,
//   contents: string,
//   fontFamily?: string,
//   fontSize: string,
//   fontStyle?: string,
//   fontWeight?: string,
//   fill?: string,
// }

// // TODO: maybe use https://airbnb.io/visx/docs/text?
// // TODO: maybe use alignmentBaseline="baseline" to measure the baseline as well?? need to add it as
// // a guide
// // TODO: very close to good alignment, but not quite there. Can I use more of the canvas
// // measurements somehow?
// export const text = ({ x, y, contents, fontFamily = "sans-serif", fontSize = "12px", fontStyle, fontWeight = "normal", fill }: TextParams): Shape => {
//   const measurements = measureText(contents, `${fontStyle ?? ""} ${fontWeight ?? ""} ${fontSize ?? ""} ${fontFamily ?? ""}`);
//   return createShape({
//     // return the positioning parameters the user gave us
//     bbox: { left: x, top: y, width: measurements.width, height: measurements.fontHeight },
//     // and the rendering function itself
//     renderFn: (canvas: BBoxValues, index?: number) => {
//       return <text key={index} x={canvas.left} y={canvas.bottom - measurements.fontDescent} fontFamily={fontFamily} fontSize={fontSize} fontStyle={fontStyle} fontWeight={fontWeight} fill={fill}>
//         {contents}
//       </text>
//     }
//   })
// }

// type LineParams = {
//   x1?: number,
//   y1?: number,
//   x2?: number,
//   y2?: number,
//   stroke?: string,
//   strokeWidth?: number,
// }

// /* 
// const dir = ops.vnormalize(ops.vsub(s.end.contents, s.start.contents));
//       const segmentWidth = absVal(sub(s.start.contents[0], s.end.contents[0]));
//       const thicknessWidth = absVal(
//         ops.vmul(s.thickness.contents, ops.rot90(dir))[0]
//       );
//       const segmentHeight = absVal(sub(s.start.contents[1], s.end.contents[1]));
//       const thicknessHeight = absVal(
//         ops.vmul(s.thickness.contents, ops.rot90(dir))[1]
//       );
//       w = add(segmentWidth, thicknessWidth);
//       h = add(segmentHeight, thicknessHeight);
//       center = ops.vdiv(
//         ops.vadd(s.start.contents, s.end.contents),
//         constOf(2)
//       ) as Pt2;
//       break;
// */

// // export const line = ({ x1, y1, x2, y2, stroke, strokeWidth = 1 }: LineParams): Shape => {
// //   let segmentWidth, thicknessWidth, width;
// //   let segmentHeight, thicknessHeight, height;
// //   if (x1 !== undefined && x2 !== undefined && y1 !== undefined && y2 !== undefined) {
// //     const magnitude = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
// //     const dir = [(x2 - x1) / magnitude, y2 - y1 / magnitude];
// //     const rotDirThickness = [dir[1] * strokeWidth, -dir[0] * strokeWidth];

// //     segmentWidth = Math.abs(x2 - x1);
// //     thicknessWidth = rotDirThickness[0];
// //     width = segmentWidth + thicknessWidth;

// //     segmentHeight = Math.abs(y2 - y1);
// //     thicknessHeight = rotDirThickness[1];
// //     height = segmentHeight + thicknessHeight;
// //   }

// //   const centerX = (x1 !== undefined && x2 !== undefined) ? (x1 + x2) / 2 : undefined;
// //   const centerY = (y1 !== undefined && y2 !== undefined) ? (y1 + y2) / 2 : undefined;

// //   return createShape({
// //     // return the positioning parameters the user gave us
// //     bbox: { centerX, centerY, width, height },
// //     // and the rendering function itself
// //     renderFn: (canvas: BBoxValues, index?: number) => {
// //       // TODO: this is super wrong for multiple reasons. first the start and end could be flipped.
// //       // second, it doesn't take into account stroke width at all
// //       return <line key={index} x1={canvas.left} x2={canvas.right} y1={canvas.top} y2={canvas.bottom} stroke={stroke} strokeWidth={strokeWidth} />
// //     }
// //   });
// // }

// // NOTE: a line is assumed to have no width. If you want to reason about width, use a rectangle.
// // (This is because width is really hard to work with for rotated lines, and it isn't very useful
// // for that anyway since we are using AABBs.)
// export const line = ({ x1, y1, x2, y2, stroke, strokeWidth = 1 }: LineParams): Shape => {
//   return createShape({
//     // return the positioning parameters the user gave us
//     bbox: { left: x1, top: y1, right: x2, bottom: y2 },
//     // and the rendering function itself
//     renderFn: (canvas: BBoxValues, index?: number) => {
//       return <line key={index} x1={canvas.left} x2={canvas.right} y1={canvas.top} y2={canvas.bottom} stroke={stroke} strokeWidth={strokeWidth} />
//     }
//   });
// }

// type ArrowParams = {
//   x1?: number,
//   y1?: number,
//   x2?: number,
//   y2?: number,
//   stroke?: string,
//   strokeWidth?: number,
// }

// // a wrapper around a line that exposes the start and end points
// // TODO: also add arrowheads here!
// export const arrow = ({ x1, y1, x2, y2, stroke, strokeWidth = 1 }: ArrowParams): Shape => {
//   return createShape({
//     shapes: {
//       "start": nil(),
//       "line": line({ x1, y1, x2, y2, stroke, strokeWidth }),
//       "end": nil(),
//     },
//     rels: {
//       "start->line": [C.alignLeft, C.alignTop],
//       "line->end": [C.alignRight, C.alignBottom],
//     }
//   });
// }

// export const nil = (): Shape => createShape(
//   {
//     bbox: { width: 0., height: 0, },
//     // and the rendering function itself
//     renderFn: (canvas: BBoxValues, index?: number) => {
//       return <></>
//     }
//   }
// )

// type HTMLParams = {
//   x?: number,
//   y?: number,
//   width?: number,
//   height?: number,
//   html: JSX.Element,
// }

// export const html = ({ x, y, width, height, html }: HTMLParams): Shape => {
//   return createShape({
//     bbox: { left: x, top: y, width: width, height: height },
//     renderFn: (canvas: BBoxValues, index?: number) => {
//       return <foreignObject key={index} x={canvas.left} y={canvas.top} width={canvas.width} height={canvas.height}>
//         {/* @ts-ignore - xmlns is not a recognized field here */}
//         <html xmlns={"http://www.w3.org/1999/xhtml"}>
//           {html}
//         </html>
//       </foreignObject >
//     }
//   })
// }

// export const debug = (canvas: BBoxValues): JSX.Element =>
//   (<rect x={canvas.left} y={canvas.top} width={canvas.width} height={canvas.height} fill="none" stroke="magenta" />);
