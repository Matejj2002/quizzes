import React, { useState, useEffect } from "react";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const ShortAnswerQuestion = ({setAnswers, answers, prepareTextForLatex}) => {
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
            <p>{<InlineMath>{prepareTextForLatex(answers["text"])}</InlineMath>}</p>
            <div className="input-group">
                <span className="input-group-text" id="inputGroup-sizing-default">Answer</span>
                <input type="text" className="form-control" value={answers["text"]} aria-label="Sizing example input"
                       aria-describedby="inputGroup-sizing-default"
                       onChange={(e) => setNewAnswer({...newAnswer, text: e.target.value})}/>
            </div>

            <details className="mt-3 mb-3" style={{textAlign: "left"}}>
                <summary>
                    Feedback
                </summary>
                <div className="p-4 w-auto mb-3">
                    <form>
                        <p>{<InlineMath>{prepareTextForLatex(answers["positive_feedback"])}</InlineMath>}</p>
                        <div className="d-flex align-items-center mb-3">
                            <label className="form-label">Positive&nbsp;&nbsp;</label>
                            <input
                                type="text"
                                className="form-control"
                                value={answers["positive_feedback"]}
                                placeholder="Feedback"
                                onChange={(e) =>
                                    setNewAnswer({...newAnswer, positive_feedback: e.target.value})
                                }
                            />
                        </div>
                        <p>{<InlineMath>{prepareTextForLatex(answers["negative_feedback"])}</InlineMath>}</p>
                        <div className="d-flex align-items-center">
                            <label className="form-label">Negative</label>
                            <input
                                type="text"
                                className="form-control"
                                value={answers["negative_feedback"]}
                                placeholder="Feedback"
                                onChange={(e) =>
                                    setNewAnswer({...newAnswer, negative_feedback: e.target.value})
                                }
                            />
                        </div>
                    </form>
                </div>
            </details>

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