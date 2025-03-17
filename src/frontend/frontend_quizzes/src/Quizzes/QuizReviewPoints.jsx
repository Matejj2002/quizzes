import React from "react";

const QuizReviewPoints = ({quiz, questionsData, data, page, setPage}) => {

    const totalAchievedPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.points), 0);

      const totalPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.max_points), 0);

      const progressPercentage = (totalAchievedPoints / totalPoints) * 100;

    return (
        <div>
            <h4>Achieved points: <span
                className="badge bg-primary mb-3">{totalAchievedPoints} / {totalPoints}</span></h4>

            <div className="progress mb-3" role="progressbar" aria-valuenow="{progressPercentage}"
                 aria-valuemin="0" aria-valuemax="100">
                <div className="progress-bar" style={{width: `${progressPercentage}%`}}>
                    {progressPercentage}%
                </div>
            </div>

            <ul className="nav nav-tabs" id="myTab" role="tablist">
                {quiz.sections.map((sect, index) => (
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${index === page ? 'active' : ''}`}
                            id={`tab-${index}`}
                            data-bs-toggle="tab"
                            data-bs-target={`#tab-pane-${index}`}
                            type="button"
                            role="tab"
                            aria-controls={`tab-pane-${index}`}
                            aria-selected={index === page}
                            onClick={() => {
                                setPage(index)
                            }}
                        >
                            {sect?.title || "Section " + (index + 1)}
                        </button>
                    </li>
                ))}

            </ul>

            <ul className="list-group mb-3">
                {data.sections[page]?.questions.map((question, index) => (
                    <li className={"list-group-item"} key={index}>
                        <div className="d-flex">
                            <h2>{questionsData[question.id]?.title}</h2>
                        </div>
                        <p>{questionsData[question.id]?.text}</p>

                        <hr/>
                        {questionsData[question.id]?.type === "matching_answer_question" && (
                            <div className="mb-3">
                                {questionsData[question.id]?.answers.map((ans, idx) => (
                                    <div className="d-flex justify-content-between" key={idx}>
                                        <p>{ans["leftSide"]}</p>
                                        <div className="dropdown">
                                            <button
                                                className="btn dropdown-toggle"
                                                type="button"
                                                id={`dropdown-${idx}`}
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                disabled="true"
                                            >
                                                {ans.answer.length === 0 ? "Select Answer" : ans.answer}
                                            </button>
                                            <ul className="dropdown-menu"
                                                aria-labelledby={`dropdown-${idx}`}>
                                                {questionsData[question.id]?.answers.map((answ, optionIdx) => (
                                                    <li key={optionIdx}>
                                                        <a
                                                            className="dropdown-item"
                                                            href="#"
                                                        >
                                                            {answ["rightSide"]}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {questionsData[question.id]?.type === "multiple_answer_question" && (
                            <div className="mb-3">
                                {questionsData[question.id]?.answers.map((ans, idx) => (
                                    <div className="form-check" key={idx}>
                                        <input className="form-check-input"
                                               type="checkbox"
                                               disabled="true"
                                               checked={ans.answer === true}
                                        />
                                        <label className="form-check-label">{ans?.text}</label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {questionsData[question.id]?.type === "short_answer_question" && (
                            <div className="mb-3">
                                <input type="text" className="form-control mt-3"
                                       placeholder="Answer"
                                       disabled="true"
                                       value={questionsData[question.id]?.answers[0]["answer"]}
                                />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default QuizReviewPoints