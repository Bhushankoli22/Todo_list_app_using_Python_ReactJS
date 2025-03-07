import React, { useState } from "react";

function TodoInput({ addList }) {
  const [inputText, setInputText] = useState('');
  const handleEnterPress = (e) => {
    if (e.keyCode === 13) {
      addList(inputText)
      setInputText("")
    }
  }
  return (
    <div className="input-container">
      <input
        type="text"
        className="input-box-todo"
        placeholder="Enter your todo"
        value={inputText}
        onChange={e => {
          setInputText(e.target.value)
        }}
        onKeyDown={handleEnterPress}
      />
      <button className="add-btn"
        onClick={() => {
          addList(inputText)
          setInputText("")
        }}>+</button>
    </div>
  );
}

export default TodoInput;
