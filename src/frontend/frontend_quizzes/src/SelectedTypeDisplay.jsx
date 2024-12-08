import React from "react";
import MultipleChoiceQuestion from "./MultipleChoiceQuestions/MultipleChoiceQuestion";

const SelectedTypeDisplay = ({ selectedType, onAnswersChange, answersBe}) => {
    switch (selectedType) {
        case 'MatchingQuestion':
            return <div>Matching Question</div>
        case 'ShortAnswerQuestion':
            return <div>Short Answer Question</div>
        case 'MultipleChoiceQuestion':
            return <MultipleChoiceQuestion onAnswersChange={onAnswersChange} answersBe={answersBe} />;
        default:
            return <div>Choose question category</div>
    }
}

export default SelectedTypeDisplay