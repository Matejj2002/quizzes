import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../Navigation";
import QuizReviewPoints from "./QuizReviewPoints";

const QuizReview = () =>{
    const location = useLocation();
    const [quiz] = useState(location.state?.quiz);
    const [data, setData] = useState([]);
    const [questionsData, setQuestionsData] = useState({});
    const [page, setPage] = useState(0);
    const totalAchievedPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.points), 0);

      const totalPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.max_points), 0);

      const progressPercentage = (totalAchievedPoints / totalPoints) * 100;


    const fetchQuestion = async (questionId, itemId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/questions-quiz/${questionId}`, {
                params: {
                    item_id: itemId,
                    review: true
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
                        student_id: 3,
                        quiz_id: quiz.id
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
            <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                <Navigation orderNav={[<a className="navbar-brand" href="http://localhost:3000/quizzes">Quizzes</a>,
                    <a className="nav-link"
                       href="http://localhost:3000/questions/supercategory?limit=10&offset=0">Questions</a>,
                    <a className="nav-link" aria-current="page"
                       href="http://127.0.0.1:5000/admin/">Admin</a>]}></Navigation>
            </header>
            <div className="container-fluid" style={{marginTop: "50px"}}>
                <div className="row">
                    <div className="col-2 sidebar"></div>

                    <div className="col-8">
                        <h1>
                            Review {quiz.title}
                        </h1>
                        {quiz["feedbackType"] === "pointsReview" && (
                            <QuizReviewPoints quiz={quiz} questionsData={questionsData}></QuizReviewPoints>
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
                                <li className={`list-group-item ${!questionsData[question.id]?.isCorrect ? 'border-danger' : ''} 
              ${questionsData[question.id]?.isCorrect ? 'border-success' : ''}`} key={index}>
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

                        <div className="d-flex justify-content-between">
                            <button type="button" className="btn btn-outline-secondary"
                                    onClick={() => {
                                        window.location.href = "/quizzes";
                                    }
                                    }
                            >
                                Back to Quizzes
                            </button>
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