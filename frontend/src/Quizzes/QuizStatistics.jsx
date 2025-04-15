import Navigation from "../components/Navigation";
import axios from "axios";
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import FormattedTextRenderer from "../components/FormattedTextRenderer";
import WrongAnswersTable from "../components/WrongAnswersTable";
const QuizStatistics = () =>{
    const location = useLocation();
    const navigate = useNavigate();
    const [quiz] = useState(location.state?.quiz);
    const [data, setData] = useState([]);
    const [evals, setEvals] = useState([]);
    const [studentsCorrect, setStudentsCorrect] = useState([]);
    const [page, setPage] = useState(0);
    const apiUrl = process.env.REACT_APP_API_URL;
        const questionTypes = {"matching_answer_question": "Matching Question", "short_answer_question" : "Short Question", "multiple_answer_question": "Multiple Choice"};


    const fetchData = async () => {
        try{
            const response = await axios.get(apiUrl+`quiz-statistics`, {
                params: {
                    "template_id": quiz.quiz_template_id
                }
            })

            setData(response.data.result)
            setEvals(response.data.evals);
            setStudentsCorrect(response.data.correct_students);

      }catch (error){
      }
       finally {}
    }

    useEffect(() => {
        fetchData();
    }, []);

    if (localStorage.getItem("role") !=="teacher"){
        navigate("/quizzes");
    }

    return (
        <div>
            <Navigation active = {"Analysis"}></Navigation>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-2 sidebar"></div>

                    <div className="col-8">
                        <h1 className="mb-3">
                            Analysis {data.title}
                        </h1>

                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            {data.sections && data.sections.map((sect, index) => (
                                <li className="nav-item" role="presentation" key={"section-" + index.toString()}>
                                    <button
                                        className={`nav-link ${index === page ? 'active' : ''}`}
                                        id={`tab-${index}`}
                                        data-bs-toggle="tab"
                                        data-bs-target={`#tab-pane-${index}`}
                                        type="button"
                                        role="tab"
                                        aria-controls={`tab-pane-${index}`}
                                        aria-selected={index === page}
                                        onClick={() => {
                                            setPage(index)
                                        }}
                                    >
                                        {sect?.title || "Section " + (index + 1)}
                                    </button>
                                </li>
                            ))}

                        </ul>

                        <ul className="list-group mb-3">
                            {data.sections && data.sections[page]?.questions.map((question, index) => (
                                <li className={"list-group-item"}
                                    key={index}>

                                    {question.questionType === "questions" ? (
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h2>{question.title}</h2>
                                                {/*{console.log(evals[question["item_id"]])}*/}
                                                <span
                                                    className="badge text-bg-primary rounded-pill flex-shrink-0"
                                                >{questionTypes[question.type]}
                                            </span>
                                            </div>
                                        ) :
                                        (
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h2>Random question</h2>
                                                    <span
                                                        className="badge text-bg-primary rounded-pill flex-shrink-0"
                                                    >{question.questionAnswerType}
                                            </span>
                                            </div>
                                        )

                                    }

                                    {question.type === "short_answer_question" && (
                                        <div className="mb-1">
                                            <span className="fw-bold">Correct Answer</span>
                                            <FormattedTextRenderer
                                                text={evals[question["item_id"]].correct_answer}
                                            />
                                        </div>
                                    )}

                                    {question.type === "multiple_answer_question" && (
                                        <div>
                                            {evals[question["item_id"]].correct_answer.map((ans, ind) => (
                                                <div className="form-check" key={ind}>
                                                    <input className="form-check-input"
                                                           type="checkbox"
                                                           defaultChecked={ans[2] === true}
                                                    />
                                                    <div className="d-flex justify-content-between">
                                                    <span className="form-check-label w-50">

                                                                <FormattedTextRenderer
                                                                    text={ans[1]}
                                                                />
                                                    </span>
                                                        <div className="w-50 progress-stacked">
                                                            <div className="progress" role="progressbar"
                                                                 aria-label="Segment one" aria-valuenow="0"
                                                                 aria-valuemin="0" aria-valuemax="100" style={{
                                                                width:
                                                                    `${Math.round((evals[question["item_id"]].wrong_answers[ans[0]].correct / evals[question["item_id"]].wrong_answers[ans[0]].sum) *100)}%`
                                                            }}
                                                            >
                                                                <div
                                                                    className="progress-bar bg-success">{Math.round((evals[question["item_id"]].wrong_answers[ans[0]].correct / evals[question["item_id"]].wrong_answers[ans[0]].sum) * 100)}%
                                                                </div>
                                                            </div>
                                                            <div className="progress" role="progressbar"
                                                                 aria-label="Segment two" aria-valuenow="30"
                                                                 aria-valuemin="0" aria-valuemax="100" style={{
                                                                width:

                                                                    `${100-Math.round((evals[question["item_id"]].wrong_answers[ans[0]].correct / evals[question["item_id"]].wrong_answers[ans[0]].sum) * 100)}%`
                                                            }}

                                                            >
                                                                <div
                                                                    className="progress-bar bg-danger">{100-Math.round((evals[question["item_id"]].wrong_answers[ans[0]].correct / evals[question["item_id"]].wrong_answers[ans[0]].sum) * 100)}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                    }

                                    {question.type === "matching_answer_question" && (
                                        <div>
                                            <table className="table table-striped">
                                                <thead>
                                                <tr>
                                                    <th scope="col">
                                                        <div className="d-flex justify-content-start">Left
                                                            Side
                                                        </div>
                                                    </th>
                                                    <th scope="col">
                                                        <div className="d-flex justify-content-center">Right
                                                            Side
                                                        </div>
                                                    </th>
                                                    <th scope="col">
                                                        <div className="d-flex justify-content-end text-end">Success
                                                        </div>
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {evals[question["item_id"]].correct_answer.map((ans, ind) => (
                                                    <tr key ={"match-q-"+ind.toString()}>
                                                    <td style={{
                                                                borderRight: "1px solid black",
                                                                paddingBottom: "2px"
                                                            }}>
                                                                <div className="d-flex justify-content-start w-100">

                                                                    <FormattedTextRenderer
                                                                        text={ans[0]}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {/*<div className="d-flex justify-content-start w-100">*/}

                                                                {/*    <FormattedTextRenderer*/}
                                                                {/*        text={ans[1]}*/}
                                                                {/*    />*/}
                                                                {/*</div>*/}
                                                                <div
                                                                    className="d-flex justify-content-between w-100">
                                                                    <div
                                                                        className="me-1">
                                                                            <FormattedTextRenderer
                                                                                text={ans[1]}
                                                                            />

                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-end">{ans[2] + "/" +  ans[4]}</td>
                                                        </tr>
                                                    )
                                                )
                                                }
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                    }


                                    <span>{evals[question["item_id"]].item_score}/ {evals[question["item_id"]].item_max_score}</span>
                                    <br/>
                                    <span>Average points: {evals[question["item_id"]].item_average_score}/ {evals[question["item_id"]].item_full_score}</span>
                                    <br/>
                                    <span>{studentsCorrect[question["item_id"]].length} / {quiz.attendance} students has this question correct.</span>

                                    {question.type === "short_answer_question" && evals[question["item_id"]].wrong_answers.length > 0 && (
                                        <details>
                                            <summary>List of wrong answers</summary>
                                            <WrongAnswersTable
                                                wrongAnswers={evals[question["item_id"]].wrong_answers}
                                                tableCols={["Answer", "Occurencies"]} colsSize={["w-75", "w-50 text-center"]}
                                                colsType={["string", "int"]}
                                            title={"AA"}></WrongAnswersTable>
                                        </details>
                                    )}
                                    {question.type === "matching_answer_question" && evals[question["item_id"]].wrong_answers.length > 0 && (
                                        <details>
                                            <summary>List of wrong answers</summary>
                                            <WrongAnswersTable
                                                wrongAnswers={evals[question["item_id"]].wrong_answers}
                                                tableCols={["Left Side", "Right Side", "Occurencies"]}
                                                colsSize={["w-50", "w-50", "w-25"]}
                                                colsType={["string", "string", "int"]}
                                            title={"BB"}></WrongAnswersTable>
                                        </details>
                                    )
                                    }


                                    {question.questionType === "random" && (
                                        <div>
                                                <details>
                                                    <summary>List of questions</summary>
                                                    <ol className="list-group">
                                                        {evals[question["item_id"]].questions.map((question, index) => (
                                                                <li className="list-group-item" key={"random-"+index.toString()}>
                                                                    <div
                                                                        className="d-flex justify-content-between align-items-center w-100">

                                                                        {/*<span*/}
                                                                        {/*    className="fw-bold h5">{question.question_title}</span>*/}
                                                                        <p className="h5 text-start text-truncate flex-grow-1">
                                                                        <a href="" onClick={(e) => {
                                                                            e.preventDefault();
                                                                            navigate(`/question/${question.question_version_id}`, {
                                                                            state: {
                                                                                catPath: "",
                                                                                id: "",
                                                                                selectedCategory: "",
                                                                                limit: "",
                                                                                offset: "",
                                                                                sort: "",
                                                                                page: "",
                                                                                filterType: "",
                                                                                authorFilter: "",
                                                                                back:true,
                                                                        }
                                                                    });
                                                                        }
                                                                        } className="text-decoration-none">
                                                                            {question.question_title || "No title available"}
                                                                        </a>
                                                                            </p>
                                                                        <span
                                                                            className="badge text-bg-primary rounded-pill flex-shrink-0">{questionTypes[question.question_type]}</span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-start">
                                                                        <span>Item score {question.item_score} / {question.item_max_score}</span>
                                                                    </div>
                                                                    <div className="d-flex justify-content-start">
                                                                        <span>Average score {(question.sum_points) / (question.item_max_score * question.number_attempts)} / {question.item_max_score}</span>
                                                                    </div>
                                                                    <div className="d-flex justify-content-start">
                                                                        <span>Times in quiz: {question.number_attempts}</span>
                                                                    </div>
                                                                </li>
                                                            )
                                                        )}
                                                    </ol>
                                                </details>
                                        </div>
                                    )}


                                    {evals[question["item_id"]].comments.length > 0 && (
                                        <details>
                                        <summary>Feedbacks</summary>
                                            <table className="table table-striped">
                                                <thead>
                                                <tr>
                                                    <th scope="col" className="w-25">Type</th>
                                                    <th scope="col" className="w-75">Text</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {evals[question["item_id"]].comments.map((comment) => (
                                                    <tr>
                                                        <td className="w-25">{comment[0]} </td>
                                                        <td className="w-75">{comment[1]}</td>
                                                    </tr>
                                                ))}

                                                </tbody>
                                            </table>
                                        </details>
                                    )}

                                </li>
                            ))}
                        </ul>

                    </div>

                    <div className="col-2 sidebar"></div>
                </div>

            </div>
        </div>
    )
}

export default QuizStatistics;