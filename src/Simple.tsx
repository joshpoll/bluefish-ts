export const data = { leftColor: "red", rightColor: "blue" };

export const rect = (data: any, colorPath: string) => (
  <rect width="300" height="100" fill={data[colorPath]} />
)

const vSpace = (_: number): any => "";

export const encoding = {
  // encodings: [
  //   rect(data, "leftColor"),
  //   rect(data, "rightColor"),
  // ],

  // this does what I want more easily so I'll go with that
  encodings2: {
    "leftColor": rect(data, "foo"), // leftColor can be primitive or compound data!
    "rightColor": rect(data, "foo"),
  },
  relations: [
    // vSpace(10.)("leftColor", "rightColor")
    // leftColor refers to the bbox of the leftColor glyph defined above
    { left: "leftColor", right: "rightColor", gestalt: [vSpace(10.)] }
  ]
}

export const render = (encoding: any) => (
  <svg width="800" height="700">
    {encoding.encodings.map((glyph: any, index: number) => (<g key={index}>{glyph}</g>))}
  </svg>
)