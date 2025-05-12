import { useLocation } from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import Navigation from "../components/Navigation";
import FormattedTextRenderer from "../components/FormattedTextRenderer";

const GenerateQuizEmbedded = ({handleAttempt, keyAtt, changeKey ,quizEmb, userId, userRole, refreshQuiz, backendUrl}) => {
    const [quiz, setQuiz] = useState(quizEmb);
    const [questionsData, setQuestionsData] = useState({});
    const [randomQuestions, setRandomQuestions] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [dateStart] = useState(0);
    const [count, setCount] = useState(-1);
    const [minutesToFinish] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [loadQuestions, setLoadQuestions] = useState(false);
    const [feedbackQuestion, setFeedbackQuestion] = useState([]);
    const [quizGenerated, setQuizGenerated] = useState(false);
    // const apiUrl = process.env.REACT_APP_API_URL;


    useEffect(() => {
        setQuiz(JSON.parse(JSON.stringify(quizEmb || {})));
        setQuestionsData({});
        setRandomQuestions([]);
        setPage(0);
        setLoading(true);
        setNumberOfQuestions(0);
        setCount(-1);
        setIsSaving(false);
        setFeedbackQuestion([]);
        setQuizGenerated(false);
    }, [keyAtt]);

    useEffect(() => {
        if (!quiz?.sections) {
            return;
        }

            console.log("Component mounted", { refreshQuiz, quizEmb, quiz, questionsData });

            axios.post(backendUrl + `new-quiz-template-check`, quiz)
                .then(response => {
                    setRandomQuestions(response.data.result[0]);
                    setNumberOfQuestions(response.data.number_of_questions);

                })
                .catch(error => {
                    console.error('Error fetching random questions:', error);
                });


    }, []);


    useEffect(() => {

        const interval = setInterval(() => {
            setCount(prev => Math.max(-1, Math.floor(prev-1)));
        }, 1000);


        return () => clearInterval(interval);
    }, [dateStart, minutesToFinish]);

    useEffect(() => {
            if (count % 55 === 0 && count !== -1) {
            handleSaveQuiz(false);
            setLoadQuestions(true);
        }

            if (count === 0 ) {
                const updatedData = {
                    quiz_template_id: quiz.id,
                    student_id: userId
                }
                const setDateFinish = async () => {
                    axios.put(backendUrl+`quiz-finish`, updatedData).then(
                        () => {
                            // window.location.href = "/quizzes";
                            changeKey();
                            handleAttempt("review");

                        }
                    );

                }
                setCount(-1);
                setDateFinish();
            }

    }, [count]);

    const fetchQuestion = async (questionId, itemId) => {
        try {
            const response = await axios.get(backendUrl+`questions-quiz/${questionId}`, {
                params: {
                    item_id: itemId,
                    review: false,
                }});
            setQuestionsData(prevData => ({
                ...prevData,
                [questionId]: response.data
            }));
        } catch (error) {
            console.error('Error fetching question:', error);
        }
    };


    useEffect(() => {
        if (!quiz?.sections) {
            return;
        }


        let cnt = 0;
        const fetchQuestions = [];

        if (quiz?.sections) {
            quiz.sections.forEach((section) => {
                section.questions.forEach((question) => {
                    if (!questionsData[question.id] && question.questionType === "questions") {
                        fetchQuestions.push(fetchQuestion(question.id, question.item_id));
                    } else {
                        if (!question.id){
                            question.id = randomQuestions[cnt];
                                cnt += 1;
                                if (question.id !== undefined) {
                                    fetchQuestions.push(fetchQuestion(question.id));
                                }
                        }

                    }
                });
            });

            Promise.all(fetchQuestions).then(() => {
                setQuiz({ ...quiz }
                );
            });

            // if (loadQuestions){
            //     handleSaveQuiz(false);
            // }
        }
    }, [randomQuestions, questionsData]);


   useEffect(() => {
       // console.log("KONTROLA",quizGenerated, questionsData, numberOfQuestions)
    if (quizGenerated || Object.keys(questionsData).length !== numberOfQuestions || numberOfQuestions === 0) {
        return;
    }

    if (quiz.correction_of_attempts !== "correctionAttempts" && refreshQuiz){
        const generateQuizWait = async () => {
        setLoading(true);
        await generateQuiz();
        setQuizGenerated(true);
        };

        generateQuizWait().then(() => {
        });
    //     handleSaveQuiz(false).then(()=>{
    //     const generateQuizWait = async () => {
    //     setLoading(true);
    //     await generateQuiz();
    //     setQuizGenerated(true);
    // };
    //
    //     generateQuizWait().then(() => {
    // });
    // })
    }else{
        const generateQuizWait = async () => {
        setLoading(true);
        await generateQuiz();
        setQuizGenerated(true);
        };

        generateQuizWait().then(() => {
        });
    }

}, [questionsData, numberOfQuestions]);


    const handleSaveQuiz = async (finalSave) => {
        setIsSaving(true);
        const updatedData = {
            "quiz": quiz,
            "data": questionsData,
            "finalSave": finalSave,
            "studentId": userId
        }
        axios.put(backendUrl+`quiz_set_answers`, updatedData).then( () =>{
                if (finalSave){
                    handleAttempt("review");
                    // window.location.href = "/quizzes";
                }
                setTimeout(() => {
                setIsSaving(false);

            }, 3000);

            }

        ).catch( () => {
            setTimeout(() => {
                setIsSaving(false);
            }, 3000);
        })

        return false;
    }

    const generateQuiz = () => {
        const updatedData = {
            "quiz": quiz,
            "questions": questionsData,
            "student_id": userId,
            "refreshQuiz": refreshQuiz
        }

        axios.put(backendUrl+`new-quiz-student`, updatedData)
                    .then(
                        async (response) => {
                            if (!response.data["created"] || response.data["created"]) {
                                const result = await axios.get(backendUrl+"quiz-student-load",
                                    {
                                        params: {
                                            student_id: userId,
                                            quiz_id: response.data["quiz_id"]
                                        }
                                    }
                                )

                                setQuiz(prevQuiz => ({
                                    ...prevQuiz,
                                    sections: result.data.sections,
                                    answers: []
                                }));

                                const startTime = new Date(result.data.start_time);

                                const finishTime = new Date(result.data.end_time).getTime();

                                const startMilis = startTime.getTime()
                                const timeToFinish = result.data.minutes_to_finish * 60 *1000

                                const endTime = startMilis + timeToFinish;

                                const nowDate = new Date(result.data.now_check);
                                const endDate = new Date(endTime)

                                const differenceInMilliseconds = endDate.getTime() - nowDate.getTime();
                                const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

                                if (nowDate > endTime || (result.data.end_time !== null && nowDate < finishTime) ){
                                    setCount(-1);
                                }else{
                                    setCount(differenceInSeconds);
                                }

                                setRandomQuestions([]);
                                setQuestionsData({});
                                setLoading(false);
                            }else{
                                setCount(response.data.time_to_finish *60);
                            }

                            // setLoading(false);
                        }
                    )
                    .catch(error => {
                        console.error('Error saving changes:', error);
                    });

    }

    const saveFeedback = (feedback, itemId) =>{
        const updatedData = {
            "feedback": feedback,
            "itemId": itemId,
            "student_id": userId,
            "role": userRole
        }
        axios.put(backendUrl+`save-feedback-to-item`, updatedData).then( () =>{
            setFeedbackQuestion([...feedbackQuestion, itemId]);
        }

        ).catch( () => {
        })
    }

    function getTime(){
        const hours = Math.floor(count / 3600);
        const minutes = Math.floor((count % 3600) / 60);
        const seconds = count % 60;


        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <h2>Loading...</h2>
            </div>
        );
    }


    return (
        <div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-2 sidebar"></div>
                    <div className="col-8">
                                <div className="d-flex justify-content-between">
                                    <div><h1>{quiz.title}</h1></div>
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-clock text-primary" style={{fontSize: '2rem', marginRight: "2px"}}></i>
                                        {
                                            count < 300 ? (
                                                    <span
                                                        className="text-xl font-bold text-danger">{getTime()}</span>
                                            ) : (
                                                <span className="text-xl font-bold">{getTime()}</span>
                                            )
                                        }
                                    </div>
                                </div>
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            {quiz.sections.map((sect, index) => (
                                <li className="nav-item" role="presentation" key={index}>
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
                                            {sect.title || "Section " + (index + 1)}
                                        </button>
                                </li>
                            ))}

                            <li className="nav-item ms-auto" role="presentation">
                                {isSaving && (
                                    <span
                                        id="disabled-tab" data-bs-toggle="tab"
                                        aria-controls="disabled-tab-pane"
                                    >Saving ...
                                </span>
                                )}
                            </li>
                        </ul>

                        <ul className="list-group mb-3">
                            {quiz.sections[page]?.questions.map((question, index) => (
                                <li className="list-group-item" key={index}>
                                    <div className="d-flex justify-content-between">
                                        <h2>{questionsData[question.id]?.title}</h2>
                                        <div className="dropdown-center">
                                          <button className="btn  dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                             <i className={`bi ${feedbackQuestion.includes(question.item_id) ? "bi-flag-fill" : "bi-flag"}`}
                                                style={{ color: feedbackQuestion.includes(question.item_id) ? 'red' : '' }}
                                                ></i>
                                          </button>
                                            <div className="dropdown-menu p-3" style={{minWidth: "300px"}}>
                                                <label htmlFor="feedback" className="form-label">Feedback</label>
                                                <textarea id={`feedback-${question.id}`} className="form-control" rows="3"
                                                          placeholder="Why you flagged this question?"
                                                ></textarea>

                                                <button className="btn btn-primary w-100 mt-2"
                                                        onClick={() => {
                                                            const feedbackValue = document.getElementById("feedback-" + question.id.toString()).value;
                                                            saveFeedback(feedbackValue, question.item_id)
                                                        }}
                                                >
                                                    {!feedbackQuestion.includes(question.item_id) ? (
                                                        <span>Send feedback</span>
                                                    ) : (
                                                        <span>Update feedback</span>
                                                    )}
                                                    </button>
                                            </div>
                                        </div>
                                    </div>
                                        <div>
                                        <FormattedTextRenderer
                                            text={questionsData[question.id]?.text}
                                        />
                                        </div>

                                        {questionsData[question.id]?.type === "matching_answer_question" && (
                                            <div className="mb-3">
                                                <table className="table table-striped">
                                                    <thead>
                                                    <tr>
                                                        <th scope="col">
                                                            <div className="d-flex justify-content-start">Left
                                                                Side
                                                            </div>
                                                        </th>
                                                        <th scope="col">
                                                            <div className="d-flex justify-content-end">Right
                                                                Side
                                                            </div>
                                                        </th>
                                                    </tr>
                                                    </thead>

                                                    <tbody>

                                                    {questionsData[question.id].answers.map((ans, idx) => (
                                                        <tr key={"tr-"+idx.toString()}>
                                                            <td className="w-50" style={{
                                                                borderRight: "1px solid black",
                                                                paddingBottom: "2px"
                                                            }}
                                                            >
                                                                <div className="d-flex justify-content-start">
                                                                    <FormattedTextRenderer
                                                                        text={ans["leftSide"]}
                                                                      />
                                                                    {/*{ans["leftSide"]}*/}
                                                                </div>
                                                            </td>
                                                            <td style={{
                                                                borderLeft: "1px solid black",
                                                                paddingBottom: "2px"
                                                            }}>
                                                                <div className="d-flex justify-content-end">
                                                                    {ans.answer.length === 0 ? "Select Answer" :
                                                                        <span>
                                                                            <FormattedTextRenderer
                                                                        text={ans.answer}
                                                                      />
                                                                            </span>
                                                                    }

                                                                    <div className="dropdown">
                                                                        <button
                                                                            className="btn"
                                                                            type="button"
                                                                            id={`dropdown-${idx}`}
                                                                            data-bs-toggle="dropdown"
                                                                            aria-expanded="false"
                                                                        >
                                                                            <i className="bi bi-chevron-down"
                                                                               style={{fontSize: '24px'}}></i>
                                                                        </button>

                                                                        <ul className="dropdown-menu"
                                                                            style={{
                                                                                width: "25rem",
                                                                                wordWrap: "break-word"
                                                                            }}
                                                                            aria-labelledby={`dropdown-${idx}`}>
                                                                            {questionsData[question.id].answers.map((answ, optionIdx) => (
                                                                                <li key={optionIdx}>
                                                                                    <a
                                                                                        className="dropdown-item"
                                                                                        style={{whiteSpace: "normal"}}
                                                                                        href="#"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault();
                                                                                            setQuestionsData((prevData) => ({
                                                                                                ...prevData,
                                                                                                [question.id]: {
                                                                                                    ...prevData[question.id],
                                                                                                    answers: prevData[question.id].answers.map((item, index) =>
                                                                                                        index === idx
                                                                                                            ? {
                                                                                                                ...item,
                                                                                                                answer: answ["showRightSide"],
                                                                                                            }
                                                                                                            : item
                                                                                                    ),
                                                                                                },
                                                                                            }));
                                                                                        }}
                                                                                    >
                                                                                        <div
                                                                                            className="d-flex justify-content-start">
                                                                                                <span>
                                                                                                    <FormattedTextRenderer
                                                                        text={answ["showRightSide"]}
                                                                      />
                                                                                                </span>
                                                                                        </div>
                                                                                    </a>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {questionsData[question.id]?.type === "multiple_answer_question" && (
                                            <div className="mb-3">
                                                {questionsData[question.id].answers.map((ans, idx) => (
                                                    <div className="form-check" key={idx}>
                                                        <input className="form-check-input"
                                                               type="checkbox"
                                                               checked={ans.answer === true}

                                                               onChange={(e) => {
                                                                   const isChecked = e.target.checked;

                                                                   setQuestionsData((prevData) => ({
                                                                       ...prevData,
                                                                       [question.id]: {
                                                                           ...prevData[question.id],
                                                                           answers: prevData[question.id].answers.map((item, index) =>
                                                                               index === idx ? {
                                                                                   ...item,
                                                                                   answer: isChecked
                                                                               } : item
                                                                           ),
                                                                       },
                                                                   }));
                                                               }}
                                                        />
                                                        <label className="form-check-label">
                                                        <FormattedTextRenderer
                                                                        text={ans.text}
                                                                      />
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {questionsData[question.id]?.type === "short_answer_question" && (
                                            <div className="mb-3">
                                                <div className="container mt-3">
                                                    <div className="row">
                                                        <div className="col-6">
                                                      <textarea
                                                          className="form-control h-100"
                                                          placeholder="Answer"
                                                          value={questionsData[question.id]?.answers[0]["answer"]}
                                                          rows={4}
                                                          onChange={(e) => {
                                                              const newAnswer = e.target.value;

                                                              setQuestionsData((prevData) => ({
                                                                  ...prevData,
                                                                  [question.id]: {
                                                                      ...prevData[question.id],
                                                                      answers: [{answer: newAnswer}],
                                                                  },
                                                              }));
                                                          }}
                                                      />
                                                        </div>
                                                        <div className="col-6 d-flex">
                                                    <span>
                                                        <FormattedTextRenderer
                                                                        text={questionsData[question.id]?.answers[0]["answer"]}
                                                                      />

                                                    </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                </li>
                                ))}
                        </ul>

                        <br></br>
                        <div className="d-flex justify-content-between">
                            <button type="button" className="btn btn-outline-secondary"
                                    onClick={() => {
                                        if (count !== -1) {
                                            handleSaveQuiz(false);
                                        }
                                        handleAttempt("review");
                                        // window.location.href = "/quizzes";
                                    }
                                    }
                            >
                                Back to Quizzes
                            </button>
                            <div>
                                {page === 0 ? (
                                    <div></div>
                                ) : (
                                    <button type="button" className="btn btn-primary" disabled={page === 0}
                                            style={{marginRight: '3px'}}
                                            onClick={() => setPage((prev) => prev - 1)}>
                                    <i className="bi bi-caret-left"></i> Back to {quiz.sections[page - 1].title}

                                    </button>
                                )}
                                    <button type="button" className="btn btn-success"
                                            style={{marginRight: '3px'}}
                                            disabled={count===-1}
                                            onClick={() => handleSaveQuiz(false)}
                                    >
                                        Save
                                    </button>

                                    {page+1 >= quiz.sections.length ? (
                                        <button type="button" className="btn btn-primary"
                                                style={{marginRight: '3px'}}
                                                disabled={count === -1}
                                                onClick={() => handleSaveQuiz(true)}
                                        >
                                            Save & Finish
                                        </button>
                                    ) : (
                                        <button type="button" className="btn btn-primary"
                                                disabled={page + 1 >= quiz.sections.length}
                                                onClick={() => setPage((prev) => prev + 1)}>
                                            Next {quiz.sections[page + 1].title} <i className="bi bi-caret-right"></i>
                                </button>
                            )}

                                    </div>

                        </div>
                    </div>

                    <div className="col-2"></div>
                </div>
            </div>
        </div>


    );
};

export default GenerateQuizEmbedded;
