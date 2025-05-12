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

// Use ReactDOM.render instead of createRoot for React 17
ReactDOM.render(/*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement(App, null)), rootElement);

// For reporting web vitals (optional)
reportWebVitals();