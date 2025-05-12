import React, { useEffect, useState } from "react";
import axios from "axios";
const QuizAttempt = ({
  quizEmb,
  handleAttempt,
  handleReviewData,
  keyAtt
}) => {
  const [quiz, setQuiz] = useState(quizEmb);
  useEffect(() => {
    setQuiz(JSON.parse(JSON.stringify(quizEmb || {})));
  }, [keyAtt, JSON.stringify(quizEmb?.quizzes)]);
  const getDate = time => {
    const dt = new Date(time);
    const da = new Date(dt);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[da.getDay()]} ${months[da.getMonth()]} ${da.getDate()} ${da.getFullYear()} ${da.getHours()}:${da.getMinutes().toString().padStart(2, '0')}:00`;
  };
  if (quiz.length === 0) {
    return "Loading";
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, quiz?.number_of_questions, " questions \xB7 ", quiz?.sections.length, " sections"), /*#__PURE__*/React.createElement("div", {
    className: "mb-3 text-truncate"
  }, /*#__PURE__*/React.createElement("span", {
    className: "m-0"
  }, "Time to finish (Minutes): ", quiz["time_to_finish"], " \xB7 Opened from ", getDate(quiz["date_time_open"]), " to ", /*#__PURE__*/React.createElement("strong", null, getDate(quiz["date_time_close"])), " \xB7 Check from ", getDate(quiz["datetime_check"])), /*#__PURE__*/React.createElement("br", null)), quiz.time_limit_end && !quiz.first_generation && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline-primary me-1",
    disabled: quiz.can_be_checked === false,
    onClick: () => {
      handleReviewData(quiz, quiz.id, quiz.feedbackTypeAfterClose, false, 1, "student");
      handleAttempt(undefined);
    }
  }, /*#__PURE__*/React.createElement("span", null, "Review quiz after close")), !quiz.time_limit_end && /*#__PURE__*/React.createElement("div", null, quiz.is_finished ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline-primary me-1",
    disabled: quiz.is_opened === false || quiz.quizzes.length + 1 > quiz["number_of_corrections"],
    onClick: () => {
      handleAttempt("attempt");
    }
  }, "Attempt the quiz"), !quiz.first_generation && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline-primary me-1",
    disabled: quiz.can_be_checked === false,
    onClick: () => {
      handleReviewData(quiz, quiz.id, quiz.feedbackTypeAfterClose, !(quiz.is_opened === false || quiz.quizzes.length + 1 >= quiz["number_of_corrections"]), 1, "student");
      handleAttempt("review");
    }
  }, quiz.quizzes.length === 0 ? /*#__PURE__*/React.createElement("span", null, "Review attempt") : /*#__PURE__*/React.createElement("span", null, "Review last attempt"))) : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline-primary me-1",
    onClick: () => {
      handleAttempt("continue");
    }
    // onClick={(e) => {
    //     e.preventDefault();
    //     navigate("/generated-quiz", {
    //         state: {
    //             quiz: quiz,
    //             userId: userData["id_user"],
    //             userRole: userData["role"]
    //         }
    //     });
    // }
    // }
  }, "Continue current attempt")));
};
export default QuizAttempt;