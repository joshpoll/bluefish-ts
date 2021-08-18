import { CompiledAST } from "./compile"
import { BBoxValues } from './kiwiBBox';

const renderAux = (index: number, name: string, { bboxValues, encoding }: CompiledAST): JSX.Element => {
  console.log("name", name);
  console.log("bboxValues", bboxValues);
  console.log("encoding", encoding);

  const childKeys = Object.keys(encoding.children);

  if (childKeys.length == 0) {
    // inline transforms at leaves for DOM readability
    const left = bboxValues.bbox.left;
    const top = bboxValues.bbox.top;
    const canvas = bboxValues.canvas;
    const values = {
      left: canvas.left + left,
      right: canvas.right + left,
      top: canvas.top + top,
      bottom: canvas.bottom + top,
      width: canvas.width,
      height: canvas.height,
      centerX: canvas.centerX + left,
      centerY: canvas.centerY + top,
    };

    return encoding.renderFn !== undefined ? (encoding.renderFn as ((canvas: BBoxValues, index?: number) => JSX.Element))(values, index) : <></>;
  } else if (childKeys.length == 1 && encoding.renderFn === undefined) {
    const glyphKey = childKeys[0];

    const left = bboxValues.bbox.left;
    const top = bboxValues.bbox.top;
    const childBBox = bboxValues.children[glyphKey].bbox;
    const bbox = {
      left: childBBox.left + left,
      right: childBBox.right + left,
      top: childBBox.top + top,
      bottom: childBBox.bottom + top,
      width: childBBox.width,
      height: childBBox.height,
      centerX: childBBox.centerX + left,
      centerY: childBBox.centerY + top,
    };

    return renderAux(0, glyphKey, { bboxValues: { ...bboxValues.children[glyphKey], bbox }, encoding: encoding.children[glyphKey] })
  } else {
    return (<g key={index} transform={`translate(${bboxValues.bbox.left} ${bboxValues.bbox.top})`}>
      {Object.keys(encoding.children).map((glyphKey: any, index: number) => (
        renderAux(index, glyphKey, { bboxValues: bboxValues.children[glyphKey], encoding: encoding.children[glyphKey] })
      )
      )}
      {
        encoding.renderFn !== undefined ? (encoding.renderFn as ((canvas: BBoxValues, index?: number) => JSX.Element))(bboxValues.canvas) : <></>
      }
    </g>)
  }
}

export default ({ bboxValues, encoding }: CompiledAST): JSX.Element => {
  return (
    <svg width={Math.max(bboxValues.bbox.width, 0)} height={Math.max(bboxValues.bbox.height, 0)}>
      {renderAux(0, "canvas", { bboxValues, encoding })}
    </svg>
  )
}