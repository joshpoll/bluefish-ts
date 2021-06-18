import { Encoding } from './Encoding';
import { alignBottom, alignLeft, hSpace, vSpace } from './Gestalt';
import { Bag, BFInstance, RefT } from './Instance';
import { text } from './Mark';

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

// TODO: make a stronger type on encoding??
const bag = (encoding: (data: any) => Encoding, data: Bag<BFInstance>): Encoding => ({
  encodings: data.map(encoding),
  // relations: []
})

const courseEncoding = ({ instructors, name, num, }: course): Encoding => (
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

export const foo = () => courseEncoding({
  instructors: 'Mueller',
  name: 'Engineering Interactive Technologies',
  num: '6.810',
});

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

const coursesEncoding = (courses: coursesSchema): Encoding => ({
  encodings: [
    bag(courseEncoding, courses.course),
    bag(siblingEncoding, courses.sibling),
  ],
  // relations: []
})

export const bar = () => coursesEncoding(coursesInstance);

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
