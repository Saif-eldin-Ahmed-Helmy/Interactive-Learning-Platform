import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ProgressBar, Table } from "react-bootstrap";
import "font-awesome/css/font-awesome.min.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
function Stats() {
  const totalActiveStudents = 1293;
  const lastMonthTotalActiveStudents = 1300;
  const mostTakenCourse = { name: "React for Beginners", students: 857 };
  const mostCompletedCourse = { name: "Advanced CSS", completionRate: 88 };
  const longestStreak = {
    userName: "Elena V.",
    days: 128,
  };

  // Placeholder data for the charts
  const dailyActivityData = [
    { day: "Mon", students: 430 },
    { day: "Tue", students: 450 },
    { day: "Wed", students: 510 },
    { day: "Thu", students: 480 },
    { day: "Fri", students: 550 },
    { day: "Sat", students: 380 },
    { day: "Sun", students: 410 },
  ];

  const courseDistributionData = [
    { name: "React", value: 857 },
    { name: "CSS", value: 621 },
    { name: "JavaScript", value: 734 },
    { name: "Node.js", value: 450 },
  ];
  const latestQuizzesData = [
    {
      id: 1,
      name: "React Hooks Fundamentals",
      passingRate: 85,
      avgScore: 88,
      participants: 150,
    },
    {
      id: 2,
      name: "Advanced CSS Selectors",
      passingRate: 72,
      avgScore: 75,
      participants: 210,
    },
    {
      id: 3,
      name: "JavaScript Promises & Async/Await",
      passingRate: 91,
      avgScore: 93,
      participants: 120,
    },
    {
      id: 4,
      name: "Node.js Event Loop",
      passingRate: 68,
      avgScore: 71,
      participants: 95,
    },
  ];
  const PIE_CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  function TotalActiveStudent({
    count,
    lastMonthCount,
  }: {
    count: number;
    lastMonthCount: number;
  }) {
    const difference = count - lastMonthCount;
    const percentageChange =
      lastMonthCount > 0 ? (difference / lastMonthCount) * 100 : 0;
    const isIncrease = difference >= 0;

    return (
      <>
        <Container
          style={{
            border: "1px solid lightgray",
            borderRadius: "8px",
            height: "100%",
          }}
        >
          <Row>
            <Col lg={8} md={8} sm={8} style={{ marginTop: "8px" }}>
              <h6 style={{ fontSize: "0.68rem", opacity: "0.7" }}>
                Total Active Students
              </h6>
            </Col>
            <Col
              lg={4}
              md={4}
              sm={4}
              style={{
                textAlign: "right",
              }}
            >
              <i
                className="fa fa-users"
                style={{ fontSize: "0.7rem", opacity: "0.7" }}
              ></i>
            </Col>
          </Row>
          <Row>
            <Col>
              <h2>{count}</h2>
            </Col>
          </Row>
          <Row>
            <Col>
              <span
                style={{
                  color: isIncrease ? "green" : "red",
                  fontSize: "0.8rem",
                  marginRight: "8px",
                }}
              >
                {isIncrease ? (
                  <i
                    className="fa fa-arrow-up"
                    style={{ marginRight: "4px" }}
                  />
                ) : (
                  <i
                    className="fa fa-arrow-down"
                    style={{ marginRight: "4px" }}
                  />
                )}
                {/* Use Math.abs to always show a positive percentage */}
                {Math.abs(percentageChange).toFixed(1)}%
              </span>
              <span style={{ fontSize: "0.8rem", opacity: "0.7" }}>
                from last month
              </span>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
  function MostTakenCourse({
    name,
    students,
  }: {
    name: string;
    students: number;
  }) {
    return (
      <Container
        style={{
          border: "1px solid lightgray",
          borderRadius: "8px",
          height: "100%",
        }}
      >
        <Row>
          <Col lg={8} md={8} sm={8} style={{ marginTop: "8px" }}>
            <h6 style={{ fontSize: "0.68rem", opacity: "0.7" }}>
              Most Popular Course
            </h6>
          </Col>
          <Col lg={4} md={4} sm={4} style={{ textAlign: "right" }}>
            <i
              className="fa fa-book"
              style={{ fontSize: "0.7rem", opacity: "0.7" }}
            ></i>
          </Col>
        </Row>
        <Row>
          <Col>
            <h4 style={{ fontSize: "1.2rem" }}>{name}</h4>
          </Col>
        </Row>
        <Row>
          <Col>
            <p style={{ fontSize: "0.9rem", opacity: "0.9" }}>
              <i className="fa fa-users" style={{ marginRight: "5px" }} />
              {students} enrolled
            </p>
          </Col>
        </Row>
      </Container>
    );
  }

  function MostCompletedCourse({ name, rate }: { name: string; rate: number }) {
    return (
      <Container
        style={{
          border: "1px solid lightgray",
          borderRadius: "8px",
          height: "100%",
        }}
      >
        <Row>
          <Col lg={8} md={8} sm={8} style={{ marginTop: "8px" }}>
            <h6 style={{ fontSize: "0.68rem", opacity: "0.7" }}>
              Highest Completion
            </h6>
          </Col>
          <Col lg={4} md={4} sm={4} style={{ textAlign: "right" }}>
            <i
              className="fa fa-trophy"
              style={{ fontSize: "0.7rem", opacity: "0.7" }}
            ></i>
          </Col>
        </Row>
        <Row>
          <Col>
            <h4 style={{ fontSize: "1.2rem" }}>{name}</h4>
          </Col>
        </Row>
        <Row className="align-items-center mb-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ fontSize: "0.8rem", opacity: "0.7" }}>
                Completion Rate
              </span>
              <span style={{ color: "green", fontWeight: "bold" }}>
                {rate}%
              </span>
            </div>
            <ProgressBar
              now={rate}
              variant="success"
              style={{ height: "8px" }}
            />
          </Col>
        </Row>
      </Container>
    );
  }

  function MostStreak({ name, days }: { name: string; days: number }) {
    return (
      <Container
        style={{
          border: "1px solid lightgray",
          borderRadius: "8px",
          background: "linear-gradient(45deg, #ffc107, #ff9800)",
          color: "white",
          height: "100%",
        }}
      >
        <Row>
          <Col style={{ marginTop: "8px" }}>
            <h6 style={{ fontSize: "0.68rem", opacity: "0.9" }}>Top Streak</h6>
          </Col>
          <Col style={{ textAlign: "right" }}>
            <i className="fa fa-bolt" style={{ opacity: "0.9" }}></i>
          </Col>
        </Row>
        <Row className="text-center mt-2 mb-2">
          <Col>
            <h2 style={{ fontWeight: "bold" }}>{days} Days</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>by {name}</p>
          </Col>
        </Row>
      </Container>
    );
  }

  function DailyActiveStudentsChart() {
    return (
      <Container
        style={{
          border: "1px solid lightgray",
          borderRadius: "8px",
          padding: "1rem",
        }}
      >
        <h5 style={{ opacity: 0.8, marginBottom: "1rem" }}>
          Daily Active Students
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyActivityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="students"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Container>
    );
  }

  function CourseDistributionChart() {
    return (
      <Container
        style={{
          border: "1px solid lightgray",
          borderRadius: "8px",
          padding: "1rem",
        }}
      >
        <h5 style={{ opacity: 0.8, marginBottom: "1rem" }}>
          Course Enrollment Distribution
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={courseDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {courseDistributionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Container>
    );
  }

  function LatestQuizzesTable({ data }: { data: typeof latestQuizzesData }) {
    return (
      <Container
        style={{
          border: "1px solid lightgray",
          borderRadius: "8px",
          padding: "1rem",
        }}
      >
        <h5 style={{ opacity: 0.8, marginBottom: "1rem" }}>
          Latest Quiz Performance
        </h5>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Quiz Name</th>
              <th>Passing Rate</th>
              <th>Average Score</th>
              <th>Participants</th>
            </tr>
          </thead>
          <tbody>
            {data.map((quiz) => (
              <tr key={quiz.id}>
                <td>{quiz.name}</td>
                <td>{quiz.passingRate}%</td>
                <td>{quiz.avgScore}%</td>
                <td>{quiz.participants}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Row className="mt-3 d-flex">
          <Col lg={3} md={6} sm={12} className="p-2">
            <TotalActiveStudent
              count={totalActiveStudents}
              lastMonthCount={lastMonthTotalActiveStudents}
            />
          </Col>
          <Col lg={3} md={6} sm={12} className="p-2">
            <MostTakenCourse
              name={mostTakenCourse.name}
              students={mostTakenCourse.students}
            />
          </Col>
          <Col lg={3} md={6} sm={12} className="p-2">
            <MostCompletedCourse
              name={mostCompletedCourse.name}
              rate={mostCompletedCourse.completionRate}
            />
          </Col>
          <Col lg={3} md={6} sm={12} className="p-2">
            <MostStreak
              name={longestStreak.userName}
              days={longestStreak.days}
            />
          </Col>
        </Row>
        <Row className="mt-3 d-flex">
          <Col lg={6} md={12} className="mb-3">
            <DailyActiveStudentsChart />
          </Col>
          <Col lg={6} md={12} className="mb-3">
            <CourseDistributionChart />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col style={{ marginBottom: "100px" }}>
            <LatestQuizzesTable data={latestQuizzesData} />
          </Col>
        </Row>
      </Container>
    </>
  );
}
export default Stats;
