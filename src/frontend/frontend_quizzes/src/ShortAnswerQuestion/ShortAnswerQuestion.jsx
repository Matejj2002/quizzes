import React, { useState, useEffect } from "react";

const ShortAnswerQuestion = ({setAnswers, answers}) => {
    const [newAnswer, setNewAnswer] = useState({
        text: "",
        is_regex: false,
        positive_feedback: "",
        negative_feedback: ""
    });

    useEffect(() => {
        setAnswers(newAnswer);
      }, [newAnswer]);

    useEffect(() => {
        if(answers && answers.length > 0) {
            const [text, is_regex, positive_feedback, negative_feedback] = answers[0];
            setNewAnswer({text, is_regex, positive_feedback, negative_feedback});
        }
  }, [answers]);

    return (
        <div>
            <div className="input-group mb-3">
                <span className="input-group-text" id="inputGroup-sizing-default">Answer</span>
                <input type="text" className="form-control" value={answers["text"]} aria-label="Sizing example input"
                       aria-describedby="inputGroup-sizing-default"
                       onChange={(e) => setNewAnswer({...newAnswer, text: e.target.value})}/>

                <div className="dropdown">
                    <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown"
                            aria-expanded="false" data-bs-auto-close="outside">
                        Feedback
                    </button>
                    <form className="dropdown-menu p-4 w-auto">
                        <div className="mb-3">
                            <label className="form-label">Positive</label>
                            <input type="email" className="form-control" value={answers["positive_feedback"]}
                                   placeholder="Feedback"
                                   onChange={(e) =>
                    setNewAnswer({...newAnswer, positive_feedback: e.target.value})
                }/>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Negative</label>
                            <input type="Feedback" className="form-control" value={answers["negative_feedback"]}
                                   placeholder="Feedback"
                                   onChange={(e) =>
                    setNewAnswer({...newAnswer, negative_feedback: e.target.value})
                }/>
                        </div>
                    </form>
                </div>
            </div>

            <div className="form-check form-check-inline mb-3">
                <input className="form-check-input" checked={answers["is_regex"]} type="checkbox" id="inlineCheckbox1"
                       value="option1" onChange={(e) =>
                    setNewAnswer({...newAnswer, is_regex: e.target.checked})
                }/>
                <label className="form-check-label" htmlFor="inlineCheckbox1">Is regex</label>
            </div>
        </div>
    )
}

export default ShortAnswerQuestion