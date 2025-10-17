import React, { useMemo, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaLock } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

type Achievement = {
  id: string;
  title: string;
  description: string;
  img?: string;
  locked: boolean;
};

const initialAchievements: Achievement[] = [
  {
    id: "1",
    title: "First Steps",
    description: "Completed your first course lesson.",
    img: "https://placehold.co/128?text=Trophy",
    locked: false,
  },
  {
    id: "2",
    title: "Course Conqueror",
    description: "Finished a complete course from start to end.",
    img: "https://placehold.co/128?text=Course",
    locked: false,
  },
  {
    id: "3",
    title: "Quiz Master",
    description: "Scored 100% on any quiz.",
    img: "https://placehold.co/128?text=Quiz",
    locked: false,
  },
  {
    id: "4",
    title: "Daily Learner",
    description: "Maintained a 7-day learning streak.",
    img: "https://placehold.co/128?text=Daily",
    locked: false,
  },
  {
    id: "5",
    title: "Early Bird",
    description: "Started a lesson before 8 AM.",
    img: "https://placehold.co/128?text=Early",
    locked: true,
  },
  {
    id: "6",
    title: "Night Owl",
    description: "Completed a lesson after 10 PM.",
    img: "https://placehold.co/128?text=Night",
    locked: true,
  },
  {
    id: "7",
    title: "Social Butterfly",
    description: "Shared your progress on social media.",
    img: "https://placehold.co/128?text=Social",
    locked: true,
  },
  {
    id: "8",
    title: "Growth Spurt",
    description: "Reached level 3 in the Tree Growth Tracker.",
    img: "https://placehold.co/128?text=Tree",
    locked: true,
  },
];

const Achievements: React.FC = () => {
  const [achievements] = useState(initialAchievements);

  const unlockedCount = useMemo(
    () => achievements.filter((a) => !a.locked).length,
    [achievements]
  );

  const handleClick = (ach: Achievement) => {
    if (ach.locked) {
      toast.info(`🔒 ${ach.title} is locked. ${ach.description}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.success(`🎉 You unlocked ${ach.title}!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <Container className="py-5">
      <ToastContainer />
      <h2 className="text-center fw-bold mb-2">Achievements</h2>
      <p className="text-center text-muted mb-5">
        {unlockedCount} / {achievements.length} unlocked
      </p>

      <Row className="g-4">
        {achievements.map((ach) => (
          <Col key={ach.id} lg={3} md={6} sm={12}>
            <div
              className="position-relative"
              style={{
                borderRadius: "0.75rem",
                overflow: "hidden",
              }}
            >
              <Card
                className={`text-center shadow-sm border-0 h-100 ${
                  ach.locked ? "opacity-50" : ""
                }`}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => handleClick(ach)}
              >
                <Card.Body className="d-flex flex-column align-items-center">
                  <div
                    className="d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    {ach.img ? (
                      <img
                        src={ach.img}
                        alt=""
                        style={{
                          width: "60%",
                          height: "60%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <span className="text-muted">🏆</span>
                    )}
                  </div>
                  <h6 className="fw-semibold mb-1">{ach.title}</h6>
                  <p className="text-muted small">{ach.description}</p>
                </Card.Body>
              </Card>


              {ach.locked && (
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    cursor: "not-allowed",
                  }}
                  onClick={() => handleClick(ach)}
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
    </Container>
  );
};

export default Achievements;