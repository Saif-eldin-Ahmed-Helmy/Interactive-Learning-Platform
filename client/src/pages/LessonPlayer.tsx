import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { courseService } from "../services/courseService";
import { progressService } from "../services/progressService";
import { toast } from "react-toastify";
import YouTubePlayer from "../components/YouTubePlayer";
import CodeEditor from "../components/CodeEditor";
import "./LessonPlayer.css";

export const LessonPlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<any | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [pendingCompletedLessons, setPendingCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  
  const refreshCompletedLessons = async () => {
    try {
      const progressData = await progressService.getCourseProgress(courseId!);
      if (progressData?.completedLessons) {
        const completedIds = progressData.completedLessons.map((cl: any) => cl.lessonId);
        setCompletedLessons(completedIds);
      }
    } catch (error) {
      console.error("Failed to refresh completed lessons:", error);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseAndProgress();
    }
  }, [courseId]);

  // If we land on a lesson that is already completed (e.g., after refresh), treat quiz as passed
  useEffect(() => {
    const lesson = getCurrentLesson();
    if (lesson) {
      const alreadyDone = isLessonCompleted(lesson._id);
      if (alreadyDone && !quizPassed) {
        setQuizPassed(true);
      }
      if (!alreadyDone && quizPassed) {
        setQuizPassed(false);
      }
    }
  }, [currentModuleIndex, currentLessonIndex, completedLessons]);

  // Check if returning from quiz with passed status
  useEffect(() => {
    if (location.state?.quizPassed && location.state?.lessonId) {
      const currentLesson = getCurrentLesson();
      if (currentLesson && currentLesson._id === location.state.lessonId) {
        setQuizPassed(true);
        setPendingCompletedLessons((prev) =>
          prev.includes(currentLesson._id) ? prev : [...prev, currentLesson._id]
        );
        toast.success('🎉 Quiz Passed! Moving to next lesson...');
        
        // Mark lesson as complete and move to next
        setTimeout(async () => {
          try {
            await progressService.updateLessonProgress(
              courseId!,
              currentLesson._id,
              currentLesson.estimatedMinutes
            );
            setCompletedLessons((prev) => {
              if (prev.includes(currentLesson._id)) return prev;
              return [...prev, currentLesson._id];
            });
            setPendingCompletedLessons((prev) => prev.filter((id) => id !== currentLesson._id));
            await refreshCompletedLessons();
          } catch (error) {
            console.error("Failed to mark lesson complete:", error);
          }
          
          // Move to next lesson
          if (!course) return;
          const currentModule = course.modules[currentModuleIndex];
          if (currentLessonIndex < currentModule.lessons.length - 1) {
            setCurrentLessonIndex(currentLessonIndex + 1);
            setShowCodeEditor(false);
            setQuizPassed(false);
          } else if (currentModuleIndex < course.modules.length - 1) {
            setCurrentModuleIndex(currentModuleIndex + 1);
            setCurrentLessonIndex(0);
            setShowCodeEditor(false);
            setQuizPassed(false);
          } else {
            toast.success("Congratulations! You've completed all lessons! 🎊");
          }
        }, 1500);
      }
    }
  }, [location.state, currentModuleIndex, currentLessonIndex, course, courseId]);

  const fetchCourseAndProgress = async () => {
    try {
      const courseData = await courseService.getCourseById(courseId!);
      setCourse(courseData);
      
      console.log('Course data loaded:', courseData);
      console.log('First lesson in first module:', courseData.modules[0]?.lessons[0]);

      // Enroll user in course if not already enrolled
      try {
        await courseService.enrollInCourse(courseId!);
        console.log('User enrolled in course');
      } catch (enrollError: any) {
        // If already enrolled, that's fine
        if (enrollError.response?.status !== 400) {
          console.error('Enrollment error:', enrollError);
        }
      }

      // Get user's progress to find next lesson
      try {
        const nextLessonData = await progressService.getNextLesson(courseId!);
        if (nextLessonData) {
          setCurrentModuleIndex(nextLessonData.moduleIndex || 0);
          setCurrentLessonIndex(nextLessonData.lessonIndex || 0);
        }
      } catch (err) {
        console.log("No progress found, starting from first lesson");
      }

      // Get completed lessons
      try {
        const progressData = await progressService.getCourseProgress(courseId!);
        if (progressData?.completedLessons) {
          const completedIds = progressData.completedLessons.map(
            (cl: any) => cl.lessonId
          );
          setCompletedLessons(completedIds);
        }
      } catch (err) {
        console.log("No completed lessons yet");
      }
    } catch (error) {
      console.error("Failed to load course:", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    setShowCodeEditor(false);
    setQuizPassed(false); // Reset quiz status when changing lessons
    refreshCompletedLessons();
  };

  const handleVideoComplete = () => {
    const currentLesson = getCurrentLesson();
    if (!currentLesson) return;

    console.log('Video completed for lesson:', currentLesson._id);
    console.log('Lesson has quizId:', currentLesson.quizId);

    // Check if lesson has a quiz
    if (currentLesson.quizId) {
      console.log('Redirecting to quiz page...');
      // Redirect to quiz page
      navigate(`/lesson-quiz/${currentLesson._id}`, {
        state: { 
          courseId, 
          returnTo: `/learn/${courseId}` 
        }
      });
    } else {
      console.log('No quiz found, proceeding to next lesson...');
      // No quiz, proceed to next lesson
      handleNextLesson();
    }
  };

  const handleNextLesson = async () => {
    if (!course) return;

    const currentLesson = getCurrentLesson();
    
    // Check if lesson has a quiz that hasn't been passed
    if (currentLesson?.quizId && !quizPassed) {
      toast.warning("⚠️ Please complete the quiz before moving to the next lesson!");
      // Redirect to quiz
      navigate(`/lesson-quiz/${currentLesson._id}`, {
        state: { 
          courseId, 
          returnTo: `/learn/${courseId}` 
        }
      });
      return;
    }

    if (currentLesson) {
      // Mark current lesson as complete
      try {
        setPendingCompletedLessons((prev) =>
          prev.includes(currentLesson._id) ? prev : [...prev, currentLesson._id]
        );
        await progressService.updateLessonProgress(
          courseId!,
          currentLesson._id,
          currentLesson.estimatedMinutes
        );
        setCompletedLessons((prev) => {
          if (prev.includes(currentLesson._id)) return prev;
          return [...prev, currentLesson._id];
        });
        await refreshCompletedLessons();
        setPendingCompletedLessons((prev) => prev.filter((id) => id !== currentLesson._id));
        toast.success("Lesson completed! +10 points 🎉");
      } catch (error) {
        console.error("Failed to mark lesson complete:", error);
        toast.error("Failed to save progress");
      }
    }

    // Move to next lesson
    const currentModule = course.modules[currentModuleIndex];
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setShowCodeEditor(false);
      setQuizPassed(false); // Reset quiz status for new lesson
    } else if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
      setShowCodeEditor(false);
      setQuizPassed(false); // Reset quiz status for new lesson
    } else {
      toast.success("Congratulations! You've completed all lessons! 🎊");
    }
  };

  const handlePracticeCode = () => {
    setShowCodeEditor(true);
  };

  const getDefaultExercise = () => ({
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Practice Code</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <!-- Write your HTML here -->
  
  <script>
    // Add your JavaScript here
  </script>
</body>
</html>`,
    hints: [
      "Start with HTML structure",
      "Add CSS for styling",
      "Use JavaScript for interactivity",
      "Experiment and have fun!"
    ],
    expectedOutput: "Your creative output!",
    testCases: []
  });

  const getCurrentLesson = (): any | null => {
    if (!course || !course.modules[currentModuleIndex]) return null;
    return course.modules[currentModuleIndex].lessons[currentLessonIndex] || null;
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId) || pendingCompletedLessons.includes(lessonId);
  };

  const arePreviousLessonsCompleted = (): boolean => {
    if (!course) return false;
    
    // Check all lessons before the current one
    for (let modIdx = 0; modIdx <= currentModuleIndex; modIdx++) {
      const module = course.modules[modIdx];
      const lessonLimit = modIdx === currentModuleIndex ? currentLessonIndex : module.lessons.length;
      
      for (let lesIdx = 0; lesIdx < lessonLimit; lesIdx++) {
        const lesson = module.lessons[lesIdx];
        if (!isLessonCompleted(lesson._id)) {
          return false;
        }
      }
    }
    
    return true;
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mt-5 text-center">
        <h3>Course not found</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/courses")}>
          Back to Courses
        </button>
      </div>
    );
  }

  const currentLesson = getCurrentLesson();

  return (
    <div className="lesson-player-container">
      {/* Left Sidebar - Lesson List */}
      <div className="lesson-sidebar">
        <div className="sidebar-header">
          <h5 className="fw-bold">{course.title}</h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
        </div>

        <div className="lesson-list">
          {course.modules.map((module: any, moduleIdx: number) => (
            <div key={moduleIdx} className="module-section">
              <div className="module-header">
                <h6 className="fw-semibold">
                  {module.order}. {module.title}
                </h6>
              </div>
              <ul className="lessons-ul">
                {module.lessons.map((lesson: any, lessonIdx: number) => (
                  <li
                    key={lesson._id}
                    className={`lesson-item ${
                      moduleIdx === currentModuleIndex &&
                      lessonIdx === currentLessonIndex
                        ? "active"
                        : ""
                    } ${isLessonCompleted(lesson._id) ? "completed" : ""}`}
                    onClick={() => handleLessonSelect(moduleIdx, lessonIdx)}
                  >
                    <span className="lesson-number">
                      {module.order}.{lessonIdx + 1}
                    </span>
                    <span className="lesson-title">{lesson.title}</span>
                    {isLessonCompleted(lesson._id) && (
                      <span className="check-mark">✓</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Video Player or Code Editor */}
      <div className="lesson-content">
        {currentLesson && (
          <>
            <div className="lesson-scrollable-area">
              <div className="lesson-header">
                <div>
                  <h4 className="fw-bold">{currentLesson.title}</h4>
                  <p className="text-muted">{currentLesson.description}</p>
                </div>
                <div className="lesson-meta">
                  <span className="badge bg-info me-2">
                    {currentLesson.estimatedMinutes} min
                  </span>
                  <span className="badge bg-success">
                    {currentLesson.pointsReward} points
                  </span>
                </div>
              </div>

              {!showCodeEditor ? (
                <div className="video-container">
                  {currentLesson.videoUrl && (
                    <YouTubePlayer
                      key={`${currentModuleIndex}-${currentLessonIndex}`}
                      videoUrl={currentLesson.videoUrl}
                      lessonId={currentLesson._id}
                      onVideoComplete={handleVideoComplete}
                    />
                  )}
                </div>
              ) : (
                <div className="code-editor-container">
                  <CodeEditor
                    exercise={currentLesson.codeExercise || getDefaultExercise()}
                    onComplete={() => {
                      setShowCodeEditor(false);
                      toast.success("Exercise completed!");
                    }}
                  />
                </div>
              )}
            </div>

            <div className="lesson-actions">
              {!showCodeEditor && (
                <button
                  className="btn btn-warning me-2"
                  onClick={handlePracticeCode}
                >
                  💻 {currentLesson.codeExercise ? 'Practice Code' : 'Open Code Editor'}
                </button>
              )}
              {showCodeEditor && (
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setShowCodeEditor(false)}
                >
                  ← Back to Video
                </button>
              )}
              {!arePreviousLessonsCompleted() ? (
                <button 
                  className="btn btn-secondary" 
                  disabled
                >
                  🔒 Finish Previous Lessons to Progress
                </button>
              ) : currentLesson?.quizId && !quizPassed ? (
                <button 
                  className="btn btn-success" 
                  onClick={() => {
                    navigate(`/lesson-quiz/${currentLesson._id}`, {
                      state: { 
                        courseId, 
                        returnTo: `/learn/${courseId}` 
                      }
                    });
                  }}
                >
                  📝 Take Quiz to Progress →
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleNextLesson}
                >
                  Next Lesson →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonPlayer;
