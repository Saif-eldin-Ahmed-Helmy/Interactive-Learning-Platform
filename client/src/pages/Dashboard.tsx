import React, { useEffect, useState } from "react";
import { BiSolidTree } from "react-icons/bi";
import { BsStar } from "react-icons/bs";
import { TbNumber15Small } from "react-icons/tb";

interface DashboardItem {
  id: number;
  name: string;
  description: string;
  progress: number;
  image: string;
}

export const Dashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/dashboard")
      .then((res) => res.json())
      .then((data) => setDashboard(data))
      .catch((err) => console.error("Error fetching dashboard data:", err));
  }, []);

  return (
    <>
      {/* Header */}
      <div className="text-center mt-4">
        <h2 className="fw-bold">Dashboard</h2>
        <div className="d-flex justify-content-center gap-5 mt-3 fw-medium text-secondary fs-4">
          <span className="border-bottom border-primary pb-1 fw-bold text-dark">
            My Courses
          </span>
          <span className="fw-bold text-dark">Achievements</span>
        </div>
      </div>

      {/* Courses Section */}
      <div className="container my-5">
        <div className="row justify-content-center">

          {/* first two*/}
          {dashboard.slice(0, 2).map((item) => (
            <DashboardCard key={item.id} item={item} />
          ))}

          {/* tree card*/}
          <div className="col-12 col-md-6 col-lg-3 shadow-sm border rounded-4 p-3 m-3 bg-light text-center">
            <BiSolidTree size={200} color="#007bff" />
            <h5 className="fw-bold mt-3 text-primary">Do Your Best 🌱</h5>
            <p className="text-muted small mb-4">
              Every hour you study brings you closer to your dreams.
            </p>
            <button className="btn btn-outline-primary w-100">
              View All Achievements
            </button>
          </div>

          {/* card 4,5*/}
          {dashboard.slice(2, 4).map((item) => (
            <DashboardCard key={item.id} item={item} />
          ))}

          {/* Daily Streak */}
          <div className="col-12 col-md-6 col-lg-3 shadow-sm border rounded-4 p-4 m-3 bg-light text-center">
            <div className="d-flex flex-column align-items-center justify-content-center">
              <p className="fw-bold fs-5 mb-2 text-primary">Daily Streak</p>
              <BsStar size={70} color="#ffc107" />
              <TbNumber15Small size={90} color="#0d6efd" />
              <p className="text-muted mt-3 fw-medium">
                15 consecutive days learning 🔥
              </p>
            </div>
          </div>

         
          {dashboard.slice(4).map((item) => (
            <DashboardCard key={item.id} item={item} />
          ))}

        </div>
      </div>
    </>
  );
};


const DashboardCard: React.FC<{ item: DashboardItem }> = ({ item }) => (
  <div className="col-12 col-md-6 col-lg-3 shadow-sm border rounded-4 p-3 m-3 bg-white">
    <img
      src={item.image}
      alt={item.name}
      className="w-100 rounded-3 mb-3"
      style={{ height: "180px", objectFit: "cover" }}
    />
    <h5 className="fw-bold text-primary">{item.name}</h5>
    <p className="text-muted small">{item.description}</p>
    <div className="progress mb-3" style={{ height: "10px" }}>
      <div
        className="progress-bar bg-primary"
        style={{ width: `${item.progress}%` }}
      >
        {item.progress}%
      </div>
    </div>
    <button className="btn btn-primary w-100">Start Learning</button>
  </div>
);