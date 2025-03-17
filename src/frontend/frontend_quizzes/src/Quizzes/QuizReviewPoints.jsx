import React from "react";

const QuizReviewPoints = ({quiz, questionsData}) => {

    const totalAchievedPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.points), 0);

      const totalPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.max_points), 0);

      const progressPercentage = (totalAchievedPoints / totalPoints) * 100;

    return (
        <div>
            <h4>Achieved points: <span
            className="badge bg-primary">{totalAchievedPoints} / {totalPoints}</span></h4>

            <div className="progress" role="progressbar" aria-valuenow="{progressPercentage}"
                 aria-valuemin="0" aria-valuemax="100">
                <div className="progress-bar" style={{width: `${progressPercentage}%`}}>
                    {progressPercentage}%
                </div>
            </div>
        </div>
)
}

export default QuizReviewPoints