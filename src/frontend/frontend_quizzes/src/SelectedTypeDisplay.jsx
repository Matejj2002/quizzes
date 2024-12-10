import React from "react";
import MultipleChoiceQuestion from "./MultipleChoiceQuestions/MultipleChoiceQuestion";
import ShortAnswerQuestion from "./ShortAnswerQuestion/ShortAnswerQuestion";
import MatchingQuestion from "./MatchingAnswerQuestions/MatchingQuestion";

const SelectedTypeDisplay = ({ selectedType, onAnswersChange, answersBe}) => {
    switch (selectedType) {
        case 'MatchingQuestion':
            return <MatchingQuestion onAnswersChange = {onAnswersChange} answersBe = {answersBe} />
        case 'ShortAnswerQuestion':
            return <ShortAnswerQuestion onAnswersChange = {onAnswersChange} answersBe = {answersBe}/>
        case 'MultipleChoiceQuestion':
            return <MultipleChoiceQuestion onAnswersChange={onAnswersChange} answersBe={answersBe} />;
        default:
            return <div>Choose question category</div>
    }
}

export default SelectedTypeDisplay