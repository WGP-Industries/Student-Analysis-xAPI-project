import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../configs/api";

const getGroup = (s) => s.group?.name ?? "N/A";
const getUsername = (s) =>
  s.user?.username ?? s.rawStatement?.actor?.name ?? "Unknown";
const getVerb = (s) => s.verb?.display ?? "Unknown";
const getDesc = (s) => s.description || "-";

const STAGE_COLOURS = {
  Planning: "bg-blue-500/10   text-blue-300   border-blue-500/20",
  Exploration: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  Construction: "bg-amber-500/10  text-amber-300  border-amber-500/20",
  Testing: "bg-green-500/10  text-green-300  border-green-500/20",
  Reflection: "bg-rose-500/10   text-rose-300   border-rose-500/20",
};

const StageBadge = ({ stage }) =>
  stage ? (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-medium border whitespace-nowrap ${STAGE_COLOURS[stage] ?? "bg-white/5 text-[#7b8399] border-white/10"}`}
    >
      {stage}
    </span>
  ) : (
    <span className="text-[#7b8399]">-</span>
  );

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

  const filtered =
    activeCourse === "all"
      ? statements
      : statements.filter(
          (s) => s.course?.courseCode?.toLowerCase() === activeCourse,
        );

  // Derive visible course tabs from enrollments - no COURSES constant needed
  const visibleCourses = enrollments
    .filter((e) => e.course?.courseCode)
    .map((e) => ({
      id: e.course.courseCode.toLowerCase(),
      label: e.course.courseCode.replace("COMP", "COMP "),
    }));

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
            <p className="text-xs text-[#7b8399] mt-1">
              Showing {activeEnrollment.group?.name ?? "your group"} ·{" "}
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

      {/* Course tabs */}
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
              {c.label}
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
          <p className="text-[#7b8399] text-sm">No statements found yet.</p>
          <p className="text-[#7b8399]/60 text-xs mt-1">
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
                {[
                  "Course",
                  "Group",
                  "User",
                  "Verb",
                  "Stage",
                  "Step",
                  "Description",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#7b8399] border-b border-white/8 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StageBadge stage={stmt.stage} />
                  </td>
                  <td className="px-4 py-3 text-[#7b8399] whitespace-nowrap text-xs max-w-35 truncate">
                    {stmt.problemStep ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-[#7b8399] max-w-xs truncate">
                    {getDesc(stmt)}
                  </td>
                  <td className="px-4 py-3 text-[#7b8399] whitespace-nowrap text-xs">
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
    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${active ? "bg-[#1a2235] text-[#e8eaf0] shadow-sm" : "text-[#7b8399] hover:text-[#7b8399]"}`}
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
