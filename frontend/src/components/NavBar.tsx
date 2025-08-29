import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './NavBar.css'

const NavBar: React.FC = () => {
    const { isLoggedIn, username } = useAuth();
    return (
        <nav className="nav-bar">
            <Link to="/" className="nav-link" replace>Home</Link>
            {(!isLoggedIn || !username) ? (
                <>
                    <Link to="/login" className="nav-link" replace>Login</Link>
                    <Link to='/register' className='nav-link' replace>Register</Link>
                </>
            ) : (
                <>
                    <Link to="/profile" className="nav-link" replace>Profile</Link>
                    <Link to="/logout" className="nav-link" replace>Logout</Link>
                </>
            )}
        </nav>
    )
}

export default NavBar
