import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Questions.css'

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
        .get('http://127.0.0.1:5000/api/questions')
        .then(response => {
          setQuestions(response.data);
          setLoading(false);
        })
        .catch(error => {
          setError('Error loading data');
          setLoading(false);
        });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
      <div>
        <div>
          <h1>Questions</h1>
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
                                </div>
                            </div>
                        )
                        }
                    </div>
                ))
            ) : (
                <p>Načítavam otázky...</p>
            )}

          </div>
      </div>
  );
}

export default Questions;
