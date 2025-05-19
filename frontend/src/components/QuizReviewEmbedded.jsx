import {useLocation, useNavigate} from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../components/Navigation";
import QuizReviewPoints from "../Quizzes/QuizReviewPoints";

import 'katex/dist/katex.min.css';
import FormattedTextRenderer from "../components/FormattedTextRenderer";
import QuizAttempt from "./QuizAttempt";

const QuizReviewEmbedded = ({handleAttempt,quizRew, userIdRew, quizIdRew, feedbackRew, backendUrl, handleReviewData, keyAtt}) =>{
    const [quiz, setQuiz] = useState(quizRew);
    const [userId] = useState(userIdRew);
    const [quizId, setQuizId] = useState(quizIdRew);
    const [feedback] = useState(feedbackRew);

    const [data, setData] = useState([]);
    const [questionsData, setQuestionsData] = useState({});
    const [page, setPage] = useState(0);
    const [questionsLoaded, setQuestionsLoaded] = useState(false);

    useEffect(() => {
        setQuiz(JSON.parse(JSON.stringify(quizRew || {})));
        setData([]);
        setQuizId(quizIdRew);
        setQuestionsData({});
        setPage(0);
        setQuestionsLoaded(false);
    }, [keyAtt, JSON.stringify(quizRew?.quizzes)]);

    const fetchQuestion = async (questionId, itemId) => {
        try {
            const response = await axios.get(backendUrl+`questions-quiz/${questionId}`, {
                params: {
                    item_id: itemId,
                    quiz_id: quiz.id,
                    review: true,
                    correctMode: false
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
        if (quiz.quizzes.length === 0){
            return ;
        }
        const getData = async () => {

            const userString = localStorage.getItem("user");
            const user = JSON.parse(userString);
            const response = await axios.get(backendUrl+`get-user-data_logged` ,
                {
                    params: {"userName": user["login"],
                            "avatarUrl": user["avatar_url"]
                    }
                }
            )

            const result = await axios.get(backendUrl+"quiz-student-load",
                {
                    params: {
                        student_id: response.data.result["id_user"],
                        quiz_id: quizId,
                        load_type: "attempt"
                    }
                }
            )
            await setData(result.data)
        }
        getData().then( ()=> {
        }
        )

    } , [quizId, quiz] )

    useEffect(() => {
        const fetchQuestions = [];

        if (data?.sections) {
            data.sections.forEach((section) => {
                section.questions.forEach((question) => {
                    fetchQuestions.push(fetchQuestion(question.id, question.item_id));
                });
            });

            Promise.all(fetchQuestions).then(() => {
                setQuestionsLoaded(true);
            });
        }
    }, [data])


    const handleChooseId = (idQuiz) => {
          setQuizId(idQuiz);
        };


    if (data.length === 0 || !questionsLoaded) {
        return (
            <div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-2 sidebar"></div>

                    <div className="col-8">
                        <h2 className="mb-3">
                            {quiz.title}
                        </h2>

                        <QuizAttempt quizEmb={quiz} handleAttempt={handleAttempt}
                                     handleReviewData={handleReviewData}></QuizAttempt>
                    </div>
                    <div className="col-2 sidebar"></div>
                </div>
            </div>
            </div>
        );
    }

    return (
        <div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-2 sidebar"></div>

                    <div className="col-8">
                        <div className="d-flex justify-content-between">
                            <h2 className="mb-3">
                                {quiz.title}
                            </h2>

                            <div>
                                {feedback.includes("pointsReview") && (
                                    <QuizReviewPoints questionsData={questionsData}></QuizReviewPoints>
                                )}
                            </div>

                        </div>

                        <QuizAttempt quizEmb={quiz} handleAttempt={handleAttempt}
                                     handleReviewData={handleReviewData} keyAtt={keyAtt}></QuizAttempt>

                        {!quiz.can_be_checked && (
                            <h2>Quiz can't be reviewed</h2>
                        )}

                        {!quiz.is_finished && (
                            <h2>Can't review quiz. Quiz already opened.</h2>
                        )}

                        {(quiz.can_be_checked && quiz.quizzes.length!==0 && quiz.is_finished) && (
                            <div>
                        <select className="form-select mb-3 mt-3" onChange={(e) => handleChooseId(e.target.value)}>
                            {quiz.quizzes
                                .slice()
                                .reverse()
                                .map((q, index, arr) => (
                                    <option key={q.quiz_id} value={q.quiz_id}>
                                        Review attempt {arr.length - index}
                                    </option>
                                ))}
                        </select>

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

                                                          {Number(questionsData[question.id]?.points).toFixed(2)}

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
                                                        // disabled="true"
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
                                        <p className="p-3 rounded"
                                           style={{
                                               background: "rgba(255, 0, 0, 0.3)"
                                           }}>
                                            {questionsData[question.id]?.feedback}
                                        </p>
                                    )
                                    }

                                    {(questionsData[question.id]?.isCorrect && feedback.includes("questionFeedback") && questionsData[question.id]?.feedback !== "" && questionsData[question.id]?.feedback !== null) && (
                                        <p className="p-3 rounded"
                                           style={{
                                               background: "rgba(155,236,137,0.15)"
                                           }}>
                                            {questionsData[question.id]?.feedback}
                                        </p>
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
                            </div>
                            <div className="d-flex">

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
                            )}
                    </div>

                    <div className="col-2 sidebar"></div>
                </div>

            </div>

        </div>
    )
}

export default QuizReviewEmbedded;