import './App.css';
import * as Simple from './simple';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {Simple.render(Simple.encoding)};
      </header>
    </div>
  );
}

export default App;
