import axios from "axios";
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "../Navigation";
import Login from "../Login";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
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


    useEffect(() => {
    const fetchAllData = async () => {
      try {
        await fetchQuizzes();
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };

    fetchAllData();

  }, []);

    console.log(quizzes);
    if (localStorage.getItem("accessToken")) {
        return (
            <div>
                <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                    <Navigation></Navigation>
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
                                            <h2 className="h5">
                                            <a href = "#" className=" text-decoration-none">{quiz.title}</a>
                                                </h2>
                                            {quiz.shuffle_sections && (
                                                <p>Sections will be shuffled.</p>
                                            )}
                                            {!quiz.shuffle_sections && (
                                                <p>Sections will <strong>not</strong> be shuffled.</p>
                                            )}

                                            {quiz.correction_of_attempts === "option1" && (
                                                <p>Attempts are independent. </p>
                                            )}
                                            {quiz.correction_of_attempts === "option2" && (
                                                <p>Attempts are corrections of previous attempt.</p>
                                            )}

                                            <p>Quiz has {quiz.sections.length} sections</p>

                                            <span
                                                className="m-0 text-secondary text-truncate">Time to finish (Minutes):  {quiz.time_to_finish}</span><br/>
                                            <span
                                                className="m-0 text-secondary text-truncate">Opened from {quiz.date_time_close} to {quiz.date_time_open}</span><br/>
                                            <span
                                                className="m-0 text-secondary text-truncate">Check until {quiz.datetime_check} with {quiz.number_of_corrections} corrections</span><br/>
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
    } else {
        return (
            <div>
                <Login path={"/quizzes"}></Login>
            </div>
        );
    }
}

export default Quiz;