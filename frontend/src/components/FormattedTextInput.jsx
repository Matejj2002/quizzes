import React, {useState} from 'react';
import FormattedTextRenderer from "./FormattedTextRenderer";

const FormattedTextInput = ({handleFunction, text, isDisabled=false, idVal="questionText"}) =>{
    return (
        <div>
                <div className="d-flex justify-content-between">
                    <textarea
                        className="form-control w-50 me-2"
                        id={idVal}
                        disabled={isDisabled}
                        value={text}
                        onChange={(e) => handleFunction(e.target.value)}
                        rows={4}
                        required
                    />
                    <div className="w-50  border border-1 p-2">
                    <FormattedTextRenderer
                        text={text}
                    />
                        </div>
                </div>
        </div>
    )
}

export default FormattedTextInput;