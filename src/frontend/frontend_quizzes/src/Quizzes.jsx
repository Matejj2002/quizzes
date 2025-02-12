import React, {useEffect, useState} from 'react';
import Navigation from "./Navigation";
import Login from "./Login";
import axios from "axios";
import Section from "./Section";
import QuestionModal from "./QuestionModal";

const Quizzes = () => {
    // State hooks for form inputs
    const [quizTitle, setQuizTitle] = useState("");
    const [randomOrder, setRandomOrder] = useState(false);
    const [orderedRevision, setOrderedRevision] = useState(false);
    const [subCategories, setSubCategories] = useState(false);
    const [numberOfAttempts, setNumberOfAttempts] = useState(1);
    const [numberOfCorrections, setNumberOfCorrections] = useState(1);
    const [minutesToFinish, setMinutesToFinish] = useState(1);
    const [dateOpen, setDateOpen] = useState("");
    const [dateClose, setDateClose] = useState("");
    const [dateCheck, setDateCheck] = useState("");

    const [loading, setLoading] = useState(false);
    const [categorySelect, setCategorySelect] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("supercategory");

    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const [section, setSection] = useState([]);

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
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/get_questions_category/${selectedCategoryId}`, {
            params: {
                includeSubCat: subCategories
            }
        });
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };


      useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      try {
        fetchCategorySelect();
        fetchData();
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };

    fetchAllData();

  }, [selectedCategoryId, subCategories]);

      const handleCheckBoxQuestions = (event) => {
          const { value, checked } = event.target;
            const valueInt = parseInt(value);
          setSelectedQuestions((prevSelected) => {
            if (checked) {
              return [...prevSelected, valueInt];
            } else {
              return prevSelected.filter((id) => id !== valueInt);
            }
          });
        };

      const handleNewSection = () => {
            setSection((prevSections) => [
              ...prevSections,
              {   id: prevSections.length + 1,
                  title: `Section ${prevSections.length + 1}`,
                  questions : []
                },
            ]);
          };

      const deleteSection = (sectionId) => {
          setSection((prevSections) =>
            prevSections.filter((section) => section.id !== sectionId)
          );
        };

      const handleAddQuestionsToSection = (sectionId, newQuestions) => {
          console.log(sectionId);
        setSection((prevSections) =>
            prevSections.map((sect) =>
                sect.id === sectionId
                    ? { ...sect, questions: [...sect.questions, ...newQuestions] }
                    : sect
            )
        );
    };

    if (localStorage.getItem("accessToken")) {
        return (
            <div>
                <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                    <Navigation></Navigation>
                </header>
                <div className="container-fluid" style={{ marginTop: "50px" }}>
                    <div className="row">
                        <div className="col-2 sidebar">
                        </div>
                        <div className="col-8">
                            <h1>Quizzes</h1>

                            <div className="mb-3">
                                <label htmlFor="QuizTitle" className="form-label">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="QuizTitle"
                                    placeholder="Quiz title"
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="randomOrder"
                                    checked={randomOrder}
                                    onChange={(e) => setRandomOrder(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="randomOrder">
                                    Random questions for Student
                                </label>
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="Ordered"
                                    checked={orderedRevision}
                                    onChange={(e) => setOrderedRevision(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="Ordered">
                                    Ordered for revision for Teacher
                                </label>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="exampleNumber" className="form-label">
                                    Number of Attempts
                                </label>
                                <input
                                    type="number"
                                    className="form-control w-25"
                                    id="exampleNumber"
                                    placeholder="Enter Number"
                                    min="1"
                                    max="10"
                                    value={numberOfAttempts}
                                    onChange={(e) => setNumberOfAttempts(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="correctionsNum" className="form-label">
                                    Number of Corrections
                                </label>
                                <input
                                    type="number"
                                    className="form-control w-25"
                                    id="correctionsNum"
                                    placeholder="Enter Number"
                                    min="1"
                                    max="10"
                                    value={numberOfCorrections}
                                    onChange={(e) => setNumberOfCorrections(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="timeFinish" className="form-label">
                                    Minutes to Finish
                                </label>
                                <input
                                    type="number"
                                    className="form-control w-25"
                                    id="timeFinish"
                                    placeholder="Enter Minutes"
                                    min="1"
                                    max="500"
                                    value={minutesToFinish}
                                    onChange={(e) => setMinutesToFinish(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="dateOpen" className="form-label">Date Open</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm w-25"
                                    id="dateOpen"
                                    value={dateOpen}
                                    onChange={(e) => setDateOpen(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="dateClose" className="form-label">Date Close</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm w-25"
                                    id="dateClose"
                                    value={dateClose}
                                    onChange={(e) => setDateClose(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="dateCheck" className="form-label">Date to Check</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm w-25"
                                    id="dateCheck"
                                    value={dateCheck}
                                    onChange={(e) => setDateCheck(e.target.value)}
                                />
                            </div>

                            <button type="button" className="btn btn-primary mb-3 me-2"
                                    onClick={handleNewSection}
                            >New Section
                            </button>

                            <button type="button" className="btn btn-primary mb-3"
                            >New Question
                            </button>

                            <div>
                                {section.map((sect) => (
                                    <div>
                                    <Section
                                        section={sect}
                                        handleAddQuestions={(quests) => handleAddQuestionsToSection(sect.id, quests)}
                                    />

                                    <button type="button" className="btn btn-danger mb-3"
                                            onClick={() => deleteSection(sect.id)}
                                    >Delete
                                    </button>
                                        </div>
                                ))}


                            </div>


                        </div>
                        <div className="col-2">
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <Login path={"/quizzes"}></Login>
            </div>
        );
    }
}

export default Quizzes;