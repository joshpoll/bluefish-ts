import { CompiledAST } from "./compile"
import { BBoxValues } from './kiwiBBox';

const renderAux = (name: string, { bboxValues, encoding }: CompiledAST): JSX.Element => {
  console.log("name", name);
  console.log("bboxValues", bboxValues);
  console.log("encoding", encoding);
  return (<>
    {Object.keys(encoding.children).map((glyphKey: any, index: number) => (
      <g key={index}>
        {renderAux(glyphKey, { bboxValues: bboxValues.children[glyphKey], encoding: encoding.children[glyphKey] })}
      </g>)
    )}
    {
      encoding.renderFn !== undefined ? (encoding.renderFn as ((bbox: BBoxValues) => JSX.Element))(bboxValues.bbox) : <></>
    }
  </>)
}

export default ({ bboxValues, encoding }: CompiledAST): JSX.Element => {
  const children = encoding.children === undefined ? {} : encoding.children;
  return (
    <svg width={Math.max(bboxValues.bbox.width, 0)} height={Math.max(bboxValues.bbox.height, 0)}>
      {renderAux("canvas", { bboxValues, encoding })}
    </svg>
  )
}