import React, {useEffect, useState} from 'react';
import QuizzesTableAnalysis from "./QuizzesTableAnalysis";

const QuizStatistics = () =>{
    return (
        <QuizzesTableAnalysis statisticsNavigate={"/quiz-all-users"} activeNav={"Results"} title={"Results"}></QuizzesTableAnalysis>
    )
}

export default QuizStatistics;