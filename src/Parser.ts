import { Encoding } from "./Encoding";
import { alignBottom, hSpace } from "./Gestalt";
import { Bag, BFInstance, RefT } from "./Instance";
import { text } from "./Mark";

export const parse = (input: BFInstance) => {
  return input;
}

type courseSchema = {
  "course": Bag<{
      "instructors": string,
      "name": string,
      "num": string,
  }>,
  "sibling": Bag<{
      "curr": RefT<"course">,
      "next": RefT<"course">,
  }>,
}

let courseInstance: courseSchema = {
    "course": [
        {
            "instructors": "Jackson & Satyanarayan",
            "name": "Software Studio",
            "num": "6.170",
            },
            {
            "instructors": "Mueller",
            "name": "Engineering Interactive Technologies",
            "num": "6.810",
            },
            {
            "instructors": "Miller, Greenberg, Keane",
            "name": "Principles and Practice of Assistive Technology",
            "num": "6.811",
            },
    ],
    "sibling": [
    {
        "curr": {location: "course", index: 0},
        "next": {location: "course", index: 1},
    },
    {
        "curr": {location: "course", index: 1},
        "next": {location: "course", index: 2},
    },
    ],
}

let courseEncoding = ({
  instructors,
  name,
  num,
}: {instructors: string, name: string, num: string}): Encoding => ({
  marks: [
      text(instructors),
      text(name),
      text(num)
  ],
  relations: [
      {
          left: num,
          right: name,
          gestalt: [
              alignBottom,
              hSpace(9.5),
          ]
      },
      // (num, name) => [alignBottom, hSpace(9.5)]
  ]
})

courseEncoding({
          "instructors": "Mueller",
          "name": "Engineering Interactive Technologies",
          "num": "6.810",
          },)

/* existentials cheat sheet from https://github.com/microsoft/TypeScript/issues/14466#issuecomment-771277782 */
// type hktval<a> = {
//     array: readonly a[]
// }
// type hkt = keyof hktval<unknown>

// type exists<f extends hkt> = <r>(f: <e>(fe: hktval<e>[f]) => r) => r

// type inject = <f extends hkt, a>(fa: hktval<a>[f]) => exists<f>
// const inject: inject = fa => k => k(fa)

// const someArray: exists<'array'> = inject([1, 2, 3])

// const result = someArray(xs => xs.length) // typechecker ensures you remain agnostic to the type of things inside `xs` here