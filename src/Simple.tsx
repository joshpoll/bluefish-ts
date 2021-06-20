export const data = { color: "red" };

export const rect = (color: string) => (
  <rect width="300" height="100" fill={color} />
)

export const encoding = {
  encodings: [
    rect(data.color),
    rect(data.color),
  ]
}

export const render = (encoding: any) => (
  <svg width="800" height="700">
    {encoding.encodings.map((glyph: any, index: number) => (<g key={index}>{glyph}</g>))}
  </svg>
)