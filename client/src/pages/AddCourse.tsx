import React, { useState } from "react";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Style.css";

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

const courseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(7, "Description must be at least 7 characters"),
  image: z.string().url("Must be a valid URL"),
  level: z.string().min(3, "Level is required"),
  duration: z.string().min(3, "Duration is required"),
  lessons: z
    .string()
    .regex(/^\d+$/, "Lessons must be a number")
    .transform((val) => Number(val)),
  category: z.string().min(3, "Category is required"),
});

export const AddCourse: React.FC = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [course, setCourse] = useState<Course>({
    id: Date.now(),
    name: "",
    description: "",
    image: "",
    level: "",
    duration: "",
    lessons: 0,
    category: "",
  });

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = courseSchema.safeParse(course);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = String(err.path[0]);
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    try {
      await axios.post("http://localhost:3001/courses", course);
      toast.success("Course added successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error("Failed to add new course!");
    }
  };

  return (
    <div className="add-course-page">
      <div className="form-card">
        <h2 className="text-center mb-4 fw-bold text-primary">Add New Course</h2>
        <form onSubmit={handleSubmit}>
          {[
            { label: "Course Name", name: "name", type: "text" },
            { label: "Image URL", name: "image", type: "text" },
            { label: "Level", name: "level", type: "text" },
            { label: "Duration", name: "duration", type: "text" },
            { label: "Number of Lessons", name: "lessons", type: "text" },
            { label: "Category", name: "category", type: "text" },
          ].map((field) => (
            <div className="mb-3" key={field.name}>
              <label className="form-label fw-semibold">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={(course as any)[field.name]}
                onChange={handleChange}
                className="form-control custom-input"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
              {errors[field.name] && (
                <p className="text-danger small mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Description */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Description</label>
            <textarea
              name="description"
              value={course.description}
              onChange={handleChange}
              className="form-control custom-input"
              placeholder="Enter course description"
              rows={3}
            />
            {errors.description && (
              <p className="text-danger small mt-1">{errors.description}</p>
            )}
          </div>

          <button type="submit" className="btn btn-gradient w-100 mt-3">
            + Add Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;