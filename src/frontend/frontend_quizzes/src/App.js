import React, {useEffect} from 'react';
import {BrowserRouter as Router , Routes, Route, Navigate} from 'react-router-dom';
import Questions from "./Questions";
import NewCategory from "./NewCategory";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import NewQuestion from "./NewQuestion";
import QuestionDetail from "./QuestionDetail";
import Quizzes from "./Quizzes";
import Login from "./Login";
import QuestionCopy from "./QuestionCopy";

const Home = () => <h1>Domovska stranka</h1>;

function App() {
  return (
      <div>
              <Routes>
                  <Route path="/" element={<Home/>}/>
                  <Route path="/login" element={<Login/>}></Route>
                  <Route path="/questions" element={<Navigate to="/questions/supercategory?limit=10&offset=0" />} />
                  <Route path="/question/:id" element={<QuestionDetail />} />
                  <Route path="/question/new-question" element={<NewQuestion />} />
                  <Route path="/question/copy-question/:id" element={<QuestionCopy />} />

                  <Route path="/:questions/*" element={<Questions />} />
                  <Route path="/category/new-category" element={<NewCategory />} />
                  <Route path="/quizzes" element={<Quizzes />} />
              </Routes>
      </div>
  );
}

export default App;
