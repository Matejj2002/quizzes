import React, { useState, useEffect } from "react";

const ShortAnswerQuestion = ({onAnswersChange, answersBe}) => {
    const [questions, setQuestions] = useState([""]);
  const [newAnswer, setNewAnswer] = useState({
    text: "",
    is_regex: false,
    is_correct: false,
    });

    useEffect(() => {
    onAnswersChange(newAnswer);
  }, [newAnswer, onAnswersChange]);

    useEffect(() => {
        if(answersBe && answersBe.length > 0) {
            const [text, is_regex, is_correct] = answersBe[0];
            setNewAnswer({text, is_regex, is_correct});
        }
  }, [answersBe]);

    return <div>
        <h1>Short Answer Question</h1>
        <input
            type="text"
            placeholder="Answer text"
            value={newAnswer.text}
            onChange={(e) => setNewAnswer({...newAnswer, text: e.target.value})}
        />
        <label>
            Is Regex:
            <input
                type="checkbox"
                checked={newAnswer.is_regex}
                onChange={(e) =>
                    setNewAnswer({...newAnswer, is_regex: e.target.checked})
                }
            />
        </label>
        <label>
            Is Correct:
            <input
                type="checkbox"
                checked={newAnswer.is_correct}
                onChange={(e) =>
                    setNewAnswer({...newAnswer, is_correct: e.target.checked})
                }
            />
        </label>
    </div>
}

export default ShortAnswerQuestion;