import {useLocation, useNavigate} from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../Navigation";
import QuizReviewPoints from "./QuizReviewPoints";

import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import "./MathText.css"
import FormattedTextRenderer from "../components/FormattedTextRenderer";

const QuizReview = () =>{
    const location = useLocation();
    const navigate = useNavigate();
    const [quiz] = useState(location.state?.quiz);
    const [quizId] = useState(location.state?.quizId);
    const [feedback] = useState(location.state?.feedback)
    const [conditionToRetake] = useState(location.state?.conditionToRetake)
    const [data, setData] = useState([]);
    const [questionsData, setQuestionsData] = useState({});
    const [page, setPage] = useState(0);

    const fetchQuestion = async (questionId, itemId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/questions-quiz/${questionId}`, {
                params: {
                    item_id: itemId,
                    review: true,
                    feedbackType: feedback
                }});

            setQuestionsData(prevData => ({
                ...prevData,
                [questionId]: response.data
            }));

        } catch (error) {
            console.error('Error fetching question:', error);
        }
    };

    useEffect(() => {

        const getData = async () => {
            const result = await axios.get("http://127.0.0.1:5000/api/quiz-student-load",
                {
                    params: {
                        student_id: localStorage.getItem("idUser"),
                        quiz_id: quizId
                    }
                }
            )
            setData(result.data)
        }
        getData().then( ()=> {
        }
        )

    } , [] )

    useEffect(() => {
        const fetchQuestions = [];

        if (data?.sections) {
            data.sections.forEach((section) => {
                section.questions.forEach((question) => {
                    fetchQuestions.push(fetchQuestion(question.id, question.item_id));
                });
            });

            Promise.all(fetchQuestions).then(() => {
            });
        }
    }, [data])

    if (data.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <div>

                <Navigation active="Quizzes"></Navigation>

            <div className="container-fluid" style={{marginTop: "50px"}}>
                <div className="row">
                    <div className="col-2 sidebar"></div>

                    <div className="col-8">
                        <h1 className="mb-3">
                            Review {quiz.title}
                        </h1>
                        {feedback.includes("pointsReview") && (
                            <QuizReviewPoints questionsData={questionsData}></QuizReviewPoints>
                        )}

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
                                <li className={`list-group-item ${(!questionsData[question.id]?.isCorrect && feedback.includes("correctAnswers")) ? 'border-danger' : ''} 
                                    ${(questionsData[question.id]?.isCorrect && feedback.includes("correctAnswers")) ? 'border-success' : ''}`}


                                    style={
                                        feedback.includes("correctAnswers")
                                            ? {
                                                background: questionsData[question.id]?.isCorrect
                                                    ? "rgba(155,236,137,0.15)"
                                                    : "rgba(255, 0, 0, 0.04)",
                                            }
                                            : {}
                                    }

                                    key={index}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h2>{questionsData[question.id]?.title}</h2>

                                        {feedback.includes("pointsReview") && (
                                            <div>
                                                {questionsData[question.id]?.isCorrect ? (
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-check-circle text-success fs-3"></i>
                                                        <p className="text-success fs-3 ms-2 mb-0">{questionsData[question.id]?.points}{questionsData[question.id]?.points === 1 ? "pt." : "pts."}</p>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-x-circle text-danger fs-3"></i>
                                                        <p className="text-danger fs-3 ms-2 mb-0">{questionsData[question.id]?.points}{questionsData[question.id]?.points === 1 ? "pt." : "pts."}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-1">
                                        <FormattedTextRenderer
                                                                        text={questionsData[question.id]?.text}
                                                                      />
                                    </div>

                                            {questionsData[question.id]?.type === "matching_answer_question" && (
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
                                                        {questionsData[question.id].answers.map((ans, idx) => (
                                                            <tr>
                                                                <td style={{
                                                                    borderRight: "1px solid black",
                                                                    paddingBottom: "2px"
                                                                }}>
                                                                    <div className="d-flex justify-content-start w-100">

                                                                        <FormattedTextRenderer
                                                                        text={ans["leftSide"]}
                                                                      />
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex justify-content-start w-100">
                                                                        {feedback.includes("correctAnswers") ? (
                                                                            ans.answer !== ans["rightSide"] ? (
                                                                                <div className="w-100">
                                                                                    <div
                                                                                        className="d-flex justify-content-between w-100">
                                                                                        <div
                                                                                            className="me-1">
                                                                                            <p className="mb-0 fw-bold">Your
                                                                                                answer
                                                                                                is</p>
                                                                                            {ans.answer.length === 0 ? "No answer" :

                                                                                                <FormattedTextRenderer
                                                                                                    text={ans.answer}
                                                                                                />
                                                                                            }
                                                                                        </div>

                                                                                        <span
                                                                                            className="d-flex text-danger justify-content-end me-0">
                                                                                            <i className="bi bi-x-circle-fill fs-5"></i>
                                                                                        </span>

                                                                                    </div>

                                                                                    <p className="mb-0 fw-bold">Correct answer
                                                                                        is</p>
                                                                                    <p
                                                                                        className=" m-0">
                                                                                        <FormattedTextRenderer
                                                                                            text={ans["rightSide"]}
                                                                                          />
                                                                                    </p>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="d-flex justify-content-between w-100">
                                                                                        <span
                                                                                            className="ms-2">
                                                                                            <FormattedTextRenderer
                                                                                            text={ans["rightSide"]}
                                                                                          />
                                                                                        </span>

                                                                                        <span
                                                                                            className="d-flex text-success justify-content-end me-0">
                                                                                            <i className="bi bi-check-circle-fill fs-5"></i>
                                                                                        </span>
                                                                                </div>
                                                                            )
                                                                        ) : (
                                                                            <span>{ans.answer}</span>
                                                                        )}

                                                                        {(!questionsData[question.id]?.isCorrect && feedback.includes("optionsFeedback") && ans?.feedback !== "") && (
                                                                            <p className="border border-danger p-3 rounded"
                                                                               style={{background: "rgba(255, 0, 0, 0.3)"}}>
                                                                                {ans?.feedback}
                                                                            </p>
                                                                        )
                                                                        }
                                                                    </div>

                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {questionsData[question.id]?.type === "multiple_answer_question" && (
                                                <div className="mb-3">
                                                    {questionsData[question.id]?.answers.map((ans, idx) => (
                                                        <div className="form-check" key={idx}>
                                                            <input className="form-check-input"
                                                                   type="checkbox"
                                                                   // disabled="true"
                                                                   checked={ans.answer === true}
                                                            />
                                                            <span className="d-flex w-100 form-check-label">

                                                                <FormattedTextRenderer
                                                                    text={ans?.text}
                                                                />

                                                            {(!questionsData[question.id]?.isCorrect && feedback.includes("correctAnswers")) && (
                                                                !ans.isCorrectOption
                                                                    ? <span className="ms-2 text-danger"><i
                                                                        className="bi bi-x-circle-fill fs-5"></i></span>
                                                                    : <span className="ms-2 text-success"><i
                                                                        className="bi bi-check-circle-fill fs-5"></i></span>
                                                            )}
                                                                </span>

                                                            {(!questionsData[question.id]?.isCorrect && feedback.includes("optionsFeedback") && ans?.feedback !== "") && (
                                                                <p className="border border-danger p-3 rounded"
                                                                   style={{background: "rgba(255, 0, 0, 0.3)"}}>
                                                                    {ans?.feedback}
                                                                </p>
                                                            )
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {questionsData[question.id]?.type === "short_answer_question" && (
                                                <div className="mb-3 mt-3">
                                                    <span className="me-2 mt-3 fw-bold">Answer: </span>
                                                    <div className="d-flex fw-bold">
                                                        <FormattedTextRenderer
                                                            text={questionsData[question.id]?.answers[0]["answer"]}
                                                        />
                                                    </div>
                                                    {(!questionsData[question.id]?.isCorrect && feedback.includes("optionsFeedback") && questionsData[question.id]?.answers[0].feedback !== "") && (
                                                        <p className="border border-danger p-3 rounded"
                                                           style={{background: "rgba(255, 0, 0, 0.3)"}}>
                                                            {questionsData[question.id]?.answers[0].feedback}
                                                        </p>
                                                    )
                                                    }
                                                </div>
                                            )}

                                            {(!questionsData[question.id]?.isCorrect && feedback.includes("questionFeedback") && questionsData[question.id]?.feedback !== "") && (
                                                <p className="p-3 rounded"
                                                   style={{
                                                       background: "rgba(255, 0, 0, 0.3)"
                                                   }}>
                                                    {questionsData[question.id]?.feedback}
                                                </p>
                                            )
                                            }

                                            {(questionsData[question.id]?.isCorrect && feedback.includes("questionFeedback") && questionsData[question.id]?.feedback !== "") && (
                                                <p className="p-3 rounded"
                                                   style={{
                                                       background: "rgba(155,236,137,0.15)"
                                                   }}>
                                                    {questionsData[question.id]?.feedback}
                                                </p>
                                            )
                                            }


                                            {(!questionsData[question.id]?.isCorrect && feedback.includes("correctAnswers") && questionsData[question.id]?.type === "short_answer_question") && (
                                                <p className="p-3 rounded"
                                                   style={{
                                                       background: "rgba(255, 165, 0, 0.3)", whiteSpace: "pre-line"
                                                   }}>
                                                    Correct answer is {
                                                    <FormattedTextRenderer
                                                        text={questionsData[question.id]?.correct_answer}
                                                    />
                                                }

                                                </p>
                                            )
                                            }


                                </li>
                                ))}
                        </ul>


                        <div className="d-flex justify-content-between">
                            <div>
                                <button type="button" className="btn btn-outline-secondary me-1"
                                        onClick={() => {
                                            window.location.href = "/quizzes";
                                        }
                                        }
                                >
                                    Back to Quizzes
                                </button>
                                {conditionToRetake && (
                                    <button
                                        className="btn btn-outline-primary me-1"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            navigate("/generated-quiz", {
                                                state: {
                                                    quiz: quiz,
                                                    refreshQuiz: true,
                                                }
                                            });
                                        }}
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>
                            <div>
                                {page === 0 ? (
                                    <div></div>
                                ) : (
                                    <button type="button" className="btn btn-primary" disabled={page === 0}
                                            style={{marginRight: '3px'}}
                                            onClick={() => setPage((prev) => prev - 1)}>
                                        <i className="bi bi-caret-left"></i> Back to {quiz.sections[page - 1].title}

                                    </button>
                                )}

                                {page + 1 >= quiz.sections.length ? (
                                    <div></div>
                                ) : (
                                    <button type="button" className="btn btn-primary"
                                            disabled={page + 1 >= quiz.sections.length}
                                            onClick={() => setPage((prev) => prev + 1)}>
                                        Next {quiz.sections[page + 1].title} <i className="bi bi-caret-right"></i>
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>

                    <div className="col-2 sidebar"></div>
                </div>

            </div>

        </div>
    )
}

export default QuizReview;