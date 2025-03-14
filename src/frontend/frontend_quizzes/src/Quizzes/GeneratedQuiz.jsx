import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../Navigation";
import {clear} from "@testing-library/user-event/dist/clear";
const GeneratedQuiz = () => {
    const location = useLocation();
    const [quiz, setQuiz] = useState(location.state?.quiz);
    const [review, setReview] = useState(location.state?.review || false)
    const [refreshQuiz, setRefreshQuiz] = useState(location.state?.refreshQuiz || false);
    const [questionsData, setQuestionsData] = useState({});
    const [randomQuestions, setRandomQuestions] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [dateStart, setDateStart] = useState(0);
    const [count, setCount] = useState(-1);
    const [minutesToFinish, setMinutesToFinish] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!quiz?.sections) {
            return;
        }

        axios.post(`http://127.0.0.1:5000/api/new-quiz-template-check`, quiz)
            .then(response => {
                setRandomQuestions(response.data.result[0]);
                setNumberOfQuestions(response.data.number_of_questions)
            })
            .catch(error => {
                console.error('Error fetching random questions:', error);
            });

    }, []);

    useEffect(() => {

        const interval = setInterval(() => {
            setCount(prev => Math.max(-1, Math.floor(prev-1)));
        }, 1000);


        return () => clearInterval(interval);
    }, [dateStart, minutesToFinish]);


    useEffect(() => {
            if (count % 60 === 0 && count !== -1) {
            handleSaveQuiz(false, "C");
        }

            if (count === 0 ) {
                const updatedData = {
                    quiz_template_id: quiz.id,
                    student_id: 3
                }
                const setDateFinish = async () => {
                    axios.put(`http://127.0.0.1:5000/api/quiz-finish`, updatedData).then(
                        () => {
                        }
                    );

                }
                setCount(-1);
                setDateFinish();
                setReview(true);
            }

    }, [count]);


    const fetchQuestion = async (questionId, itemId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/questions-quiz/${questionId}`, {
                params: {
                    item_id: itemId,
                    review: review
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
        if (!quiz?.sections) {
            return;
        }

        let cnt = 0;
        const fetchQuestions = [];

        if (quiz?.sections) {
            quiz.sections.forEach((section) => {
                section.questions.forEach((question) => {
                    if (!questionsData[question.id] && question.questionType === "questions") {
                        fetchQuestions.push(fetchQuestion(question.id, question.item_id));
                    } else {
                        if (!question.id){
                            question.id = randomQuestions[cnt];
                                cnt += 1;
                                if (question.id !== undefined) {
                                    fetchQuestions.push(fetchQuestion(question.id));
                                }
                        }

                    }
                });
            });

            Promise.all(fetchQuestions).then(() => {
                setQuiz({ ...quiz }
                );
            });
        }
    }, [randomQuestions]);

    const [quizGenerated, setQuizGenerated] = useState(false);

   useEffect(() => {
    if (quizGenerated || Object.keys(questionsData).length !== numberOfQuestions || numberOfQuestions === 0) {
        return;
    }

    const generateQuizWait = async () => {
        setLoading(true);
        await generateQuiz();
        setLoading(false);
        setQuizGenerated(true);
    };

    generateQuizWait().then(() => {
    });

}, [questionsData]);


    const handleSaveQuiz = async (finalSave , res) => {
        setIsSaving(true);
        const updatedData = {
            "quiz": quiz,
            "data": questionsData,
            "finalSave": finalSave
        }
        axios.put(`http://127.0.0.1:5000/api/quiz_set_answers`, updatedData).then( () =>{
                setTimeout(() => {
                setIsSaving(false);

                if (finalSave){
                    window.location.href = "/quizzes";
                }

            }, 3000);

            }

        ).catch( () => {
            setTimeout(() => {
                setIsSaving(false);
            }, 3000);
        })

        return false;
    }

    const generateQuiz = () => {
        const updatedData = {
            "quiz": quiz,
            "questions": questionsData,
            "student_id": 3,
            "refreshQuiz": refreshQuiz
        }
        axios.put(`http://127.0.0.1:5000/api/new-quiz-student`, updatedData)
                    .then(
                        async (response) => {
                            if (!response.data["created"]) {
                                const result = await axios.get("http://127.0.0.1:5000/api/quiz-student-load",
                                    {
                                        params: {
                                            student_id: 3,
                                            quiz_id: response.data["quiz_id"]
                                        }
                                    }
                                )

                                setQuiz(prevQuiz => ({
                                    ...prevQuiz,
                                    sections: result.data.sections,
                                    answers: []
                                }));

                                const startTime = new Date(result.data.start_time);

                                const finishTime = new Date(result.data.end_time).getTime();

                                const startMilis = startTime.getTime()
                                const timeToFinish = result.data.minutes_to_finish * 60 *1000

                                const now = Date.now() + 60 * 60000;
                                const endTime = startMilis + timeToFinish;

                                const nowDate = new Date(now);
                                const endDate = new Date(endTime)

                                const differenceInMilliseconds = endDate.getTime() - nowDate.getTime();
                                const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);


                                if (now > endTime || (result.data.end_time !== null && now < finishTime) ){
                                    setCount(-1);
                                }else{
                                    setCount(differenceInSeconds);
                                }

                                setRandomQuestions([]);
                                setQuestionsData([]);
                            }else{
                                setCount(response.data.time_to_finish *60)
                            }

                            setLoading(false);
                        }
                    )
                    .catch(error => {
                        console.error('Error saving changes:', error);
                    });

    }


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <h2>Loading...</h2>
            </div>
        );
    }

    const hours = Math.floor(count / 3600);
  const minutes = Math.floor((count % 3600) / 60);
  const seconds = count % 60;
  const showTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  let totalAchievedPoints = 0;
  if (review && count === -1) {
      totalAchievedPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.points), 0);
  }
  let totalPoints = 0;
  if (review && count === -1) {
      totalPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.max_points), 0);
  }

  let progressPercentage = (totalAchievedPoints / totalPoints) * 100;

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
                        {
                            (count === -1 && review === true) ? (
                                <div>
                                    <h3>
                                        Review {quiz.title}
                                    </h3>
                                    <h4>Achieved points: <span
                                        className="badge bg-primary">{totalAchievedPoints} / {totalPoints}</span></h4>

                                    <div className="progress" role="progressbar" aria-valuenow="{progressPercentage}"
                                         aria-valuemin="0" aria-valuemax="100">
                                        <div className="progress-bar" style={{width: `${progressPercentage}%`}}>
                                            {progressPercentage}%
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex justify-content-between">
                                    <div><h1>{quiz.title}</h1></div>
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-clock text-primary" style={{fontSize: '2rem', marginRight: "2px"}}></i>
                                        {
                                            count < 30 ? (
                                                    <span
                                                        className="text-xl font-bold text-danger">{showTime}</span>
                                            ) : (
                                                <span className="text-xl font-bold">{showTime}</span>
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }
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
                                        {sect.title || "Section " + (index + 1)}
                                    </button>
                                </li>
                            ))}

                            <li className="nav-item ms-auto" role="presentation">
                                {isSaving && (
                                    <span
                                        id="disabled-tab" data-bs-toggle="tab"
                                        aria-controls="disabled-tab-pane"
                                    >Saving ...
                                </span>
                                )}
                            </li>
                        </ul>

                        <ul className="list-group mb-3">
                            {quiz.sections[page]?.questions.map((question, index) => (
                                <li className={`list-group-item ${review && !questionsData[question.id]?.isCorrect ? 'border-danger' : ''} 
              ${review && questionsData[question.id]?.isCorrect ? 'border-success' : ''}`} key={index}>
                                    <div className="d-flex justify-content-between">
                                    <h2>{questionsData[question.id]?.title}</h2>
                                        {( review && questionsData[question.id]?.isCorrect) && (
                                            <div className="d-flex">
                                            <i className="bi bi-check-circle text-success fs-3"></i>
                                                <p className="text-success">{questionsData[question.id]?.points}b.</p>
                                            </div>
                                        )}
                                        {(review && !questionsData[question.id]?.isCorrect) && (
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
                                            {/*<p><strong>Matching question</strong></p>*/}

                                            {questionsData[question.id].answers.map((ans, idx) => (
                                                <div className="d-flex justify-content-between" key={idx}>
                                                <p>{ans["leftSide"]}</p>
                                                    <div className="dropdown">
                                                        <button
                                                            className="btn dropdown-toggle"
                                                            type="button"
                                                            id={`dropdown-${idx}`}
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                            disabled={count === -1}
                                                        >
                                                            {ans.answer.length === 0 ? "Select Answer" : ans.answer}
                                                        </button>
                                                        <ul className="dropdown-menu"
                                                            aria-labelledby={`dropdown-${idx}`}>
                                                            {questionsData[question.id].answers.map((answ, optionIdx) => (
                                                                <li key={optionIdx}>
                                                                    <a
                                                                        className="dropdown-item"
                                                                        href="#"
                                                                        onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setQuestionsData(prevData => ({
                                                                            ...prevData,
                                                                            [question.id]: {
                                                                                ...prevData[question.id],
                                                                                answers: prevData[question.id].answers.map((item, index) =>
                                                                                    index === idx
                                                                                        ? {
                                                                                            ...item,
                                                                                            answer: answ["rightSide"]
                                                                                          }
                                                                                        : item
                                                                                )
                                                                            }
                                                                        }));
                                                                    }}
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
                                            {/*<p><strong>Multiple answer question</strong></p>*/}
                                            {questionsData[question.id].answers.map((ans, idx) => (
                                                <div className="form-check" key={idx}>
                                                    <input className="form-check-input"
                                                           type="checkbox"
                                                           disabled={count === -1}
                                                           checked={ans.answer === true}

                                                           onChange={(e) => {
                                                               const isChecked = e.target.checked;

                                                               setQuestionsData((prevData) => ({
                                                                   ...prevData,
                                                                [question.id]: {
                                                                  ...prevData[question.id],
                                                                  answers: prevData[question.id].answers.map((item, index) =>
                                                                    index === idx ? { ...item, answer: isChecked } : item
                                                                  ),
                                                                },
                                                              }));
                                                            }}
                                                />
                                                <label className="form-check-label">{ans.text}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {questionsData[question.id]?.type === "short_answer_question" && (
                                    <div className="mb-3">
                                        {/*<p><strong>Short answer question</strong></p>*/}
                                        <input type="text" className="form-control mt-3"
                                               placeholder="Answer"
                                               disabled={count === -1}
                                                value={questionsData[question.id]?.answers[0]["answer"]}
                                               onChange={(e) => {
                                                    const newAnswer = e.target.value;

                                                    setQuestionsData((prevData) => ({
                                                      ...prevData,
                                                      [question.id]: {
                                                        ...prevData[question.id],
                                                        answers: [{ answer: newAnswer }],
                                                      },
                                                    }));
                                                  }}

                                        />
                                    </div>
                                )}

                                    {(review && !questionsData[question.id]?.isCorrect) && (
                                        <p className="border border-danger p-3 rounded" style={{background: "rgba(255, 0, 0, 0.3)"}}>
                                            {questionsData[question.id]?.feedback}
                                        </p>
                                    )
                                    }
                                </li>
                            ))}
                        </ul>

                        <br></br>
                        <div className="d-flex justify-content-between">
                            <button type="button" className="btn btn-outline-secondary"
                                    onClick={() => {
                                        if (count !==-1){
                                        handleSaveQuiz(false);
                                        }
                                        window.location.href = "/quizzes";}
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
                                    <button type="button" className="btn btn-success"
                                            style={{marginRight: '3px'}}
                                            disabled={count===-1}
                                            onClick={() => handleSaveQuiz(false, "B")}
                                    >
                                        Save
                                    </button>

                                    {page+1 >= quiz.sections.length ? (
                                        <button type="button" className="btn btn-primary"
                                                style={{marginRight: '3px'}}
                                                disabled={count === -1}
                                                onClick={() => handleSaveQuiz(true, "A")}
                                        >
                                            Save & Finish
                                        </button>
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

                    <div className="col-2"></div>
                </div>
            </div>
        </div>


    );
};

export default GeneratedQuiz;
