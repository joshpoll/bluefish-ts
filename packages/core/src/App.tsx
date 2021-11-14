import './App.css';
import compile from './compile';
import compileWithRef from './compileWithRef';
import { course, courses, data } from './examples/courses';
import { example } from './examples/example';
import render from './render';
import { dataGlyph } from './examples/barchart';
import groupedbarchart from './examples/groupedbarchart';
import { dataGlyph as reduced } from './examples/reducebug';
import { textspans } from './examples/textspans';
import { pathTest } from './examples/pathTest';
import { htmlTest } from './examples/htmlTest';
// import { exampleRelationInterface } from './examples/exampleRelationInterface';
import { GlyphFnCompileTest, loweredListGlyphTest } from './examples/glyphExistentialAPI';
import { textspansLoweredApplied } from './examples/textspansExistential';
import { barChart } from './examples/barchartExistential';
// import { loweredGlyphTest, loweredGlyphMarbles } from './examples/exampleRelationInterfaceExistential';
import { boundingBox } from './examples/boundingboxexample';
import { constraintExample } from './examples/constraintexample';

function App() {
  // console.log("loweredGlyphTest", loweredGlyphTest);
  return (
    <div className="App">
      <header className="App-header">
        <br />
        <br />
        <br />
        {render(compileWithRef(GlyphFnCompileTest.testTwoMarbleSets))}
        {/* {render(compile(htmlTest))} */}
        <br />
        <br />
        <br />
        {/* {render(compileWithRef(textspansLoweredApplied))} */}
        {render(compileWithRef(boundingBox))}
        <br />
        <br />
        <br />
        {render(compileWithRef(constraintExample))}
        <br />
        <br />
        <br />
        {/* {render(compileWithRef(textspansLoweredApplied))} */}
        {render(compileWithRef(barChart))}
        <br />
        <br />
        <br />
        {/* <br />
        <br />
        <br />
        {render(compileWithRef(GlyphFnCompileTest.testMarblesListMoreComplex))}
        <br />
        <br />
        <br />
        {render(compileWithRef(GlyphFnCompileTest.testMarblesListReduced))}
        {render(compileWithRef(GlyphFnCompileTest.testMarblesList))}
        <br />
        <br />
        <br />
        {render(compileWithRef(GlyphFnCompileTest.testCompiledGlyphFnExample))}
        <br />
        <br />
        <br />
        {render(compileWithRef(GlyphFnCompileTest.testCompiledGlyphFnMarbles))} */}
        {/* <br />
        <br />
        <br />
        {render(compile(loweredListGlyphTest))} */}
        {/* <br />
        <br />
        <br /> */}
        {/* <br />
        <br />
        <br />
        {render(compile(exampleRelationInterface))}
        <br />
        <br />
        <br /> */}
        {render(compile(textspans))}
        {/* {render(compile(loweredGlyphMarbles))} */}
        {/* <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        {render(compile(htmlTest))}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br /> */}
        {/* {render(compile(example))} */}
        {/* <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        {render(compile(pathTest))} */}
        {/* <br />
        <br />
        <br /> */}
        {/* TODO: this _doesn't_ work properly, because text measurement happens too late */}
        {/* {render(compile(course(data)))} */}
        {/* <br />
        <br />
        <br />
        {render(compile(courses))}
        <br />
        <br />
        <br />
        {render(compile(dataGlyph))}
        <br />
        <br />
        <br />
        {render(compile(groupedbarchart))}
        <br />
        <br />
        <br />
        {render(compile(reduced))}
        <br />
        <br />
        <br /> */}
        {/* {render(compile(courses))}
        <br />
        <br />
        <br />
        {render(compile(dataGlyph))}
        <br />
        <br />
        <br />
        {render(compile(groupedbarchart))}
        <br />
        <br />
        <br /> */}
        <br />
        <br />
        <br />
        {render(compile(groupedbarchart))}
      </header>
    </div>
  );
}

export default App;
