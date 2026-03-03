import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../configs/api";
import { useSelector } from "react-redux";

const Badge = ({ role }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-medium tracking-wide uppercase ${
      role === "admin"
        ? "bg-gold/15 text-gold border border-gold/25"
        : "bg-white/5 text-[#7b8399] border border-white/8"
    }`}
  >
    {role}
  </span>
);

const AdminUsers = () => {
  const currentUser = useSelector((s) => s.auth.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/user/all");
      setUsers(data.users ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "student" : "admin";
    try {
      await api.patch(`/api/user/${user._id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)),
      );
      toast.success(`${user.username} is now ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteUser = async (user) => {
    if (
      !window.confirm(`Delete user "${user.username}"? This cannot be undone.`)
    )
      return;
    try {
      await api.delete(`/api/user/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      toast.success(`${user.username} deleted`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#e8eaf0]">Users</h1>
          <p className="text-sm text-[#7b8399] mt-1">
            {users.length} registered
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#7b8399] border border-white/8 rounded-lg transition-all duration-200 hover:text-[#e8eaf0] hover:border-white/[0.14] disabled:opacity-40"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-[#e05c5c]/10 border border-[#e05c5c]/25 rounded-lg text-sm text-[#e05c5c]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-[#7b8399]">Loading…</div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center text-sm text-[#7b8399]">
          No users found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1a2235]">
                {["Username", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[0.68rem] font-medium tracking-[0.09em] uppercase text-[#7b8399] border-b border-white/8 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#111827]">
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-white/5 last:border-none hover:bg-white/2 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-[#e8eaf0] font-medium">
                    {u.username}
                  </td>
                  <td className="px-4 py-3 text-[#7b8399]">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge role={u.role ?? "student"} />
                  </td>
                  <td className="px-4 py-3 text-[#7b8399] text-xs whitespace-nowrap">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Don't let admin demote themselves */}
                      {u._id !== currentUser._id && (
                        <button
                          onClick={() => toggleRole(u)}
                          className="px-2.5 py-1 text-xs text-[#7b8399] border border-white/8 rounded-md hover:text-[#e8eaf0] hover:border-white/20 transition-all duration-150"
                        >
                          Make {u.role === "admin" ? "Student" : "Admin"}
                        </button>
                      )}
                      {u._id !== currentUser._id && (
                        <button
                          onClick={() => deleteUser(u)}
                          className="px-2.5 py-1 text-xs text-[#e05c5c] border border-[#e05c5c]/20 rounded-md hover:bg-[#e05c5c]/10 hover:border-[#e05c5c]/40 transition-all duration-150"
                        >
                          Delete
                        </button>
                      )}
                      {u._id === currentUser._id && (
                        <span className="text-xs text-[#7b8399] italic">
                          you
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
