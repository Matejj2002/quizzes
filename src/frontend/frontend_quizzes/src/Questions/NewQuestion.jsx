import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useParams, useNavigate} from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useLocation } from 'react-router-dom';
import MatchingQuestion from "../MatchingAnswerQuestions/MatchingQuestion";
import ShortAnswerQuestion from "../ShortAnswerQuestion/ShortAnswerQuestion";
import MultipleChoiceQuestion from "../MultipleChoiceQuestions/MultipleChoiceQuestion";
import Categories from "../CategoriesTree/Categories";
import Navigation from "../Navigation";
import Login from "../Login";

const NewQuestion = ({subButText="Submit"}) => {
    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    let titleText = "";
    if (subButText === "Submit"){
        titleText = "New Question";
    }
    if (subButText === "Copy"){
        titleText = "Copy of " + location.state["questionTitle"];
    }
    if (subButText === "Update"){
        titleText = "Update Question";
    }

    const [category, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);

    const catPath = location.state['catPath'];
    const page = location.state['page'];
    const limit = location.state['limit'];
    const offset = location.state['offset'];
    const sort = location.state['sort'];
    const selectedCategory1 = location.state['selectedCategory'];
    const idQ = location.state['id'];
    const filters = location.state['filterType'];
    const authorFilter = location.state['authorFilter'];
    const newQuestions = location.state["newQuestions"];

    const [questionType, setQuestionType ] = useState("Matching Question");
    const [answers, setAnswers] = useState({});

    const [selectedCategoryId, setSelectedCategoryId] = useState(idQ);
    const [selectedCategory, setSelectedCategory] = useState(selectedCategory1);

    const [categorySelect, setCategorySelect] = useState("");

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [questionFeedback, setQuestionFeedback] = useState('')

    const [checkSubmit, setCheckSubmit] = useState("");

    const [author, setAuthor] = useState("");

    const [createMoreQuestions, setCreateMoreQuestions] = useState(newQuestions || false);

    const saveChanges = () => {
        let answersSel = []
        if (questionType === "Matching Question"){
            answersSel = {"MatchingQuestion":answers};
        }
        if (questionType === "Short Question"){
            answersSel = {"ShortAnswerQuestion": answers};
        }
        if (questionType === "Multiple Choice Question"){
            answersSel = {"MultipleChoiceQuestion": answers};
        }

        const updatedData = {
            title: title,
            text: text,
            category_id: selectedCategoryId,
            questionType: questionType,
            answers: answersSel,
            author: author,
            feedback: questionFeedback
        };
        if (subButText === "Submit" || subButText === "Copy") {
            if (title !=="" && text !=="") {
                axios.put(`http://127.0.0.1:5000/api/questions/new-question`, updatedData)
                    .then(response => {
                        if (createMoreQuestions){
                            setTitle("");
                            setText("");
                            setQuestionType("Matching Question");
                            setSelectedCategoryId(idQ);
                            setSelectedCategory(selectedCategory1);
                            setCategorySelect("");
                            setAnswers({});
                            setCheckSubmit([]);


                            navigate(`/question/new-question`, {
                                            state: {
                                                catPath: category,
                                                id: idQ,
                                                selectedCategory: selectedCategory1,
                                                limit: limit,
                                                offset: offset,
                                                sort: sort,
                                                page: page,
                                                filterType: filters,
                                                authorFilter: authorFilter,
                                                newQuestions: createMoreQuestions
                                            }
                                        });
                             window.location.reload();
                        }else {
                            window.location.href = '/questions';
                        }
                    })
                    .catch(error => {
                        console.error('Error saving changes:', error);
                    });
            }else{
                if (title === ""){
                    setCheckSubmit("Title must be provided")
                }else if (text === ""){
                    setCheckSubmit("Text must be provided")
                }
            }
        }else{
            if (title !=="" && text !=="") {
                axios.put(`http://127.0.0.1:5000/api/questions/versions/${id}`, updatedData)
                    .then(response => {
                        window.location.href = '/questions';
                    })
                    .catch(error => {
                        console.error('Error saving changes:', error);
                    });
            }else{
                if (title === ""){
                    setCheckSubmit("Title must be provided")
                }else if (text === ""){
                    setCheckSubmit("Text must be provided")
                }
            }
        }

    }

    async function getUSerData() {
        await fetch("http://127.0.0.1:5000/getUserData", {
                method: "GET",
                headers: {
                    "Authorization" : "Bearer " + localStorage.getItem("accessToken")
                }
            }

        ).then((response) => {
            return response.json();
        }).then((data) => {
            setAuthor(data.login);
        })
    }

    const fetchCategory = async () => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/categories`)
            setCategory(response.data);
      }catch (error){
      }finally {
          setLoading(false);
      }
      }

      const fetchCategorySelect = async () => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/get-category-tree-array`)
            setCategorySelect(response.data);
      }catch (error){
      }finally {
          setLoading(false);
      }
      }

    const fetchData = async () => {
        try{
            const response = await axios.get(`http://127.0.0.1:5000/api/question-version-choice/${id}`)
            setSelectedCategory(response.data["category_name"]);
            setSelectedCategoryId(response.data["category_id"]);
            setTitle(response.data["title"]);
            setText(response.data["text"]);
            setQuestionFeedback(response.data["question_feedback"])

            if (response.data["type"] === "matching_answer_question"){
                setQuestionType("Matching Question")
                setAnswers(response.data["answers"]);
            }

            if (response.data["type"] === "multiple_answer_question"){
                setQuestionType("Multiple Choice Question")
                setAnswers(response.data["answers"]);
            }

            if (response.data["type"] === "short_answer_question"){
                setQuestionType("Short Question")
                setAnswers(response.data["answers"]);
            }

        }catch(error){

        }finally {
            setLoading(false);

        }
    }

    useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      try {
        fetchCategory();
        fetchCategorySelect();
        getUSerData();

        if (subButText !== "Submit") {
          fetchData();
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };

    fetchAllData();

  }, []);

    const AnswerSetter = async (newAnswers) => {
        setAnswers(newAnswers)
    };

        return localStorage.getItem("accessToken") ? (
            <div>
                <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                    <Navigation active="Questions"></Navigation>
                </header>
                <div className="container-fluid" style={{marginTop: "50px"}}>
                    <div className="row">
                        <div className="col-2 sidebar"
                             style={{position: "sticky", textAlign: "left", top: "50px", height: "calc(100vh - 60px)"}}>
                            <Categories catPath={""}/>
                        </div>
                        <div className="col-8">
                            <h1>{titleText}</h1>

                            {
                                checkSubmit.length !== 0 && (
                                    <div className="alert alert-danger" role="alert">
                                        {checkSubmit}
                                    </div>
                                )
                            }

                            <div>
                                <label htmlFor="select-category">Category</label>
                                <select
                                    id="select-category"
                                    className="form-select"
                                    value={selectedCategoryId}
                                    onChange={(e) => {
                                        const selectedOption = categorySelect.find(
                                            (cat) => cat.id === parseInt(e.target.value)
                                        );
                                        setSelectedCategory(selectedOption.title);
                                        setSelectedCategoryId(selectedOption.id);
                                    }}
                                >
                                    <option value="" disabled>
                                        Select a category
                                    </option>
                                    {Array.isArray(categorySelect) &&
                                        categorySelect.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.title}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="mb-3 mt-3">
                                <label htmlFor="questionType" className="form-label">
                                    Question Type
                                </label>
                                <select
                                    id="questionType"
                                    className="form-select"
                                    value={questionType}
                                    onChange={(e) => setQuestionType(e.target.value)}
                                >
                                    <option value="Matching Question">Matching Question</option>
                                    <option value="Multiple Choice Question">Multiple Choice Question</option>
                                    <option value="Short Question">Short Question</option>
                                </select>
                            </div>

                            <form className="was-validated">
                                <div className="mb-3">
                                    <label htmlFor="questionTitle" className="form-label">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="questionTitle"
                                        value={title}
                                        placeholder="Question title"
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                    <div className="invalid-feedback">
                                        Please enter title
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="questionText" className="form-label">
                                        Question Text
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="questionText"
                                        value={text}
                                        placeholder="Question text"
                                        onChange={(e) => setText(e.target.value)}
                                        rows={4}
                                        required
                                    />

                                    <div className="invalid-feedback">
                                        Please enter text of question
                                    </div>
                                </div>
                            </form>

                            <div className="mb-3">
                                <label htmlFor="questionFeedback" className="form-label">
                                    Question Feedback
                                </label>
                                <textarea
                                    className="form-control"
                                    id="questionFeedback"
                                    value={questionFeedback}
                                    placeholder="Question feedback"
                                    onChange={(e) => setQuestionFeedback(e.target.value)}
                                    rows={4}
                                    />
                                </div>

                                {questionType === "Matching Question" && (
                                    <div>
                                        <h2>{questionType}</h2>
                                        <MatchingQuestion setAnswers={AnswerSetter}
                                                          answers={answers}></MatchingQuestion>
                                    </div>
                                )}

                                {questionType === "Short Question" && (
                                    <div>
                                        <h2>{questionType}</h2>
                                        <ShortAnswerQuestion setAnswers={AnswerSetter}
                                                             answers={answers}></ShortAnswerQuestion>
                                    </div>

                                )}

                                {questionType === "Multiple Choice Question" && (
                                    <div>
                                        <h2>{questionType}</h2>
                                        <MultipleChoiceQuestion setAnswers={AnswerSetter}
                                                                answers={answers}></MultipleChoiceQuestion>
                                    </div>
                                )}

                            <div className='mb-3'>
                                {subButText === "Submit" && (
                                    <div className="form-check me-3 mb-3">
                                        <input className="form-check-input" type="checkbox"
                                               name="independentAttempts"
                                               id="exampleRadios2" value="option2"
                                               checked={createMoreQuestions}
                                               onChange={(e) => setCreateMoreQuestions(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="exampleRadios2">
                                            Create more questions
                                        </label>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between">
                                    <button type="button" className="btn btn-outline-primary mb-3"
                                            onClick={() => {
                                                navigate(`/questions/${catPath}?page=${page}&limit=${limit}&offset=${offset}&category=${selectedCategory1}&category_id=${idQ}&sort=${sort}&filter-type=${filters}&author-filter=${authorFilter}`);
                                            }
                                            }
                                    >Back
                                    </button>

                                    <button type="button" className="btn btn-success mb-3"
                                            disabled={title.length === 0 || text.length === 0}
                                            onClick={() => {
                                                saveChanges();
                                            }
                                            }
                                    >{subButText}
                                    </button>
                                </div>
                            </div>

                        </div>
                        <div className="col-2"></div>
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <Login></Login>
            </div>
        )
}

export default NewQuestion