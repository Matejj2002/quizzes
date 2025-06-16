import React from "react";

const QuizReviewPoints = ({questionsData}) => {

    const totalAchievedPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.points), 0);

      const totalPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.max_points), 0);

    return (
        <span
                 className="badge bg-primary mb-3 fs-5 mt-2">{totalAchievedPoints.toFixed(2)} / {totalPoints} pts.</span>
    )
}

export default QuizReviewPoints