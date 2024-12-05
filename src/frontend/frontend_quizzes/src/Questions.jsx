import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
      <h1>Questions</h1>
      {questions.length > 0 ? (
        questions.map((question) => (
          <div key={question.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h2>Category: {question.category}</h2>

            {question.versions ? (
              <div>
                <h3>Version: {question.versions.title}</h3>
                <p><strong>Created on:</strong> {question.versions.dateCreated}</p>
                <p><strong>Text:</strong> {question.versions.text ? question.versions.text : 'No text provided'}</p>
                <p><strong>Author name:</strong> {question.versions.author_name}</p>
              </div>
            ) : (
              <p>No versions available for this question.</p>
            )}
          </div>
        ))
      ) : (
        <div>No questions available</div>
      )}
    </div>
  );
};

export default Questions;
