import React from "react";

const QuizReviewPoints = ({questionsData}) => {

    const totalAchievedPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.points), 0);

      const totalPoints = Object.values(questionsData)
          .reduce((sum, item) => sum + parseFloat(item.max_points), 0);


    // return (
    //     <div>
    //         <h4>Achieved points: <span
    //             className="badge bg-primary mb-3">{totalAchievedPoints} / {totalPoints}</span></h4>
    //
    //         <div className="progress mb-3" role="progressbar" aria-valuenow="{progressPercentage}"
    //              aria-valuemin="0" aria-valuemax="100">
    //             <div className="progress-bar" style={{width: `${progressPercentage}%`}}>
    //                 {progressPercentage}%
    //             </div>
    //         </div>
    //     </div>
    // )

    return (
        <span
                 className="badge bg-primary mb-3 fs-5 mt-2">{totalAchievedPoints.toFixed(2)} / {totalPoints} pts.</span>
    )
}

export default QuizReviewPoints