import React, { useEffect, useState } from "react";
import FormattedTextRenderer from "../components/FormattedTextRenderer";
const QuizReviewOriginal = ({quizData}) =>{
    const [quiz] = useState(quizData);
    const [page, setPage] = useState(0);

    return (
        <div>
            <ul className="nav nav-tabs mt-3" id="myTab" role="tablist">
                {quiz.map((sect, index) => (
                    <li className="nav-item" role="presentation" key={index}>
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

            {console.log(quiz[page]["questions"])}

            <ul className="list-group mb-3">
                {Object.entries(quiz[page]["questions"]).map(([id, question]) => (
                        <li className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                            <h2>{question?.question_title}</h2>
                                <div>
                                <span
                                    className="badge bg-primary fs-5 ms-2 mb-0"
                                >
                                    {question?.points} {Number(question?.points) === 1 ? ' pt.' : ' pts.'}
                                </span>
                                </div>
                            </div>

                            <div className="mb-1">
                                <FormattedTextRenderer
                                    text={question?.question_text}
                                />
                            </div>

                            {quiz[page]["questions"][id]?.question_type === "matching_answer_question" && (
                                <div className="mb-3">
                                    <table className="table table-striped">
                                        <thead>
                                        <tr>
                                            <th scope="col">
                                                <div className="d-flex justify-content-start">Left
                                                    Side
                                                </div>
                                            </th>
                                            <th scope="col">
                                                <div className="d-flex justify-content-end">Right
                                                    Side
                                                </div>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {question.sides.map((side, idx) => (
                                            <tr key={"table-" + idx.toString()}>
                                                <td style={{
                                                    borderRight: "1px solid black",
                                                    paddingBottom: "2px"
                                                }}>
                                                    <div className="d-flex justify-content-start w-100">

                                                        <FormattedTextRenderer
                                                            text={side[0]}
                                                        />
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="d-flex justify-content-start w-100">

                                                        <FormattedTextRenderer
                                                            text={side[1]}
                                                        />

                                                        {(side[2] !=="" || side[3] !=="") && (
                                                            <details>
                                                                <summary>Option Feedback</summary>
                                                                {side[2] !== "" && (
                                                                    <div className="p-3 rounded mb-1"
                                                                         style={{
                                                                             background: "rgba(255, 0, 0, 0.3)"
                                                                         }}>
                                                                        <span className="fw-bold">Negative Option Feedback</span>
                                                                        <FormattedTextRenderer
                                                                            text={side[2]}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {side[3] !== "" && (
                                                                    <div className="p-3 rounded mb-1"
                                                                         style={{
                                                                             background: "rgba(155,236,137,0.15)"
                                                                         }}>
                                                                        <span className="fw-bold">Positive Option Feedback</span>
                                                                        <FormattedTextRenderer
                                                                            text={side[3]}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </details>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                        }
                                        </tbody>
                                    </table>
                                </div>
                            )
                            }

                            {quiz[page]["questions"][id]?.question_type === "multiple_answer_question" && (
                                <div className="mb-3">
                                    {question.choices.map((choice, idx) => (
                                        <div className="form-check" key={idx}>
                                            <input className="form-check-input"
                                                   type="checkbox"
                                                   style={{pointerEvents: 'none'}}
                                                   defaultChecked={choice[1] === true}
                                            />
                                            <span className="d-flex w-100 form-check-label">

                                                                <FormattedTextRenderer
                                                                    text={choice[0]}
                                                                />
                                                </span>

                                            {(choice[2] !== "" || choice[3] !== "") && (
                                                <details>
                                                    <summary>Option Feedback</summary>
                                                    {choice[2] !== "" && (
                                                        <div className="p-3 rounded mb-1"
                                                             style={{
                                                                 background: "rgba(255, 0, 0, 0.3)"
                                                             }}>
                                                            <span className="fw-bold">Negative Option Feedback</span>
                                                            <FormattedTextRenderer
                                                                text={choice[2]}
                                                            />
                                                        </div>
                                                    )}

                                                    {choice[3] !== "" && (
                                                        <div className="p-3 rounded mb-1"
                                                             style={{
                                                                 background: "rgba(155,236,137,0.15)"
                                                             }}>
                                                            <span className="fw-bold">Positive Option Feedback</span>
                                                            <FormattedTextRenderer
                                                                text={choice[3]}
                                                            />
                                                        </div>
                                                    )}
                                                </details>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            )
                            }

                            {quiz[page]["questions"][id]?.question_type === "short_answer_question" && (
                                <div className="mb-3 mt-3">
                                    <span className="me-2 mt-3 fw-bold">Answer: </span>
                                    <input
                                        type="text"
                                        value={question?.answer_text}
                                        disabled
                                        required
                                        className="form-control"
                                    />
                                </div>
                            )
                            }

                            {quiz[page]["questions"][id]?.type === "random" && (
                                <div className="p-3 rounded mb-1">
                                    <h2>Random question</h2>
                                    <p className="h4">{question?.question_type}</p>
                                    <p className="h4">From category {question?.question_category} </p>
                                    {question.include_sub_categories ? (
                                        <p className="h4">Include subcategories</p>
                                    ) : (
                                        <p className="h4">Don't include subcategories</p>
                                    )}
                                </div>
                            )
                            }
                            <details>
                                <summary>Question Feedback</summary>
                                {question?.question_negative_feedback !== "" && (
                                    <div className="p-3 rounded mb-1"
                                         style={{
                                             background: "rgba(255, 0, 0, 0.3)"
                                         }}>
                                        <span className="fw-bold">Negative Question Feedback</span>
                                        <FormattedTextRenderer
                                            text={question?.question_negative_feedback}
                                        />
                                    </div>
                                )}

                                {question?.question_positive_feedback !== "" && (
                                    <div className="p-3 rounded"
                                         style={{
                                             background: "rgba(155,236,137,0.15)"
                                         }}>
                                        <span className="fw-bold">Positive Question Feedback</span>
                                        <FormattedTextRenderer
                                            text={question?.question_negative_feedback}
                                        />
                                    </div>

                                )}
                            </details>
                        </li>
                    )
                )
                }
            </ul>


        </div>
    )
}

export default QuizReviewOriginal;