import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Questions from './Questions';
import QuestionDetail from './QuestionDetail'

const Home = () => <h1>Domovska stranka</h1>;

function App() {
  return (
      <div>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/questions" element={<Questions/>}/>
              <Route path="/question/:id" element={<QuestionDetail />} />
          </Routes>
      </div>
  );
}

export default App;
