import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

const GeneratedQuiz = () => {
    const location = useLocation();
    const [quiz, setQuiz] = useState(location.state?.quiz);
    const [questionsData, setQuestionsData] = useState({});
    const [randomQuestions, setRandomQuestions] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.post(`http://127.0.0.1:5000/api/new-quiz-template-check`, quiz?.sections)
            .then(response => {
                setRandomQuestions(response.data.result[0]);
            })
            .catch(error => {
                console.error('Error fetching random questions:', error);
            });
    }, []);

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
        if (!randomQuestions.length) return;
        setLoading(true);

        let cnt = 0;
        const fetchQuestions = [];

        if (quiz?.sections) {
            quiz.sections.forEach((section) => {
                section.questions.forEach((question) => {
                    if (!questionsData[question.id] && question.questionType === "questions") {
                        fetchQuestions.push(fetchQuestion(question.id));
                    } else {
                        section.questions = section.questions.map((q) => {
                            if (!q.id) {
                                q.id = randomQuestions[cnt];
                                cnt += 1;
                                if (q.id !== undefined) {
                                    fetchQuestions.push(fetchQuestion(q.id));
                                }
                            }
                            return q;
                        });
                    }
                });
            });

            Promise.all(fetchQuestions).then(() => {
                setLoading(false);
                setQuiz({ ...quiz });

                console.log(quiz);
            });
        }
    }, [randomQuestions]);


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <div>
            <h1>{quiz.sections[page]?.title}</h1>

            {quiz.sections[page]?.questions.map((question, index) => (
                <div className="border p-3 mb-3 mt-3" key={index}>

                    {questionsData[question.id]?.type === "matching_answer_question" && (
                        <div>
                            <p><strong>Matching question</strong></p>
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
                            <p><strong>Multiple answer question</strong></p>
                            {questionsData[question.id].answers.map((ans, idx) => (
                                <div className="form-check" key={idx}>
                                    <input className="form-check-input" type="checkbox" />
                                    <label className="form-check-label">{ans.text}</label>
                                </div>
                            ))}
                        </div>
                    )}

                    {questionsData[question.id]?.type === "short_answer_question" && (
                        <div>
                            <p><strong>Short answer question</strong></p>
                            <input type="text" className="form-control mt-3" placeholder="Answer" />
                        </div>
                    )}
                </div>
            ))}

            <button type="button" className="btn btn-primary" disabled={page === 0}
                onClick={() => setPage((prev) => prev - 1)}>
                Previous Page
            </button>

            <button type="button" className="btn btn-primary" disabled={page + 1 >= quiz.sections.length}
                onClick={() => setPage((prev) => prev + 1)}>
                Next Page
            </button>
        </div>
    );
};

export default GeneratedQuiz;
