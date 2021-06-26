import { CompiledAST } from "./compile"

const renderAux = (name: string, { bboxValues, encoding }: CompiledAST): JSX.Element => {
  console.log("name", name);
  console.log("bboxValues", bboxValues);
  console.log("encoding", encoding);
  const children = encoding.children === undefined ? {} : encoding.children;
  return (<>
    {Object.keys(children).map((glyphKey: any, index: number) => (
      <>
        {renderAux(glyphKey, { bboxValues: bboxValues.children[glyphKey], encoding: children[glyphKey] })}
        <g key={`${index}.renderFn`}>{
          children[glyphKey].renderFn !== undefined ? (children[glyphKey].renderFn as ((bbox: any) => JSX.Element))(bboxValues.children[glyphKey].bbox) : <></>
        }</g></>))}
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