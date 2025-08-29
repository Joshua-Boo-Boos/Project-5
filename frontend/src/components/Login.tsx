import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from './NavBar'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

const Login: React.FC = () => {
    const [inputUsername, setInputUsername] = useState<string>('');
    const [inputPassword, setInputPassword] = useState<string>('');
    const {isLoggedIn, login} = useAuth();
    const navigate = useNavigate();
    const loginAPI = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const loginAPIURL = 'https://192.168.1.210:8000/api/login';
        const response = await fetch(loginAPIURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: inputUsername, password: inputPassword })
        });
        const data = await response.json();
        if (data.success) {
            console.log('Login successful');
            login(inputUsername);
            setInputUsername('');
            setInputPassword('');
        }
    }

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/', { replace: true });
        }
    }, [isLoggedIn])
    return (
        <>
            <NavBar />
            <div className="login-container">
                <span>Please Login</span>
                <div className="login-controls">
                    <form onSubmit={e => loginAPI(e)} className="login-form">
                        <div className="username-info">
                            <label className="login-label">Username:</label>
                            <input onChange={e => setInputUsername(e.target.value)} type="text" className="username-input" />
                        </div>
                        <div className="password-info">
                            <label className="password-label">Password:</label>
                            <input onChange={e => setInputPassword(e.target.value)} type="password" className="password-input" />
                        </div>
                        <button className="login-button">Login</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Login