import { useEffect, useState } from "react";
import Card from "../components/Card";
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

export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
   const navigate=useNavigate()
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/db.json");
        const data = await res.json();
        setCourses(data.courses);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="fw-bold mb-4 text-center">Available Courses 📚</h1>
      <button onClick={() => navigate("/courses/new")} className="btn btn-dark px-3 my-2">
  Add New Course
</button>
      <div className="row g-4 justify-content-center">
        {courses.map((course) => (
          <Card key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};