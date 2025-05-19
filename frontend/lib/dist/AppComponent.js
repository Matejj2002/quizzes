import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Provider } from 'react-redux';
import initStore from './redux/store';
import { connect } from 'react-redux';
import QuizList from "./components/QuizList";
import QuizAttempt from "./components/QuizAttempt";
import GenerateQuizEmbedded from "./components/GenerateQuizEmbedded";
import QuizReviewEmbedded from "./components/QuizReviewEmbedded";
import axios from "axios";
export default function configure(backendUrl) {
  return {
    prepare: (initialState, additionalArgs) => {
      const syncedState = JSON.parse(JSON.stringify(initialState)) || {};
      const instance = {
        store: initStore(backendUrl),
        syncedState,
        ghAccessToken: additionalArgs?.ghAccessToken
      };
      const getState = instance => JSON.parse(JSON.stringify(instance.syncedState));
      return {
        instance,
        getState
      };
    },
    AppComponent: props => /*#__PURE__*/React.createElement("div", {
      className: `quiz`
    }, /*#__PURE__*/React.createElement(Provider, {
      store: props.instance.store
    }, /*#__PURE__*/React.createElement(AppComponent, {
      instance: props.instance,
      onStateChange: props.onStateChange,
      backendUrl: backendUrl
    })))
  };
}
function AppComponent({
  instance,
  onStateChange,
  isEdited,
  backendUrl
}) {
  const [quizId, setQuizId] = useState(instance.syncedState.quizId);
  const [quiz, setQuiz] = useState(instance.syncedState.quiz);
  const [attempt, setAttempt] = useState(undefined);
  const [reviewData, setReviewData] = useState(instance.syncedState.reviewData || {});
  console.log("QUIZ id: ", quizId, "QUIZ: ", quiz, "REVIEW data: ", reviewData);
  const [userData, setUserData] = useState([]);
  const [keyGenerateQuiz, setKeyGenerateQuiz] = useState(0);
  const [keyReviewQuiz, setKeyReviewQuiz] = useState(0);
  const forceRerender = () => {
    setKeyGenerateQuiz(prev => prev + 1);
    setKeyReviewQuiz(prev => prev + 1);
  };
  const handleChooseId = async id => {
    setQuizId(id);
  };
  const handleChooseQuiz = async quiz => {
    setQuiz(quiz);
  };
  const handleAttempt = async attempt => {
    setAttempt(attempt);
  };
  const handleReviewData = async (quiz, quizId, feedback, conditionToRetake, userId, userRole) => {
    const RewData = {
      quiz,
      quizId,
      feedback,
      conditionToRetake,
      userId,
      userRole
    };
    setReviewData(RewData);
  };
  useEffect(() => {
    if (quiz) {
      handleReviewData(quiz, quiz.quiz_id, quiz.feedbackTypeAfterClose, !(quiz.is_opened === false || quiz.quizzes.length + 1 >= quiz["number_of_corrections"]), userData["id_user"], "student").then(() => {
        instance.syncedState = {
          quiz: quiz,
          quizId: quizId,
          reviewData: reviewData
        };
        onStateChange();
      });
    }
  }, [quiz, attempt]);
  async function getUserData() {
    await fetch(backendUrl + "getUserData", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    }).then(response => {
      return response.json();
    }).then(data => {
      setUserData(data);
    });
  }
  useEffect(() => {
    getUserData().then(() => {
      fetchStudent();
    });
  }, []);
  const userDt = JSON.parse(localStorage.getItem('user'));
  const fetchStudent = async () => {
    try {
      const response = await axios.get(backendUrl + 'get-user-data_logged', {
        params: {
          "userName": userDt.login
        }
      });
      fetchQuizzes(response.data.result.id_user);
    } catch (error) {
      console.error(error);
    } finally {}
  };
  const fetchQuizzes = async studentId => {
    try {
      console.log("Fetched quiz");
      const response = await axios.get(backendUrl + `get-quiz-template`, {
        params: {
          "studentId": studentId,
          "quizId": quizId
        }
      });
      setQuiz(response.data.result);
    } catch (error) {
      console.error(error);
    } finally {}
  };
  useEffect(() => {
    if (attempt === "review") {
      console.log("SEM");
      setAttempt(undefined);
      fetchStudent().then(handleReviewData(quiz, quiz.quiz_id, quiz.feedbackTypeAfterClose, !(quiz.is_opened === false || quiz.quizzes.length + 1 >= quiz["number_of_corrections"]), userData["id_user"], "student"));
    }
  }, [attempt]);
  useEffect(() => {
    console.log("ZMENENE :", quizId);
    instance.syncedState = {
      quiz: quiz,
      quizId: quizId,
      reviewData: reviewData
    };
    onStateChange();
  }, [quizId]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, quizId === undefined && /*#__PURE__*/React.createElement(QuizList, {
    chooseId: handleChooseId,
    chooseQuiz: handleChooseQuiz,
    userName: userDt.login,
    backendUrl: backendUrl
  }), quizId !== undefined && quiz !== undefined && attempt === undefined && Object.keys(reviewData).length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(QuizReviewEmbedded, {
    key: `quiz-review-${keyReviewQuiz}`,
    keyAtt: keyReviewQuiz,
    handleAttempt: handleAttempt,
    handleReviewData: handleReviewData,
    quizRew: reviewData.quiz,
    quizIdRew: reviewData.quizId,
    feedbackRew: reviewData.feedback,
    userIdRew: reviewData.userId,
    backendUrl: backendUrl
  })), quizId !== undefined && quiz !== undefined && attempt === "attempt" && /*#__PURE__*/React.createElement(GenerateQuizEmbedded, {
    key: `quiz-attempt-${keyGenerateQuiz}`,
    keyAtt: keyGenerateQuiz,
    changeKey: forceRerender,
    handleAttempt: handleAttempt,
    quizEmb: quiz,
    refreshQuiz: true,
    userId: userData.id_user,
    userRole: userData.role,
    backendUrl: backendUrl
  }), quizId !== undefined && quiz !== undefined && attempt === "continue" && /*#__PURE__*/React.createElement(GenerateQuizEmbedded, {
    handleAttempt: handleAttempt,
    quizEmb: quiz,
    refreshQuiz: false,
    userId: userData.id_user,
    userRole: userData.role,
    backendUrl: backendUrl
  }), quizId !== undefined && quiz !== undefined && attempt === "review" && /*#__PURE__*/React.createElement(QuizReviewEmbedded, {
    handleAttempt: handleAttempt,
    quizRew: reviewData.quiz,
    quizIdRew: reviewData.quizId,
    feedbackRew: reviewData.feedback,
    conditionToRetakeRew: reviewData.conditionToRetake,
    userIdRew: reviewData.userId,
    userRoleRew: reviewData.userRole,
    backendUrl: backendUrl
  }));
}