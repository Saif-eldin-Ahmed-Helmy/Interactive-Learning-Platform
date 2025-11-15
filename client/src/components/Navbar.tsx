import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavbarRB from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import logo from "../assets/logo.png";

export const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("logout failed:", error);
    }
  };

  return (
    <NavbarRB
      bg="primary"
      variant="dark"
      expand="md"
      sticky="top"
      className="shadow-sm"
    >
      <Container>
        <NavbarRB.Brand as={Link} to="/" className="fw-semibold">
          <img
            src={logo}
            alt="Learning Platform Logo"
            style={{ width: "5vh" }}
          />
          Learning Platform
        </NavbarRB.Brand>
        <NavbarRB.Toggle aria-controls="main-navbar" />
        <NavbarRB.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-md-center">
            {!user && (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/login/register">
                  Register
                </Nav.Link>
              </>
            )}
            {user && (
              <>
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/courses">
                  Courses
                </Nav.Link>
                <Nav.Link as={Link} to="/achievements">
                  Achievements
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">
                  Profile
                </Nav.Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  style={{ borderRadius: 10 }}
                  className="ms-md-3 mt-2 mt-md-0"
                >
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </NavbarRB.Collapse>
      </Container>
    </NavbarRB>
  );
};
