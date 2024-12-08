import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Questions.css'

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('All');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsResponse = await axios.get('http://127.0.0.1:5000/api/questions');
        setQuestions(questionsResponse.data);

        const categoriesResponse = await axios.get('http://127.0.0.1:5000/api/categories');
        setCategories(categoriesResponse.data);

        setLoading(false);
      } catch (error) {
        setError('Error loading data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleOpen = () => {
      setIsOpen(!isOpen);
  }

    const fetchQuestionsByCategory = async (categoryId, categoryTitle) => {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:5000/api/categories_show/${categoryId}`);
      setQuestions(response.data);
      setSelectedCategory(categoryId);
      setSelectedCategoryTitle(categoryTitle);
      setLoading(false);
    }

    const handleCategoryClick = async (categoryId, categoryTitle) => {
      fetchQuestionsByCategory(categoryId, categoryTitle);
      setIsOpen(false);
    }

    const openNewQuestionWindow = () => {
        window.location.href = '/question/new-question';
    };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
      <div>
          <div>
              <h1>Questions</h1>
              <button onClick={openNewQuestionWindow}>New Question</button>
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
                      <li onClick={() => handleCategoryClick(1, 'All')}>All</li>
                      {categories.length > 0 ? (
                          categories.map((category, index) => category.id !== 1 && (
                              <li
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id, category.title)}

                              >{category.title}</li>
                          )

                      ) ) : (
                    <p>Načítavam otázky...</p>
                )
                      }
                  </ul>
                </div>
              )}
              </div>
          </div>
          <div className="scroll-box">
              {questions.length > 0 ? (
                  questions.map((question, index) => (
                      <div key={question.id} className="question">
                      {question.versions && (
                            <div>
                                <div className="index">
                                <p>{index+1}</p>
                                </div>
                                <div className="content">
                                    <Link to={`/question/${question.id}`}>
                                <h2>{question.versions.title}</h2>
                                    </Link>
                                <p>Author: {question.versions.author_name}</p>
                                <p>{question.versions.text}</p>
                                    <p>Category: {question.category_id}</p>
                                </div>
                            </div>
                        )
                        }
                    </div>
                ))
            ) : (
                <p>Ziadne otázky...</p>
            )}

          </div>
      </div>
  );
}

export default Questions;
