import React from 'react'

function Todolist({ item, deleteItem, index }) {
  console.log(typeof(item),"ITEM"); //undefined yetay
  // console.log(item.task, "Tasks fetched from backend");

  
  return (
    <li className="list-item">
      <p style={{color:'white solid'}}>{item.task}</p>     
      <span className='icons'>
        <i className="fa-solid fa-trash-can icon-delete"
          onClick={e => {
            deleteItem(index)
          }}></i>
      </span>
    </li>
  )
}

export default Todolist