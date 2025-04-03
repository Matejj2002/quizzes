import React, {useState} from 'react';
import FormattedTextRenderer from "./FormattedTextRenderer";

const FormattedTextInput = ({handleFunction, text}) =>{
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () =>{
        setIsFocused(true);
    }

    const handleUnFocus = () =>{
        setIsFocused(false);
    }

    return (
        <div>
            {isFocused && (
                <div className="d-flex justify-content-between">
                    <textarea
                        ref={input => input && input.focus()}
                        className="form-control w-50 me-2"
                        id="questionText"
                        value={text}
                        placeholder="Question text"
                        onFocus={handleFocus}
                        onBlur={handleUnFocus}
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
            )}
            {!isFocused && (
                <textarea
                    className="form-control"
                    id="questionText"
                    value={text}
                    placeholder="Question text"
                    onFocus={handleFocus}
                    onBlur={handleUnFocus}
                    onChange={(e) => handleFunction(e.target.value)}
                    rows={4}
                    required
                />
            )}

        </div>
    )
}

export default FormattedTextInput;