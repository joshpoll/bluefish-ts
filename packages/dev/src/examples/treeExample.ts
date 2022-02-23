// $dataName$shapeName
// $$shapeName
// $dataName$ := $dataName$dataName

import { createShape, marks as M, constraints as C, ref, Shape, ShapeFn, render } from "@bfjs/core"
import _ from "lodash"

const createShape2 = (shapes: any, rels = {}) => createShape({ shapes, rels })

/* nodes: [...],
  trees: [{ node, subTrees: [ref(tree)]}], // for node-subtree constraints
  parentChild: [{ parent: ref(node), child: ref(node) }], // for links
  subTreeList: [mkList(subtree), mkList(subtree), ...] // for subtree-subtree constraints
*/

const mkList = (name: any, xs: any[]) => ({
  [name]: xs,
  neighbors: xs.length < 2 ? [] :
    _.zipWith(_.range(xs.length - 1), _.range(1, xs.length), (curr, next) => (
      {
        curr: ref(`../../${name}/${curr}`),
        next: ref(`../../${name}/${next}`),
      }
    ))
})

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
    { node: ref('../../nodes/1'), subtrees: 0 },
    { node: ref('../../nodes/2'), subtrees: 0 },
    { node: ref('../../nodes/0'), subtrees: mkList('elements', [ref("../../../0"), ref("../../../1")]) },
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
const tree: ShapeFn<any> = createShape2({
  $nodes$: (contents: any) => M.ellipse({ rx: 50, ry: 50, 'fill': 'blue' }),
  // (contents) => M.text({contents}),
  $parentChild$: (_: any) => M.nil(),
  $trees$: createShape2({
    $node$: 'ref',
    $subtrees$: (subtree: any) => subtree === 0 ? M.nil() : createShape2({
      $elements$: 'ref',
      // relation between subtrees
      $neighbors$: createShape2({
        $curr$: 'ref',
        $next$: 'ref',
      }, {
        'curr->next': [C.alignTop, C.hSpace(0)],
      }),
    })
  }, {
    // relation between node and subtree group
    'node->subtrees': [C.vSpace(10), C.alignCenter],
  }),
}) as ShapeFn<any>

export const treeExample = render(treeData, tree);
