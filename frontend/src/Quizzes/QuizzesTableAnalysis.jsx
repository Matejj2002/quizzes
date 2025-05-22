import Navigation from "../components/Navigation";
import axios from "axios";
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const QuizzesTableAnalysis = ({statisticsNavigate = "/quiz-analysis-show", activeNav = "Analysis", title="Quiz Analysis"}) =>{
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterForName,setFilterForName] = useState("");
    const [userData, setUserData]= useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;
    const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
    const fetchQuizzes = async () => {
      try{
            const response = await axios.get(apiUrl+`get-quizzes-analysis`, {
                params: {
                    "filterName": filterForName,

                }
            })
            setQuizzes(response.data.result);
      }catch (error){
      }
       finally {}
    }

    const evaluateAllQuizzes = async () => {
      try{
            const response = await axios.get(apiUrl+`evaluate_all_quizzes`)
      }catch (error){
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

            if (response.data.result.role !== "teacher"){
                navigate("/quizzes");
            }

      }catch (error){
            console.error(error);
      }
       finally {}
    }

    if (localStorage.getItem("data") === null || localStorage.getItem("data")==='{}' ){
        navigate("/login");
    }

    useEffect(() => {
        getUserLogged().then(() => {
            setLoading(false);
        });

        evaluateAllQuizzes();
    }, []);

    useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
        fetchQuizzes();
    }
}, [userData]);

    useEffect(() => {
        fetchQuizzes().then(() => {});
    }, [filterForName]);

    if (loading){
        return (
            <div className="d-flex justify-content-center align-items-center">
                <h2>Loading...</h2>
            </div>
        )
    }

    return (
        <div>
            <Navigation active = {activeNav}></Navigation>

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-2 sidebar"></div>

                        <div className="col-8">
                            <h1>{title}</h1>

                            <div className="mb-3">
                                <label htmlFor="search" className="form-label">Filter by Quiz Name</label>
                                <input
                                    type="text"
                                    id="search"
                                    className="form-control"
                                    placeholder="Search for quiz"
                                    onChange={(e) => setFilterForName(e.target.value)}
                                />
                            </div>

                            <table className="table table-striped table-hover table-fixed">
                                <thead>
                                <tr>
                                    <th scope="col" className="w-25">Name</th>

                                    <th scope="col" className="text-end w-25"> Attendance</th>

                                    <th scope="col" className="w-25 text-end">{activeNav}</th>

                                </tr>
                                </thead>
                                <tbody>
                                {

                                    quizzes.map((quiz, ind) => (
                                            <tr key={ind}>
                                                <td>{quiz.title}</td>
                                                <td>
                                                    <div className="d-flex justify-content-end align-items-center">
                                                        <span>{quiz.attendance}/{quiz.number_of_students}</span>
                                                        {quiz.attendance === quiz.number_of_students && (
                                                            <i className="bi bi-check-circle text-success fs-4 ms-2"></i>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <button type="button" className="btn btn-outline-primary"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (activeNav === "Analysis") {
                                                                    navigate("/quiz-analysis-show?quiz_template_id=" + quiz.quiz_template_id);
                                                                }else {
                                                                   navigate("/quiz-all-users?quiz_template_id=" + quiz.quiz_template_id);
                                                                }

                                                                }
                                                            }
                                                    >
                                                        Show
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )

                                }
                                </tbody>
                            </table>

                                <button type="button" className="btn btn-outline-secondary mb-3 mb-sm-0"
                                        onClick={() => {
                                            window.location.href = quizzesUrl+"/quizzes";
                                        }
                                        }
                                >
                                    Back to Quizzes
                                </button>

                        </div>
                        <div className="col-2 sidebar"></div>
                    </div>
                </div>
        </div>
    )
}

export default QuizzesTableAnalysis;