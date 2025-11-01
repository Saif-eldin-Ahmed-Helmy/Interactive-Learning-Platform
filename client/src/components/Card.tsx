import React from "react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  name: string;
  description: string;
  image: string;
  level: string;
  duration: string;
  lessons: number;
  category: string;
}

interface CardProps {
  course: Course;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ course, children }) => {
  const navigate = useNavigate();

  return (
    <div className="col g-4 px-1 d-flex justify-content-center">
      <div
        className="card shadow-sm rounded-3 border-0 h-100"
        style={{
          width: "20rem",
          minHeight: "420px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: "200px",
            overflow: "hidden",
            borderTopLeftRadius: "0.375rem",
            borderTopRightRadius: "0.375rem",
          }}
        >
          <img
            src={course.image}
            className="card-img-top"
            alt={course.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>

        <div className="card-body d-flex flex-column flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="card-title fw-bold mb-0">{course.name}</h5>
            <span className="badge bg-primary">{course.level}</span>
          </div>

          <p
            className="card-text text-muted flex-grow-1"
            style={{
              minHeight: "70px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {course.description}
          </p>

          <small className="text-muted d-block mb-3">
            ⏱ {course.duration} · 📘 {course.lessons} lessons
          </small>

           <button
            className="btn btn-primary w-100 mt-auto"
            onClick={() => navigate('/courses/${course.id}')}
          >
            View Details
          </button> 
        </div>
      </div>
    </div>
  );
};

export default Card;
