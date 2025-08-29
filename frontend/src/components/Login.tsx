import { useState } from 'react'
import NavBar from './NavBar'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

const Login: React.FC = () => {
    const [inputUsername, setInputUsername] = useState<string>('');
    const [inputPassword, setInputPassword] = useState<string>('');
    const {login} = useAuth();

    const loginAPI = async () => {
        const loginAPIURL = 'https://192.169.1.210:8000/api/login';
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
    return (
        <>
            <NavBar />
            <div className="login-container">
                <span>Please Login</span>
                <div className="login-controls">
                    <div className="username-info">
                        <label className="login-label">Username:</label>
                        <input onChange={e => setInputUsername(e.target.value)} type="text" className="username-input" />
                    </div>
                    <div className="password-info">
                        <label className="password-label">Password:</label>
                        <input onChange={e => setInputPassword(e.target.value)} type="password" className="password-input" />
                    </div>
                    <button onClick={() => loginAPI()} className="login-button">Login</button>
                </div>
                
            </div>
        </>
    )
}

export default Login