import Navigation from "../components/Navigation";
import axios from "axios";
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

const QuizAllUsersEvals = () =>{
    const location = useLocation();
    const navigate = useNavigate();
    const [quiz] = useState(location.state?.quiz);
    const apiUrl = process.env.REACT_APP_API_URL;
    const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
    const [studentsData, setStudentsData] = useState([]);
    const [data, setData] = useState([]);

    const fetchData = async () => {
        try{
            const response = await axios.get(apiUrl+`get-quiz-template-students-results`, {
                params: {
                    "template_id": quiz.quiz_template_id
                }
            })
            setStudentsData(response.data.result.students)
            setData(response.data.result.data);

      }catch (error){
      }
       finally {}
    }

    useEffect(() => {
        fetchData();
    }, []);


    return (
         <div>
            <Navigation active = {"Results"}></Navigation>

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-2 sidebar"></div>

                        <div className="col-8">
                            <h1>Quiz {quiz.title} statistics</h1>
                            <p>Attendance {data.attendance} out of {data.num_students} students ({data.attendance_perc} %)</p>
                            <p>Average points {data.average_points}pts. out of {data.max_points}pts. ({data.average_points_perc}%)</p>

                            <table className="table table-striped table-hover table-fixed">
                                <thead>
                                <tr>
                                    <th scope="col" className="w-25">Github Name</th>

                                    <th scope="col" className="text-center w-25"> Attempts</th>

                                    <th scope="col" className="text-center w-25"> Score</th>

                                    <th scope="col" className="w-25 text-center">Max Score</th>

                                </tr>
                                </thead>
                                <tbody>
                                {

                                    studentsData.map((data, ind) => (
                                        <tr key={ind}>
                                            <td>{data.github_name}</td>
                                            <td className="text-center">{data.num_quizzes}</td>
                                            <td className="text-center">{data.quizzes[0]?.points}</td>
                                            <td className="text-center">{data.quizzes[0]?.max_points}</td>
                                        </tr>
                                    ))
                                }
                                </tbody>
                            </table>

                            <button type="button" className="btn btn-outline-secondary mb-3 mb-sm-0"
                                    onClick={() => {
                                        navigate(-1);
                                    }
                                    }
                            >
                                Back to Quiz table
                            </button>

                        </div>
                    </div>
                </div>
         </div>
    )
}

export default QuizAllUsersEvals;