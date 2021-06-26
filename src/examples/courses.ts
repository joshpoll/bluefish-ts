import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignBottom } from '../gestalt';
import { ellipse, rect, text } from '../mark';
import { Glyph, Relation } from '../compile';

type Course = {
  instructors: string,
  name: string,
  num: string,
}

type Courses = Course[];

const data: Course = {
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

const course = (data: Course): Glyph => ({
  children: {
    "instructors": text({ text: data.instructors, fontSize: "16x", fontStyle: "italic" }),
    "name": text({ text: data.name, fontSize: "18x", fontWeight: "bold" }),
    "num": text({ text: data.num, fontSize: "18x" }),
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
    "course0": course(datadata[0]),
    "course1": course(datadata[1]),
    "course2": course(datadata[2]),
  },
  relations: [
    {
      left: "course0",
      right: "course1",
      gestalt: [alignLeft, vSpace(10.)],
    },
    {
      left: "course1",
      right: "course2",
      gestalt: [alignLeft, vSpace(10.)],
    },
  ]
}