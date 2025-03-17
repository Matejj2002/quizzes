
const QuizQuestionFeedback = ({quiz, questionsData, data, page, setPage}) =>{
    return (
        <div>
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
            <li className={`list-group-item ${!questionsData[question.id]?.isCorrect ? 'border-danger' : ''} 
                                    ${questionsData[question.id]?.isCorrect ? 'border-success' : ''}`}

                style={{
                        background: questionsData[question.id]?.isCorrect
                            ? "rgba(155,236,137,0.15)"
                            : "rgba(255, 0, 0, 0.04)"
                    }}

                key={index}>
                <div className="d-flex justify-content-between">
                    <h2>{questionsData[question.id]?.title}</h2>
                    {questionsData[question.id]?.isCorrect && (
                        <div className="d-flex">
                            <i className="bi bi-check-circle text-success fs-3"></i>
                            <p className="text-success">{questionsData[question.id]?.points}b.</p>
                        </div>
                    )}
                    {!questionsData[question.id]?.isCorrect && (
                        <div className="d-flex">
                            <i className="bi bi-x-circle text-danger fs-3"></i>
                            <p className="text-danger">{questionsData[question.id]?.points}b.</p>
                        </div>
                    )}
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

                {!questionsData[question.id]?.isCorrect && (
                    <p className="border border-danger p-3 rounded"
                       style={{background: "rgba(255, 0, 0, 0.3)"}}>
                        {questionsData[question.id]?.feedback}
                    </p>
                )
                }
            </li>
        ))}
    </ul>
            </div>
)
}

export default QuizQuestionFeedback;