import axios from "axios";
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "../components/Navigation";

const Quiz = () => {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updateAt, setUpdateAt] = useState(null);
    const [userData, setUserData] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;
    const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;

    const fetchQuizzes = async () => {
      try{
            const response = await axios.get(apiUrl+`get-quiz-templates` ,
                {
                    params: {"studentId": userData["id_user"], "userRole": userData["role"], "templateId": 0}
                }
            )
            setQuizzes(response.data.result);
            setUpdateAt(response.data.update_at);

      }catch (error){
            console.error(error);
            window.location.href=quizzesUrl+"/login";
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
            setUserData(response.data.result);
      }catch (error){
            console.error(error);
      }
       finally {}
    }

    useEffect(() => {
        getUserLogged().then(() => {
           setLoading(false);
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
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [updateAt]);

    const handleUpdateQuiz = (e, quiz) => {
        e.preventDefault();
        navigate("/update-quiz-template?templateId="+quiz.id)
    }

    const getDate = (time) =>{
        const dt = new Date(time);
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

return `${days[dt.getUTCDay()]} ${months[dt.getUTCMonth()]} ${dt.getUTCDate()} ${dt.getUTCFullYear()} ${dt.getUTCHours()}:${dt.getUTCMinutes().toString().padStart(2, '0')}:00`;    }

    const handleArchiveQuiz = (e, quiz) => {
        const updatedData = {
            quiz_template_id: quiz.id
        }
        axios.put(apiUrl+`archive-quiz`, updatedData)
            .then(
                () => {
                    window.location.href = quizzesUrl+'/quizzes';
                }
            )
            .catch(error => {
                console.error('Error saving changes:', error);
            });
    }

    if (loading){
        return (
            <div className="d-flex justify-content-center align-items-center">
                <h2>Loading...</h2>
            </div>
        )
    }

    if (localStorage.getItem("data") === null || localStorage.getItem("data")==='{}' ){
        window.location.href = quizzesUrl+"/login";
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
                                    navigate('/new-quiz-template', {
                                        state: {
                                            userRole: userData["role"]
                                        }
                                    });
                                }}>
                                    New Quiz
                                </button>
                            )}

                            {quizzes.map((quiz, ind) => {
                                    return (
                                        <div
                                            className={`border p-3 mb-3 mt-3 ${quiz.actual_quiz ? 'border-success' : ''}`}
                                            key={ind}>
                                            <div className="d-flex justify-content-between">
                                                <div className="d-flex">
                                                    <h2 className="h5">
                                                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                        {userData["role"] === "teacher" ? (
                                                            <a href="#" className="text-decoration-none me-1"
                                                               onClick={(e) => handleUpdateQuiz(e, quiz)}

                                                            >{quiz.title}</a>
                                                        ) : (
                                                            <h5>{quiz.title}</h5>
                                                        )}
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
                                                className="m-0">Time to finish (Minutes): {quiz["time_to_finish"]}</span><br/>
                                                <span
                                                    className="m-0">Opened from {getDate(quiz["date_time_open"])} to {getDate(quiz["date_time_close"])}</span><br/>
                                                <span
                                                    className="m-0">Check from {getDate(quiz["datetime_check"])}</span><br/>
                                            </div>

                                            <div
                                                className="d-flex flex-column flex-md-row justify-content-between gap-2">
                                                {(quiz.time_limit_end && !quiz.first_generation) && (
                                                    <button
                                                        className="btn btn-outline-primary me-1"
                                                        disabled={quiz.can_be_checked === false}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            navigate("/review-quiz?quiz_template_id="+quiz.id.toString()+"&user_id="+userData["id_user"].toString()+"&actualQuiz="+(quiz.quizzes.length).toString()+"&correctMode=false")
                                                        }
                                                        }
                                                    >
                                                        <span>Review quiz after close</span>
                                                    </button>
                                                )}

                                                {!quiz.time_limit_end && (
                                                    <div className="d-flex flex-column flex-md-row gap-2">
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
                                                                            navigate("/review-quiz?quiz_template_id="+quiz.id.toString()+"&user_id="+userData["id_user"].toString()+"&actualQuiz="+(quiz.quizzes.length).toString()+"&correctMode=false")
                                                                        }
                                                                        }
                                                                    >
                                                                        <span>Review previous attempt</span>
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

                                                <div>
                                                    {userData["role"] === "teacher" && (
                                                        <div className="d-flex flex-column flex-md-row">
                                                            <button type="button"
                                                                    className="btn btn-outline-primary me-1   "
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        navigate("/quiz-all-users?quiz_template_id="+quiz.id);
                                                                    }
                                                                    }
                                                            >
                                                                Results
                                                            </button>

                                                            <button type="button" className="btn btn-outline-primary"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        navigate("/quiz-analysis-show?quiz_template_id="+quiz.id);
                                                                    }
                                                                    }
                                                            >
                                                                Analysis
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
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