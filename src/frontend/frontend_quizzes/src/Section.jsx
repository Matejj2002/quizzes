import React, {useEffect, useState} from 'react';
import axios from "axios";
import QuestionModal from "./QuestionModal";

const Section = ({ section, selectedQuestions2, questionsAll }) => {
     const [selectedQuestions, setSelectedQuestions] = useState(() => selectedQuestions2 || []);

     const filteredQuestions = questionsAll.filter(q => selectedQuestions2.includes(q.id));

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