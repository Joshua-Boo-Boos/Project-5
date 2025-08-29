import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from './NavBar'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import './Register.css'

const Register: React.FC = () => {
    const [inputUsername, setInputUsername] = useState<string>('');
    const [inputPassword, setInputPassword] = useState<string>('');
    const {username, login} = useAuth();
    const navigate = useNavigate();
    const registerAPI = async () => {
        const registerAPIURL = 'https://192.168.1.210:8000/api/register';
        const response = await fetch(registerAPIURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: inputUsername, password: inputPassword })
        });
        if (!response.ok) {
            console.error('Registration failed');
        } else {
            const data = await response.json()
            if (data.success) {
                login(inputUsername);
                setInputUsername('');
                setInputPassword('');
            }
        }
    }
    useEffect(() => {
        if (username) {
            navigate('/', { replace: true });
        }
    }, [username])
    return (
        <>
            <NavBar />
            <div className="register-container">
                <span className="register-span">Please Register</span>
                <div className="register-controls">
                    <div className="username-elements">
                        <label className="register-username-label">Username:</label>
                        <input onChange={e => setInputUsername(e.target.value)} type="text" className="username-input" />
                    </div>
                    <div className="password-elements">
                        <label className="password-label">Password:</label>
                        <input onChange={e => setInputPassword(e.target.value)} type="password" className="password-input" />
                    </div>
                    <button onClick={() => registerAPI()} className="register-button">Register</button>
                </div>
            </div>
        </>
    )
}

export default Register