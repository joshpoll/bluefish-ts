import { Encoding } from './Encoding';
import { alignBottom, alignLeft, hSpace, vSpace } from './Gestalt';
import { Bag, BFInstance, RefT } from './Instance';
import { rect, text } from './Mark';

export const parse = (input: BFInstance) => input;

type course = {
  'instructors': string,
  'name': string,
  'num': string,
};

type sibling = {
  'curr': RefT<'course'>,
  'next': RefT<'course'>,
};

type coursesSchema = {
  'course': Bag<course>,
  'sibling': Bag<sibling>,
};

const coursesInstance: coursesSchema = {
  course: [
    {
      instructors: 'Jackson & Satyanarayan',
      name: 'Software Studio',
      num: '6.170',
    },
    {
      instructors: 'Mueller',
      name: 'Engineering Interactive Technologies',
      num: '6.810',
    },
    {
      instructors: 'Miller, Greenberg, Keane',
      name: 'Principles and Practice of Assistive Technology',
      num: '6.811',
    },
  ],
  sibling: [
    {
      curr: { location: 'course', index: 0 },
      next: { location: 'course', index: 1 },
    },
    {
      curr: { location: 'course', index: 1 },
      next: { location: 'course', index: 2 },
    },
  ],
};

const coursesInstanceIDs = {
  course: [
    {
      instructors: { type: "instructors", contents: 'Jackson & Satyanarayan' },
      name: { type: "name", contents: 'Software Studio' },
      num: { type: "num", contents: '6.170' },
    },
    {
      instructors: { type: "instructors", contents: 'Mueller' },
      name: { type: "name", contents: 'Engineering Interactive Technologies' },
      num: { type: "num", contents: '6.810' },
    },
    {
      instructors: { type: "instructors", contents: 'Miller, Greenberg, Keane' },
      name: { type: "name", contents: 'Principles and Practice of Assistive Technology' },
      num: { type: "num", contents: '6.811' },
    },
  ],
  sibling: [
    {
      curr: { location: 'course', index: 0 },
      next: { location: 'course', index: 1 },
    },
    {
      curr: { location: 'course', index: 1 },
      next: { location: 'course', index: 2 },
    },
  ],
};

type Path = string[];

type courseSchemaMap = {
  instructors: { $values: RefT<"instructors"> },
  name: { $values: RefT<"name"> },
  num: { $values: RefT<"num"> },
}

type coursesSchemaMap = {
  course: {
    $path: Path,
    instructors: { $path: Path, $values: string[] },
    name: { $path: Path, $values: string[] },
    num: { $path: Path, $values: string[] },
    $values: courseSchemaMap[]
  },
  sibling: {
    $path: Path,
    $values: {
      'curr': { $values: RefT<'course'> },
      'next': { $values: RefT<'course'> },
    }[]
  }
};

const coursesInstanceMap: coursesSchemaMap = {
  course: {
    $path: ["course"],
    instructors: {
      $path: ["course", "instructors"],
      $values: [
        'Jackson & Satyanarayan',
        'Mueller',
        'Miller, Greenberg, Keane'
      ]
    },
    name: {
      $path: ["course", "name"],
      $values: [
        'Software Studio',
        'Engineering Interactive Technologies',
        'Principles and Practice of Assistive Technology'
      ]
    },
    num: {
      $path: ["course", "num"],
      $values: [
        '6.170',
        '6.810',
        '6.811'
      ]
    },
    $values: [
      {
        instructors: { $values: { location: "instructors", index: 0 } },
        name: { $values: { location: "name", index: 0 } },
        num: { $values: { location: "num", index: 0 } },
      },
      {
        instructors: { $values: { location: "instructors", index: 1 } },
        name: { $values: { location: "name", index: 1 } },
        num: { $values: { location: "num", index: 1 } },
      },
      {
        instructors: { $values: { location: "instructors", index: 2 } },
        name: { $values: { location: "name", index: 2 } },
        num: { $values: { location: "num", index: 2 } },
      },
    ]
  },
  sibling: {
    $path: ["sibling"],
    $values: [
      {
        curr: { $values: { location: 'course', index: 0 } },
        next: { $values: { location: 'course', index: 1 } },
      },
      {
        curr: { $values: { location: 'course', index: 1 } },
        next: { $values: { location: 'course', index: 2 } },
      },
    ]
  },
}

// TODO: make a stronger type on encoding??
const bag = (encoding: (data: any) => Encoding, data: Bag<BFInstance>): Encoding => ({
  encodings: data.map(encoding),
  // relations: []
})

const courseEncoding = ({ instructors, name, num, }: courseSchemaMap): Encoding => (
  {
    encodings: [
      text(instructors),
      text(name),
      text(num),
    ],
    relations: [
      {
        left: num,
        right: name,
        gestalt: [alignBottom, hSpace(9.5)],
      },
      // (num, name) => [alignBottom, hSpace(9.5)]
    ],
  }
);

// export const foo = () => courseEncoding({
//   instructors: 'Mueller',
//   name: 'Engineering Interactive Technologies',
//   num: '6.810',
// });

const siblingEncoding = ({ curr, next }: sibling): Encoding => ({
  // marks: [],
  relations: [
    {
      left: curr,
      right: next,
      gestalt: [alignLeft, vSpace(10.)],
    }
  ]
})

const coursesEncoding = (courses: coursesSchemaMap): Encoding => ({
  encodings: [
    bag(courseEncoding, courses.course.$values),
    bag(siblingEncoding, courses.sibling.$values),
  ],
  // relations: []
})

export const bar = () => coursesEncoding(coursesInstanceMap);

type BoxType = {
  $path: string,
  color: string,
}

type SimpleExampleType = {
  leftBox: BoxType,
  rightBox: BoxType,
}

export const simpleExample: SimpleExampleType = {
  leftBox: { $path: "leftBox", color: "red" },
  rightBox: {
    $path: "rightBox", color: "blue"
  },
}

const simpleEncoding = (simpleExample: SimpleExampleType): Encoding => ({
  encodings: [
    rect(simpleExample.leftBox),
    rect(simpleExample.rightBox),
  ],
  relations: [
    { left: "leftBox", right: "rightBox", gestalt: [vSpace(10.)] }
  ],
})

export const baz = () => simpleEncoding(simpleExample);

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


// TODO: the easiest thing I can do is just pass the data around everywhere and use paths to look up
// the data every time. I can get fancier later.