import axios from "axios";
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "../components/Navigation";

const Quiz = () => {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [updateAt, setUpdateAt] = useState(null);
    const [userData, setUserData] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;

    const fetchQuizzes = async () => {
      try{
            const response = await axios.get(apiUrl+`get-quiz-templates` ,
                {
                    params: {"studentId": userData["id_user"]}
                }
            )
            setQuizzes(response.data.result);
            setUpdateAt(response.data.update_at);
      }catch (error){
            console.error(error);
            window.location.href="/login";
      }
       finally {}
    }

    async function getUserData() {
        await fetch(apiUrl+"getUserData", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("accessToken")
                }
            }
        ).then((response) => {
            return response.json();
        }).then((data) => {
            setUserData(data);

        })
    }

    useEffect(() => {
        getUserData().then(() => {
        });
    }, []);

    useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
        fetchQuizzes();
    }
}, [userData]);

    useEffect(() => {
        if (!updateAt) return;
        const interval = setInterval(() => {
            const updt = new Date(updateAt).getTime();
            if (Date.now() + 2*60 * 60000 >= updt){
                fetchQuizzes();
            }else{
                console.log(updt, Date.now(), new Date().getTime());
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [updateAt]);


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
                feedbackTypeAfterClose: quiz["feedbackTypeAfterClose"],
                quizId : quiz.id

            }
        })
    }

    const getDate = (time) =>{
        const dt = new Date(time);
        const da = new Date(dt);
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        return `${days[da.getDay()]} ${months[da.getMonth()]} ${da.getDate()} ${da.getFullYear()} ${da.getHours()}:${da.getMinutes().toString().padStart(2, '0')}:00`;
    }

    const handleArchiveQuiz = (e, quiz) => {
        const updatedData = {
            quiz_template_id: quiz.id
        }
        axios.put(apiUrl+`archive-quiz`, updatedData)
            .then(
                () => {
                    window.location.href = '/quizzes';
                }
            )
            .catch(error => {
                console.error('Error saving changes:', error);
            });
    }

    return (
            <div>
                <Navigation active = {"Quizzes"}></Navigation>

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-2 sidebar"></div>

                        <div className="col-8">
                            <h1>Quizzes</h1>
                            {userData["role"] !== "student" && (
                                <button className="btn btn-primary mb-3" onClick={() => {
                                    navigate('/new-quiz', {
                                        state:{
                                            userRole: userData["role"]
                                        }
                                    });
                                }}>
                                    New Quiz
                                </button>
                            )}

                            {quizzes.map((quiz, ind) => {
                                    return (
                                        <div className={`border p-3 mb-3 mt-3 ${quiz.actual_quiz ? 'border-success' : ''}`} key={ind}>
                                            <div className="d-flex justify-content-between">
                                                <div className="d-flex">
                                                    <h2 className="h5">
                                                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                        <a href="#" className="text-decoration-none me-1"
                                                           {...(userData["role"] !== "student"
                                                               ? {onClick: (e) => handleUpdateQuiz(e, quiz)}
                                                               : {})}
                                                        >{quiz.title}</a>
                                                    </h2>


                                                </div>
                                                {userData["role"] !== "student" && (
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
                                                )}

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

                                            <div className="mb-3 text-truncate">
                                            <span
                                                className="m-0 text-secondary">Time to finish (Minutes): {quiz["time_to_finish"]}</span><br/>
                                                <span
                                                    className="m-0 text-secondary">Opened from {getDate(quiz["date_time_open"])} to {getDate(quiz["date_time_close"])}</span><br/>
                                                <span
                                                    className="m-0 text-secondary">Check from {getDate(quiz["datetime_check"])}</span><br/>
                                            </div>

                                            {quiz.quizzes.length > 1 && !quiz.time_limit_end && (
                                                <details className="mb-3">
                                                    <summary className="mb-1">Older attempts ({quiz.quizzes.length-1})
                                                    </summary>
                                                    {quiz.quizzes.slice(1).map((qz, ind) => (
                                                            <div
                                                                className="d-flex justify-content-between align-items-start border p-3" key={"rew-"+ind.toString()}>
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
                                                                                    quizId: qz["quiz_id"],
                                                                                    feedback: qz.feedback,
                                                                                    userId: userData["id_user"],
                                                                                    userRole: userData["role"],
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

                                            {(quiz.time_limit_end && !quiz.first_generation) && (
                                                <button
                                                    className="btn btn-outline-primary me-1"
                                                    disabled={quiz.can_be_checked === false}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate("/review-quiz", {
                                                            state: {
                                                                quiz: quiz,
                                                                quizId: quiz.id,
                                                                feedback: quiz.feedbackTypeAfterClose,
                                                                conditionToRetake: false,
                                                                userId: userData["id_user"],
                                                                userRole: userData["role"],
                                                            }
                                                        })
                                                    }
                                                    }
                                                >
                                                    <span>Review quiz after close</span>
                                                </button>
                                            )}

                                            {!quiz.time_limit_end && (
                                                <div>
                                                    {quiz.is_finished ? (
                                                        <div>
                                                            <button
                                                                className="btn btn-outline-primary me-1"
                                                                disabled={quiz.is_opened === false || (quiz.quizzes.length + 1 > quiz["number_of_corrections"])}
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
                                                                                quizId: quiz.id,
                                                                                feedback: quiz.feedbackType,
                                                                                conditionToRetake: !(quiz.is_opened === false || quiz.quizzes.length + 1 >= quiz["number_of_corrections"]),
                                                                                userId: userData["id_user"],
                                                                                userRole: userData["role"],
                                                                            }
                                                                        })
                                                                    }
                                                                    }
                                                                >
                                                                    {quiz.quizzes.length === 0 ? (
                                                                        <span>Review attempt</span>) : (
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
                                                                        quiz: quiz,
                                                                        userId: userData["id_user"],
                                                                        userRole: userData["role"]
                                                                    }
                                                                });
                                                            }
                                                            }
                                                        >
                                                            Continue current attempt
                                                        </button>
                                                    )}
                                                </div>
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
    )
}

export default Quiz;