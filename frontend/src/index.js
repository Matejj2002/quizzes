import React from 'react';
import ReactDOM from 'react-dom'; // Use ReactDOM instead of ReactDOM.client
import { BrowserRouter } from 'react-router-dom';
import './Styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');

rootElement.style.width = '100%';
rootElement.style.height = '100%';
rootElement.style.margin = '0';
rootElement.style.padding = '0';

let basename = process.env.REACT_APP_BASENAME || undefined;
if (basename === undefined){
    basename = "";
}
// Use ReactDOM.render instead of createRoot for React 17
ReactDOM.render(
   <BrowserRouter basename={basename}  >
     <App />
  </BrowserRouter>,
  rootElement
);

// For reporting web vitals (optional)
reportWebVitals();
