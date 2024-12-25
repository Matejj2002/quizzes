import React, { useState, useEffect } from "react";

const MultipleChoiceQuestion = ({setAnswers, answers}) => {
    const [questions, setQuestions] = useState([""]);
    const [isChecked, setIsChecked] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState([false]);
    const [feedback, setFeedback] = useState([{"positive":"", "negative":""}]);


    useEffect(() => {
        if (answers["texts"] && answers["texts"].length > 0) {
            setQuestions([...answers["texts"], ""]);
            setCorrectAnswers([...answers["correct_ans"], false]);
            setFeedback([...answers["feedback"], {"positive":"", "negative":""}])
        }
    }, [answers]);
    const handleInputChange = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = value;
        setQuestions(updatedQuestions);

        if (value !== "" && index === questions.length - 1) {
          setQuestions([...updatedQuestions, ""]);
          setCorrectAnswers([...correctAnswers, false]);
            setFeedback([...feedback, {"positive":"", "negative":""}]);
            }
      };

    const handleFeedbackChange = (index, value, typeFeedback) => {
        const updatedFeedback = [...feedback];
        updatedFeedback[index][typeFeedback] = value;
        setFeedback(updatedFeedback);
    }

    const handleCheckboxChange = (index, checked) => {
        const updatedAnswers = [...correctAnswers];
        updatedAnswers[index] = checked;
        setCorrectAnswers(updatedAnswers);
    };

    useEffect(() => {
        setAnswers({"text" : questions.filter((q) => q.trim() !== ""), "is_single": isChecked, "correct_answers": correctAnswers, "feedback": feedback});
      }, [questions, correctAnswers, feedback]);

    console.log(feedback);
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
                <div className="input-group mb-3">
                    <div className="input-group-text">
                        <input className="form-check-input mt-0" type="checkbox" checked={correctAnswers[index]}
                               key={index}
                               onChange={(e) =>
                                   handleCheckboxChange(index, e.target.checked)
                               }
                        />
                    </div>

                    <input className='form-control me-3'
                           key={index}
                           type="text"
                           value={question}
                           onChange={(e) => handleInputChange(index, e.target.value)}
                           placeholder={`Option`}
                    />


                    <div className="dropdown">
                        <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown"
                                aria-expanded="false" data-bs-auto-close="outside">
                            Feedback
                        </button>
                        <form className="dropdown-menu p-4 w-auto">
                            <div className="mb-3">
                                <label className="form-label">Positive</label>
                                <input type="email" className="form-control" value={feedback[index]["positive"]}
                                       placeholder="Feedback" onChange={(e) => handleFeedbackChange(index, e.target.value, "positive")}/>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Negative</label>
                                <input type="Feedback" className="form-control" value={feedback[index]["negative"]}
                                       placeholder="Feedback" onChange={(e) => handleFeedbackChange(index, e.target.value, "negative")}/>
                            </div>
                        </form>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MultipleChoiceQuestion