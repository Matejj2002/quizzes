import React, { useState, useEffect, useCallback } from 'react';
import SelectedTypeDisplay from "./SelectedTypeDisplay";
import axios from 'axios';
import QuestionTypeView from "./QuestionTypeView";

const NewQuestion = () => {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('supercategory');
    const [selectedType, setSelectedType] = useState('Type');
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});

     useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await axios.get('http://127.0.0.1:5000/api/categories');
        setCategories(categoriesResponse.data);

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
    const fetchQuestionsByCategory = async (categoryId, categoryTitle) => {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:5000/api/categories_show/${categoryId}`);
      setSelectedCategory(categoryId);
      setSelectedCategoryTitle(categoryTitle);
      setLoading(false);
    }

    const handleCategoryClick = async (categoryId, categoryTitle) => {
      fetchQuestionsByCategory(categoryId, categoryTitle);
      setIsOpen(false);
    }

    const AnswerSetter = (newAnswers) => {
        setAnswers(newAnswers);
    };

    const SelectedTypeSetter = (newType) => {
        setSelectedType(newType);
    };

    const saveChanges = () => {
        const updatedData = {
            title: title,
            text: text,
            category_id: selectedCategory,
            questionType: selectedType,
            answers: answers,
        };
        //console.log(updatedData);
        if (selectedType !== 'Type') {
            axios.put(`http://127.0.0.1:5000/api/questions/new-question`, updatedData)
                .then(response => {
                    window.location.href = '/questions';
                })
                .catch(error => {
                    console.error('Error saving changes:', error);
                });
        }
    }

    const toggleOpen = () => {
      setIsOpen(!isOpen);
    }

    const handleAnswersChange = useCallback(
    (newAnswers) => {
      setAnswers((prev) => ({
        ...prev,
        [selectedType]: newAnswers,
      }));
    },
    [selectedType]
  );


    console.log(answers);

        return (
            <div>
                <h1>New Question</h1>

                <div>
                    <h2>Title</h2>
                    <textarea
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    > </textarea>
                </div>
                <div>
                    <h2>Text Otazky</h2>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    > </textarea>
                </div>

                <div className="container">
                    <button
                        onClick={toggleOpen}
                        className={`collapsible ${isOpen ? "active" : ""}`}
                    >
                        {selectedCategoryTitle}
                    </button>
                    {isOpen && (
                        <div className="content-menu">
                            <ul className="task-list-menu">
                                <li onClick={() => handleCategoryClick(1, 'supercategory')}>supercategory</li>
                                {categories.length > 0 ? (
                                    categories.map((category, index) => category.id !== 1 && (
                                            <li
                                                key={category.id}
                                                onClick={() => handleCategoryClick(category.id, category.title)}

                                            >{category.title}</li>
                                        )
                                    )) : (
                                    <p>Načítavam otázky...</p>
                                )
                                }
                            </ul>
                        </div>
                    )}
                </div>

                <QuestionTypeView setAnswers={AnswerSetter} setType={SelectedTypeSetter} handleAnswersChange={handleAnswersChange} startType={"Type"} answersBe={answers} />

                <button onClick={saveChanges}>Uloz zmeny</button>
            </div>
        );
}
export default NewQuestion;