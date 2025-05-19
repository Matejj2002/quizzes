import React, { useEffect, useState } from 'react';
import QuizzesTableAnalysis from "./QuizzesTableAnalysis";
const QuizStatistics = () => {
  return /*#__PURE__*/React.createElement(QuizzesTableAnalysis, {
    statisticsNavigate: "/quiz-all-users",
    activeNav: "Results",
    title: "Quiz Statistics"
  });
};
export default QuizStatistics;