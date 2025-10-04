import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import { useAuth } from '../hooks/useAuth';

export const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, categoryFilter, difficultyFilter]);

  const loadCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error('failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(c => c.difficulty === difficultyFilter);
    }
    
    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await courseService.enrollInCourse(courseId);
      alert('enrolled successfully!');
      loadCourses(); // reload to update enrollment status
    } catch (err: any) {
      alert(err.response?.data?.error || 'enrollment failed');
    }
  };

  const isEnrolled = (courseId: string) => {
    return user?.enrolledCourses.includes(courseId);
  };

  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success';
      case 'intermediate': return 'bg-warning';
      case 'advanced': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">explore courses 📚</h1>

      {/* filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">category</label>
              <select 
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">all categories</option>
                <option value="programming">programming</option>
                <option value="web-development">web development</option>
                <option value="data-science">data science</option>
                <option value="algorithms">algorithms</option>
                <option value="databases">databases</option>
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">difficulty</label>
              <select 
                className="form-select"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">all levels</option>
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* course grid */}
      {filteredCourses.length === 0 ? (
        <div className="alert alert-info">
          no courses found matching your filters
        </div>
      ) : (
        <div className="row g-4">
          {filteredCourses.map(course => (
            <div key={course._id} className="col-md-4">
              <div className="card h-100 shadow-sm">
                {course.thumbnailUrl && (
                  <img 
                    src={course.thumbnailUrl} 
                    className="card-img-top" 
                    alt={course.title}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <span className={`badge ${getDifficultyBadgeClass(course.difficulty)} me-2`}>
                      {course.difficulty}
                    </span>
                    <span className="badge bg-secondary">
                      {course.category}
                    </span>
                  </div>
                  
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {course.description}
                  </p>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      ⏱️ {course.estimatedHours} hours · 
                      👥 {course.enrollmentCount} students
                    </small>
                  </div>
                  
                  {isEnrolled(course._id) ? (
                    <Link 
                      to={`/courses/${course._id}`}
                      className="btn btn-success w-100"
                    >
                      continue learning
                    </Link>
                  ) : (
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => handleEnroll(course._id)}
                    >
                      enroll now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
