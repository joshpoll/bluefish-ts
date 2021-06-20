import React from 'react';
import logo from './logo.svg';
import './App.css';
import { parse, /* foo, */ bar, baz, simpleExample } from './Parser';
import { makeBBoxVars } from './KiwiBBox';
import * as kiwi from 'kiwi.js';
import { toBBoxes, toConstraints } from './Encoding';
import * as Simple from './Simple';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit
          {' '}
          <code>src/App.tsx</code>
          {' '}
          and save to reload.
          {/* {
            console.log(parse('foo'))
          } */}
          {/* {
            console.log(foo())
          } */}
          {/* {
            console.log(baz())
          } */}
          {/* {
            console.log("makeBBoxVars", makeBBoxVars("foo"))
          } */}
          {/* {
            toBBoxes(baz())
          } */}
          {/* {
            toConstraints(simpleExample, baz())
          } */}
        </p>
        {Simple.render(Simple.encoding)};
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
