import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignBottom } from '../gestalt';
import { ellipse, rect, text } from '../mark';
import { Glyph, Relation } from '../compile';

type Course = {
  instructors: string,
  name: string,
  num: string,
}

type Courses = Course[];

export const data: Course = {
  instructors: "Jackson & Satyanarayan", name: "Software Studio", num: "6.170"
};

const datadata: Courses = [{
  instructors: "Jackson & Satyanarayan", name: "Software Studio", num: "6.170"
},
{
  instructors: "Mueller",
  name: "Engineering Interactive Technologies",
  num: "6.810",
},
{
  instructors: "Miller, Greenberg, Keane",
  name: "Principles and Practice of Assistive Technology",
  num: "6.811",
},
];

export const course = (data: Course): Glyph => ({
  children: {
    "instructors": text({ contents: data.instructors, fontSize: "16x", fontStyle: "italic" }),
    "name": text({ contents: data.name, fontSize: "18x", fontWeight: "bold" }),
    "num": text({ contents: data.num, fontSize: "18x" }),
  },
  relations: [
    {
      left: "num",
      right: "name",
      gestalt: [alignBottom, hSpace(9.5)],
    },
    {
      left: "name",
      right: "instructors",
      gestalt: [alignLeft, vSpace(2.)],
    },
  ]
})

export const courses: Glyph = {
  children: {
    "0": course(datadata[0]),
    "1": course(datadata[1]),
    "2": course(datadata[2]),
  },
  relations: [
    {
      left: "0",
      right: "1",
      gestalt: [alignLeft, vSpace(10.)],
    },
    {
      left: "1",
      right: "2",
      gestalt: [alignLeft, vSpace(10.)],
    },
  ]
}