import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Main from './Main';
import SignUp from './Signup';
import QuizDetails from './QuizDetail';
import CreateQuiz from './CreateQuiz';
import EditQuiz from './EditQuiz';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/quiz/:id" element={<QuizDetails />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/edit/:id" element={<EditQuiz />} />
      </Routes>
    </div>
  );
}

export default App;