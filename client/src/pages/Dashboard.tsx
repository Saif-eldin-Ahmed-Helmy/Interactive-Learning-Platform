import React, { useEffect, useState } from "react";
import { BiSolidTree } from "react-icons/bi";
import { BsStar } from "react-icons/bs";
import { courseService } from "../services/courseService";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  difficulty: string;
  estimatedHours: number;
  category: string;
}

export const Dashboard: React.FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const courses = await courseService.getEnrolledCourses();
        setEnrolledCourses(courses);
      } catch (error: any) {
        console.error("Error fetching enrolled courses:", error);
        toast.error("Failed to load your courses");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mt-4">
        <h2 className="fw-bold">Dashboard</h2>
        <div className="d-flex justify-content-center gap-5 mt-3 fw-medium text-secondary fs-4">
          <span className="border-bottom border-primary pb-1 fw-bold text-dark">
            My Courses
          </span>
          <span 
            className="fw-bold text-dark" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/achievements')}
          >
            Achievements
          </span>
        </div>
      </div>

      {/* Courses Section */}
      <div className="container my-5">
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">You haven't enrolled in any courses yet!</h4>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/courses')}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="row justify-content-center">
            {/* first two*/}
            {enrolledCourses.slice(0, 2).map((course) => (
              <DashboardCard key={course._id} course={course} />
            ))}

            {/* tree card*/}
            <div className="col-12 col-md-6 col-lg-3 shadow-sm border rounded-4 p-3 m-3 bg-light text-center">
              <BiSolidTree size={200} color="#007bff" />
              <h5 className="fw-bold mt-3 text-primary">Level {user?.treeLevel || 1} 🌱</h5>
              <p className="text-muted small mb-4">
                Every hour you study brings you closer to your dreams.
              </p>
              <button 
                className="btn btn-outline-primary w-100"
                onClick={() => navigate('/achievements')}
              >
                View All Achievements
              </button>
            </div>

            {/* cards 3-4*/}
            {enrolledCourses.slice(2, 4).map((course) => (
              <DashboardCard key={course._id} course={course} />
            ))}

            {/* Daily Streak */}
            <div className="col-12 col-md-6 col-lg-3 shadow-sm border rounded-4 p-4 m-3 bg-light text-center">
              <div className="d-flex flex-column align-items-center justify-content-center">
                <p className="fw-bold fs-5 mb-2 text-primary">Daily Streak</p>
                <BsStar size={70} color="#ffc107" />
                <div className="display-4 fw-bold text-primary my-2">
                  {user?.currentStreak || 0}
                </div>
                <p className="text-muted mt-3 fw-medium">
                  {user?.currentStreak === 1 ? '1 day' : `${user?.currentStreak || 0} consecutive days`} learning 🔥
                </p>
                <small className="text-muted">
                  Longest: {user?.longestStreak || 0} days
                </small>
              </div>
            </div>

            {/* remaining courses*/}
            {enrolledCourses.slice(4).map((course) => (
              <DashboardCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const DashboardCard: React.FC<{ course: Course }> = ({ course }) => {
  const navigate = useNavigate();
  
  return (
    <div className="col-12 col-md-6 col-lg-3 shadow-sm border rounded-4 p-3 m-3 bg-white">
      <img
        src={course.thumbnailUrl || 'https://via.placeholder.com/400x300?text=Course'}
        alt={course.title}
        className="w-100 rounded-3 mb-3"
        style={{ height: "180px", objectFit: "cover" }}
      />
      <h5 className="fw-bold text-primary">{course.title}</h5>
      <p className="text-muted small">{course.description.substring(0, 80)}...</p>
      <div className="mb-3">
        <span className="badge bg-info me-2">{course.difficulty}</span>
        <span className="badge bg-secondary">{course.estimatedHours}h</span>
      </div>
      <button 
        className="btn btn-primary w-100"
        onClick={() => navigate(`/learn/${course._id}`)}
      >
        Continue Learning
      </button>
    </div>
  );
};