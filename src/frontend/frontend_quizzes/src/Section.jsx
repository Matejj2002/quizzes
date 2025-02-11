import React, {useEffect, useState} from 'react';
import axios from "axios";
import QuestionModal from "./QuestionModal";

const Section = () => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("supercategory");
    const [categorySelect, setCategorySelect] = useState("");
    const [subCategories, setSubCategories] = useState(false);

    const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

    const fetchCategorySelect = async () => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/get-category-tree-array`)
            setCategorySelect(response.data);
      }catch (error){
      }finally {
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
      }
    };

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

    useEffect(() => {
    const fetchAllData = async () => {
      try {
        fetchCategorySelect();
        fetchData();
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };

    fetchAllData();

  }, [selectedCategoryId, subCategories]);

    return (
        <div className="mb-3">
            <h2>Section</h2>
            <div>
                <button type="button" className="btn btn-primary" data-bs-toggle="modal"
                        data-bs-target="#staticBackdrop"
                    onClick={handleShowModal}
                    >Add Question
                </button>
                <QuestionModal></QuestionModal>
                <br></br>
                <label htmlFor="select-category">Category</label>
                <select
                    id="select-category"
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

            <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="includeSubcategories"
                    checked={subCategories}
                    onChange={(e) => setSubCategories(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeSubcategories">
                    Include subcategories
                </label>
            </div>

            <details>
                <summary>Questions</summary>
                <div>
                    <label>Questions</label>
                    {Array.isArray(questions) && questions.length > 0 ? (
                        <div>
                            {questions.map((question) => (
                                <div key={question.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`question-${question.id}`}
                                        value={question.id}
                                        className="form-checkbox"
                                        onChange={handleCheckBoxQuestions}
                                        checked={selectedQuestions.includes(question.id)}
                                    />
                                    <label htmlFor={`question-${question.id}`}>
                                        {question.title || "No title"}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No questions available</p>
                    )}
                </div>
            </details>
        </div>
    )
}

export default Section;