import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../configs/api";
import { COURSES, GROUPS } from "../../utils/constants";

const STATUS_COLORS = {
  "not-started": "text-[#4a5168]",
  "in-progress": "text-blue-400",
  completed: "text-emerald-400",
};

const formatGroup = (g) =>
  g
    ? g.replace("group-", "Group ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "-";

const EMPTY_FORM = {
  email: "",
  courseCode: COURSES[0]?.id?.toUpperCase() ?? "",
  group: "group-a",
};

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterCourse, setFilterCourse] = useState("");
  const [filterGroup, setFilterGroup] = useState("");

  // Enroll modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Inline edit
  const [editing, setEditing] = useState(null); // enrollment _id
  const [editData, setEditData] = useState({});

  const fetchEnrollments = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterCourse) params.set("course", filterCourse);
      if (filterGroup) params.set("group", filterGroup);
      const { data } = await api.get(`/api/enrollments?${params}`);
      setEnrollments(data.enrollments ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [filterCourse, filterGroup]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/api/enrollments", form);
      toast.success(`${data.enrollment.user?.username} enrolled`);
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await api.patch(`/api/enrollments/${id}`, editData);
      setEnrollments((prev) =>
        prev.map((e) => (e._id === id ? data.enrollment : e)),
      );
      toast.success("Enrollment updated");
      setEditing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteEnrollment = async (id, username) => {
    if (!window.confirm(`Remove enrollment for ${username}?`)) return;
    try {
      await api.delete(`/api/enrollments/${id}`);
      setEnrollments((prev) => prev.filter((e) => e._id !== id));
      toast.success("Enrollment removed");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-[#e8eaf0]">Enrollments</h1>
          <p className="text-sm text-[#4a5168] mt-1">
            {enrollments.length} records
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-navy text-sm font-medium rounded-lg hover:bg-[#d4b05a] transition-all duration-200"
        >
          + Enroll Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="bg-[#111827] border border-white/8 rounded-lg px-3 py-2 text-sm text-[#e8eaf0] outline-none"
        >
          <option value="">All Courses</option>
          {COURSES.map((c) => (
            <option key={c.id} value={c.id.toUpperCase()}>
              {c.id.toUpperCase()}
            </option>
          ))}
        </select>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="bg-[#111827] border border-white/8 rounded-lg px-3 py-2 text-sm text-[#e8eaf0] outline-none"
        >
          <option value="">All Groups</option>
          {GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="px-4 py-3 bg-[#e05c5c]/10 border border-[#e05c5c]/25 rounded-lg text-sm text-[#e05c5c]">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#4a5168]">Loading…</div>
      ) : enrollments.length === 0 ? (
        <div className="py-20 text-center text-sm text-[#4a5168]">
          No enrollments found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1a2235]">
                {["User", "Email", "Course", "Group", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[0.68rem] font-medium tracking-[0.09em] uppercase text-[#4a5168] border-b border-white/8 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="bg-[#111827]">
              {enrollments.map((e) => {
                const isEditing = editing === e._id;
                return (
                  <tr
                    key={e._id}
                    className="border-b border-white/5 last:border-none hover:bg-white/2 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 text-[#e8eaf0] font-medium whitespace-nowrap">
                      {e.user?.username ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-[#7b8399] text-xs">
                      {e.user?.email ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-[#7b8399] text-xs whitespace-nowrap">
                      {e.course?.courseCode ?? "-"}
                    </td>

                    {/* Group - editable */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editData.group ?? e.group}
                          onChange={(ev) =>
                            setEditData((p) => ({
                              ...p,
                              group: ev.target.value,
                            }))
                          }
                          className="bg-[#1a2235] border border-white/12 rounded px-2 py-1 text-xs text-[#e8eaf0] outline-none"
                        >
                          {GROUPS.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[#7b8399]">
                          {formatGroup(e.group)}
                        </span>
                      )}
                    </td>

                    {/* Status - editable */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editData.projectStatus ?? e.projectStatus}
                          onChange={(ev) =>
                            setEditData((p) => ({
                              ...p,
                              projectStatus: ev.target.value,
                            }))
                          }
                          className="bg-[#1a2235] border border-white/12 rounded px-2 py-1 text-xs text-[#e8eaf0] outline-none"
                        >
                          {["not-started", "in-progress", "completed"].map(
                            (s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ),
                          )}
                        </select>
                      ) : (
                        <span
                          className={`text-xs font-medium ${STATUS_COLORS[e.projectStatus] ?? "text-[#4a5168]"}`}
                        >
                          {e.projectStatus ?? "-"}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(e._id)}
                              className="px-2.5 py-1 text-xs text-emerald-400 border border-emerald-400/25 rounded-md hover:bg-emerald-400/10 transition-all duration-150"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="px-2.5 py-1 text-xs text-[#7b8399] border border-white/8 rounded-md hover:text-[#e8eaf0] transition-all duration-150"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditing(e._id);
                                setEditData({
                                  group: e.group,
                                  projectStatus: e.projectStatus,
                                });
                              }}
                              className="px-2.5 py-1 text-xs text-[#7b8399] border border-white/8 rounded-md hover:text-[#e8eaf0] hover:border-white/20 transition-all duration-150"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                deleteEnrollment(e._id, e.user?.username)
                              }
                              className="px-2.5 py-1 text-xs text-[#e05c5c] border border-[#e05c5c]/20 rounded-md hover:bg-[#e05c5c]/10 hover:border-[#e05c5c]/40 transition-all duration-150"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual enroll modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 flex flex-col gap-5">
            <h2 className="font-display text-xl text-[#e8eaf0]">
              Enroll Student
            </h2>

            <form onSubmit={handleEnroll} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
                  Student Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="student@example.com"
                  className="bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none placeholder:text-[#4a5168] focus:border-gold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
                  Course
                </label>
                <select
                  value={form.courseCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, courseCode: e.target.value }))
                  }
                  className="bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none focus:border-gold"
                >
                  {COURSES.map((c) => (
                    <option
                      key={c.id}
                      value={c.id.toUpperCase()}
                      className="bg-[#111827]"
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
                  Group
                </label>
                <select
                  value={form.group}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, group: e.target.value }))
                  }
                  className="bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none focus:border-gold"
                >
                  {GROUPS.map((g) => (
                    <option key={g.id} value={g.id} className="bg-[#111827]">
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gold text-navy text-sm font-medium rounded-lg hover:bg-[#d4b05a] transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? "Enrolling…" : "Enroll"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setForm(EMPTY_FORM);
                  }}
                  className="flex-1 py-3 text-sm text-[#7b8399] border border-white/8 rounded-lg hover:text-[#e8eaf0] hover:border-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollments;
