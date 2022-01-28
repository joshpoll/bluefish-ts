import { CompiledAST } from "./compile"
import { BBoxValues } from './kiwiBBoxTransform';

const renderAux = (index: number, name: string, { bboxValues, encoding }: CompiledAST): JSX.Element => {
  // TODO: render is messed up when doing translations
  // console.log("name", name, "bboxValues", bboxValues);
  console.log("encoding", encoding);

  const childKeys = Object.keys(encoding.children);

  // if (childKeys.length == 0) {
  //   // render bbox directly, no need for <g> transform
  //   console.log("name", name, "bboxValues", bboxValues, "branch 0");
  //   return encoding.renderFn !== undefined ? (encoding.renderFn as ((canvas: BBoxValues, index?: number) => JSX.Element))(bboxValues.bbox, index) : <></>;
  // } else if (childKeys.length == 1 && encoding.renderFn === undefined) {
  if (false) {
    // pass translation through to child
    console.log("name", name, "bboxValues", bboxValues, "branch 1");
    const glyphKey = childKeys[0];

    const transform = bboxValues.transform;
    const childBBox = bboxValues.children[glyphKey].bbox;
    const bbox = {
      left: childBBox.left + transform.translate.x,
      right: childBBox.right + transform.translate.x,
      top: childBBox.top + transform.translate.y,
      bottom: childBBox.bottom + transform.translate.y,
      width: childBBox.width,
      height: childBBox.height,
      centerX: childBBox.centerX + transform.translate.x,
      centerY: childBBox.centerY + transform.translate.y,
    };
    const childTransform = bboxValues.children[glyphKey].transform;
    const newTransform = {
      translate: {
        x: childTransform.translate.x + transform.translate.x,
        y: childTransform.translate.y + transform.translate.y,
      }
    };

    return renderAux(0, glyphKey, { bboxValues: { ...bboxValues.children[glyphKey], bbox, transform: newTransform }, encoding: encoding.children[glyphKey] })
  } else {
    console.log("name", name, "bboxValues", bboxValues, "branch 2");
    return (<g className={name} key={index} transform={`translate(${bboxValues.transform.translate.x} ${bboxValues.transform.translate.y})`}>
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