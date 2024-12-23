import React, { useState, useEffect } from "react";

const ShortAnswerQuestion2 = ({setAnswers, answers}) => {
    const [newAnswer, setNewAnswer] = useState({
        text: "",
        is_regex: false,
        is_correct: false,
    });

    useEffect(() => {
        setAnswers(newAnswer);
      }, [newAnswer]);

    useEffect(() => {
        if(answers && answers.length > 0) {
            const [text, is_regex, is_correct] = answers[0];
            setNewAnswer({text, is_regex, is_correct});
        }
  }, [answers]);

    return (
        <div>
            <div className="input-group mb-3">
                <span className="input-group-text" id="inputGroup-sizing-default">Answer</span>
                <input type="text" className="form-control" value={answers["text"]} aria-label="Sizing example input"
                       aria-describedby="inputGroup-sizing-default" onChange={(e) => setNewAnswer({...newAnswer, text: e.target.value})}/>
            </div>

            <div className="form-check form-check-inline mb-3">
                <input className="form-check-input" checked={answers["is_regex"]} type="checkbox" id="inlineCheckbox1" value="option1" onChange={(e) =>
                    setNewAnswer({...newAnswer, is_regex: e.target.checked})
                }/>
                <label className="form-check-label" htmlFor="inlineCheckbox1">Is regex</label>
            </div>
            <br></br>
            <div className="form-check form-check-inline mb-3">
                <input className="form-check-input" type="checkbox" checked={answers["is_correct"]} id="inlineCheckbox1" value="option1" onChange={(e) =>
                    setNewAnswer({...newAnswer, is_correct: e.target.checked})
                }/>
                <label className="form-check-label" htmlFor="inlineCheckbox1">Is correct</label>
            </div>

        </div>
    )
}

export default ShortAnswerQuestion2