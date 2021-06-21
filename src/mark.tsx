import { Mark } from './encoding';
import { bboxValues } from './kiwiBBox';

export const text: Mark = (text: any) => text;

type RectParams = {
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  fill?: string,
}

export const rect = ({ x, y, width, height, fill }: RectParams) => {
  return [
    // return the positioning parameters the user gave us
    { top: x, left: y, width, height },
    // and the rendering function itself
    (bbox: bboxValues) => {
      return <rect x={x ?? bbox.left} y={y ?? bbox.top
      } width={width ?? bbox.width} height={height ?? bbox.height} fill={fill} />
    }]
}
