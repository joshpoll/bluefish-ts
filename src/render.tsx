import { CompiledAST } from "./compile"

export default ({ bboxValues, encoding }: CompiledAST): JSX.Element => {
  return (
    <svg width={bboxValues["canvas"].width} height={bboxValues["canvas"].height}>
      {Object.keys(encoding.encodings).map((glyphKey: any, index: number) => (<g key={index}>{encoding.encodings[glyphKey].renderFn(bboxValues[glyphKey])}</g>))}
    </svg>
  )
}