import { useEffect, useState } from "react";
import api from "../../configs/api";

const StatCard = ({ label, value, sub }) => (
  <div className="bg-[#111827] border border-white/8 rounded-xl px-6 py-5 flex flex-col gap-1">
    <p className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
      {label}
    </p>
    <p className="font-display text-3xl text-[#e8eaf0]">{value ?? "-"}</p>
    {sub && <p className="text-xs text-[#4a5168]">{sub}</p>}
  </div>
);

const BarRow = ({ label, value, max, color = "bg-gold" }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-[#7b8399] w-24 shrink-0 truncate">
      {label}
    </span>
    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700`}
        style={{ width: max ? `${Math.round((value / max) * 100)}%` : "0%" }}
      />
    </div>
    <span className="text-xs text-[#4a5168] w-8 text-right">{value}</span>
  </div>
);

const GROUP_COLORS = {
  "group-a": "bg-gold",
  "group-b": "bg-blue-400",
  "group-c": "bg-emerald-400",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/api/xapi/admin/stats");
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-[#4a5168] text-sm">
        Loading stats…
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 bg-[#e05c5c]/10 border border-[#e05c5c]/25 rounded-lg text-sm text-[#e05c5c]">
        {error}
      </div>
    );
  }

  const {
    totals,
    statementsByCourse,
    statementsByGroup,
    statementsByVerb,
    recentStatements,
  } = stats;
  const maxVerb = statementsByVerb?.[0]?.count ?? 1;
  const maxCourse = Math.max(
    ...(statementsByCourse?.map((c) => c.count) ?? [1]),
  );
  const maxGroup = Math.max(...(statementsByGroup?.map((g) => g.count) ?? [1]));

  const syncPct = totals.statements
    ? Math.round((totals.lrsSynced / totals.statements) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-[#e8eaf0]">Overview</h1>
        <p className="text-sm text-[#4a5168] mt-1">
          Platform activity at a glance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={totals.users} />
        <StatCard
          label="Statements"
          value={totals.statements}
          sub={`${syncPct}% LRS synced`}
        />
        <StatCard label="Enrollments" value={totals.enrollments} />
        <StatCard
          label="LRS Synced"
          value={totals.lrsSynced}
          sub="sent to Veracity"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By course */}
        <div className="bg-[#111827] border border-white/8 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
            Statements by Course
          </p>
          {statementsByCourse?.length ? (
            <div className="flex flex-col gap-3">
              {statementsByCourse.map((c) => (
                <BarRow
                  key={c.courseCode}
                  label={c.courseCode}
                  value={c.count}
                  max={maxCourse}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#4a5168]">No data yet</p>
          )}
        </div>

        {/* By group */}
        <div className="bg-[#111827] border border-white/8 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
            Statements by Group
          </p>
          {statementsByGroup?.length ? (
            <div className="flex flex-col gap-3">
              {statementsByGroup.map((g) => (
                <BarRow
                  key={g._id}
                  label={g._id.replace("group-", "Group ").toUpperCase()}
                  value={g.count}
                  max={maxGroup}
                  color={GROUP_COLORS[g._id] ?? "bg-gold"}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#4a5168]">No data yet</p>
          )}
        </div>

        {/* Top verbs */}
        <div className="bg-[#111827] border border-white/8 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
            Top Verbs
          </p>
          {statementsByVerb?.length ? (
            <div className="flex flex-col gap-3">
              {statementsByVerb.slice(0, 8).map((v) => (
                <BarRow
                  key={v._id}
                  label={v._id}
                  value={v.count}
                  max={maxVerb}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#4a5168]">No data yet</p>
          )}
        </div>
      </div>

      {/* Recent activity - last 7 days */}
      {recentStatements?.length > 0 && (
        <div className="bg-[#111827] border border-white/8 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
            Daily Statements - Last 7 Days
          </p>
          <div className="flex items-end gap-2 h-20">
            {(() => {
              const maxDay = Math.max(
                ...recentStatements.map((d) => d.count),
                1,
              );
              return recentStatements.map((d) => (
                <div
                  key={d._id}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[0.6rem] text-[#4a5168]">
                    {d.count}
                  </span>
                  <div
                    className="w-full bg-gold/70 rounded-t"
                    style={{
                      height: `${Math.round((d.count / maxDay) * 56)}px`,
                      minHeight: "4px",
                    }}
                  />
                  <span className="text-[0.6rem] text-[#4a5168]">
                    {new Date(d._id).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
