import React, { useState, useEffect } from "react";

const MatchingQuestion = ({setAnswers , answers}) => {
    const [questions, setQuestions] = useState([{ left: "", right: "", positive: "", negative:"" }]);

    useEffect(() => {
    if (answers && answers.length > 0) {
      const updatedQuestions = answers.map((answerPair) => ({
        left: answerPair["left"],
        right: answerPair["right"],
          positive : answerPair["positive"],
          negative : answerPair["negative"]
      }));
      setQuestions([...updatedQuestions, {left: "", right: "", positive: "", negative:""}]);
    }
  }, []);

    const handleInputChange = (index, side, value) => {
        const updatedQuestions = [...questions];
        if (side ==="left"){
            updatedQuestions[index].left = value;
            setQuestions(updatedQuestions);
        }else {
            updatedQuestions[index].right = value;
            setQuestions(updatedQuestions);
        }
        if (value !== "" && index === questions.length - 1) {
          if (questions[index].left !== "" && questions[index].right !== "") {
                setQuestions([...updatedQuestions, {left: "", right: ""}]);
            }
        }

    }

    const handleFeedbackChange = (index, value, typeFeed) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][typeFeed] = value;
        setQuestions(updatedQuestions);

    }

    useEffect(() => {
        setAnswers(questions.filter((q) => q.left.trim() !== "" && q.right!==""));
      }, [questions]);


    return (
        <div>
            {questions.map((question, index) => (
                    <div className="input-group mb-3" key={index}>
                        <input type="text" className="form-control" value={question.left} placeholder="Left Side"
                               onChange={(e) => handleInputChange(index, 'left', e.target.value)}/>
                        <input type="text" className="form-control me-3" value={question.right} placeholder="Right Side"
                               onChange={(e) => handleInputChange(index, 'right', e.target.value)}/>

                        <div className="dropdown">
                            <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown"
                                    aria-expanded="false" data-bs-auto-close="outside">
                                Feedback
                            </button>
                            <form className="dropdown-menu p-4 w-auto">
                                <div className="mb-3">
                                    <label className="form-label">Positive</label>
                                    <input type="email" className="form-control" value={question["positive"]}
                                           placeholder="Feedback"
                                           onChange={(e) => handleFeedbackChange(index, e.target.value, "positive")}/>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Negative</label>
                                    <input type="Feedback" className="form-control" value={question["negative"]}
                                           placeholder="Feedback"
                                           onChange={(e) => handleFeedbackChange(index, e.target.value, "negative")}/>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            )

            }
        </div>
    )
}

export default MatchingQuestion