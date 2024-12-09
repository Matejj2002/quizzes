import React, { useState, useEffect } from "react";
import './MultipleChoiceQuestion.css'

const MultipleChoiceQuestion = ({onAnswersChange}) => {
    const [questions, setQuestions] = useState([""]);
    const [isChecked, setIsChecked] = useState(false);

    const handleInputChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);

    if (value !== "" && index === questions.length - 1) {
      setQuestions([...updatedQuestions, ""]);
    }
  };

    const handleCheckboxChange = (e) => {
        setIsChecked(e.target.checked);
        setQuestions([""]);
        console.log(e.target.checked);
    }

    useEffect(() => {
        onAnswersChange(questions.filter((q) => q.trim() !== ""));
      }, [questions, onAnswersChange]);

    console.log(questions);
    const renderContent = () => {
        if (isChecked){
            return <div>
                <input className='input-box'
                       type="text"
                       placeholder={`Single Answer`}
                       onChange={(e) => handleInputChange(0, e.target.value)}
                       />
            </div>
        }else{
            return <div>
                {questions.map((question, index) => (
                <input className='input-box'
                       key={index}
                       type="text"
                       value={question}
                       onChange={(e) => handleInputChange(index, e.target.value)}
                       placeholder={`Option ${index + 1}`}
                />
            ))
            }
            </div>
        }
    }

    return (
        <div className="multiple-choice-question">
            <h3>Multiple Choice Question</h3>
            <div className="checkbox-container">
                <input
                    type="checkbox"
                    name="single-answer"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
                <p>Is single answer</p>
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    )
}

export default MultipleChoiceQuestion;