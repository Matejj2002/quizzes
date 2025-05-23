import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../components/Navigation";
import QuizReviewPoints from "./QuizReviewPoints";

import 'katex/dist/katex.min.css';
import FormattedTextRenderer from "../components/FormattedTextRenderer";
import QuizReviewOriginal from "./QuizReviewOriginal";

const QuizReview = () =>{
    const [searchParams] = useSearchParams();
    const quizTemplateId = searchParams.get("quiz_template_id") ?? 0;
    const actualId = parseInt(searchParams.get("actualQuiz"))-1;
    const userId = parseInt(searchParams.get("user_id"));
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState([]);
    const [conditionToRetake, setConditionToRetake] = useState([]);
    const correctMode = searchParams.get("correctMode") === "true";
    const [data, setData] = useState([]);
    const [questionsData, setQuestionsData] = useState({});
    const [page, setPage] = useState(0);
    const [actualType, setActualType] = useState("SeenByStudent");

    const [userData, setUserData] = useState([]);
    const [userName, setUserName] = useState("");
    const [quiz, setQuiz] = useState([]);
    const [quizLoaded, setQuizLoaded] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL;
    const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;

    useEffect(() => {
        getUserLogged().then(() =>{
            setQuiz();
            setQuizLoaded(false);
            setData([]);
            setQuestionsData({});
        })

    }, [actualId])

    const fetchQuizzes = async (templateId) => {
        try {
            const response = await axios.get(apiUrl + `get-quiz-templates`,
                {
                    params: {"studentId": userId, "templateId": templateId}
                }
            )
            setQuiz(response.data.result[0]);
            if (response.data.result[0].is_opened){
                setFeedback(response.data.result[0].feedbackType);
            }else{
                setFeedback(response.data.result[0].feedbackTypeAfterClose);
            }

            setUserName(response.data.author);
            setConditionToRetake((response.data.result[0].number_of_corrections > response.data.result[0].quizzes.length ) && response.data.result[0].is_opened)
            setQuizLoaded(true);


        }catch (error){
            console.error(error);
      }
       finally {}
    }

    async function getUserLogged(){
        const data = JSON.parse(localStorage.getItem("data"));
        try{
            const response = await axios.get(apiUrl+`get-user-data_logged` ,
                {
                    params: {"userName": data["login"],
                            "avatarUrl": data["avatar_url"]
                    }
                }
            )
            if (response.data.result["role"] !== "teacher" && (userId !== response.data.result["id_user"] || correctMode === true)){
                navigate("quizzes");
            }

            setUserData(response.data.result);
            fetchQuizzes(quizTemplateId);
      }catch (error){
            console.error(error);
      }
       finally {}
    }

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
            if (quiz?.quizzes?.length > 0) {
                const result = await axios.get(apiUrl + "quiz-student-load",
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
        }
        getData().then( ()=> {
        }
        )

    } , [quizLoaded] )

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

    const handleChooseId = (actId) => {
        navigate("/review-quiz?quiz_template_id="+quiz.id.toString()+"&user_id="+userId.toString()+"&actualQuiz="+(parseInt(actId)+1).toString()+"&correctMode="+correctMode)
    }

    const handleChangeType = (newType) =>{
        setActualType(newType);
    }


    const sectionsToRender = actualType === "Original" ? data.sections_ordered : data.sections;


    return (
        <div>

                <Navigation active="Quizzes"></Navigation>

            <div className="container-fluid">
                <div className="row">
                    <div className="col-2 sidebar"></div>

                    <div className="col-8">
                        <div className="d-flex justify-content-between mt-3">
                            <h1 className="mb-3">
                                {quiz?.title}
                            </h1>
                            <div>
                                {feedback.includes("pointsReview") && (
                                    <QuizReviewPoints questionsData={questionsData}></QuizReviewPoints>
                                )}
                            </div>

                        </div>

                        {correctMode === true && (
                            <span className="text-secondary mb-3">Attended by {userName}</span>
                        )}

                        <div className="mb-3 mt-1">
                        <label className="text-center" htmlFor={"quizAttempt"}
                        >Attempt</label>
                        <select className="form-select mb-3 mt-2" id="quizAttempt" onChange={(e) => handleChooseId(e.target.value)}
                                value={actualId}>
                            {quiz?.quizzes
                                .slice()
                                .reverse()
                                .map((q, index, arr) => (
                                    <option key={q.quiz_id} value={quiz?.quizzes.length - index - 1}>
                                        {q?.started}
                                    </option>
                                ))}
                        </select>
                            </div>


                        {userData["role"] === "teacher" && (
                            <div className="mb-3 mt-1">
                                <label className="text-center" htmlFor={"quizType"}
                                >Question and answer order:</label>
                                <select className="form-select mb-3 mt-2" id="quizType" value={actualType}
                                        onChange={(e) => handleChangeType(e.target.value)}>
                                    <option key={"Original"} value={"Original"}>Original</option>
                                    <option key={"SeenByStudent"} value={"SeenByStudent"}>As seen by student</option>
                                </select>
                            </div>
                        )}

                            <div>
                                <ul className="nav nav-tabs mt-3" id="myTab" role="tablist">
                                    {sectionsToRender.map((sect, index) => (
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
                                    {sectionsToRender[page]?.questions.map((question, index) => (
                                        <li className={`list-group-item ${(parseFloat(questionsData[question.id]?.points) === 0 && feedback.includes("correctAnswers")) ? 'border-danger' : ''} 
                                ${(parseFloat(questionsData[question.id]?.points) > 0 && parseFloat(questionsData[question.id]?.points) !== parseFloat(questionsData[question.id]?.max_points) && feedback.includes("correctAnswers")) ? 'border-warning' : ''} 
                                    ${(parseFloat(questionsData[question.id]?.points) === parseFloat(questionsData[question.id]?.max_points) && feedback.includes("correctAnswers")) ? 'border-success' : ''}`}

                                            style={
                                                feedback.includes("correctAnswers")
                                                    ? {
                                                        background: parseFloat(questionsData[question.id]?.points) === parseFloat(questionsData[question.id]?.max_points)
                                                            ? "rgba(155,236,137,0.15)"
                                                            : parseFloat(questionsData[question.id]?.points) === 0
                                                                ? "rgba(255, 0, 0, 0.04)"
                                                                : "rgba(255, 255, 0, 0.1)",
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
                                                        parseFloat(questionsData[question.id]?.points) === parseFloat(questionsData[question.id]?.max_points)
                                                            ? 'bg-success'
                                                            : parseFloat(questionsData[question.id]?.points) === 0
                                                                ? 'bg-danger'
                                                                : 'bg-warning'
                                                    }`}
                                                >
                                                      {correctMode ? (
                                                          <input
                                                              type="text"
                                                              value={questionsData[question.id]?.points}
                                                              onChange={(e) => handlePointsChange(question.id, e.target.value)}
                                                              className="form-control form-control-sm d-inline bg-white border-0 p-0 fs-5"
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
                                                        {(actualType !== "Original" ? questionsData[question.id].answers : questionsData[question.id].answers_ordered).map((ans, idx) => (
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
                                                                            (ans.answer !== ans["rightSide"]) ? (
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

                                                                                    <p className="mb-0 fw-bold">Correct
                                                                                        answer
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
                                                                            <span><FormattedTextRenderer
                                                                                text={ans.answer}
                                                                            /></span>
                                                                        )}

                                                                        {ans.answer !== ans["rightSide"] && feedback.includes("optionsFeedback") && ans?.negative_feedback !== "" ? (

                                                                            <div className="p-3 rounded"
                                                                            style={{
                                                                            background: "rgba(255, 0, 0, 0.3)"
                                                                                }}>
                                                                                <FormattedTextRenderer
                                                                                    text={ans?.negative_feedback}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            ans?.positive_feedback !== "" && (
                                                                            <div className="p-3 rounded"
                                                                            style={{
                                                                            background: "rgba(155,236,137,0.15)"
                                                                                }}>
                                                                                <FormattedTextRenderer
                                                                                    text={ans?.positive_feedback}
                                                                                />
                                                                            </div>
                                                                            )
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
                                                    {(actualType !== "Original" ? questionsData[question.id].answers : questionsData[question.id].answers_ordered).map((ans, idx) => (
                                                            <div className="form-check" key={idx}>
                                                                <input className="form-check-input"
                                                                       type="checkbox"
                                                                       style={{pointerEvents: 'none'}}
                                                                       defaultChecked={ans.answer === true}
                                                                />

                                                                <span className="d-flex w-100 form-check-label">

                                                                <FormattedTextRenderer
                                                                    text={ans?.text}
                                                                />

                                                                    {feedback.includes("correctAnswers") && (
                                                                        !ans.isCorrectOption
                                                                            ? <span className="ms-2 text-danger"><i
                                                                                className="bi bi-x-circle-fill fs-5"></i></span>
                                                                            : <span className="ms-2 text-success"><i
                                                                                className="bi bi-check-circle-fill fs-5"></i></span>
                                                                    )}
                                                                </span>

                                                                {!ans.isCorrectOption && feedback.includes("optionsFeedback") && ans?.negative_feedback !== "" ? (
                                                                    <div className="p-3 rounded"
                                                                    style={{
                                                                    background: "rgba(255, 0, 0, 0.3)"
                                                                        }}>
                                                                        <FormattedTextRenderer
                                                                            text={ans?.negative_feedback}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    ans?.positive_feedback !== "" && (
                                                                    <div className="p-3 rounded"
                                                                    style={{
                                                                    background: "rgba(77,210,44,0.15)"
                                                                        }}>
                                                                        <FormattedTextRenderer
                                                                            text={ans?.positive_feedback}
                                                                        />
                                                                    </div>

                                                        )
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

                                                    {(parseFloat(questionsData[question.id]?.points) !== parseFloat(questionsData[question.id]?.max_points) && feedback.includes("optionsFeedback") && questionsData[question.id]?.answers[0].feedback !== "") && (
                                                        <div className="p-3 rounded"
                                                        style={{
                                                        background: "rgba(255, 0, 0, 0.3)"
                                                            }}>
                                                            <FormattedTextRenderer
                                                                text={questionsData[question.id]?.answers[0].feedback}
                                                            />
                                                        </div>

                                            )
                                            }
                                        </div>
                                    )}

                                    {(parseFloat(questionsData[question.id]?.points) !== parseFloat(questionsData[question.id]?.max_points) && feedback.includes("questionFeedback") && questionsData[question.id]?.negative_feedback !== "") && (
                                        <div className="p-3 rounded"
                                             style={{
                                                         background: "rgba(255, 0, 0, 0.3)"
                                                     }}>
                                                    <FormattedTextRenderer
                                                        text={questionsData[question.id]?.negative_feedback}
                                                    />
                                                </div>
                                            )
                                            }

                                            {(parseFloat(questionsData[question.id]?.points) === parseFloat(questionsData[question.id]?.max_points) && feedback.includes("questionFeedback") && questionsData[question.id]?.positive_feedback !== "") && (
                                                <div className="p-3 rounded"
                                                     style={{
                                                         background: "rgba(155,236,137,0.15)"
                                                     }}>
                                                    <FormattedTextRenderer
                                                        text={questionsData[question.id]?.positive_feedback}
                                                    />
                                                </div>
                                            )
                                            }


                                            {(parseFloat(questionsData[question.id]?.points) !== parseFloat(questionsData[question.id]?.max_points) && feedback.includes("correctAnswers") && questionsData[question.id]?.type === "short_answer_question") && (
                                                <div className="p-3 rounded mt-3"
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
                                                        window.location.href = quizzesUrl + "/quizzes";
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
                                                            userId: userData["id_user"],
                                                            userRole: userData["role"]
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
                                                <i className="bi bi-caret-left"></i> Back
                                                to {data?.sections[page - 1]?.title}

                                            </button>
                                        )}

                                        {page + 1 >= quiz?.sections.length ? (
                                            <div></div>
                                        ) : (
                                            <button type="button" className="btn btn-primary"
                                                    disabled={page + 1 >= quiz?.sections.length}
                                                    onClick={() => setPage((prev) => prev + 1)}>
                                                Next {data?.sections[page + 1].title} <i
                                                className="bi bi-caret-right"></i>
                                            </button>
                                        )}

                                    </div>

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