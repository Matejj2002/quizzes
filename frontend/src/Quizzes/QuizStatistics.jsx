import React, {useEffect, useState} from 'react';
import QuizzesTableAnalysis from "./QuizzesTableAnalysis";

const QuizStatistics = () =>{
    return (
        <QuizzesTableAnalysis statisticsNavigate={"/quiz-all-users"} activeNav={"Results"} title={"Quiz Statistics"}></QuizzesTableAnalysis>
    )
}

export default QuizStatistics;