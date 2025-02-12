import React, {useEffect, useState} from 'react';
import axios from "axios";
import QuestionModal from "./QuestionModal";

const Section = ({ section, selectedQuestions2 }) => {
    const [questions, setQuestions] = useState([]);
     const [selectedQuestions, setSelectedQuestions] = useState(() => selectedQuestions2 || []);
    const [selectedCategoryId, setSelectedCategoryId] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("supercategory");
    const [categorySelect, setCategorySelect] = useState("");
    const [subCategories, setSubCategories] = useState(false);

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
    setSelectedQuestions(selectedQuestions2 || []);
}, [selectedQuestions2]);

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

    const handleAddQuestions = (newQuestions) => {
    setSelectedQuestions(newQuestions);
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
            <div>
            </div>
            {
                selectedQuestions.map((question) => (
                    <div>
                        {question}
                    </div>
                    )
                )
            }

        </div>
    )
}

export default Section;