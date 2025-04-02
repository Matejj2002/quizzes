import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Navigation from "./Navigation";
import axios from "axios";

const UserStatistics = () =>{
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const [studentId] = useState(location.state?.studentId);

    const fetchUserData = async () => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/get-user-data`, {
                params: {
                    "studentId": studentId
                }
            })
            setUserData(response.data.result);
      }catch (error){
      }
       finally {}
    }

    useEffect(() => {
        fetchUserData()
    }, []);

    if (localStorage.getItem("role") !=="teacher"){
        navigate("/quizzes");
    }

    return (
        <div>
            <Navigation active = {"Users"}></Navigation>

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-2 sidebar"></div>

                        <div className="col-8">
                            <h1>{userData["github_name"]} ({userData["user_type"]}) statistics</h1>

                            <h2>Attended {userData["quizzes_attended"]?.length} out
                                of {userData["all_quizzes"]} Quizzes</h2>
                            <ul className="list-group list-group-flush">
                                {userData["quizzes_attended"]?.map((quiz) => (
                                        <li className="list-group-item"><strong>{quiz.title}</strong> needed
                                            (<strong>{quiz.attempts}</strong>) attempts and
                                            scored {quiz.achieved}/{quiz.max_points}</li>
                                    )
                                )

                                }
                            </ul>
                            <div
                                className="d-flex justify-content-end">{userData["all_achieved_points"]}/{userData["all_max_points"]} b
                            </div>
                            <div
                                className="d-flex justify-content-end">{userData["percentage"]} %
                            </div>
                            <button type="button" className="btn btn-outline-secondary"
                                    onClick={() => {
                                        window.location.href = "/users";
                                    }
                                    }
                            >
                                Back to Users
                            </button>
                        </div>

                        <div className="col-2 sidebar"></div>
                    </div>
                </div>
        </div>
    )
}

export default UserStatistics;