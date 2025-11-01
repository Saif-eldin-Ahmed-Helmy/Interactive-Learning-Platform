import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { authService } from '../services/authService';
import "../styles/signin.css";

export const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const [name, setName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({ name, email, password, role: 'student' });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'registration failed');
    } finally {
      setLoading(false);
    }
  };

  const containerClassName = `containerr ${
    isSignUp ? "right-panel-active" : ""
  }`;

  return (
    <div className={containerClassName} id="container">
      <div className="form-container container-signup">
        <Form onSubmit={handleRegister}>
          <h1>Sign Up</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit">Sign Up</Button>
        </Form>
      </div>
      <div className="form-container container-signin">
        <Form onSubmit={handleSubmit}>
          <h1>Sign In</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Link to="/forgot-password" className="forgot-password">Forgot your password?</Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Form>
      </div>
      <div className="container-overlay">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>
              To keep connected with us please login with your personal info
            </p>
            <button
              className="ghost"
              id="signin"
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your personal details and start your journey with us</p>
            <button
              className="ghost"
              id="signup"
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
