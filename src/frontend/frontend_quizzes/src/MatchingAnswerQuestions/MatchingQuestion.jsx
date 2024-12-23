import React, { useState, useEffect } from "react";

const MatchingQuestion = ({setAnswers , answers}) => {
    const [questions, setQuestions] = useState([{ left: "", right: "" }]);

    useEffect(() => {
    if (answers && answers.length > 0) {
      const updatedQuestions = answers.map((answerPair) => ({
        left: answerPair["left"],
        right: answerPair["right"],
      }));
      setQuestions([...updatedQuestions, {left: "", right: ""}]);
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

    useEffect(() => {
        setAnswers(questions.filter((q) => q.left.trim() !== "" && q.right!==""));
      }, [questions]);



    return (
        <div>
            {questions.map((question, index) => (
                <div className="input-group mb-3" key = {index}>
                    <input type="text" className="form-control" value = {question.left} placeholder="Left Side" onChange={(e) => handleInputChange(index, 'left', e.target.value)}/>
                    <input type="text" className="form-control" value = {question.right} placeholder="Right Side" onChange={(e) => handleInputChange(index, 'right', e.target.value)}/>
                </div>
                )
            )

            }
        </div>
    )
}

export default MatchingQuestion