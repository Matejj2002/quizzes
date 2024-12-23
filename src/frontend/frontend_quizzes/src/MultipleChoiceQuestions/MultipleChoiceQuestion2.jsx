import React, { useState, useEffect } from "react";

const MultipleChoiceQuestion2 = ({setAnswers, answers}) => {
    const [questions, setQuestions] = useState([""]);
    const [isChecked, setIsChecked] = useState(false);


    useEffect(() => {
        if (answers && answers.length > 0) {
            setQuestions([...answers, ""]);
        }
    }, []);

    const handleInputChange = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = value;
        setQuestions(updatedQuestions);

        if (value !== "" && index === questions.length - 1) {
          setQuestions([...updatedQuestions, ""]);
            }
      };


    useEffect(() => {
        setAnswers(questions.filter((q) => q.trim() !== ""));
      }, [questions]);

    return (
        <div>
            <div className="form-check form-check-inline mb-3">
                <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"
                       onChange={(e) =>
                           setIsChecked(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="inlineCheckbox1">Is single answer</label>
            </div>
            {questions.map((question, index) => (
                <input className='form-control'
                       key={index}
                       type="text"
                       value={question}
                       onChange={(e) => handleInputChange(index, e.target.value)}
                       placeholder={`Option`}
                />
            ))}
        </div>
    )
}

export default MultipleChoiceQuestion2