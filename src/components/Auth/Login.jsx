import { useCrisisContext } from '../../context/CrisisContext';
import { LogIn, LogOut, User } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { user, loginWithGoogle, logout } = useCrisisContext();

  return (
    <div className="auth-container">
      {user ? (
        <div className="user-profile">
          <div className="user-info">
            <User size={16} />
            <span>{user.displayName || user.email}</span>
          </div>
          <button className="auth-btn logout" onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <button className="auth-btn login" onClick={loginWithGoogle}>
          <LogIn size={16} />
          <span>Sign in with Google</span>
        </button>
      )}
    </div>
  );
};

export default Login;
