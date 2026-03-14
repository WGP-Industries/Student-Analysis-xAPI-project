import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../configs/api";

// Parses raw CSV text into an array of row objects using the header row as keys
const parseCSV = (text) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.replace(/^"|"$/g, "").trim());
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
};

const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-[#111827] border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
    <div>
      <h2 className="font-display text-lg text-[#e8eaf0]">{title}</h2>
      <p className="text-xs text-[#7b8399] mt-1">{subtitle}</p>
    </div>
    {children}
  </div>
);

const ResultPill = ({ label, count, color }) =>
  count > 0 ? (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {count} {label}
    </span>
  ) : null;

const FileDropZone = ({ onFile, accept = ".csv" }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-8 cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-gold bg-gold/5"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <svg className="w-6 h-6 text-[#4a5168]" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 16V8M9 11l3-3 3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 16.5A4.5 4.5 0 0 0 15.5 12H15a6 6 0 1 0-11.8 1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-sm text-[#7b8399]">
        Drop a CSV file here or <span className="text-gold">browse</span>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
    </div>
  );
};

const AdminImport = () => {
  const [courses, setCourses] = useState([]);

  const [groupCourse, setGroupCourse] = useState("");
  const [groupRows, setGroupRows] = useState([]);
  const [groupRawCSV, setGroupRawCSV] = useState("");
  const [groupSubmitting, setGroupSubmitting] = useState(false);
  const [groupResults, setGroupResults] = useState(null);

  const [enrollRows, setEnrollRows] = useState([]);
  const [enrollRawCSV, setEnrollRawCSV] = useState("");
  const [onDuplicate, setOnDuplicate] = useState("skip");
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollResults, setEnrollResults] = useState(null);

  useEffect(() => {
    api.get("/api/courses").then(({ data }) => {
      const list = data.courses ?? [];
      setCourses(list);
      if (list.length > 0) setGroupCourse(list[0].courseCode);
    });
  }, []);

  const handleGroupFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setGroupRawCSV(text);
      setGroupResults(null);
      setGroupRows(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const handleEnrollFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setEnrollRawCSV(text);
      setEnrollResults(null);
      setEnrollRows(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const submitGroups = async () => {
    if (!groupRawCSV || !groupCourse) return;
    setGroupSubmitting(true);
    try {
      const { data } = await api.post(
        `/api/courses/${groupCourse}/groups/bulk`,
        {
          csv: groupRawCSV,
        },
      );
      setGroupResults(data.results);
      toast.success(`Done — ${data.results.created.length} groups created`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setGroupSubmitting(false);
    }
  };

  const submitEnrollments = async () => {
    if (!enrollRawCSV) return;
    setEnrollSubmitting(true);
    try {
      const { data } = await api.post("/api/enrollments/bulk", {
        csv: enrollRawCSV,
        onDuplicate,
      });
      setEnrollResults(data.results);
      toast.success(`Done — ${data.results.enrolled.length} enrolled`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // Detect which course columns are in the preview
  const enrollHeaders = enrollRows.length > 0 ? Object.keys(enrollRows[0]) : [];
  const has3609 = enrollHeaders.includes("comp3609");
  const has3610 = enrollHeaders.includes("comp3610");

  const selectCls =
    "bg-[#111827] border border-white/8 rounded-lg px-3 py-2 text-sm text-[#e8eaf0] outline-none focus:border-gold transition-colors";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-[#e8eaf0]">Import</h1>
        <p className="text-sm text-[#7b8399] mt-1">
          Bulk create groups or enrol students from a CSV file
        </p>
      </div>

      {/* Groups import */}
      <SectionCard
        title="Import Groups"
        subtitle="CSV must have a single column: name"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
            Course
          </label>
          <select
            value={groupCourse}
            onChange={(e) => {
              setGroupCourse(e.target.value);
              setGroupRows([]);
              setGroupResults(null);
            }}
            className={selectCls}
          >
            {courses.map((c) => (
              <option key={c.courseCode} value={c.courseCode}>
                {c.courseCode} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <FileDropZone onFile={handleGroupFile} />

        {groupRows.length > 0 && !groupResults && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[#7b8399]">
              {groupRows.length} groups to import — preview
            </p>
            <div className="overflow-x-auto rounded-xl border border-white/8 max-h-48 overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1a2235]">
                    <th className="text-left px-4 py-2 text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168] border-b border-white/8">
                      Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#111827]">
                  {groupRows.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 last:border-none"
                    >
                      <td className="px-4 py-2 text-[#e8eaf0] text-xs">
                        {r.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={submitGroups}
              disabled={groupSubmitting}
              className="self-start flex items-center gap-2 px-5 py-2.5 bg-gold text-navy text-sm font-medium rounded-lg hover:bg-[#d4b05a] disabled:opacity-50 transition-all duration-200"
            >
              {groupSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-navy/25 border-t-navy rounded-full animate-spin" />
              )}
              {groupSubmitting
                ? "Importing…"
                : `Import ${groupRows.length} Groups`}
            </button>
          </div>
        )}

        {groupResults && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#7b8399] font-medium">
              Import complete
            </p>
            <div className="flex flex-wrap gap-2">
              <ResultPill
                label="created"
                count={groupResults.created?.length}
                color="bg-emerald-400/10 text-emerald-400"
              />
              <ResultPill
                label="skipped (already exists)"
                count={groupResults.skipped?.length}
                color="bg-[#4a5168]/20 text-[#7b8399]"
              />
              <ResultPill
                label="failed"
                count={groupResults.failed?.length}
                color="bg-[#e05c5c]/10 text-[#e05c5c]"
              />
            </div>
            <button
              onClick={() => {
                setGroupRows([]);
                setGroupRawCSV("");
                setGroupResults(null);
              }}
              className="self-start text-xs text-[#7b8399] hover:text-[#e8eaf0] transition-colors mt-1"
            >
              Import another file
            </button>
          </div>
        )}
      </SectionCard>

      {/* Enrollments import */}
      <SectionCard
        title="Import Enrollments"
        subtitle="Flexible CSV — any combo of: username, email, password, comp3609, comp3610. Missing fields are derived automatically."
      >
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168]">
            If already enrolled
          </label>
          <div className="flex gap-1 p-1 bg-white/3 rounded-lg">
            {["skip", "overwrite"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setOnDuplicate(opt)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 capitalize ${
                  onDuplicate === opt
                    ? "bg-[#1a2235] text-[#e8eaf0] shadow-sm"
                    : "text-[#7b8399] hover:text-[#e8eaf0]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <FileDropZone onFile={handleEnrollFile} />

        {enrollRows.length > 0 && !enrollResults && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs text-[#7b8399]">
                {enrollRows.length} rows — preview
              </p>
              {has3609 && (
                <span className="text-[0.65rem] px-2 py-0.5 rounded bg-blue-400/10 text-blue-300 border border-blue-400/20">
                  COMP3609 detected
                </span>
              )}
              {has3610 && (
                <span className="text-[0.65rem] px-2 py-0.5 rounded bg-purple-400/10 text-purple-300 border border-purple-400/20">
                  COMP3610 detected
                </span>
              )}
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/8 max-h-48 overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1a2235]">
                    {enrollHeaders.map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2 text-[0.68rem] font-medium tracking-widest uppercase text-[#4a5168] border-b border-white/8 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-[#111827]">
                  {enrollRows.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 last:border-none"
                    >
                      {enrollHeaders.map((h) => (
                        <td
                          key={h}
                          className="px-4 py-2 text-[#7b8399] text-xs whitespace-nowrap"
                        >
                          {r[h] || (
                            <span className="text-[#4a5168] italic">auto</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={submitEnrollments}
              disabled={enrollSubmitting}
              className="self-start flex items-center gap-2 px-5 py-2.5 bg-gold text-navy text-sm font-medium rounded-lg hover:bg-[#d4b05a] disabled:opacity-50 transition-all duration-200"
            >
              {enrollSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-navy/25 border-t-navy rounded-full animate-spin" />
              )}
              {enrollSubmitting
                ? "Importing…"
                : `Import ${enrollRows.length} Students`}
            </button>
          </div>
        )}

        {enrollResults && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#7b8399] font-medium">
              Import complete
            </p>
            <div className="flex flex-wrap gap-2">
              <ResultPill
                label="enrolled"
                count={enrollResults.enrolled?.length}
                color="bg-emerald-400/10 text-emerald-400"
              />
              <ResultPill
                label="new accounts created"
                count={enrollResults.created?.length}
                color="bg-blue-400/10 text-blue-400"
              />
              <ResultPill
                label="skipped"
                count={enrollResults.skipped?.length}
                color="bg-[#4a5168]/20 text-[#7b8399]"
              />
              <ResultPill
                label="failed"
                count={enrollResults.failed?.length}
                color="bg-[#e05c5c]/10 text-[#e05c5c]"
              />
            </div>
            {enrollResults.failed?.length > 0 && (
              <div className="mt-1 flex flex-col gap-1">
                {enrollResults.failed.map((f, i) => (
                  <p key={i} className="text-xs text-[#e05c5c]">
                    {f.email ?? f.row} — {f.reason}
                  </p>
                ))}
              </div>
            )}
            {enrollResults.created?.length > 0 && (
              <p className="text-xs text-[#7b8399] mt-1">
                New accounts use the default password{" "}
                <span className="text-[#e8eaf0] font-mono">
                  studentUWi@1234
                </span>{" "}
                — share this with students so they can log in and change it.
              </p>
            )}
            <button
              onClick={() => {
                setEnrollRows([]);
                setEnrollRawCSV("");
                setEnrollResults(null);
              }}
              className="self-start text-xs text-[#7b8399] hover:text-[#e8eaf0] transition-colors mt-1"
            >
              Import another file
            </button>
          </div>
        )}
      </SectionCard>

      {/* CSV format reference */}
      <div className="bg-[#111827] border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-display text-lg text-[#e8eaf0]">
          CSV Format Reference
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-[#7b8399] uppercase tracking-widest">
              Groups CSV
            </p>
            <pre className="bg-white/3 border border-white/6 rounded-lg px-4 py-3 text-xs text-[#e8eaf0] font-mono leading-relaxed">{`name\nGroup A\nGroup B\nGroup C`}</pre>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-[#7b8399] uppercase tracking-widest">
              Enrollments — email only
            </p>
            <pre className="bg-white/3 border border-white/6 rounded-lg px-4 py-3 text-xs text-[#e8eaf0] font-mono leading-relaxed">{`email,comp3609,comp3610\n816012345@my.uwi.edu,Group A,Group B\n816012346@my.uwi.edu,Group A,`}</pre>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-[#7b8399] uppercase tracking-widest">
              Enrollments — username only
            </p>
            <pre className="bg-white/3 border border-white/6 rounded-lg px-4 py-3 text-xs text-[#e8eaf0] font-mono leading-relaxed">{`username,comp3609\n816012345,Group A\n816012346,Group B`}</pre>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-[#7b8399] uppercase tracking-widest">
              Enrollments — full control
            </p>
            <pre className="bg-white/3 border border-white/6 rounded-lg px-4 py-3 text-xs text-[#e8eaf0] font-mono leading-relaxed">{`username,email,password,comp3609\njane.doe,jane@example.com,Secret@99,Group A`}</pre>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 px-4 py-3 bg-white/2 border border-white/6 rounded-lg">
          <p className="text-xs font-medium text-[#e8eaf0]">
            Auto-derivation rules
          </p>
          <p className="text-xs text-[#7b8399]">
            No email → appends{" "}
            <span className="font-mono text-[#e8eaf0]">@my.uwi.edu</span> to
            username
          </p>
          <p className="text-xs text-[#7b8399]">
            No username → uses the part before{" "}
            <span className="font-mono text-[#e8eaf0]">@</span> in email
          </p>
          <p className="text-xs text-[#7b8399]">
            No password → defaults to{" "}
            <span className="font-mono text-[#e8eaf0]">studentUWi@1234</span>
          </p>
          <p className="text-xs text-[#7b8399]">
            Empty comp3609/comp3610 cell → that course is skipped for that
            student
          </p>
          <p className="text-xs text-[#7b8399] mt-1">
            Groups must be imported before enrollments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminImport;
