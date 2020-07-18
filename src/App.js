import React from 'react';
import logo from './logo.svg';
import './App.css';
import PrefectureComponent from "./PrefectureComponent"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <PrefectureComponent displaytext="Population Trend By Prefecture"/>
      </header>
    </div>
  );
}

export default App;
