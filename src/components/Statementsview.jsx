import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../configs/api";
import { COURSES } from "../utils/constants";

const formatGroup = (group) =>
  group
    ? group.replace("group-", "Group ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "N/A";

const getUsername = (s) =>
  s.user?.username ?? s.rawStatement?.actor?.name ?? "Unknown";
const getGroup = (s) => formatGroup(s.group);
const getVerb = (s) => s.verb?.display ?? "Unknown";
const getDescription = (s) => s.description || "-";

const StatementsView = () => {
  const { enrollments } = useSelector((s) => s.auth);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeCourse, setActiveCourse] = useState("all");

  const fetchStatements = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/xapi/statements?limit=100");
      setStatements(data.statements ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  // Filter by selected course tab
  const filtered =
    activeCourse === "all"
      ? statements
      : statements.filter((s) => {
          const code = s.course?.courseCode?.toLowerCase();
          return code === activeCourse.toLowerCase();
        });

  // Only show tabs for courses the user is actually enrolled in
  const enrolledCourseCodes = enrollments.map((e) =>
    e.course?.courseCode?.toLowerCase(),
  );
  const visibleCourses = COURSES.filter((c) =>
    enrolledCourseCodes.includes(c.id),
  );

  // Find what group the user is in for the active course (for the heading)
  const activeEnrollment = enrollments.find(
    (e) => e.course?.courseCode?.toLowerCase() === activeCourse,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-[#e8eaf0]">Statements</h2>
          {activeEnrollment && (
            <p className="text-xs text-[#4a5168] mt-1">
              Showing {formatGroup(activeEnrollment.group)} ·{" "}
              {activeEnrollment.course?.name}
            </p>
          )}
        </div>
        <button
          onClick={fetchStatements}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#7b8399] border border-white/8 rounded-lg transition-all duration-200 hover:text-[#e8eaf0] hover:border-white/[0.14] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-[#7b8399] rounded-full animate-spin" />{" "}
              Refreshing…
            </>
          ) : (
            <>
              <RefreshIcon /> Refresh
            </>
          )}
        </button>
      </div>

      {/* Course filter tabs */}
      {visibleCourses.length > 0 && (
        <div className="flex gap-1 p-1 bg-white/3 rounded-lg w-fit">
          <TabButton
            active={activeCourse === "all"}
            onClick={() => setActiveCourse("all")}
          >
            All
          </TabButton>
          {visibleCourses.map((c) => (
            <TabButton
              key={c.id}
              active={activeCourse === c.id}
              onClick={() => setActiveCourse(c.id)}
            >
              {c.id.toUpperCase().replace("COMP", "COMP ")}
            </TabButton>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-[#e05c5c]/10 border border-[#e05c5c]/25 rounded-lg text-sm text-[#e05c5c]">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111827] border border-white/8 rounded-2xl">
          <p className="text-[#4a5168] text-sm">No statements found yet.</p>
          <p className="text-[#4a5168]/60 text-xs mt-1">
            {enrollments.length === 0
              ? "Select a group in the Create Statement tab to get started."
              : "Submit a statement from the Create Statement tab."}
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1a2235]">
                {["Course", "Group", "User", "Verb", "Description", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#4a5168] border-b border-white/8 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="bg-[#111827]">
              {filtered.map((stmt, i) => (
                <tr
                  key={stmt._id ?? i}
                  className="border-b border-white/5 transition-colors duration-150 hover:bg-white/2 last:border-none"
                >
                  <td className="px-4 py-3 text-[#7b8399] whitespace-nowrap text-xs">
                    {stmt.course?.courseCode ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-[#7b8399] whitespace-nowrap">
                    {getGroup(stmt)}
                  </td>
                  <td className="px-4 py-3 text-[#e8eaf0] whitespace-nowrap">
                    {getUsername(stmt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gold font-medium text-xs tracking-wide">
                      {getVerb(stmt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#7b8399] max-w-xs truncate">
                    {getDescription(stmt)}
                  </td>
                  <td className="px-4 py-3 text-[#4a5168] whitespace-nowrap text-xs">
                    {stmt.createdAt
                      ? new Date(stmt.createdAt).toLocaleDateString()
                      : "-"}
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

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
      active
        ? "bg-[#1a2235] text-[#e8eaf0] shadow-sm"
        : "text-[#4a5168] hover:text-[#7b8399]"
    }`}
  >
    {children}
  </button>
);

const RefreshIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
    <path
      d="M13.65 2.35A8 8 0 1 0 15 8h-2a6 6 0 1 1-1.06-3.39L10 7h5V2l-1.35.35z"
      fill="currentColor"
    />
  </svg>
);

export default StatementsView;
