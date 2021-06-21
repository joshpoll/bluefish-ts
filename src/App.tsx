import './App.css';
import { example } from './example';
import render from './render';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {render(example)};
      </header>
    </div>
  );
}

export default App;
