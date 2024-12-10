import React, { useState, useEffect } from "react";

const MatchingQuestion = ({onAnswersChange, answersBe}) => {
    const [questions, setQuestions] = useState([{ left: "", right: "" }]);

    useEffect(() => {
    if (answersBe && answersBe.length > 0) {
      const updatedQuestions = answersBe.map((answerPair) => ({
        left: answerPair[0],
        right: answerPair[1],
      }));

      setQuestions([...updatedQuestions, {left: "", right: ""}]);
    }
  }, [answersBe]);
    const handleInputChange = (index, side, value) => {
        const updatedQuestions = [...questions];
        if (side ==="left"){
            updatedQuestions[index].left = value;
            setQuestions(updatedQuestions);
        }else{
            updatedQuestions[index].right = value;
            setQuestions(updatedQuestions);
        }
      //setQuestions(updatedQuestions);
      if (value !== "" && index === questions.length - 1) {
          if (questions[index].left !== "" && questions[index].right !== "") {
                setQuestions([...updatedQuestions, {left: "", right: ""}]);
            }
        }

      //console.log(questions);
      };

    useEffect(() => {
        onAnswersChange(questions.filter((q) => q.left.trim() !== "" && q.right!==""));
      }, [questions, onAnswersChange]);

    return (
        <div>
            {questions.map((question, index) => (
                <div key={index}>
                    <input
                           type="text"
                           value={question.left}
                           onChange={(e) => handleInputChange(index, 'left', e.target.value)}
                           placeholder={`Left ${index + 1}`}
                    />
                    <input
                           type="text"
                           value={question.right}
                           onChange={(e) => handleInputChange(index, 'right', e.target.value)}
                           placeholder={`Right ${index + 1}`}
                    />
                </div>
            ))
            }
        </div>
    )
}

export default MatchingQuestion;