import axios from "axios";
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "../Navigation";
import Login from "../Login";

const Quiz = () => {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);

    const fetchQuizzes = async () => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/get-quiz-templates`)
            setQuizzes(response.data.result);
      }catch (error){}
       finally {}
    }

  //   useEffect(() => {
  //   const fetchAllData = async () => {
  //     try {
  //       await fetchQuizzes();
  //     } catch (error) {
  //       console.error("Error during fetch:", error);
  //     }
  //   };
  //
  //   fetchAllData().then(() => {});
  //
  // }, []);

    useEffect(() => {
        fetchQuizzes();

        const interval = setInterval(() => {
            fetchQuizzes();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleUpdateQuiz = (e, quiz) => {
        e.preventDefault();
        navigate("/new-quiz",{
            state: {
                title: quiz.title,
                numberOfCorrections: quiz["number_of_corrections"],
                minutesToFinish: quiz["time_to_finish"],
                dateOpen: quiz["date_time_open"],
                dateClose: quiz["date_time_close"],
                dateCheck: quiz["datetime_check"],
                shuffleSections: quiz["shuffle_sections"],
                selectedOption: quiz["correction_of_attempts"],
                sections: quiz.sections,
                newUpdateQuiz: "Update",
                selectedFeedback: quiz["feedbackType"],
                quizId : quiz.id

            }
        })
    }
    const handleArchiveQuiz = (e, quiz) => {
        const updatedData = {
            quiz_template_id: quiz.id
        }
        axios.put(`http://127.0.0.1:5000/api/archive-quiz`, updatedData)
            .then(
                () => {
                    window.location.href = '/quizzes';
                }
            )
            .catch(error => {
                console.error('Error saving changes:', error);
            });
    }

    return localStorage.getItem("accessToken") ? (
            <div>
                <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                    <Navigation active = {"Quizzes"}></Navigation>
                </header>
                <div className="container-fluid" style={{ marginTop: "50px" }}>
                    <div className="row">
                        <div className="col-2 sidebar"></div>

                        <div className="col-8">
                            <h1>Quizzes</h1>
                            <button className="btn btn-primary" onClick={() => {navigate('/new-quiz');}}>
                                New Quiz
                            </button>

                            {quizzes.map((quiz) => {
                                    return (
                                        <div className="border p-3 mb-3 mt-3 ">
                                            <div className="d-flex justify-content-between">
                                                <div className="d-flex">
                                                    <h2 className="h5">
                                                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                        <a href="#" className="text-decoration-none me-1"
                                                           onClick={(e) => handleUpdateQuiz(e, quiz)}
                                                        >{quiz.title}</a>
                                                    </h2>


                                                </div>
                                                <button
                                                    className="btn btn-outline-danger btn-xs p-0 px-1"
                                                    style={{marginLeft: "25%"}}
                                                    onClick={(e) => {
                                                        if (window.confirm("Are you sure you want to archive this quiz?")) {
                                                            handleArchiveQuiz(e, quiz)
                                                        }
                                                    }
                                                    }
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>

                                            {quiz["shuffle_sections"] && (
                                                <p>Sections will be shuffled.</p>
                                            )}
                                            {!quiz["shuffle_sections"] && (
                                                <p>Sections will <strong>not</strong> be shuffled.</p>
                                            )}

                                            {quiz["correction_of_attempts"] === "option1" && (
                                                <p>Attempts are independent. </p>
                                            )}
                                            {quiz["correction_of_attempts"] === "option2" && (
                                                <p>Attempts are corrections of previous attempt.</p>
                                            )}

                                            <p>{quiz.number_of_questions} questions, {quiz.sections.length} sections</p>

                                            <div className="mb-3">
                                            <span
                                                className="m-0 text-secondary text-truncate">Time to finish (Minutes): {quiz["time_to_finish"]}</span><br/>
                                            <span
                                                className="m-0 text-secondary text-truncate">Opened from {quiz["date_time_open"]} to {quiz["date_time_close"]}</span><br/>
                                            <span
                                                className="m-0 text-secondary text-truncate">Check from {quiz["datetime_check"]}</span><br/>
                                            </div>

                                            {quiz.quizzes.length > 0 && (
                                                <details className="mb-3">
                                                    <summary className="mb-1">Older attempts</summary>
                                                    {quiz.quizzes.map((qz, ind) => (
                                                            <div
                                                                className="d-flex justify-content-between align-items-start border p-3">
                                                                <div>
                                                                    <span>Attempt {ind + 1}</span>
                                                                    <p className="text-secondary mb-0">Finished
                                                                        at {qz.ended}</p>
                                                                </div>

                                                                <div>
                                                                    <button
                                                                        className="btn btn-outline-primary"
                                                                        disabled={quiz.can_be_checked === false}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            navigate("/review-quiz", {
                                                                                state: {
                                                                                    quiz: quiz,
                                                                                    quizId: qz["quiz_id"]
                                                                                }
                                                                            });
                                                                        }}
                                                                    >
                                                                        Review
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </details>
                                            )}


                                            {quiz.is_finished ? (
                                                <div>
                                                    <button
                                                        className="btn btn-outline-primary me-1"
                                                        disabled={quiz.is_opened === false || quiz.quizzes.length + 1 >= quiz["number_of_corrections"]}
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
                                                        Attempt the quiz
                                                    </button>
                                                    {!quiz.first_generation && (
                                                        <button
                                                            className="btn btn-outline-primary me-1"
                                                            disabled={quiz.can_be_checked === false}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                navigate("/review-quiz", {
                                                                    state: {
                                                                        quiz: quiz,
                                                                        quizId: quiz.id
                                                                    }
                                                                })
                                                            }
                                                            }
                                                        >
                                                            {quiz.quizzes.length === 0 ? (<span>Review attempt</span>): (
                                                                <span>Review last attempt</span>)}
                                                        </button>
                                                    )}

                                                </div>
                                            ) : (
                                                <button
                                                    className="btn btn-outline-primary me-1"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate("/generated-quiz", {
                                                            state: {
                                                                quiz: quiz
                                                            }
                                                        });
                                                    }
                                                    }
                                                >
                                                    Continue current attempt
                                                </button>
                                            )}

                                        </div>
                                    )
                                }
                            )
                            }
                        </div>
                        <div className="col-2"></div>

                    </div>
                </div>


            </div>
    ) : (
        <div>
            <Login path={"/quizzes"}></Login>
        </div>
    )
}

export default Quiz;