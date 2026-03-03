import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../configs/api";

const STATUS_COLORS = {
  "not-started": "text-[#4a5168]",
  "in-progress": "text-blue-400",
  completed: "text-emerald-400",
};

//  Reusable new-group modal (same pattern as student side)
const NewGroupModal = ({ courseCode, courseName, onCreated, onCancel }) => {
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const trimmed = name.trim();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/api/courses/${courseCode}/groups`, {
        name: trimmed,
      });
      toast.success(`Group "${trimmed}" created`);
      onCreated(data.group, data.groups);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-xl"
        style={{ animation: "fadeUp 0.2s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] uppercase text-[#4a5168]">
              {courseCode?.replace("COMP", "COMP ")}
            </p>
            <h3 className="text-base font-display text-[#e8eaf0]">
              Add a new group
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#4a5168] hover:text-[#7b8399] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {!confirming ? (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#4a5168]">
                Group name
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && trimmed) {
                    e.preventDefault();
                    setConfirming(true);
                  }
                  if (e.key === "Escape") onCancel();
                }}
                placeholder="e.g. Group A"
                className="w-full bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none focus:border-gold transition-all duration-200 placeholder:text-[#4a5168]"
              />
              <p className="text-xs text-[#7b8399]">
                This group will be visible to all students in {courseName}.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => trimmed && setConfirming(true)}
                disabled={!trimmed}
                className="flex-1 px-4 py-2.5 bg-gold text-navy text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-[#d4b05a] transition-all duration-200"
              >
                Next
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-sm text-[#4a5168] border border-white/8 rounded-lg hover:text-[#7b8399] transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-4 py-3 bg-white/2 border border-white/6 rounded-lg flex flex-col gap-1">
              <p className="text-sm text-[#e8eaf0]">
                Create group{" "}
                <span className="text-gold font-medium">"{trimmed}"</span>?
              </p>
              <p className="text-xs text-[#7b8399] mt-0.5">
                Available to all students in {courseName}.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gold text-navy text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-[#d4b05a] transition-all duration-200"
              >
                {loading && (
                  <span className="w-3.5 h-3.5 border-2 border-navy/25 border-t-navy rounded-full animate-spin" />
                )}
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="px-4 py-2.5 text-sm text-[#4a5168] border border-white/8 rounded-lg hover:text-[#7b8399] transition-all duration-200"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

//

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  // groups cache: { [courseCode]: [...] }
  const [groupsCache, setGroupsCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterCourse, setFilterCourse] = useState("");
  const [filterGroup, setFilterGroup] = useState("");

  // Enroll modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", courseCode: "", groupId: "" });
  const [submitting, setSubmitting] = useState(false);

  // New group modal
  const [addingGroupFor, setAddingGroupFor] = useState(null); // courseCode | null
  const [addingGroupContext, setAddingGroupContext] = useState(""); // "modal" | "edit"

  // Inline edit
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  //  Fetch helpers
  const fetchGroups = useCallback(
    async (courseCode) => {
      if (!courseCode || groupsCache[courseCode]) return;
      try {
        const { data } = await api.get(`/api/courses/${courseCode}/groups`);
        setGroupsCache((p) => ({ ...p, [courseCode]: data.groups ?? [] }));
      } catch {
        /* silent */
      }
    },
    [groupsCache],
  );

  const fetchEnrollments = useCallback(async () => {
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
  }, [filterCourse, filterGroup]);

  useEffect(() => {
    api.get("/api/courses").then(({ data }) => {
      const list = data.courses ?? [];
      setCourses(list);
      if (list.length > 0)
        setForm((p) => ({ ...p, courseCode: list[0].courseCode }));
    });
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Pre-fetch groups for the enroll modal's selected course
  useEffect(() => {
    if (form.courseCode) fetchGroups(form.courseCode);
  }, [form.courseCode, fetchGroups]);

  //  Group helpers
  const getGroups = (courseCode) => groupsCache[courseCode] ?? [];

  const handleGroupCreated = (newGroup, allGroups, courseCode, context) => {
    setGroupsCache((p) => ({ ...p, [courseCode]: allGroups }));
    setAddingGroupFor(null);
    if (context === "modal") {
      setForm((p) => ({ ...p, groupId: newGroup._id }));
    } else if (context === "edit") {
      setEditData((p) => ({ ...p, groupId: newGroup._id }));
    }
  };

  //  Enroll
  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!form.groupId) {
      toast.error("Please select a group");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/api/enrollments", {
        email: form.email,
        courseCode: form.courseCode,
        groupId: form.groupId,
      });
      toast.success(`${data.enrollment.user?.username} enrolled`);
      setShowModal(false);
      setForm({
        email: "",
        courseCode: courses[0]?.courseCode ?? "",
        groupId: "",
      });
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  //  Edit
  const startEdit = (enrollment) => {
    const courseCode = enrollment.course?.courseCode;
    setEditing(enrollment._id);
    setEditData({
      groupId: enrollment.group?._id ?? "",
      projectStatus: enrollment.projectStatus,
    });
    fetchGroups(courseCode);
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

  //  Filter group options
  // Flatten all cached groups for the filter dropdown
  const allCachedGroups = Object.values(groupsCache).flat();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-[#e8eaf0]">Enrollments</h1>
          <p className="text-sm text-[#7b8399] mt-1">
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
          {courses.map((c) => (
            <option key={c.courseCode} value={c.courseCode}>
              {c.courseCode}
            </option>
          ))}
        </select>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="bg-[#111827] border border-white/8 rounded-lg px-3 py-2 text-sm text-[#e8eaf0] outline-none"
        >
          <option value="">All Groups</option>
          {allCachedGroups.map((g) => (
            <option key={g._id} value={g._id}>
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
                const courseCode = e.course?.courseCode;
                const courseGroups = getGroups(courseCode);
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
                      {courseCode ?? "-"}
                    </td>

                    {/* Group */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={editData.groupId}
                            onChange={(ev) =>
                              setEditData((p) => ({
                                ...p,
                                groupId: ev.target.value,
                              }))
                            }
                            className="bg-[#1a2235] border border-white/12 rounded px-2 py-1 text-xs text-[#e8eaf0] outline-none"
                          >
                            <option value="" disabled>
                              Select group
                            </option>
                            {courseGroups.map((g) => (
                              <option key={g._id} value={g._id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingGroupFor(courseCode);
                              setAddingGroupContext("edit");
                            }}
                            className="text-[0.65rem] text-gold border border-gold/20 px-1.5 py-0.5 rounded hover:bg-gold/10 transition-all duration-150 whitespace-nowrap"
                          >
                            + New
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#7b8399]">
                          {e.group?.name ?? "-"}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editData.projectStatus}
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
                              onClick={() => startEdit(e)}
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

      {/* Enroll modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 flex flex-col gap-5">
            <h2 className="font-display text-xl text-[#e8eaf0]">
              Enroll Student
            </h2>
            <form onSubmit={handleEnroll} className="flex flex-col gap-4">
              {/* Email */}
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
                  className="bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none placeholder:text-[#4a5168] focus:border-gold transition-colors"
                />
              </div>

              {/* Course */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
                  Course
                </label>
                <select
                  value={form.courseCode}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      courseCode: e.target.value,
                      groupId: "",
                    }))
                  }
                  className="bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none focus:border-gold transition-colors"
                >
                  {courses.map((c) => (
                    <option
                      key={c.courseCode}
                      value={c.courseCode}
                      className="bg-[#111827]"
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
                  Group
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.groupId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, groupId: e.target.value }))
                    }
                    className="flex-1 bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none focus:border-gold transition-colors"
                  >
                    <option value="" disabled>
                      Select a group
                    </option>
                    {getGroups(form.courseCode).map((g) => (
                      <option
                        key={g._id}
                        value={g._id}
                        className="bg-[#111827]"
                      >
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingGroupFor(form.courseCode);
                      setAddingGroupContext("modal");
                    }}
                    className="shrink-0 px-3 py-2 text-xs text-gold border border-gold/20 rounded-lg hover:bg-gold/10 transition-all duration-200 whitespace-nowrap"
                  >
                    + New
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !form.groupId}
                  className="flex-1 py-3 bg-gold text-navy text-sm font-medium rounded-lg hover:bg-[#d4b05a] transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? "Enrolling…" : "Enroll"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setForm({
                      email: "",
                      courseCode: courses[0]?.courseCode ?? "",
                      groupId: "",
                    });
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

      {/* New group modal */}
      {addingGroupFor && (
        <NewGroupModal
          courseCode={addingGroupFor}
          courseName={
            courses.find((c) => c.courseCode === addingGroupFor)?.name
          }
          onCreated={(g, all) =>
            handleGroupCreated(g, all, addingGroupFor, addingGroupContext)
          }
          onCancel={() => setAddingGroupFor(null)}
        />
      )}
    </div>
  );
};

export default AdminEnrollments;
