import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { courseService } from '../services/courseService';
import { progressService } from '../services/progressService';
import { Course, StudyStats } from '../types';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [coursesData, statsData] = await Promise.all([
        courseService.getAllCourses(),
        progressService.getStudyStats()
      ]);
      
      // filter for enrolled courses only
      const enrolled = coursesData.filter(course => 
        user?.enrolledCourses.includes(course._id)
      );
      
      setEnrolledCourses(enrolled);
      setStats(statsData);
    } catch (err) {
      console.error('failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">loading...</span>
        </Spinner>
      </Container>
    );
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">welcome back, {user?.name}! 👋</h1>

      {/* stats cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="mb-0">{user?.points || 0}</h3>
              <p className="text-muted mb-0">points 🏆</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="mb-0">{user?.studyHours || 0}</h3>
              <p className="text-muted mb-0">study hours 📚</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="mb-0">{user?.currentStreak || 0}</h3>
              <p className="text-muted mb-0">day streak 🔥</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="mb-0">level {user?.treeLevel || 1}</h3>
              <p className="text-muted mb-0">tree growth 🌳</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* recent achievements */}
      {stats && stats.recentBadges.length > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>recent achievements 🎖️</Card.Title>
            <div className="d-flex gap-3 flex-wrap">
              {stats.recentBadges.slice(0, 5).map(badge => (
                <div key={badge._id} className="text-center">
                  <Badge bg="warning" text="dark" className="p-3 mb-1">
                    {badge.type}
                  </Badge>
                  <small className="d-block">{badge.name}</small>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* enrolled courses */}
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0">my courses</Card.Title>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate('/courses')}
            >
              browse more
            </Button>
          </div>
          
          {enrolledCourses.length === 0 ? (
            <p className="text-muted">
              you haven't enrolled in any courses yet. <Link to="/courses">explore courses</Link>
            </p>
          ) : (
            <Row className="g-3">
              {enrolledCourses.map(course => (
                <Col key={course._id} md={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title as="h6">{course.title}</Card.Title>
                      <Card.Text className="small text-muted">
                        {course.description.slice(0, 80)}...
                      </Card.Text>
                      <Button 
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/courses/${course._id}`)}
                      >
                        continue
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* quick actions */}
      <Row className="g-3 mt-4">
        <Col md={6}>
          <Card bg="primary" text="white">
            <Card.Body>
              <Card.Title>challenge a friend ⚔️</Card.Title>
              <Card.Text>compete with peers and climb the leaderboard</Card.Text>
              <Button 
                variant="light"
                onClick={() => navigate('/challenges')}
              >
                view challenges
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card bg="success" text="white">
            <Card.Body>
              <Card.Title>keep learning 📖</Card.Title>
              <Card.Text>maintain your streak and grow your knowledge tree</Card.Text>
              <Button 
                variant="light"
                onClick={() => navigate('/courses')}
              >
                start studying
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
