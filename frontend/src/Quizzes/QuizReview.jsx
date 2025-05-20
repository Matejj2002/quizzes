import {useLocation, useNavigate} from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../components/Navigation";
import QuizReviewPoints from "./QuizReviewPoints";

import 'katex/dist/katex.min.css';
import FormattedTextRenderer from "../components/FormattedTextRenderer";

const QuizReview = () =>{
    const location = useLocation();
    const navigate = useNavigate();
    const [quiz] = useState(location.state?.quiz);
    const [actualId, setActualId] = useState(location.state?.actualId ?? quiz.quizzes.length - 1);
    const [userId] = useState(location.state?.userId);
    const [quizId] = useState(location.state?.quizId);
    const [feedback] = useState(location.state?.feedback);
    const [userRole] = useState(location.state?.userRole);
    const [conditionToRetake] = useState(location.state?.conditionToRetake);
    const [userName] = useState(location.state?.userName || "");
    const [correctMode] = useState(location.state?.correctMode || false)
    const [data, setData] = useState([]);
    const [questionsData, setQuestionsData] = useState({});
    const [page, setPage] = useState(0);
    const apiUrl = process.env.REACT_APP_API_URL;
    const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;

    useEffect(() => {
        console.log("AI",actualId, "QZ", quiz);
        setData([]);
        setQuestionsData({});
    }, [actualId])


    const fetchQuestion = async (questionId, itemId) => {
        try {
            const response = await axios.get(apiUrl+`questions-quiz/${questionId}`, {
                params: {
                    item_id: itemId,
                    quiz_id: quiz.id,
                    review: true,
                    correctMode: correctMode
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
            const result = await axios.get(apiUrl+"quiz-student-load",
                {
                    params: {
                        student_id: userId,
                        quiz_id: quiz.quizzes[actualId].quiz_id,
                        load_type: "attempt"
                    }
                }
            )
            setData(result.data)
        }
        getData().then( ()=> {
        }
        )

    } , [actualId] )

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

    const handlePointsChange = (questionId, newValue) => {
      setQuestionsData(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          points: newValue,
        },
      }));
    };

    const handleSaveEvaluation = () =>{
        const updatedData = {
            questionsData: questionsData,
            id: quiz.quizzes[actualId].quiz_id
        }
        axios.put(apiUrl+`quiz_change_evaluation`, updatedData).then( () =>{
                // navigate(-1);
                window.scrollTo(0,0);
                alert("Evaluation saved.")

            }

        ).catch( () => {
            alert("Error during saving evaluation.")
        })
    }

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

            <div className="container-fluid">
                <div className="row">
                    <div className="col-2 sidebar"></div>

                    <div className="col-8">
                        <div className="d-flex justify-content-between mt-3 mb-3">
                            <button
                                className="btn btn-outline-primary me-1"
                                disabled={quiz.can_be_checked === false || actualId <= 0}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActualId(prev => prev - 1);
                                    navigate("/review-quiz", {
                                        state: {
                                            quiz: quiz,
                                            quizId: quiz.quizzes[actualId].quiz_id,
                                            feedback: quiz.feedbackTypeAfterClose,
                                            conditionToRetake: false,
                                            userId: userId,
                                            userRole: userRole,
                                            actualId: actualId
                                        }
                                    })
                                }
                                }
                            >
                                <span>Previous attempt</span>
                            </button>
                            <div className="d-flex align-items-center">
                                <span className="text-center">Attempt {actualId + 1} / {quiz.quizzes.length}</span>
                            </div>
                            <button
                                className="btn btn-outline-primary me-1"
                                disabled={quiz.can_be_checked === false || actualId >= quiz.quizzes.length-1}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActualId(prev => prev + 1);
                                    navigate("/review-quiz", {
                                        state: {
                                            quiz: quiz,
                                            quizId: quiz.quizzes[actualId].quiz_id,
                                            feedback: quiz.feedbackTypeAfterClose,
                                            conditionToRetake: false,
                                            userId: userId,
                                            userRole: userRole,
                                            actualId: actualId
                                        }
                                    })
                                }
                                }
                            >
                                <span>Next attempt</span>
                            </button>
                        </div>

                        <div className="d-flex justify-content-between">
                            <h1 className="mb-3">
                                Review {quiz.title}
                            </h1>
                            <div>
                                {feedback.includes("pointsReview") && (
                                    <QuizReviewPoints questionsData={questionsData}></QuizReviewPoints>
                                )}
                            </div>

                        </div>

                        {correctMode === true && (
                            <span className="text-secondary">Attended by {userName}</span>
                        )}


                        <ul className="nav nav-tabs mt-3" id="myTab" role="tablist">
                            {quiz.sections.map((sect, index) => (
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

                        <ul className="list-group mb-3">
                            {data.sections[page]?.questions.map((question, index) => (
                                <li className={`list-group-item ${(parseFloat(questionsData[question.id]?.points) === 0 && feedback.includes("correctAnswers")) ? 'border-danger' : ''} 
                                    ${(parseFloat(questionsData[question.id]?.points) > 0 && feedback.includes("correctAnswers")) ? 'border-success' : ''}`}

                                    style={
                                        feedback.includes("correctAnswers")
                                            ? {
                                                background: questionsData[question.id]?.points > 0
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
                                                <span
                                                    className={`badge fs-5 ms-2 mb-0 ${
                                                        Number(questionsData[question.id]?.points) === 0
                                                            ? 'bg-danger'
                                                            : 'bg-success'
                                                    }`}
                                                >
                                                      {correctMode ? (
                                                          <input
                                                              type="number"
                                                              step="0.1"
                                                              min="0"
                                                              max={questionsData[question.id]?.max_points}
                                                              value={Number(questionsData[question.id]?.points).toFixed(2)}
                                                              onChange={(e) => handlePointsChange(question.id, e.target.value)}
                                                              className="form-control form-control-sm d-inline bg-transparent text-white border-0 p-0 fs-5"
                                                              style={{width: '60px', textAlign: 'right'}}
                                                          />
                                                      ) : (
                                                          Number(questionsData[question.id]?.points).toFixed(2)
                                                      )}
                                                    /{questionsData[question.id]?.max_points}
                                                    {Number(questionsData[question.id]?.points) === 1 ? ' pt.' : ' pts.'}
                                                    </span>
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
                                                    <tr key={"table-" + idx.toString()}>
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
                                                                            <div
                                                                                className=" m-0">
                                                                                <FormattedTextRenderer
                                                                                    text={ans["rightSide"]}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div
                                                                            className="d-flex justify-content-between w-100">
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

                                                                {(!questionsData[question.id]?.isCorrect && feedback.includes("optionsFeedback") && ans?.feedback !== "" && ans.feedback !== null) && (
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
                                                           style={{ pointerEvents: 'none' }}
                                                           defaultChecked={ans.answer === true}
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
                                            <input
                                                type="text"
                                                value={questionsData[question.id]?.answers[0]["answer"]}
                                                disabled
                                                required

                                                className="form-control"
                                            />
                                            {/*<div className="d-flex">*/}
                                            {/*    <FormattedTextRenderer*/}
                                            {/*        text={questionsData[question.id]?.answers[0]["answer"]}*/}
                                            {/*    />*/}
                                            {/*</div>*/}
                                            {(!questionsData[question.id]?.isCorrect && feedback.includes("optionsFeedback") && questionsData[question.id]?.answers[0].feedback !== "") && (
                                                <p className="border border-danger p-3 rounded"
                                                   style={{background: "rgba(255, 0, 0, 0.3)"}}>
                                                    {questionsData[question.id]?.answers[0].feedback}
                                                </p>
                                            )
                                            }
                                        </div>
                                    )}

                                    {(!questionsData[question.id]?.isCorrect && feedback.includes("questionFeedback") && questionsData[question.id]?.feedback !== "" && questionsData[question.id]?.feedback !== null) && (
                                        <div className="p-3 rounded"
                                           style={{
                                               background: "rgba(255, 0, 0, 0.3)"
                                           }}>
                                            <FormattedTextRenderer
                                            text = {questionsData[question.id]?.feedback}
                                                />
                                        </div>
                                    )
                                    }

                                    {(questionsData[question.id]?.isCorrect && feedback.includes("questionFeedback") && questionsData[question.id]?.feedback !== "" && questionsData[question.id]?.feedback !== null) && (
                                        <div className="p-3 rounded"
                                           style={{
                                               background: "rgba(155,236,137,0.15)"
                                           }}>
                                            <FormattedTextRenderer
                                            text = {questionsData[question.id]?.feedback}
                                                />
                                        </div>
                                    )
                                    }


                                    {(!questionsData[question.id]?.isCorrect && feedback.includes("correctAnswers") && questionsData[question.id]?.type === "short_answer_question") && (
                                        <div className="p-3 rounded"
                                             style={{
                                                 background: "rgba(255, 165, 0, 0.3)", whiteSpace: "pre-line"
                                             }}>
                                            Correct answer is {
                                            <FormattedTextRenderer
                                                text={questionsData[question.id]?.correct_answer}
                                            />
                                        }

                                        </div>
                                    )
                                    }


                                </li>
                            ))}
                        </ul>


                        <div className="d-flex justify-content-between">
                            <div>
                                <button type="button" className="btn btn-outline-secondary me-1"
                                        onClick={() => {
                                            if (correctMode) {
                                                navigate(-1);
                                            } else {
                                                window.location.href = quizzesUrl+"/quizzes";
                                            }
                                        }
                                        }
                                >
                                    {correctMode === false ? "Back to quizzes" : "Back to user statistics"}
                                </button>
                                {(conditionToRetake && correctMode === false) && (
                                    <button
                                        className="btn btn-outline-primary me-1"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            navigate("/generated-quiz", {
                                                state: {
                                                    quiz: quiz,
                                                    refreshQuiz: true,
                                                    userId: userId,
                                                    userRole: userRole
                                                }
                                            });
                                        }}
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>
                            <div className="d-flex">
                                {correctMode && (
                                    <button type="button" className="btn btn-primary"
                                            style={{marginRight: '3px'}}
                                            onClick={handleSaveEvaluation}>
                                        Save evaluation
                                    </button>
                                )}


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