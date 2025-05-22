import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useParams, useNavigate} from 'react-router-dom';
import { Toast, ToastContainer, Button } from 'react-bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useLocation } from 'react-router-dom';
import MatchingQuestion from "./MatchingAnswerQuestions/MatchingQuestion";
import ShortAnswerQuestion from "./ShortAnswerQuestion/ShortAnswerQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestions/MultipleChoiceQuestion";
import Categories from "../Categories/CategoriesTree/Categories";
import Navigation from "../components/Navigation";

import FormattedTextRenderer from "../components/FormattedTextRenderer";
import FormattedTextInput from "../components/FormattedTextInput";

const NewQuestion = ({subButText="Submit"}) => {
    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;

    // const subButText = location.state.subButText;

    const apiUrl = process.env.REACT_APP_API_URL;

    const [category, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);

    const catPath = location.state['catPath'];
    const page = location.state['page'];
    const limit = location.state['limit'];
    const offset = location.state['offset'];
    const sort = location.state['sort'];
    const selectedCategory1 = location.state['selectedCategory'];
    const userId = location.state.userId;
    const userRole = location.state.userRole;
    const idQ = location.state['id'] === 1 ? 2 : location.state['id'];
    const filters = location.state['filterType'];
    const authorFilter = location.state['authorFilter'];
    const newQuestions = location.state["newQuestions"];
    const back = location.state["back"];
    const [questionType, setQuestionType ] = useState("Matching Question");
    const [answers, setAnswers] = useState({});
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(0);

    const [selectedCategoryId, setSelectedCategoryId] = useState(idQ);
    const [selectedCategory, setSelectedCategory] = useState(selectedCategory1);

    const [categorySelect, setCategorySelect] = useState("");

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [questionFeedback, setQuestionFeedback] = useState('');
    const [questionPositiveFeedback, setQuestionPositiveFeedback] = useState('')

    const [checkSubmit, setCheckSubmit] = useState("");

    const [createMoreQuestions, setCreateMoreQuestions] = useState(newQuestions || false);

    const [showToast, setShowToast] = useState(false);

    let titleText = "";
    let buttonText = "";
    if (subButText === "Submit"){
        titleText = "New Question";
        buttonText = "Create Question";
    }
    if (subButText === "Copy"){
        titleText = "Copy of " + location.state["questionTitle"];
        buttonText = "Copy Question"
    }
    if (subButText === "Update"){
        if (selectedVersion !==0){
            titleText = "Retrieve Question";
            buttonText = "Retrieve Question";
        }else {
            titleText = "Update Question";
            buttonText = "Update Question";
        }
    }


      const handleShowToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      };

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
            author: userId,
            feedback: questionFeedback,
            positiveFeedback: questionPositiveFeedback
        };
        if (subButText === "Submit" || subButText === "Copy") {
            if (title !=="" && text !=="") {
                axios.put(apiUrl+`questions/new-question`, updatedData)
                    .then(response => {
                        if (createMoreQuestions){
                            // setTitle("");
                            // setText("");
                            // setQuestionType("Matching Question");
                            // setSelectedCategoryId(idQ);
                            // setSelectedCategory(selectedCategory1);
                            // setCategorySelect("");
                            // setAnswers({});
                            // setQuestionFeedback("");
                            // setQuestionPositiveFeedback("");
                            // setCheckSubmit([]);
                            sessionStorage.setItem("scrollToTop", "true");
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
                                                newQuestions: createMoreQuestions,
                                                userRole: userRole,
                                                userId: userId,
                                                scrollTop: true
                                            }
                                        });
                             // window.location.reload();
                            handleShowToast();
                            window.scrollTo(0,0);
                        }else {
                            window.location.href = quizzesUrl+'/questions';
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
                axios.put(apiUrl+`questions/versions/${id}`, updatedData)
                    .then(response => {
                        window.location.href = quizzesUrl+'/questions';
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


    const fetchCategory = async () => {
      try{
            const response = await axios.get(apiUrl+`categories`)
            setCategory(response.data);
      }catch (error){
      }finally {
          setLoading(false);
      }
      }

      const fetchCategorySelect = async () => {
      try{
            const response = await axios.get(apiUrl+`get-category-tree-array`)
            setCategorySelect(response.data);
      }catch (error){
      }finally {
          setLoading(false);
      }
      }

    const fetchData = async () => {
        try{
            const response = await axios.get(apiUrl+`question-version-choice/${id}`)

            setVersions(response.data);

            setSelectedCategory(response.data[0]["category_name"]);
            setSelectedCategoryId(response.data[0]["category_id"]);
            setTitle(response.data[0]["title"]);
            setText(response.data[0]["text"]);
            setQuestionFeedback(response.data[0]["question_feedback"])
            setQuestionPositiveFeedback(response.data[0]["question_positive_feedback"])

            if (response.data[0]["type"] === "matching_answer_question"){
                setQuestionType("Matching Question")
            }

            if (response.data[0]["type"] === "multiple_answer_question"){
                setQuestionType("Multiple Choice Question")
            }

            if (response.data[0]["type"] === "short_answer_question"){
                setQuestionType("Short Question")
            }

            await AnswerSetter(response.data[0]["answers"]);
            setAnswers(response.data[0]["answers"]);

        }catch(error){

        }finally {
            setLoading(false);

        }
    }

    const fetchAllData = async () => {
      setLoading(true);

      try {
          fetchCategory();
          fetchCategorySelect();

        if (subButText !== "Submit") {
          await fetchData().then(() => {
              setLoading(false);
          });
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };
    useEffect(() => {
        if (sessionStorage.getItem("scrollToTop") === "true") {
            setTimeout(() => {
              window.scrollTo(0, 0);
              sessionStorage.removeItem("scrollToTop");
            }, 50);
          }
        fetchAllData();

  }, []);


    useEffect(() =>{
        if (versions.length === 0){
            return;
        }
        const fetchDataWait = async () => {
            setSelectedCategory(versions[selectedVersion]["category_name"]);
            setSelectedCategoryId(versions[selectedVersion]["category_id"]);
            setTitle(versions[selectedVersion]["title"]);
            setText(versions[selectedVersion]["text"]);
            setQuestionFeedback(versions[selectedVersion]["question_feedback"])
            setQuestionPositiveFeedback(versions[selectedVersion]["question_positive_feedback"])

            if (versions[selectedVersion]["type"] === "matching_answer_question") {
                setQuestionType("Matching Question")
            }

            if (versions[selectedVersion]["type"] === "multiple_answer_question") {
                setQuestionType("Multiple Choice Question")
            }

            if (versions[selectedVersion]["type"] === "short_answer_question") {
                setQuestionType("Short Question")
            }

            await AnswerSetter(versions[selectedVersion]["answers"]);
            setAnswers(versions[selectedVersion]["answers"]);
        }
        fetchDataWait();
    }, [selectedVersion])


    const AnswerSetter = async (newAnswers) => {
        setAnswers(newAnswers)
    };

    if (userRole !=="teacher"){
        navigate("/quizzes");
    }

        return (
            <div>

                    <Navigation active="Questions"></Navigation>

                <div className="container-fluid">
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
                                <label htmlFor="select-version">Question Version</label>
                                <select
                                    id="select-version"
                                    className="form-select"
                                    onChange={(e) => {
                                        setSelectedVersion(Number(e.target.value))
                                    }
                                    }
                                    >

                                    {versions.map((version, index) => (
                                          <option key={index} value={index}>
                                            Version {versions.length- index}
                                          </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="select-category">Category</label>
                                <select
                                    id="select-category"
                                    className="form-select"
                                    disabled={selectedVersion!==0}
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
                                    disabled={selectedVersion!==0}
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
                                        disabled={selectedVersion!==0}
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
                                    <FormattedTextInput text={text} handleFunction={setText} isDisabled={selectedVersion!==0}></FormattedTextInput>
                                    <div className="invalid-feedback">
                                        Please enter text of question
                                    </div>
                                </div>
                            </form>

                            <div className="mb-3">
                                <label htmlFor="questionFeedback" className="form-label">
                                    Question negative feedback
                                </label>
                                <FormattedTextInput text={questionFeedback} handleFunction={setQuestionFeedback} isDisabled={selectedVersion!==0}></FormattedTextInput>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="questionPositiveFeedback" className="form-label">
                                    Question positive feedback
                                </label>
                                <FormattedTextInput text={questionPositiveFeedback} handleFunction={setQuestionPositiveFeedback} isDisabled={selectedVersion!==0}></FormattedTextInput>
                            </div>

                            {questionType === "Matching Question" && (
                                <div>
                                    <h2>{questionType}</h2>
                                    <MatchingQuestion setAnswers={AnswerSetter}
                                                      answers={answers} isDisabled={selectedVersion!==0}></MatchingQuestion>
                                </div>
                            )}

                            {questionType === "Short Question" && (
                                <div>
                                    <h2>{questionType}</h2>
                                    <ShortAnswerQuestion setAnswers={AnswerSetter}
                                                         answers={answers} isDisabled={selectedVersion!==0}></ShortAnswerQuestion>
                                </div>

                            )}

                            {questionType === "Multiple Choice Question" && (
                                <div>
                                    <h2>{questionType}</h2>
                                    <MultipleChoiceQuestion setAnswers={AnswerSetter}
                                                            answers={answers} isDisabled={selectedVersion!==0}></MultipleChoiceQuestion>
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
                                                if (back) {
                                                    navigate(-1);
                                                }
                                                else {
                                                    navigate(`/questions/${catPath}?page=${page}&limit=${limit}&offset=${offset}&category=${selectedCategory1}&category_id=${idQ}&sort=${sort}&filter-type=${filters}&author-filter=${authorFilter}`);
                                                }
                                                }
                                            }
                                    >Back
                                    </button>

                                    <button type="button" className="btn btn-success mb-3"
                                            disabled={title.length === 0 || text.length === 0 || back}
                                            onClick={() => {
                                                saveChanges();
                                            }
                                            }
                                    >{buttonText}
                                    </button>
                                </div>
                            </div>

                        </div>
                        <div className="col-2"></div>
                    </div>
                </div>

                <ToastContainer position="bottom-end" className="p-3">
                <Toast show={showToast} onClose={() => setShowToast(false)} bg="success">
                  <Toast.Header closeButton>
                    <strong className="me-auto">Question {title} was created.</strong>
                  </Toast.Header>
                  <Toast.Body className="text-white">Created sucesfully.</Toast.Body>
                </Toast>
              </ToastContainer>
            </div>
        )
}

export default NewQuestion