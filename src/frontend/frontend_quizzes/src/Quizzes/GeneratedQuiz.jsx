import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../Navigation";
const GeneratedQuiz = () => {
    const location = useLocation();
    const [quiz, setQuiz] = useState(location.state?.quiz);
    const [refreshQuiz, setRefreshQuiz] = useState(location.state?.refreshQuiz || false);
    const [questionsData, setQuestionsData] = useState({});
    const [randomQuestions, setRandomQuestions] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [dateStart, setDateStart] = useState(0);
    const [count, setCount] = useState(0);
    const [minutesToFinish, setMinutesToFinish] = useState(0);

    useEffect(() => {
        if (!quiz?.sections) {
            return;
        }

        axios.post(`http://127.0.0.1:5000/api/new-quiz-template-check`, quiz)
            .then(response => {
                setRandomQuestions(response.data.result[0]);
                setNumberOfQuestions(response.data.number_of_questions)
            })
            .catch(error => {
                console.error('Error fetching random questions:', error);
            });

    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => Math.max(0, Math.floor(prev-1)));
        }, 1000);

        return () => clearInterval(interval);
    }, [dateStart, minutesToFinish]);

    const fetchQuestion = async (questionId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/questions-quiz/${questionId}`);
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
                        fetchQuestions.push(fetchQuestion(question.id));
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
                setQuiz({ ...quiz });
            });
        }
    }, [randomQuestions]);


   useEffect(() => {
    if (Object.keys(questionsData).length !== numberOfQuestions || numberOfQuestions === 0) {
        return;
    }

    const generateQuizWait = async () => {
        setLoading(true);
        await generateQuiz();
        setLoading(false);
    };

    generateQuizWait().then(() => {});

}, [questionsData]);

    const handleSaveQuiz = () => {
        return false;
    }
    const generateQuiz = () => {

        const updatedData = {
            "quiz": quiz,
            "questions": questionsData,
            "student_id": 3,
            "refreshQuiz": refreshQuiz
        }
        axios.put(`http://127.0.0.1:5000/api/new-quiz-student`, updatedData)
                    .then(
                        async (response) => {
                            if (!response.data["created"]) {
                                const result = await axios.get("http://127.0.0.1:5000/api/quiz-student-load",
                                    {
                                        params: {
                                            student_id: 3,
                                            quiz_id: response.data["quiz_id"]
                                        }
                                    }
                                )

                                setQuiz(prevQuiz => ({
                                    ...prevQuiz,
                                    sections: result.data.sections
                                }));

                                const startTime = new Date(result.data.start_time);
                                const startMilis = startTime.getTime()
                                const timeToFinish = result.data.minutes_to_finish * 60 *1000

                                const now = Date.now() + 60 * 60000;
                                const endTime = startMilis + timeToFinish;

                                const nowDate = new Date(now);
                                const endDate = new Date(endTime)

                                const differenceInMilliseconds = endDate.getTime() - nowDate.getTime();
                                const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

                                if (now> endTime){
                                    setCount(0);
                                }else{
                                    setCount(differenceInSeconds);
                                }

                                setRandomQuestions([]);
                            }else{
                                setCount(response.data.time_to_finish *60)
                            }

                            setLoading(false);
                        }
                    )
                    .catch(error => {
                        console.error('Error saving changes:', error);
                    });

    }



    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <h2>Loading...</h2>
            </div>
        );
    }

    const hours = Math.floor(count / 3600);
  const minutes = Math.floor((count % 3600) / 60);
  const seconds = count % 60;

  const showTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return (
        <div>
            <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                <Navigation></Navigation>
            </header>
            <div className="container-fluid" style={{marginTop: "50px"}}>
                <div className="row">
                    <div className="col-2 sidebar"></div>
                    <div className="col-8">
                        {
                            count === 0 ? (
                                <h3>
                                    Review
                                </h3>
                            ) : (
                                <div className="d-flex justify-content-between">
                                    <div><h1>{quiz.title}</h1></div>
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-clock text-primary" style={{fontSize: '2rem', marginRight: "2px"}}></i>
                                        <span className="text-xl font-bold">{showTime}</span>
                                    </div>
                                </div>
                            )
                        }
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            {quiz.sections.map((sect, index) => (
                                <li className="nav-item" role="presentation">
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
                        </ul>


                        {quiz.sections[page]?.questions.map((question, index) => (
                            <div className="border p-3 mb-3 mt-3" key={index}>
                                {/*<h2>{questionsData[question.id]?.title}</h2>*/}
                                <p>{questionsData[question.id]?.text}</p>

                                {questionsData[question.id]?.type === "matching_answer_question" && (
                                    <div>
                                        {/*<p><strong>Matching question</strong></p>*/}
                                        {questionsData[question.id].answers.map((ans, idx) => (
                                            <div className="d-flex justify-content-between" key={idx}>
                                                <p>{ans["leftSide"]}</p>
                                                <p>{ans["rightSide"]}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {questionsData[question.id]?.type === "multiple_answer_question" && (
                                    <div>
                                        {/*<p><strong>Multiple answer question</strong></p>*/}
                                        {questionsData[question.id].answers.map((ans, idx) => (
                                            <div className="form-check" key={idx}>
                                                <input className="form-check-input" type="checkbox"/>
                                                <label className="form-check-label">{ans.text}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {questionsData[question.id]?.type === "short_answer_question" && (
                                    <div>
                                        {/*<p><strong>Short answer question</strong></p>*/}
                                        <input type="text" className="form-control mt-3" placeholder="Answer"/>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="d-flex justify-content-between">
                            <button type="button" className="btn btn-primary" disabled={page === 0} style={{marginRight: '3px'}}
                                    onClick={() => setPage((prev) => prev - 1)}>
                                &lt;
                            </button>

                            <button type="button" className="btn btn-primary" disabled={page + 1 >= quiz.sections.length}
                                    onClick={() => setPage((prev) => prev + 1)}>
                                >
                            </button>
                        </div>
                        <br></br>
                        <div className="d-flex justify-content-between">
                            <button type="button" className="btn btn-success"
                                    onClick={handleSaveQuiz}
                                    disabled={count === 0}
                            >
                                Save
                            </button>

                            <button type="button" className="btn btn-outline-danger"
                                    onClick={() => window.location.href="/quizzes"}
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="col-2"></div>
                </div>
            </div>
        </div>


    );
};

export default GeneratedQuiz;
