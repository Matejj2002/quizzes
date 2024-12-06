import { useParams } from 'react-router-dom';
import {useNavigate} from 'react-router-dom'
import { useState, useEffect } from 'react';
import axios from 'axios';


const QuestionDetail = () => {
    const {id} = useParams();
    const [question, setQuestion] = useState(null);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/api/questions/${id}`)
            .then(response => {
                setQuestion(response.data);
                setTitle(response.data.versions.title);
                setText(response.data.versions.text || '');
            })
            .catch(error => {
                console.error('Error fetching question details:', error);
            });
    }, [id]);

    const navigate = useNavigate();

    const saveChanges = () => {
        const updatedData = {
            title: title,
            text: text
        };

        axios.put(`http://127.0.0.1:5000/api/questions/versions/${id}`, updatedData)
            .then(response => {
                setStatusMessage('Zmeny boli úspešne uložené!');
            })
            .catch(error => {
                console.error('Error saving changes:', error);
                setStatusMessage('Chyba pri ukladaní zmien.');
            });
    };

    if (!question || !question.versions) {
        return <div>Loading...</div>;
    }

    const handleButtonClick = () => {
    navigate(`/question-versions`);
    };

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

        <button onClick={saveChanges}>Uloz zmeny</button>
        <button onClick={handleButtonClick}>Ukaz vsetky verzie otazky</button>
    </div>
    );
}

export default QuestionDetail;