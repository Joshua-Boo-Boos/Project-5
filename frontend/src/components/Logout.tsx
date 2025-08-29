import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Logout: React.FC = () => {
    const { isLoggedIn, username, logout } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (isLoggedIn && username) {
            logout();
            navigate('/', { replace: true });
        }
    }, []);
    return (
        <div>
            <h2>Logging out...</h2>
        </div>
    )
}

export default Logout