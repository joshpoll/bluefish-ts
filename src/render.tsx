import { CompiledAST } from "./compile"

export default ({ bboxValues, encoding }: CompiledAST): JSX.Element => {
  const children = encoding.children === undefined ? {} : encoding.children;
  return (
    <svg width={bboxValues.bbox.width} height={bboxValues.bbox.height}>
      {Object.keys(children).map((glyphKey: any, index: number) => (<g key={index}>{
        children[glyphKey].renderFn !== undefined ? (children[glyphKey].renderFn as ((bbox: any) => JSX.Element))(bboxValues.children[glyphKey].bbox) : <></>
      }</g>))}
    </svg>
  )
}