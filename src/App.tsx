import './App.css';
import compile from './compile';
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
import { GlyphFnLowerTest } from './examples/glyphExistentialAPI';
// import { loweredGlyphTest, loweredGlyphMarbles } from './examples/exampleRelationInterfaceExistential';

function App() {
  // console.log("loweredGlyphTest", loweredGlyphTest);
  return (
    <div className="App">
      <header className="App-header">
        <br />
        <br />
        <br />
        {render(compile(GlyphFnLowerTest.testLoweredGlyphExample))}
        <br />
        <br />
        <br />
        {render(compile(GlyphFnLowerTest.testLoweredGlyphMarbles))}
        <br />
        <br />
        <br />
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
      </header>
    </div>
  );
}

export default App;
