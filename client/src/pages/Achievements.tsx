import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Badge, ProgressBar } from "react-bootstrap";
import { FaLock, FaTrophy } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { achievementService } from "../services/achievementService";

type Achievement = {
  _id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: string;
  requirement: {
    type: string;
    value: number;
  };
  points: number;
  earned: boolean;
  earnedAt: string | null;
  progress: {
    current: number;
    required: number;
  };
};

type AchievementsData = {
  achievements: Achievement[];
  grouped: Record<string, Achievement[]>;
  stats: {
    total: number;
    earned: number;
    locked: number;
  };
};

const Achievements: React.FC = () => {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await achievementService.getUserAchievements();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load achievements");
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (achievement: Achievement) => {
    if (!achievement.earned) {
      const progressPercent = Math.round(
        (achievement.progress.current / achievement.progress.required) * 100
      );
      toast.info(
        `🔒 ${achievement.name} - Progress: ${progressPercent}% (${achievement.progress.current}/${achievement.progress.required})`,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else {
      toast.success(`🎉 ${achievement.name} unlocked!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      html: "HTML",
      css: "CSS",
      javascript: "JavaScript",
      react: "React",
      milestone: "Milestones",
      streak: "Streaks",
      general: "General",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      html: "danger",
      css: "primary",
      javascript: "warning",
      react: "info",
      milestone: "success",
      streak: "danger",
      general: "secondary",
    };
    return colors[category] || "secondary";
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading achievements...</p>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || "Failed to load achievements"}
        </Alert>
      </Container>
    );
  }

  const filteredAchievements =
    selectedCategory === "all"
      ? data.achievements
      : data.grouped[selectedCategory] || [];

  const categories = Object.keys(data.grouped);

  return (
    <Container className="py-5">
      <ToastContainer />
      
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-2">
          <FaTrophy className="text-warning me-2" />
          Achievements
        </h2>
        <p className="text-muted mb-3">
          {data.stats.earned} / {data.stats.total} unlocked
        </p>
        <ProgressBar
          now={(data.stats.earned / data.stats.total) * 100}
          variant="success"
          style={{ height: "8px", maxWidth: "400px", margin: "0 auto" }}
        />
      </div>

      {/* Category Filter */}
      <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
        <Badge
          bg={selectedCategory === "all" ? "primary" : "secondary"}
          style={{ cursor: "pointer", fontSize: "0.9rem", padding: "0.5rem 1rem" }}
          onClick={() => setSelectedCategory("all")}
        >
          All ({data.stats.total})
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            bg={selectedCategory === category ? getCategoryColor(category) : "secondary"}
            style={{ cursor: "pointer", fontSize: "0.9rem", padding: "0.5rem 1rem" }}
            onClick={() => setSelectedCategory(category)}
          >
            {getCategoryLabel(category)} ({data.grouped[category].length})
          </Badge>
        ))}
      </div>

      {/* Achievements Grid */}
      <Row className="g-4">
        {filteredAchievements.map((achievement) => (
          <Col key={achievement._id} lg={3} md={6} sm={12}>
            <div
              className="position-relative"
              style={{
                borderRadius: "0.75rem",
                overflow: "hidden",
              }}
            >
              <Card
                className={`text-center shadow-sm border-0 h-100 ${
                  !achievement.earned ? "opacity-75" : ""
                }`}
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onClick={() => handleClick(achievement)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Card.Body className="d-flex flex-column align-items-center">
                  {/* Icon */}
                  <div
                    className={`d-flex align-items-center justify-content-center mb-3 ${
                      achievement.earned ? "" : "opacity-50"
                    }`}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: achievement.earned ? "#fff3cd" : "#f8f9fa",
                      fontSize: "2.5rem",
                    }}
                  >
                    {achievement.iconUrl}
                  </div>

                  {/* Name */}
                  <h6 className="fw-semibold mb-1">{achievement.name}</h6>
                  
                  {/* Description */}
                  <p className="text-muted small mb-2">{achievement.description}</p>

                  {/* Points */}
                  <Badge bg="warning" className="mb-2">
                    {achievement.points} pts
                  </Badge>

                  {/* Progress Bar for Locked Achievements */}
                  {!achievement.earned && achievement.progress.current > 0 && (
                    <div className="w-100 mt-2">
                      <ProgressBar
                        now={(achievement.progress.current / achievement.progress.required) * 100}
                        variant="success"
                        style={{ height: "6px" }}
                      />
                      <small className="text-muted">
                        {achievement.progress.current} / {achievement.progress.required}
                      </small>
                    </div>
                  )}

                  {/* Earned Date */}
                  {achievement.earned && achievement.earnedAt && (
                    <small className="text-success mt-2">
                      ✓ Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </small>
                  )}
                </Card.Body>
              </Card>

              {/* Lock Overlay */}
              {!achievement.earned && (
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    cursor: "pointer",
                  }}
                  onClick={() => handleClick(achievement)}
                >
                  <div
                    className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(255,255,255,0.95)",
                      color: "#6c757d",
                    }}
                  >
                    <FaLock size={18} />
                  </div>
                </div>
              )}
            </div>
          </Col>
        ))}
      </Row>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <Alert variant="info" className="text-center">
          No achievements in this category yet.
        </Alert>
      )}
    </Container>
  );
};

export default Achievements;