import React, { useState, useEffect } from "react";
import axios from "axios";
import TodoInput from "../src/components/TodoInput";
import Todolist from "../src/components/TodoList";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";


const Home = ({ setToken }) => { // Receive setToken from App.js
    const [listTodo, setListTodo] = useState([]);
    const { accounts, instance } = useMsal(); // Include instance
    // const [token, setInternalToken] = useState(null); // State for token
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    // const [token, setToken] = useState(null); // ✅ Define token state
    

    const fetchTasks = async (usedToken) => {

        
        if (!usedToken) return;
        try {
            const response = await axios.get(`http://localhost:8000/get-tasks`, { // Use env variable
                
                headers: { Authorization: `Bearer ${usedToken}` },
            }           
        );
            // console.log(response.data.tasks, "Tasks fetched from backend");
            setListTodo(response.data.tasks);
            setError(null);
        } catch (error) {
            // console.error("Error fetching tasks", error);
            setError("Error fetching tasks. Please try again later.");
        }
    };

    useEffect(() => {
        const initializeApp = async () => {
            if (accounts.length > 0) {
                // MSAL authentication
                setUsername(accounts[0]?.name || "User");
                try {
                    const response = await instance.acquireTokenSilent({ scopes: ["User.Read"] });
                     setToken(response.accessToken);
                    localStorage.setItem("token", response.accessToken);
                    fetchTasks(response.accessToken);
                } catch (error) {
                    if (error.errorCode === "interaction_required") {
                        instance.loginPopup({ scopes: ["User.Read"] })
                            .then(response => {
                                setToken(response.accessToken);
                                localStorage.setItem("token", response.accessToken);
                                fetchTasks(response.accessToken);
                            })
                            .catch(err => {
                                console.error("Popup login error:", err);
                                setError("Authentication failed. Please try again.");
                            });
                    } else {
                        console.error("Silent token acquisition error:", error);
                        setError("Error getting token. Please try again later.");
                    }
                }
            } else if (localStorage.getItem("token")) {
                // Local storage authentication
                const localToken = localStorage.getItem("token");
                const localUsername = localStorage.getItem("username");
                setUsername(localUsername || "User");
                fetchTasks(localToken);
            } else {
                // Redirect to login if not authenticated
                navigate('/Login');
            }
        };

        initializeApp();
    }, [accounts, instance, navigate, setToken]);

    const usedToken = localStorage.getItem("token");
    // Add a new task
    const addList = async (inputText) => {
        if (inputText.trim() === "") {
            setError("Task cannot be empty.");
            return;
        }

        const newTask = {
            email: accounts.length > 0 ? accounts[0]?.name : localStorage.getItem("username"),
            assigned_to: "Me",
            assigned_by: "Teamleader",
            task: inputText,
            duration: 8,
            token: usedToken
        };

        try {       
            const response = await axios.post(`http://localhost:8000/add-task`, newTask, {
                headers: { Authorization: `Bearer ${usedToken}` },
            });
            setListTodo((prevList) => [...prevList, response.data.task]);
            setError(null);
        } catch (error) {
            // console.error("Error adding task", error);
            setError("Error adding task. Please try again later.");
        }
    };

    // Delete a task
    const deleteListItem = async (taskId) => {
        try {
            const usedToken = localStorage.getItem("token");
            await axios.delete(`http://localhost:8000/delete-task/${taskId}`, {
                headers: { Authorization: `Bearer ${usedToken}` },
            });
            setListTodo(listTodo.filter(task => task.id !== taskId));
            setError(null);
        } catch (error) {
            console.error("Error deleting task", error);
            setError("Error deleting task. Please try again later.");
        }
    };

    // Handle logout
    const logout = () => {
        if (accounts.length > 0) {
            instance.logoutPopup().catch(e => {
                console.error(e);
            });
        }
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate('/Login');
    };

    return (
        <div className="home-container" style={{ border: "3px solid red", padding: "20px" }}>
            <h1 style={{ color: "white" }}>Welcome to Home</h1>
            <p style={{ color: "whitesmoke" }}>Welcome, {username}!</p>

            <button onClick={logout} style={{ marginBottom: "20px" }}>Logout</button>

            <TodoInput addList={addList} />
            <h1 style={{ color: "whitesmoke" }}>TODO</h1>
            <hr />
            {error && <p style={{ color: "red" }}>{error}</p>}
            {listTodo.length > 0 ? (
                listTodo.map((listItem) => (
                    <Todolist
                        key={listItem.id}
                        item={listItem}
                        deleteItem={() => deleteListItem(listItem.id)}
                    />
                ))
            ) : (
                <p style={{ color: "whitesmoke" }}>No tasks found. Add a new task!</p>
            )}
        </div>
    );
};

export default Home;