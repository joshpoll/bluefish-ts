const createShape: any = [];

const _ =
  createShape({
    // shapes that aren't data-driven
    shapes: {
      "foo": [],
      "bar": [],
    },
    // shapes that are driven by objects
    fields: {
      "baz": "line",
    },
    // shape driven by the entire object
    object: "line",
    // relations between objects | shapes. can think of shapes as objects driven by empty data
    // can be a mixture of constraints and shapes
    rels: {
      "foo->bar": []
    }
  }, {
    "baz": "string",
  })

/* 
concepts
- object + relation
- shape + constraint


which way?????

object -> shape
relation -> shape | constraint
* nice b/c lines are easier to specify
* also maybe the data assumption is wrong

shape -> object | relation
constraint -> relation
* nice b/c doesn't assume data from the beginning. can grow it

*/


export default {}
