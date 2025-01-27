import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useParams, useNavigate, useSearchParams} from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useLocation } from 'react-router-dom';
import MatchingQuestion from "./MatchingAnswerQuestions/MatchingQuestion";
import ShortAnswerQuestion from "./ShortAnswerQuestion/ShortAnswerQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestions/MultipleChoiceQuestion";
import Categories from "./CategoriesTree/Categories";
import Navigation from "./Navigation";
import CategorySelect from "./CategoriesTree/CategorySelect"

const NewQuestion = ({questionDetail = false}) => {
    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const idQ = queryParams.get('id');
    const selectedCategory1 = queryParams.get('selected_category');
    const [category, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);

    let subButton = "";
    if (questionDetail){
        subButton = "Update";
    }else{
        subButton = "Submit";
    }

    const page = queryParams.get("page");
    const limit = queryParams.get("limit");
    const offset = queryParams.get("offset");
    const sort = queryParams.get("sort");
    const categoryS = queryParams.get("selected_category");
    const categorySId = queryParams.get("id");
    const filters = queryParams.get("filter-type");
    const authorFilter = queryParams.get("author-filter")

    const [questionType, setQuestionType ] = useState("Question Type");
    const [answers, setAnswers] = useState({});

    const [selectedCategoryId, setSelectedCategoryId] = useState(idQ);
    const [selectedCategory, setSelectedCategory] = useState(selectedCategory1);

    const [categorySelect, setCategorySelect] = useState("");

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');

    const [checkSubmit, setCheckSubmit] = useState([]);


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
        };
        if (!questionDetail ) {
            if (questionType !== 'Question Type' && title !=="" && text !=="") {
                axios.put(`http://127.0.0.1:5000/api/questions/new-question`, updatedData)
                    .then(response => {
                        window.location.href = '/questions';
                    })
                    .catch(error => {
                        console.error('Error saving changes:', error);
                    });
            }else{
                if (title === ""){
                    setCheckSubmit("Title must be provided")
                }else if (questionType === 'Question Type') {
                    setCheckSubmit("No type of question provided")
                }else if (text === ""){
                    setCheckSubmit("Text must be provided")
                }
            }
        }else{
            axios.put(`http://127.0.0.1:5000/api/questions/versions/${id}`, updatedData)
            .then(response => {
                window.location.href = '/questions';
            })
            .catch(error => {
                console.error('Error saving changes:', error);
            });
        }

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
            setTitle(response.data["title"]);
            setText(response.data["text"]);

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
        setLoading(true);
        fetchCategory();
        fetchCategorySelect();
        if (questionDetail) {
            fetchData();
        }
        }, []);

    const AnswerSetter = (newAnswers) => {
        setAnswers(newAnswers);
    };

    return (
        <div>
            <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                <Navigation></Navigation>
            </header>
    <div className="container-fluid" style ={{marginTop: "50px"}}>
        <div className="row">
            <div className="col-2 sidebar"
                     style={{position: "sticky", textAlign: "left", top: "50px", height: "calc(100vh - 60px)"}}>
                    <Categories catPath={""}/>
                </div>
            <div className="col-8">
                {questionDetail && (
                    <h1>Question Detail</h1>
                )}
                {!questionDetail && (
                    <h1>New Question</h1>
                )}

                {
                    checkSubmit.length !==0 && (
                        <div className="alert alert-danger" role="alert">
                            {checkSubmit}
                        </div>
                    )
                }

                <div>
                    <label htmlFor="select-category">Category</label>
                    <select
                        id = "select-category"
                        className="form-select"
                        value={selectedCategoryId || ""}
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
                    />
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
                    />
                </div>

                {questionType === "Matching Question" && (
                    <div>
                        <h2>{questionType}</h2>
                        <MatchingQuestion setAnswers={AnswerSetter} answers={answers}></MatchingQuestion>
                    </div>
                )}

                {questionType === "Short Question" && (
                    <div>
                        <h2>{questionType}</h2>
                        <ShortAnswerQuestion setAnswers={AnswerSetter} answers={answers}></ShortAnswerQuestion>
                    </div>

                )}

                {questionType === "Multiple Choice Question" && (
                    <div>
                        <h2>{questionType}</h2>
                        <MultipleChoiceQuestion setAnswers={AnswerSetter}
                                                answers={answers}></MultipleChoiceQuestion>
                    </div>
                )}

                <div className='mb-3 d-flex mt-3'>
                    <button type="button" className="btn btn-success mb-3 me-3"
                            onClick={() => {
                                saveChanges();
                            }
                            }
                    >{subButton}
                    </button>

                    <button type="button" className="btn btn-primary mb-3"
                            onClick={() => {
                                navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category_id=${categorySId}&category=${categoryS}&sort=${sort}&filter-type=${filters}&author-filter=${authorFilter}`);
                            }
                            }
                    >Back
                    </button>

                </div>

            </div>
            <div className="col-2"></div>
        </div>
    </div>
        </div>
    )
}

export default NewQuestion