import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Navigation from "../components/Navigation";
import axios from "axios";

const UserStatistics = () =>{
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const [studentId] = useState(location.state?.studentId);
    const [userRole] = useState(location.state?.userRole);
    const [userId] = useState(location.state?.userId);
    const apiUrl = process.env.REACT_APP_API_URL;

    const fetchUserData = async () => {
      try{
            const response = await axios.get(apiUrl+`get-user-data`, {
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

    if (userRole !=="teacher") {
        navigate("/quizzes");
    }
    console.log(userData);
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

                             <table className="table table-striped table-hover table-fixed align-middle">
                                <thead>
                                <tr>
                                    <th scope="col" className="w-25">Title</th>

                                    <th scope="col" className="w-25 text-end">Attempts</th>

                                    <th scope="col" className="w-25 text-end">Points</th>
                                    <th scope="col" className="w-25 text-end">Review</th>

                                </tr>
                                </thead>
                                 <tbody>
                                    {userData["quizzes_attended"]?.map((quiz, ind) => (
                                            <tr key = {ind}>
                                                <td className="w-25">{quiz.title}</td>
                                                <td className="w-25 text-end">{quiz.attempts}</td>
                                                <td className="w-25 text-end">{quiz.achieved}/{quiz.max_points}</td>
                                                <td className="w-25 text-end">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            navigate("/review-quiz", {
                                                                state: {
                                                                    quiz: quiz.quizzes[0],
                                                                    quizId: quiz.id,
                                                                    feedback: quiz.quizzes[0].feedbackType,
                                                                    correctMode: true,
                                                                    userId: studentId,
                                                                    userName: userData["github_name"],
                                                                    userRole:"teacher"

                                                                }
                                                            });
                                                        }}
                                                    >
                                                        Review
                                                    </button>

                                                </td>
                                            </tr>

                                        )
                                    )
                                    }

                                 </tbody>
                             </table>

                            <div
                                className="d-flex justify-content-end">{userData["all_achieved_points"]}/{userData["all_max_points"]} b
                            </div>
                            <div
                                className="d-flex justify-content-end">{userData["percentage"]} %
                            </div>
                            <button type="button" className="btn btn-outline-secondary"
                                    onClick={() => {
                                       navigate("/users");
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