import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsGear, BsBook, BsShield } from 'react-icons/bs';
import logo from '../assets/logo.png';
import { HeroIllustration } from '../components/HeroIllustration';
// LearningLanding.tsx
// Single-file React + TypeScript page for a Vite project using Bootstrap 5 classes.
// - Uses only local placeholder JSON data (no backend calls)
// - Accessible and responsive
// - No external dependencies beyond react-icons (assumed available in project)

type Course = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  topics: string[];
};

const COURSES: Course[] = [
  {
    id: "c1",
    title: "Front-End Fundamentals",
    level: "Beginner",
    duration: "4 weeks",
    topics: ["HTML", "CSS", "Responsive Layouts"],
  },
  {
    id: "c2",
    title: "JavaScript: From Basics to Modern",
    level: "Intermediate",
    duration: "6 weeks",
    topics: ["ES6+", "Async", "DOM", "Tooling"],
  },
  {
    id: "c3",
    title: "React & TypeScript",
    level: "Advanced",
    duration: "8 weeks",
    topics: ["Components", "State", "Hooks", "Types"],
  },
];

export default function LandingPage(): JSX.Element {
  const navigate = useNavigate();

  const goToCourses = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate('/courses');
  };

  return (
    <main>
      {/* Hero */}
      <section className="hero-section text-white" aria-labelledby="hero-heading">
        <div className="container hero-container">
          <div className="row align-items-center g-0">
            <div className="col-lg-6">
              <h1 id="hero-heading" className="hero-title fw-bold">
                Unlock Your Coding. Start Your Front End Journey
              </h1>
              <p className="lead hero-lead">
                Video lessons, quizzes and code practice — build real
                skills with short, focused lessons.
              </p>

              <div className="d-flex gap-3 mb-4">
                <a
                  href="#courses"
                  className="btn btn-success btn-lg hero-btn"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Start Learning
                </a>
                <a
                  href="#features"
                  className="btn btn-outline-light btn-lg hero-btn"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Learn More
                </a>
              </div>

              <ul className="list-inline hero-tags text-white-50">
                <li className="list-inline-item">HTML5</li>
                <li className="list-inline-item">•</li>
                <li className="list-inline-item">CSS3</li>
                <li className="list-inline-item">•</li>
                <li className="list-inline-item">JavaScript</li>
              </ul>
            </div>

            <div className="col-lg-6 d-none d-lg-block">
              {/* Decorative illustration placeholder */}
              <div className="hero-illustration">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards - replaced with React-Bootstrap layout */}
      <section id="features" aria-labelledby="features-heading" className="feature-section">
        <Container fluid>
          <Container className="d-flex flex-column justify-content-center">
            <Row>
              <Col>
                <h2 id="features-heading" className="section-title">
                  Learn, practice and track your progress
                </h2>
              </Col>
            </Row>
            <Row className="align-items-center justify-content-center">
              <Col lg={3} md={4} className="d-flex justify-content-center mb-4 mb-md-0">
                <img
                  src={logo}
                  alt="Learning Platform owl logo"
                  className="features-logo"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/180x180/5a99e0/ffffff?text=Logo';
                  }}
                />
              </Col>
              <Col lg={9} md={8}>
                <Row>
                  <Col lg={4} className="mb-4 mb-lg-0 d-flex align-items-stretch">
                    <Card className="feature-card">
                      <Card.Body className="d-flex flex-column">
                        <div className="icon-badge" aria-hidden>
                          <BsGear className="course-icon" />
                        </div>
                        <Card.Title className="feature-card-title">Gamified Learning</Card.Title>
                        <Card.Text className="feature-card-text">Check your understanding with lesson quizzes and see the progress you make.</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={4} className="mb-4 mb-lg-0 d-flex align-items-stretch">
                    <Card className="feature-card">
                      <Card.Body className="d-flex flex-column">
                        <div className="icon-badge" aria-hidden>
                          <BsBook className="course-icon" />
                        </div>
                        <Card.Title className="feature-card-title">Interactive Courses</Card.Title>
                        <Card.Text className="feature-card-text">Watch a lesson, then experiment with HTML, CSS and JavaScript in the code editor.</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={4} className="mb-4 mb-lg-0 d-flex align-items-stretch">
                    <Card className="feature-card">
                      <Card.Body className="d-flex flex-column">
                        <div className="icon-badge" aria-hidden>
                          <BsShield className="course-icon" />
                        </div>
                        <Card.Title className="feature-card-title">See Your Progress</Card.Title>
                        <Card.Text className="feature-card-text">Review completed lessons, learning streaks and achievements in your profile.</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </Container>
      </section>

      {/* Courses */}
      <section id="courses" aria-labelledby="courses-heading" className="courses-section">
        <Container fluid>
          <Container>
            <Row>
              <Col>
                <h2 id="courses-heading" className="section-title">Popular Courses</h2>
              </Col>
            </Row>
            <Row className="gy-4">
              {COURSES.map((c) => {
                const levelInfo: Record<Course['level'], { emoji: string; text: string }> = {
                  Beginner: {
                    emoji: '🐛',
                    text:
                      'Represents someone starting their coding journey. The bug emoji symbolizes early learning stages, fixing small mistakes, and getting comfortable with debugging basics.',
                  },
                  Intermediate: {
                    emoji: '💻',
                    text:
                      'Represents a coder who can build solid applications. The laptop emoji fits the hands-on, project-building stage where they’re turning ideas into working front-end or full-stack apps.',
                  },
                  Advanced: {
                    emoji: '🧠',
                    text:
                      'Represents an experienced developer. The brain emoji stands for deep understanding, system architecture, optimization, and creating efficient, scalable solutions.',
                  },
                };
                return (
                  <Col key={c.id} xs={12} md={6} lg={4}>
                    <Card className="course-card">
                      <Card.Body className="d-flex flex-column">
                        <div className="icon-badge emoji-badge" aria-hidden>{levelInfo[c.level].emoji}</div>
                        <div className="course-title-wrap mb-2">
                          <h3 className="h5 mb-0 course-card-title">{c.title}</h3>
                          <span className="badge bg-primary course-level" aria-hidden>{c.level}</span>
                        </div>
                        <div className="course-meta mb-2">{c.duration} • {c.topics.join(' • ')}</div>
                        <div className="level-desc text-center mb-2">{levelInfo[c.level].text}</div>
                        <ul className="mb-3 small text-start mx-auto mx-auto-narrow-list">
                          {c.topics.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                        <div className="mt-auto d-flex gap-2 justify-content-center">
                          <button className="btn btn-outline-primary btn-sm" onClick={goToCourses}>
                            Preview
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={goToCourses}>
                            Enroll
                          </button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Container>
        </Container>
      </section>

      

      {/* Footer */}
      <footer className="py-5 landing-footer">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <h4 className="h6">Eduquest</h4>
              <p className="small">
                A friendly place to learn front-end development with
                interactive challenges and a supportive community.
              </p>
              <a className="btn btn-success btn-sm" href="#" role="button">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
