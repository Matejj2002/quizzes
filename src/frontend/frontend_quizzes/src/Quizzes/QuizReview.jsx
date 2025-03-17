import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../Navigation";
import QuizReviewPoints from "./QuizReviewPoints";
import QuizQuestionFeedback from "./QuizQuestionFeedback";

const QuizReview = () =>{
    const location = useLocation();
    const [quiz] = useState(location.state?.quiz);
    const [data, setData] = useState([]);
    const [questionsData, setQuestionsData] = useState({});
    const [page, setPage] = useState(0);

    console.log(quiz)

    const fetchQuestion = async (questionId, itemId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/questions-quiz/${questionId}`, {
                params: {
                    item_id: itemId,
                    review: true,
                    feedbackType: quiz["feedbackType"]
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
                        <h1 className="mb-3">
                            Review {quiz.title}
                        </h1>
                        {quiz["feedbackType"] === "pointsReview" && (
                            <QuizReviewPoints quiz={quiz} questionsData={questionsData} data={data} page={page} setPage={setPage}></QuizReviewPoints>
                        )}
                        {quiz["feedbackType"] === "questionFeedback" && (
                            <QuizQuestionFeedback quiz={quiz} questionsData={questionsData} data={data} page={page} setPage={setPage}></QuizQuestionFeedback>
                        )}



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