import { useParams } from 'react-router-dom';
import {useNavigate} from 'react-router-dom'
import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import QuestionTypeView from "./QuestionTypeView";

//Dorobit vysvietenie typu otazky, potom vybratie moznosti z api, ktore su tam a vypisanie
const QuestionDetail = () => {
    const {id} = useParams();
    const [question, setQuestion] = useState(null);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [answers, setAnswers] = useState({});
    const [selectedType, setSelectedType] = useState('Type');

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/api/questions/${id}`)
            .then(response => {
                setQuestion(response.data);
                console.log(response.data);
                setTitle(response.data.versions.title);
                setText(response.data.versions.text || '');
            })
            .catch(error => {
                console.error('Error fetching question details:', error);
            });

        axios.get(`http://127.0.0.1:5000/api/question-version-choice/${id}`).then(response => {
            console.log(response.data);
            if (response.data.type === 'multiple_answer_question'){
                //console.log("AAAAA");
                setSelectedType("MultipleChoiceQuestion");
                setAnswers(response.data.texts);

                //console.log("QuDetail Type: " + selectedType);
            }

        })
            .catch(error => {
                console.error('Error fetching question details:', error);
            })
    }, [id]);


    const navigate = useNavigate();

    const handleAnswersChange = useCallback(
    (newAnswers) => {
      setAnswers((prev) => ({
        ...prev,
        [selectedType]: newAnswers,
      }));
    },
    [selectedType]
  );

    const saveChanges = () => {
        const updatedData = {
            title: title,
            text: text,
            questionType: selectedType,
            answers: answers
        };

        console.log(answers);

        axios.put(`http://127.0.0.1:5000/api/questions/versions/${id}`, updatedData)
            .then(response => {
                window.location.href = '/questions';
            })
            .catch(error => {
                console.error('Error saving changes:', error);
            });
    };

    if (!question || !question.versions) {
        return <div>Loading...</div>;
    }

    const handleButtonClick = () => {
    navigate(`/question-versions`);
    };

    const AnswerSetter = (newAnswers) => {
        setAnswers(newAnswers);
    };

    const SelectedTypeSetter = (newType) => {
        setSelectedType(newType);
    };

    if (selectedType === 'Type') {
        return <div>Loading...</div>;
    }

    return (
    <div>
      <h1>{question.versions.title}</h1>

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

        <div>
            <QuestionTypeView setAnswers={AnswerSetter} setType={SelectedTypeSetter} handleAnswersChange={handleAnswersChange} startType={selectedType} answersBe={answers}/>

        </div>



        <button onClick={saveChanges}>Uloz zmeny</button>
        <button onClick={handleButtonClick}>Ukaz vsetky verzie otazky</button>
    </div>
    );
}

export default QuestionDetail;