import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import { FaUserCog, FaTree, FaCalendarDay, FaClock, FaEdit, FaSave, FaTimes, FaTrophy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userService } from "../services/userService";

interface ProfileData {
  user: {
    name: string;
    email: string;
    enrolledDate: string;
    treeLevel: number;
    currentStreak: number;
    longestStreak: number;
    studyHours: number;
    points: number;
  };
  badges: Array<{
    _id: string;
    name: string;
    description: string;
    iconUrl: string;
  }>;
  completedCourses: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getProfile();
      setProfileData(data);
      setNewName(data.user.name);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load profile");
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      const result = await userService.updateName(newName);
      setProfileData({
        ...profileData!,
        user: { ...profileData!.user, name: result.name },
      });
      setEditingName(false);
      toast.success("Name updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update name");
    }
  };

  const handleCancelEdit = () => {
    setNewName(profileData?.user.name || "");
    setEditingName(false);
  };

  const getTreeIcon = (level: number) => {
    if (level === 1) return '🌱'; // Seedling
    if (level <= 3) return '🌿'; // Small plant
    if (level <= 5) return '🌳'; // Young tree
    if (level <= 8) return '🌲'; // Mature tree
    return '🌴'; // Tall tree
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  if (error || !profileData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || "Failed to load profile"}
          <Button variant="link" onClick={fetchProfile}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="g-4">
        {/* Left: Profile settings */}
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <FaUserCog className="me-2" />
              Profile Settings
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  {editingName ? (
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                      />
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleSaveName}
                        title="Save"
                      >
                        <FaSave />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCancelEdit}
                        title="Cancel"
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={profileData.user.name}
                        disabled
                      />
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        title="Edit name"
                      >
                        <FaEdit />
                      </Button>
                    </div>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email (Read-only)</Form.Label>
                  <Form.Control
                    type="email"
                    value={profileData.user.email}
                    disabled
                  />
                </Form.Group>
                <p className="text-muted small">
                  Enrolled: {new Date(profileData.user.enrolledDate).toLocaleDateString()}
                </p>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Info cards */}
        <Col md={8}>
          <Row className="g-4">
            {/* Tree Growth Card */}
            <Col md={6}>
              <Card className="text-center shadow-sm border-0">
                <Card.Body>
                  <div
                    style={{
                      fontSize: `${50 + profileData.user.treeLevel * 10}px`,
                      transition: 'font-size 0.3s',
                    }}
                  >
                    {getTreeIcon(profileData.user.treeLevel)}
                  </div>
                  <Card.Title className="mt-3">Tree Level {profileData.user.treeLevel}</Card.Title>
                  <Card.Text className="text-muted">
                    {profileData.completedCourses} course{profileData.completedCourses !== 1 ? 's' : ''} completed
                  </Card.Text>
                  <small className="text-muted">
                    Your learning journey is growing! 🌟
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {/* Day Streak Card */}
            <Col md={6}>
              <Card className="text-center shadow-sm border-0">
                <Card.Body>
                  <FaCalendarDay size={40} color="#ff6b6b" className="mb-2" />
                  <Card.Title>Day Streak</Card.Title>
                  <h2 className="mb-1">🔥 {profileData.user.currentStreak}</h2>
                  <p className="text-muted small mb-0">
                    Longest: {profileData.user.longestStreak} days
                  </p>
                </Card.Body>
              </Card>
            </Col>

            {/* Study Hours Card */}
            <Col md={12}>
              <Card className="text-center shadow-sm border-0">
                <Card.Body>
                  <FaClock size={40} color="#0d6efd" className="mb-2" />
                  <Card.Title>Hours Studied</Card.Title>
                  <h2>{profileData.user.studyHours.toFixed(1)} hrs</h2>
                  <p className="text-muted small">Keep up the great work!</p>
                </Card.Body>
              </Card>
            </Col>

            {/* Achievements Section */}
            <Col md={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title className="mb-0">
                      <FaTrophy className="me-2 text-warning" />
                      Achievements
                    </Card.Title>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/achievements')}
                    >
                      View All
                    </Button>
                  </div>

                  {profileData.badges.length > 0 ? (
                    <Row className="g-3">
                      {profileData.badges.map((badge) => (
                        <Col xs={6} md={4} key={badge._id}>
                          <div className="text-center p-2 border rounded">
                            <div style={{ fontSize: '2rem' }}>{badge.iconUrl}</div>
                            <small className="fw-bold d-block">{badge.name}</small>
                            <small className="text-muted">{badge.description}</small>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="info" className="mb-0">
                      Complete courses to earn achievements! 🎯
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;