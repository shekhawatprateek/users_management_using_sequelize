import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      await api.delete(`http://localhost:8000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter((user) => user.id !== userId));
      alert("User deleted successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete user.");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");

        const response = await api.get(
          `http://localhost:8000/v1/user?search=${search}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Prove you are logged in
            },
          },
        );

        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Dashboard Error:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, navigate]); 

  // 4. Handlers
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); 
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-4">
          <h1 className="text-2xl font-bold">User Directory</h1>

          {/* Action Buttons Container */}
          <div className="flex gap-3">
            <Link
              to="/profile"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-bold shadow transition-colors flex items-center"
            >
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-bold shadow transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={handleSearchChange}
            className="w-full border-2 border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="text-center py-10 font-bold text-gray-500">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Role</th>
                  <th className="p-3 border-b">Verified</th>
                  {/* Conditionally render the Actions header */}
                  {currentUser?.role === "admin" && (
                    <th className="p-3 border-b text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{user.name}</td>
                      <td className="p-3 border-b">{user.email}</td>
                      <td className="p-3 border-b capitalize">{user.role}</td>
                      <td className="p-3 border-b">
                        {user.isVerified ? "✅ Yes" : "❌ No"}
                      </td>
                      {/* Conditionally render the Delete button */}
                      {currentUser?.role === "admin" && (
                        <td className="p-3 border-b text-center">
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === currentUser.id} // Disable if it's their own account
                            className={`px-3 py-1 rounded text-white text-sm font-bold ${user.id === currentUser.id ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={currentUser?.role === "admin" ? "5" : "4"}
                      className="text-center p-4 text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded ${page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            Previous
          </button>

          <span className="font-semibold text-gray-700">
            Page {page} of {totalPages === 0 ? 1 : totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className={`px-4 py-2 rounded ${page === totalPages || totalPages === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
