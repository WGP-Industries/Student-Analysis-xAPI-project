import { useEffect, useState, useCallback } from "react";
import api from "../../configs/api";

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
    <span className="text-[#4a5168]">-</span>
  );

const AdminStatements = () => {
  const [statements, setStatements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]); // all groups for selected course filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterCourse, setFilterCourse] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterVerb, setFilterVerb] = useState("");

  // Fetch courses once on mount
  useEffect(() => {
    api.get("/api/courses").then(({ data }) => setCourses(data.courses ?? []));
  }, []);

  // Fetch groups when course filter changes
  useEffect(() => {
    setFilterGroup("");
    if (!filterCourse) {
      setGroups([]);
      return;
    }
    api
      .get(`/api/courses/${filterCourse}/groups`)
      .then(({ data }) => setGroups(data.groups ?? []))
      .catch(() => setGroups([]));
  }, [filterCourse]);

  const fetchStatements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterCourse) params.set("course", filterCourse);
      if (filterGroup) params.set("group", filterGroup);
      if (filterStage) params.set("stage", filterStage);
      if (filterVerb) params.set("verb", filterVerb);
      params.set("limit", "200");
      const { data } = await api.get(`/api/xapi/admin/statements?${params}`);
      setStatements(data.statements ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [filterCourse, filterGroup, filterStage, filterVerb]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-[#e8eaf0]">Statements</h1>
          <p className="text-sm text-[#7b8399] mt-1">
            {statements.length} records
          </p>
        </div>
        <button
          onClick={fetchStatements}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#7b8399] border border-white/8 rounded-lg hover:text-[#e8eaf0] hover:border-white/[0.14] disabled:opacity-40 transition-all duration-200"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {/* Course */}
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

        {/* Group - only shows options when a course is selected */}
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          disabled={!filterCourse}
          className="bg-[#111827] border border-white/8 rounded-lg px-3 py-2 text-sm text-[#e8eaf0] outline-none disabled:opacity-40"
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>

        {/* Stage */}
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="bg-[#111827] border border-white/8 rounded-lg px-3 py-2 text-sm text-[#e8eaf0] outline-none"
        >
          <option value="">All Stages</option>
          {[
            "Planning",
            "Exploration",
            "Construction",
            "Testing",
            "Reflection",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Verb text search */}
        <input
          type="text"
          placeholder="Filter by verb…"
          value={filterVerb}
          onChange={(e) => setFilterVerb(e.target.value)}
          className="bg-[#111827] border border-white/8 rounded-lg px-3 py-2 text-sm text-[#e8eaf0] placeholder:text-[#4a5168] outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-[#e05c5c]/10 border border-[#e05c5c]/25 rounded-lg text-sm text-[#e05c5c]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-[#4a5168]">Loading…</div>
      ) : statements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111827] border border-white/8 rounded-2xl">
          <p className="text-[#4a5168] text-sm">No statements found.</p>
        </div>
      ) : (
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
                  "Description",
                  "LRS",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[0.68rem] font-medium tracking-[0.09em] uppercase text-[#4a5168] border-b border-white/8 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#111827]">
              {statements.map((s, i) => (
                <tr
                  key={s._id ?? i}
                  className="border-b border-white/5 last:border-none hover:bg-white/2 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-[#7b8399] text-xs whitespace-nowrap">
                    {s.course?.courseCode ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-[#7b8399] text-xs whitespace-nowrap">
                    {s.group?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-[#e8eaf0] whitespace-nowrap">
                    {s.user?.username ?? "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gold font-medium text-xs tracking-wide">
                      {s.verb?.display ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StageBadge stage={s.stage} />
                  </td>
                  <td className="px-4 py-3 text-[#7b8399] max-w-xs truncate text-xs">
                    {s.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[0.65rem] font-medium px-1.5 py-0.5 rounded ${s.lrsSynced ? "bg-emerald-400/10 text-emerald-400" : "bg-[#4a5168]/20 text-[#4a5168]"}`}
                    >
                      {s.lrsSynced ? "Synced" : "Local"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#4a5168] whitespace-nowrap text-xs">
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString()
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

export default AdminStatements;
