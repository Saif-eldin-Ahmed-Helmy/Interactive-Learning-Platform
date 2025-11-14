import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../services/courseService";
import { toast } from "react-toastify";
import { Course } from "../types";
import "../pages/Style.css";

export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const enrolledCourses = await courseService.getEnrolledCourses();
      setEnrolledCourseIds(enrolledCourses.map((c: Course) => c._id));
    } catch (error) {
      console.error("Failed to load enrolled courses:", error);
    }
  };

  const handleViewDetails = async (courseId: string) => {
    try {
      const courseDetails = await courseService.getCourseById(courseId);
      setSelectedCourse(courseDetails);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to load course details");
    }
  };

  const handleEnroll = async () => {
    if (!selectedCourse) return;
    
    setActionLoading(true);
    try {
      await courseService.enrollInCourse(selectedCourse._id);
      toast.success("Successfully enrolled in course!");
      setEnrolledCourseIds([...enrolledCourseIds, selectedCourse._id]);
      setShowModal(false);
      fetchCourses(); // refresh to update enrollment count
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to enroll in course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!selectedCourse) return;
    
    setActionLoading(true);
    try {
      await courseService.unenrollFromCourse(selectedCourse._id);
      toast.success("Successfully unenrolled from course");
      setEnrolledCourseIds(enrolledCourseIds.filter(id => id !== selectedCourse._id));
      setShowModal(false);
      fetchCourses(); // refresh to update enrollment count
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to unenroll from course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  const isEnrolled = (courseId: string) => enrolledCourseIds.includes(courseId);

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
      <div className="container mt-4">
        <h1 className="fw-bold mb-4 text-center">Available Courses 📚</h1>
        <button 
          onClick={() => navigate("/courses/new")} 
          className="btn btn-dark px-3 my-2"
        >
          Add New Course
        </button>
        <div className="row g-4 justify-content-center">
          {courses.map((course) => (
            <CourseCard 
              key={course._id} 
              course={course} 
              isEnrolled={isEnrolled(course._id)}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>

      {/* Course Details Modal */}
      {showModal && selectedCourse && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '700px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{selectedCourse.title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <img
                src={selectedCourse.thumbnailUrl || 'https://via.placeholder.com/700x300?text=Course'}
                alt={selectedCourse.title}
                className="w-100 rounded mb-3"
                style={{ maxHeight: '250px', objectFit: 'cover' }}
              />
              <p className="text-muted">{selectedCourse.description}</p>
              
              <div className="mb-3">
                <span className="badge bg-info me-2">{selectedCourse.difficulty}</span>
                <span className="badge bg-secondary me-2">{selectedCourse.estimatedHours}h</span>
                <span className="badge bg-success">{selectedCourse.category}</span>
              </div>

              <div className="alert alert-info">
                <strong>{selectedCourse.enrollmentCount}</strong> students enrolled
              </div>

              <h6 className="fw-bold mt-4 mb-3">Course Content</h6>
              {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                <div className="course-modules">
                  {selectedCourse.modules.map((module, idx) => (
                    <div key={idx} className="mb-3">
                      <h6 className="fw-semibold text-primary">
                        {module.order}. {module.title}
                      </h6>
                      <ul className="list-unstyled ms-3">
                        {Array.isArray(module.lessons) && module.lessons.map((lesson: any, lessonIdx) => {
                          // Handle both populated (object) and unpopulated (string) lessons
                          if (typeof lesson === 'string') {
                            return (
                              <li key={lesson} className="mb-2">
                                <span className="text-muted">
                                  {module.order}.{lessonIdx + 1}
                                </span>{" "}
                                Lesson {lessonIdx + 1}
                              </li>
                            );
                          }
                          return (
                            <li key={lesson._id} className="mb-2">
                              <span className="text-muted">
                                {module.order}.{lessonIdx + 1}
                              </span>{" "}
                              {lesson.title}
                              <span className="badge bg-light text-dark ms-2 small">
                                {lesson.estimatedMinutes} min
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No course content available yet.</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                Close
              </button>
              {isEnrolled(selectedCourse._id) ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleUnenroll}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Unenroll"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-gradient"
                  onClick={handleEnroll}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Enrolling..." : "Enroll Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  onViewDetails: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isEnrolled, onViewDetails }) => {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-card">
        <img
          src={course.thumbnailUrl || 'https://via.placeholder.com/400x250?text=Course'}
          alt={course.title}
          className="card-img-top"
          style={{ height: "200px", objectFit: "cover" }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title fw-bold text-primary">{course.title}</h5>
          <p className="card-text text-muted flex-grow-1">
            {course.description.substring(0, 100)}...
          </p>
          <div className="mb-3">
            <span className="badge bg-info me-2">{course.difficulty}</span>
            <span className="badge bg-secondary">{course.estimatedHours}h</span>
            {isEnrolled && (
              <span className="badge bg-success ms-2">Enrolled ✓</span>
            )}
          </div>
          <button
            className="btn btn-primary w-100"
            onClick={() => onViewDetails(course._id)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};