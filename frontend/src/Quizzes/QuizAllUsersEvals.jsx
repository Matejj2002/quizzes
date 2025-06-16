import Navigation from "../components/Navigation";
import axios from "axios";
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {forEach} from "react-bootstrap/ElementChildren";

const QuizAllUsersEvals = () =>{
    const navigate = useNavigate();
     const [searchParams] = useSearchParams();
    const quizTemplateId = searchParams.get("quiz_template_id");
    const apiUrl = process.env.REACT_APP_API_URL;
    const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
    const [studentsData, setStudentsData] = useState([]);
    const [data, setData] = useState([]);

    const fetchData = async () => {
        try{
            const response = await axios.get(apiUrl+`get-quiz-template-students-results`, {
                params: {
                    "template_id": quizTemplateId
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

    const reviewStudentQuiz = async (studentId, githubName) =>{
        try{
            const response = await axios.get(apiUrl+`get-user-data`, {
                params: {
                    "studentId": studentId
                }
            })


            for(let i=0; i<response.data.result.quizzes_attended.length; i++){
                if (response.data.result.quizzes_attended[i].title === data.title){
                    console.log(response.data.result.quizzes_attended[i].quizzes[0].id);
                    console.log(studentId);
                    console.log(response.data.result.quizzes_attended[i].quizzes[0].quizzes.length);
                    navigate("/review-quiz?quiz_template_id="+(response.data.result.quizzes_attended[i].quizzes[0].id).toString()+"&user_id="+studentId.toString()+"&actualQuiz="+(response.data.result.quizzes_attended[i].quizzes[0].quizzes.length).toString()+"&correctMode=true")
                }
            }
      }catch (error){
            console.log(error);
      }
       finally {}
    }


    return (
         <div>
            <Navigation active = {"Results"}></Navigation>

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-2 sidebar"></div>

                        <div className="col-8">
                            <h1>Quiz {data.title} statistics</h1>
                            <p>Attendance {data.attendance} out of {data.num_students} students ({data.attendance_perc} %)</p>
                            <p>Average points {data.average_points}pts. out of {data.max_points}pts. ({data.average_points_perc}%)</p>

                            <table className="table table-striped table-hover table-fixed">
                                <thead>
                                <tr>
                                    <th scope="col" className="w-25">Github Name</th>

                                    <th scope="col" className="text-center w-25"> Attempts</th>

                                    <th scope="col" className="text-center w-25"> Score</th>

                                    <th scope="col" className="w-25 text-end">Review</th>

                                </tr>
                                </thead>
                                <tbody>
                                {

                                    studentsData.map((data, ind) => (
                                        <tr key={ind}>
                                            <td>{data.github_name}</td>
                                            <td className="text-center">{data.num_quizzes}</td>
                                            <td className="text-center">{data.quizzes[0]?.points}</td>
                                            <td className="w-25 text-end">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    disabled={data.num_quizzes === 0}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        reviewStudentQuiz(data["student_id"], data["github_name"]);
                                                    }}
                                                >
                                                    Review
                                                </button>

                                            </td>
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