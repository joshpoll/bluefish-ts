import { constraints as C, makePathsAbsolute, marks as M, RelativeBFRef } from '@bfjs/core';
import { Shape, ref, createShape, render } from '@bfjs/core';
import * as _ from "lodash";
import { zipWith } from 'lodash';
import * as scale from "d3-scale";
import { summarize, tidy, min, max } from '@tidyjs/tidy';
import { compileShapeValue } from '@bfjs/core';

const mkList = (xs: any) => ({
  elements: xs,
  neighbors: xs.length < 2 ? [] :
    _.zipWith(_.range(xs.length - 1), _.range(1, xs.length), (curr, next) => (
      {
        curr: ref(`../../elements/${curr}`),
        next: ref(`../../elements/${next}`),
      }
    ))
})

const data = mkList([1, 2, 3, 4, 5]);

type MyList<T> = {
  elements: Array<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Array<{
    curr: RelativeBFRef,
    next: RelativeBFRef,
  }>
}

// $dataName$shapeName
// $$shapeName
// $dataName$ := $dataName$dataName

const createShape2 = (shapes: any, rels = {}) => createShape({ shapes, rels });

const treeData = ({
  // set of nodes
  nodes: ['a', 'b', 'c'],
  // parent-child relation. useful for drawing links
  parentChild: [
    { parent: ref('../../nodes/0'), child: ref('../../nodes/1') },
    { parent: ref('../../nodes/0'), child: ref('../../nodes/2') }
  ],
  // set of trees. useful for putting space between a node and its subtrees (root-subtree relation in GoTree)
  trees: [
    { node: ref('../../nodes/1'), subtrees: mkList([]) },
    { node: ref('../../nodes/2'), subtrees: mkList([]) },
    { node: ref('../../nodes/0'), subtrees: mkList([ref("../../../0"), ref("../../../1")]) },
  ],
  // subtree-subtree relation. useful for spacing subtrees under a single node
  // subTreeList: [
  //   mkList('elements', [ref('../../trees/0'), ref('../../trees/1')]),
  // ],
  // parentSubtree: [
  //   {node: ref('../../nodes/0'), subtree: ref('../../trees/0')},
  //   {node: ref('../../nodes/0'), subtree: ref("../../trees/1")},
  // ],
  // subtree-subtree

  // trees: [{node: ref('../../../nodes/1'), subTrees: mkList("subtrees",[ref('../../../nodes/1'),ref('../../../nodes/2')])],
  // subTreeList: [mkList("subtrees",[ref('../../../nodes/1'),ref('../../../nodes/2')])],
  //ignore above
})

//createShape2(  {}, {})
const tree = createShape2({
  // $nodes$: (contents: any) => M.ellipse({ rx: 50, ry: 50, 'fill': 'blue' }),
  $nodes$: (contents: any) => M.text({ contents, fontSize: '30px' }),
  $parentChild$: (_: any) => M.nil(),
  $trees$: createShape2({
    $node$: 'ref',
    $subtrees$: createShape2({
      $elements$: 'ref',
      // relation between subtrees
      $neighbors$: createShape2({
        $curr$: 'ref',
        $next$: 'ref',
      }, {
        'curr->next': [C.alignTop, C.hSpace(50)],
      }),
    })
  }, {
    // relation between node and subtree group
    'node->subtrees': [C.vSpace(10), C.alignCenter],
  }),
})

type SplatTest = {
  node: number,
  children: MyList<number>
}

const splatTestData: SplatTest = {
  node: 20,
  children: data,
}

const splatTestData2 = {
  nodes: ['a', 'b', 'c'],
  trees: [
    {
      node: ref('../../nodes/0'),
      subtrees: mkList([ref("../../../../nodes/1"), ref("../../../../nodes/2")]),
    }
  ],
}

export const treeSplatTestShape: Shape<any> = createShape({
  shapes: {
    $nodes$: (n: any) => M.text({ contents: n.toString(), fontSize: "18px" }),
    $trees$: createShape({
      shapes: {
        $node$: 'ref',
        $subtrees$: createShape({
          shapes: {
            $elements$: 'ref',
            $neighbors$: createShape({
              shapes: {
                $curr$: 'ref',
                $next$: 'ref',
              },
              rels: { "curr->next": [C.hSpace(20), C.alignMiddle] },
            })
          },
        })
      },
      rels: {
        "node->subtrees": [C.vSpace(5), C.alignCenter],
      },
    })
    // $children$: createShape({
    //   shapes: {
    //     $elements$: (n: number) => M.text({ contents: n.toString(), fontSize: "18px" }),
    //     $neighbors$: createShape({
    //       shapes: {
    //         $curr$: 'ref',
    //         $next$: 'ref',
    //       },
    //       rels: { "curr->next": [C.hSpace(20), C.alignMiddle] },
    //     })
    //   },
    // }),
  },
  rels: {
    /* TODO: this constraint doesn't seem to be enforced properly... */
    // "node->children/elements": [C.vSpace(5)],
    // "node->children/elements": [C.vSpace(5)],
    // "node->children": [C.vSpace(5)],
    // "node->children/neighbors": [C.vSpace(5)],
  }
})

// console.log('output before compiling', (treeSplatTestShape as any)(makePathsAbsolute(splatTestData2 as any) as any))
// console.log('output after compileShapeValue', compileShapeValue((treeSplatTestShape as any)(makePathsAbsolute(splatTestData2 as any) as any)))
// export const treeSplatTestGrowing = render(splatTestData2 as any, treeSplatTestShape as any);
export const subtreeTest = render(treeData, tree as any)
