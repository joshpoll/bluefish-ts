import { indigoMain as I } from "@bfjs/core";
const { nil, text, rect, } = I.marks;
const { alignTop, hSpace } = I.constraints;

// export const helloIndigo = () => I.render(text({ contents: 'hello indigo!' }));
export const helloIndigo = () => I.render(rect({ fill: 'coral', width: 10, height: 20 }),);

export const indigoGroup = () => I.render(I.createShape({
  shapes: {
    'r1': rect({ fill: 'coral', width: 10, height: 20 }),
  }
}))

export const indigoConstraint = () => I.render(I.createShape({
  shapes: {
    'r1': rect({ fill: 'coral', width: 10, height: 20 }),
    'r2': rect({ fill: 'cornflowerblue', width: 50, height: 10, }),
  },
  rels: {
    'r1->r2': [alignTop, hSpace(5)],
  }
}))
