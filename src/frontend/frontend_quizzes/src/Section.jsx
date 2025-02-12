import React, {useEffect, useState} from 'react';
import axios from "axios";
import QuestionModal from "./QuestionModal";

const Section = ({ section, selectedQuestions2, questionsAll }) => {
     const [selectedQuestions, setSelectedQuestions] = useState(() => selectedQuestions2 || []);

     const filteredQuestions = selectedQuestions2
  .map(id => questionsAll.find(q => q.id === id))
  .filter((value, index, self) => self.findIndex(q => q.id === value.id) === index);
    useEffect(() => {
    setSelectedQuestions(selectedQuestions2 || []);
}, [selectedQuestions2]);


    return (
        <div className="mb-3">
            <div>
            </div>
            {
                filteredQuestions.map((question) => (
                    <div>
                        {question.id} {question.title}
                    </div>
                    )
                )
            }

        </div>
    )
}

export default Section;