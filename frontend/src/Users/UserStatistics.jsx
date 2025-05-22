import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Navigation from "../components/Navigation";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
const UserStatistics = () =>{
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const studentId = searchParams.get("studentId");
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
        getUserLogged().then(() => {
            fetchUserData()
        })

    }, []);

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

            if (response.data.result.role !== "teacher"){
                navigate("/quizzes");
            }

      }catch (error){
            console.error(error);
      }
       finally {}
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
                                                            navigate("/review-quiz?quiz_template_id="+quiz.id.toString()+"&user_id="+studentId.toString()+"&actualQuiz="+(quiz.quizzes[0].quizzes.length).toString()+"&correctMode=true")
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