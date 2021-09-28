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

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <br />
        <br />
        <br />
        {render(compile(textspans))}
        <br />
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
        <br />
        {render(compile(example))}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        {render(compile(pathTest))}
        {/* <br />
        <br />
        <br /> */}
        {/* TODO: this _doesn't_ work properly, because text measurement happens too late */}
        {/* {render(compile(course(data)))} */}
        <br />
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
        <br />
      </header>
    </div>
  );
}

export default App;
