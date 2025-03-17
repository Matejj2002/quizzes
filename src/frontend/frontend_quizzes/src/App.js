import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import Questions from "./Questions/Questions";
import NewCategory from "./Categories/NewCategory";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import NewQuestion from "./Questions/NewQuestion";
import QuestionDetail from "./Questions/QuestionDetail";
import Login from "./Login";
import QuestionCopy from "./Questions/QuestionCopy";
import NewQuiz from "./Quizzes/NewQuiz";
import Quiz from "./Quizzes/Quiz";
import GeneratedQuiz from "./Quizzes/GeneratedQuiz";
import QuizReview from "./Quizzes/QuizReview";

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
                  <Route path="/new-quiz" element={<NewQuiz />} />
                  <Route path="/quizzes" element={<Quiz />} />
                  <Route path="/generated-quiz" element={<GeneratedQuiz />} />
                  <Route path="/review-quiz" element={<QuizReview/>}></Route>
              </Routes>
      </div>
  );
}

export default App;
