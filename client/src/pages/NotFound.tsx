import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import { FaHome, FaBook } from "react-icons/fa";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="display-1 fw-bold text-primary mb-3" style={{ fontSize: "8rem" }}>
          404
        </h1>

        {/* Sad Mascot */}
        <div className="mb-4" style={{ fontSize: "5rem" }}>
          😕
        </div>

        {/* Message */}
        <h2 className="mb-3">Page Not Found</h2>
        <p className="text-muted mb-4 lead">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="d-flex gap-3 justify-content-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/")}
            className="d-flex align-items-center gap-2"
          >
            <FaHome />
            Go Home
          </Button>
          <Button
            variant="outline-primary"
            size="lg"
            onClick={() => navigate("/courses")}
            className="d-flex align-items-center gap-2"
          >
            <FaBook />
            Browse Courses
          </Button>
        </div>

        {/* Helpful Text */}
        <p className="text-muted mt-4 small">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </Container>
  );
};

export default NotFound;
