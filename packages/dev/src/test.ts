import { marks as M, constraints as C } from '@bfjs/core';

const foo = {
  objs: {
    "g1": M.text({ contents: "Hello", fontSize: "18pt", }),
    "g1->g2": {
      obj: "line",
      rels: {
        "g1->obj": [C.hSpace(5)],
        "obj->g2": [C.hSpace(5)],
      }
    },
    "g2": M.text({ contents: "World!", fontSize: "18pt", }),
  },
  rels: {
    "g1->g2": [C.hAlignCenter, C.hSpace(20)],
  },
}

const bar = {
  objs: {
    "g1": M.text({ contents: "Hello", fontSize: "18pt", }),
    "g1->g2": "line",
    "g2": M.text({ contents: "World!", fontSize: "18pt", }),
  },
  rels: {
    "g1->g2": [C.hAlignCenter, C.hSpace(20)],
    "g1->(g1->g2)": [C.hSpace(5)],
    "(g1->g2)->g2": [C.hSpace(5)],
  },
}

const foo2 = {
  objs: {
    "g1": M.text({ contents: "Hello", fontSize: "18pt", }),
    "g1->g2": ({ g1, g2 }: any) => ({
      objs: {
        g1,
        line: "line",
        g2,
      },
      rels: {
        "g1->line": [C.hSpace(5)],
        "line->g2": [C.hSpace(5)],
      }
    }),
    "g2": M.text({ contents: "World!", fontSize: "18pt", }),
  },
  rels: {
    "g1->g2": [C.hAlignCenter, C.hSpace(20)],
  },
}


const foo25 = {
  objs: {
    "g1": M.text({ contents: "Hello", fontSize: "18pt", }),
    "g1->g2": ({ g1, g2 }: any) => ({
      objs: {
        g1,
        line: "line",
        g2,
      },
      rels: {
        "g1->line": [C.hSpace(5)],
        "line<-g2": [C.hSpace(5)],
      }
    }),
    "g2": M.text({ contents: "World!", fontSize: "18pt", }),
  },
  rels: {
    "g1->g2": [C.hAlignCenter, C.hSpace(20)],
  },
}


const foo3 = {
  objs: {
    "g1": M.text({ contents: "Hello", fontSize: "18pt", }),
    "g1->g2": ({ g1, g2 }: any) => ({
      objs: {
        g1,
        line: "line",
        g2,
      },
      rels: {
        "g1->line": [C.hSpace(5)],
        "line->g2": [C.hSpace(5)],
        "g1->g2": [C.hAlignCenter, C.hSpace(20)],
      }
    }),
    "g2": M.text({ contents: "World!", fontSize: "18pt", }),
  },
}