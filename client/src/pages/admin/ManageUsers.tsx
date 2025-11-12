import React, { useState } from "react";
import { adminService } from "../../services/adminService";
import { toast } from "react-toastify";
import "../Style.css";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  points: number;
  studyHours: number;
  currentStreak: number;
  createdAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

export const ManageUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "student",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning("Please enter a search query");
      return;
    }

    setLoading(true);
    try {
      const users = await adminService.searchUsers(searchQuery);
      setUsers(users);
      if (users.length === 0) {
        toast.info("No users found");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to search users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      role: "student",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await adminService.updateUser(selectedUser._id, formData);
      toast.success("User updated successfully");
      
      // Update the user in the list
      setUsers((prev) =>
        prev.map((user) =>
          user._id === selectedUser._id ? { ...user, ...formData } : user
        )
      );
      
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update user");
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "badge bg-danger";
      case "teacher":
        return "badge bg-success";
      default:
        return "badge bg-primary";
    }
  };

  return (
    <div className="manage-users-page">
      <div className="container py-5">
        <div className="form-card">
          <h2 className="text-center mb-4 fw-bold text-primary">Manage User Roles</h2>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="row g-3">
              <div className="col-md-9">
                <input
                  type="text"
                  className="form-control custom-input"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <button
                  type="submit"
                  className="btn btn-gradient w-100"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </form>

          {/* Users List */}
          {users.length > 0 && (
            <div className="users-list">
              <h5 className="mb-3 text-secondary">Search Results ({users.length})</h5>
              <div className="list-group">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="list-group-item list-group-item-action user-item"
                    onClick={() => handleSelectUser(user)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 fw-semibold">{user.name}</h6>
                        <p className="mb-1 text-muted small">{user.email}</p>
                        <div className="d-flex gap-2 mt-2">
                          <span className={getRoleBadgeClass(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                          <span className="badge bg-info">
                            {user.points} points
                          </span>
                        </div>
                      </div>
                      <div className="text-end">
                        <i className="bi bi-pencil-square text-primary fs-5"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Edit User Information</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Name</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control custom-input"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Role</label>
                  <select
                    className="form-select custom-input"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="alert alert-info small">
                  <strong>Current Stats:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Points: {selectedUser.points}</li>
                    <li>Study Hours: {selectedUser.studyHours}</li>
                    <li>Current Streak: {selectedUser.currentStreak} days</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-gradient">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
