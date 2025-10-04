import { Link } from 'react-router-dom';

export const Landing = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container text-center">
        <h1 className="display-3 fw-bold mb-4">Interactive Learning Platform</h1>
        <p className="lead mb-5">
          Learn programming through interactive courses, quizzes, and challenges.
          Track your progress, earn badges, and compete with peers!
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/login" className="btn btn-primary btn-lg">
            Login
          </Link>
          <Link to="/register" className="btn btn-outline-primary btn-lg">
            Get Started
          </Link>
        </div>

        <div className="row mt-5 text-start">
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h3>📚 Structured Courses</h3>
                <p>Learn through well-organized modules and lessons</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h3>🏆 Gamification</h3>
                <p>Earn points, badges, medals, and certificates</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h3>⚔️ Peer Challenges</h3>
                <p>Compete with other students in quiz battles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
