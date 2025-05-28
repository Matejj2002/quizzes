import React, { useState, useEffect } from "react";
import FormattedTextRenderer from "../../components/FormattedTextRenderer";

const MatchingQuestion = ({setAnswers , answers, distractors, isDisabled, setDistractors, selectedVersion, versions}) => {
    const [questions, setQuestions] = useState([{ left: "", right: "", positive: "", negative:"" }]);
    const [distractorsPom, setDistractorsPom] = useState([{distractorV: ""}]);

    useEffect(() => {
    if (versions && versions.length > 0) {
        try {
            const updatedQuestions = versions[selectedVersion]["answers"].map((answerPair) => ({
                left: answerPair["left"],
                right: answerPair["right"],
                positive: answerPair["positive"],
                negative: answerPair["negative"]
            }));

            setQuestions([...updatedQuestions, {left: "", right: "", positive: "", negative: ""}]);
        }catch{

        }
    }
  }, [selectedVersion, versions]);

    useEffect(() => {
    if (distractors && distractors.length > 0) {
      const updatedDist = distractors.map((distr) => ({
        distractorV: distr["distractorV"],
      }));
      setDistractorsPom([...updatedDist, {distractorV: ""}]);
    }
  }, [distractors]);

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

    const handleChangeDistractros = (index, value) => {
        const updatedDistractors = [...distractorsPom];
        updatedDistractors[index].distractorV = value;
        setDistractorsPom(updatedDistractors);

        if (value !== "" && index === distractorsPom.length - 1) {
            if (distractorsPom[index] !== "") {
                setDistractorsPom([...updatedDistractors, {distractorV: ""}]);
            }
            }
    }

    const handleFeedbackChange = (index, value, typeFeed) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][typeFeed] = value;
        setQuestions(updatedQuestions);

    }

    useEffect(() => {
        const filteredAnswers = questions.filter(
            (q) => q.left.trim() !== "" && q.right.trim() !== ""
        );
        setAnswers((prevAnswers) => {
            if (JSON.stringify(prevAnswers) !== JSON.stringify(filteredAnswers)) {
                return filteredAnswers;
            }
            return prevAnswers;
        });
    }, [questions, setAnswers]);

    useEffect(() => {
        const filteredDist = distractorsPom.filter(
            (q) => q.distractorV.trim() !== ""
        );

        setDistractors((prevDist) => {
             if (JSON.stringify(prevDist) !== JSON.stringify(filteredDist)) {
                return filteredDist;
            }
            return prevDist;
        })
    }, [distractorsPom]);

    return (
        <div>
            {questions.map((question, index) => (
                    <div key={'qv-'+index}>
                    <div className="input-group mt-3" key={index}>
                        <input type="text" className="form-control" value={question.left} placeholder="Left Side" disabled={isDisabled}
                               onChange={(e) => handleInputChange(index, 'left', e.target.value)}/>
                        <input type="text" className="form-control me-3" value={question.right} placeholder="Right Side" disabled={isDisabled}
                               onChange={(e) => handleInputChange(index, 'right', e.target.value)}/>
                    </div>

                <details className="mt-1 mb-3"  style={{textAlign:"left"}}>
                    <summary>
                        Feedback
                    </summary>

                    <form className="w-auto">
                        <label className="form-label" htmlFor={`matching-option-pos-${index}`}>Positive Feedback</label>
                        <div className="d-flex justify-content-between">
                            <textarea
                                id={`matching-option-pos-${index}`}
                                className="form-control w-50 me-2"
                                disabled={isDisabled}
                                value={question["positive"]}
                                onChange={(e) =>
                                    handleFeedbackChange(index, e.target.value, "positive")
                                }
                                rows={4}
                                required
                            />

                            <div className="w-50  border border-1 p-2">
                                <FormattedTextRenderer
                                    text={question["positive"]}
                                />
                            </div>
                        </div>

                        <label className="form-label" htmlFor={`matching-option-neg-${index}`}>Negative Feedback</label>
                        <div className="d-flex justify-content-between">
                            <textarea
                                id={`matching-option-neg-${index}`}
                                className="form-control w-50 me-2"
                                disabled={isDisabled}
                                value={question["negative"]}
                                onChange={(e) =>
                                    handleFeedbackChange(index, e.target.value, "negative")
                                }
                                rows={4}
                                required
                            />

                            <div className="w-50  border border-1 p-2">
                                <FormattedTextRenderer
                                    text={question["negative"]}
                                />
                            </div>
                        </div>

                    </form>
                </details>
                    </div>
                )
            )}

            <h3>Right sides distractors</h3>
            {distractorsPom.map((distractor, index) => (
                <div key={index}>
                    <input type="text" className="form-control mb-1" value={distractor.distractorV} placeholder="Add Distractor"
                           disabled={isDisabled}
                           onChange={(e) => handleChangeDistractros(index, e.target.value)}/>
                </div>
            ))}
        </div>
    )
}

export default MatchingQuestion