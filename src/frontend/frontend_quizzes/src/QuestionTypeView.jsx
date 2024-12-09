import SelectedTypeDisplay from "./SelectedTypeDisplay";
import axios from 'axios';
import React, {useState} from "react";
const QuestionTypeView = ({setAnswers, setType, handleAnswersChange, startType, answersBe} ) => {
    const [isOpenQT, setIsOpenQT] = useState(false);
    const [selectedType, setSelectedType] = useState(startType);

    const questionsTypes = ['MatchingQuestion', 'ShortAnswerQuestion', 'MultipleChoiceQuestion'];

    const toggleOpenQuestionType = () => {
        setIsOpenQT(!isOpenQT);
    }
    const handleTypeClick = async (index, item) => {
        setType(item);
        setSelectedType(item);
        setAnswers({});
        setIsOpenQT(false);
    }

    return (
        <div>
            <div className="container">
                <button
                    onClick={toggleOpenQuestionType}
                    className={`collapsible ${isOpenQT ? "active" : ""}`}
                >
                    {selectedType}
                </button>
                {isOpenQT && (
                    <div className="content-menu">
                        <ul className="task-list-menu">
                            {questionsTypes.map((item, index) => (
                                <li key={index}
                                    onClick={() => handleTypeClick(index, item)}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div>
                <SelectedTypeDisplay selectedType={selectedType} onAnswersChange={handleAnswersChange} answersBe = {answersBe}/>
            </div>

        </div>
    )
}

export default QuestionTypeView;