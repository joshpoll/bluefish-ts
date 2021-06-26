import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignBottom } from '../gestalt';
import { ellipse, Mark, rect, text } from '../mark';
import { Encoding, Relation } from '../compile';

const data = {
  instructors: "Jackson & Satyanarayan", name: "Software Studio", num: "6.170"
};

export const course: Encoding = {
  /* canvas: {
    width: 800,
    height: 700,
  }, */
  encodings: {
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
}
