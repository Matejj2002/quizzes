import { useParams } from 'react-router-dom';
import {useNavigate} from 'react-router-dom'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewQuestion = () => {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('supercategory');
    const [loading, setLoading] = useState(true);

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

    const saveChanges = () => {
        const updatedData = {
            title: title,
            text: text,
            category_id: selectedCategory
        };

        axios.put(`http://127.0.0.1:5000/api/questions/new-question`, updatedData)
            .then(response => {
                window.location.href = '/questions';
            })
            .catch(error => {
                console.error('Error saving changes:', error);
            });
    }

    const toggleOpen = () => {
      setIsOpen(!isOpen);
  }

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

                <button onClick={saveChanges}>Uloz zmeny</button>
            </div>
        );
}
export default NewQuestion;