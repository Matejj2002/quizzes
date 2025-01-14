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
                    <div>
                    <div className="input-group mt-3" key={index}>
                        <input type="text" className="form-control" value={question.left} placeholder="Left Side"
                               onChange={(e) => handleInputChange(index, 'left', e.target.value)}/>
                        <input type="text" className="form-control me-3" value={question.right} placeholder="Right Side"
                               onChange={(e) => handleInputChange(index, 'right', e.target.value)}/>
                    </div>

                <details className="mt-1">
                    <summary className="btn btn-primary">
                        Feedback
                    </summary>
                    <form className="w-auto">
                    <div className="d-flex align-items-center">
                                    <label className="form-label">Positive&nbsp;&nbsp;</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={question["positive"]}
                                        placeholder="Feedback"
                                        onChange={(e) => handleFeedbackChange(index, e.target.value, "positive")}
                                    />
                                </div>
                                <div className="d-flex align-items-center">
                                    <label className="form-label">Negative</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={question["negative"]}
                                        placeholder="Feedback"
                                        onChange={(e) => handleFeedbackChange(index, e.target.value, "negative")}
                                    />
                                </div>
                            </form>
                        </details>
                        </div>
                )
            )

            }
        </div>
    )
}

export default MatchingQuestion