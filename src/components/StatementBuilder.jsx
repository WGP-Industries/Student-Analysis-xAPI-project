import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useXAPI } from "../hooks/useXAPI";
import { useEnrollment } from "../hooks/useEnrollment";
import { XAPI_VERBS, SCENARIOS } from "../utils/constants";
import api from "../configs/api";

const NEW_GROUP_SENTINEL = "__new__";

const selectClass = (focused) =>
  `w-full bg-white/[0.03] border rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none appearance-none transition-all duration-200 cursor-pointer ${
    focused
      ? "border-gold shadow-[0_0_0_3px_var(--gold-dim)]"
      : "border-white/[0.08] hover:border-white/[0.14]"
  }`;

const Chevron = () => (
  <svg
    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 text-[#7b8399] pointer-events-none"
    viewBox="0 0 10 6"
    fill="none"
  >
    <path
      d="M1 1l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FieldLabel = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#7b8399]"
  >
    {children}
  </label>
);

const STAGE_COLOURS = {
  Planning: "bg-blue-500/10   text-blue-300   border-blue-500/20",
  Exploration: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  Construction: "bg-amber-500/10  text-amber-300  border-amber-500/20",
  Testing: "bg-green-500/10  text-green-300  border-green-500/20",
  Reflection: "bg-rose-500/10   text-rose-300   border-rose-500/20",
};

const StageBadge = ({ stage }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded text-[0.65rem] font-medium border ${STAGE_COLOURS[stage] ?? "bg-white/5 text-[#7b8399] border-white/10"}`}
  >
    {stage}
  </span>
);

//  New group modal
const NewGroupModal = ({ courseCode, courseName, onCreated, onCancel }) => {
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const trimmed = name.trim();

  const handleConfirm = async () => {
    if (!trimmed) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/api/courses/${courseCode}/groups`, {
        name: trimmed,
      });
      toast.success(`Group "${trimmed}" created!`);
      // Route now returns { group, groups } - use data.group directly
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
            <p className="text-[0.65rem] font-medium tracking-[0.12em] uppercase text-[#7b8399]">
              {courseCode.toUpperCase().replace("COMP", "COMP ")}
            </p>
            <h3 className="text-base font-display text-[#e8eaf0]">
              Add a new group
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#7b8399] hover:text-[#7b8399] transition-colors mt-0.5"
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
              <label className="text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#7b8399]">
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
                className="w-full bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none transition-all duration-200 placeholder:text-[#7b8399]"
              />
              <p className="text-xs text-[#7b8399]">
                This group will be visible to all students in this course.
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
                className="px-4 py-2.5 text-sm text-[#7b8399] border border-white/8 rounded-lg hover:text-[#7b8399] transition-all duration-200"
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
                This group will be available for all students in {courseName}.
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
                className="px-4 py-2.5 text-sm text-[#7b8399] border border-white/8 rounded-lg hover:text-[#7b8399] transition-all duration-200"
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

const StatementBuilder = () => {
  const { user } = useSelector((s) => s.auth);
  const { sendXAPI } = useXAPI();
  const { getEnrollment, joinGroup } = useEnrollment();

  // Courses fetched from API
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null); // full course object
  const [selectedGroup, setSelectedGroup] = useState(""); // Group _id
  const [selectedVerb, setSelectedVerb] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [focused, setFocused] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [addingGroup, setAddingGroup] = useState(false);

  // Fetch courses on mount
  useEffect(() => {
    api.get("/api/courses").then(({ data }) => {
      const list = data.courses ?? [];
      setCourses(list);
      if (list.length > 0) setSelectedCourse(list[0]);
    });
  }, []);

  const courseCode = selectedCourse?.courseCode?.toLowerCase() ?? "";
  const verbs = XAPI_VERBS[courseCode] ?? [];
  const verbObj = verbs.find((v) => v.uri === selectedVerb);
  const enrollment = getEnrollment(courseCode);

  // Fetch groups when selected course changes
  useEffect(() => {
    if (!selectedCourse) return;
    setGroupsLoading(true);
    setAddingGroup(false);
    api
      .get(`/api/courses/${selectedCourse.courseCode}/groups`)
      .then(({ data }) => setGroups(data.groups ?? []))
      .catch(() => {
        setGroups([]);
        toast.error("Could not load groups for this course.");
      })
      .finally(() => setGroupsLoading(false));
  }, [selectedCourse?.courseCode]);

  // Sync selected group and verb when course or enrollment changes
  useEffect(() => {
    setSelectedGroup(enrollment?.group?._id ?? "");
    setSelectedVerb(XAPI_VERBS[courseCode]?.[0]?.uri ?? "");
  }, [courseCode, enrollment?.group?._id]);

  const handleCourseChange = (e) => {
    const course = courses.find((c) => c.courseCode === e.target.value);
    setSelectedCourse(course ?? null);
  };

  const handleGroupChange = async (e) => {
    const value = e.target.value;
    if (value === NEW_GROUP_SENTINEL) {
      setAddingGroup(true);
      return;
    }
    setSelectedGroup(value);
    if (!value) return;
    setIsJoining(true);
    try {
      await joinGroup(courseCode, value);
      const groupName = groups.find((g) => g._id === value)?.name ?? value;
      toast.success(`Joined ${groupName} for ${selectedCourse?.name}`);
    } catch (err) {
      toast.error(
        "Failed to save group: " + (err.response?.data?.message || err.message),
      );
      setSelectedGroup(enrollment?.group?._id ?? "");
    } finally {
      setIsJoining(false);
    }
  };

  const handleGroupCreated = async (newGroup, allGroups) => {
    setGroups(allGroups);
    setAddingGroup(false);
    setSelectedGroup(newGroup._id);
    setIsJoining(true);
    try {
      await joinGroup(courseCode, newGroup._id);
      toast.success(`Joined ${newGroup.name} for ${selectedCourse?.name}`);
    } catch (err) {
      toast.error(
        "Failed to join new group: " +
          (err.response?.data?.message || err.message),
      );
      setSelectedGroup(enrollment?.group?._id ?? "");
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroup) {
      toast.error("Please select a group before submitting a statement");
      return;
    }
    if (!selectedScenario) {
      toast.error("Please select a learner scenario before submitting");
      return;
    }
    if (!verbObj || !selectedCourse) return;

    setIsLoading(true);
    try {
      await sendXAPI("custom", {
        customVerb: true,
        verbId: verbObj.uri,
        verbDisplay: verbObj.display,
        username: user.username,
        email: user.email,
        userId: user._id,
        activity: selectedCourse.project?.name,
        activityId: selectedCourse.project?.uri,
        activityType: "https://example.edu/activity-types/project",
        description: description || verbObj.description,
        courseId: courseCode,
        stage: verbObj.stage,
        scenario: selectedScenario,
        parent: {
          objectType: "Activity",
          id: selectedCourse.uri,
          definition: {
            name: { "en-US": selectedCourse.name },
            description: { "en-US": selectedCourse.description },
          },
        },
      });
      toast.success("Statement sent!");
      setDescription("");
    } catch (err) {
      toast.error("Failed to send: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#7b8399] text-sm">Loading courses…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center">
      <h2 className="font-display text-2xl text-[#e8eaf0]">
        Create xAPI Statement
      </h2>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-[#111827] border border-white/8 rounded-2xl p-8 flex flex-col gap-6 max-w-2xl"
      >
        {/* Course */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="course">Course</FieldLabel>
          <div className="relative">
            <select
              id="course"
              value={selectedCourse?.courseCode ?? ""}
              onChange={handleCourseChange}
              onFocus={() => setFocused("course")}
              onBlur={() => setFocused(null)}
              className={selectClass(focused === "course")}
              required
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
            <Chevron />
          </div>
        </div>

        {/* Group */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="group">
            Group
            {(isJoining || groupsLoading) && (
              <span className="ml-2 normal-case tracking-normal text-[#7b8399]/60">
                {isJoining ? "Saving..." : "Loading..."}
              </span>
            )}
            {!isJoining && !groupsLoading && enrollment?.group && (
              <span className="ml-2 normal-case tracking-normal text-gold/60">
                Enrolled
              </span>
            )}
          </FieldLabel>
          <div className="relative">
            <select
              id="group"
              value={addingGroup ? NEW_GROUP_SENTINEL : selectedGroup}
              onChange={handleGroupChange}
              onFocus={() => setFocused("group")}
              onBlur={() => setFocused(null)}
              className={selectClass(focused === "group")}
              disabled={isJoining || groupsLoading}
            >
              <option value="" disabled>
                {groupsLoading ? "Loading groups…" : "Select your group"}
              </option>
              {groups.map((g) => (
                <option key={g._id} value={g._id} className="bg-[#111827]">
                  {g.name}
                </option>
              ))}
              <option
                value={NEW_GROUP_SENTINEL}
                className="bg-[#111827] text-gold"
              >
                + Add new group
              </option>
            </select>
            <Chevron />
          </div>

          {addingGroup && (
            <NewGroupModal
              courseCode={selectedCourse?.courseCode}
              courseName={selectedCourse?.name}
              onCreated={handleGroupCreated}
              onCancel={() => {
                setAddingGroup(false);
                setSelectedGroup(enrollment?.group?._id ?? "");
              }}
            />
          )}

          {!addingGroup && !groupsLoading && !enrollment?.group && (
            <p className="text-xs text-[#7b8399] mt-1">
              {groups.length === 0
                ? 'No groups yet - use "+ Add new group" to create the first one.'
                : "Select your group or create a new one."}
            </p>
          )}
        </div>

        {/* Project */}
        {selectedCourse?.project && (
          <div className="flex flex-col gap-2">
            <span className="text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#7b8399]">
              Project
            </span>
            <div className="px-4 py-3 bg-white/2 border border-white/6 rounded-lg flex flex-col gap-1">
              <span className="text-sm text-[#e8eaf0] font-medium">
                {selectedCourse.project.name}
              </span>
              <span className="text-xs text-[#7b8399] leading-relaxed">
                {selectedCourse.project.description}
              </span>
            </div>
          </div>
        )}

        {/* Verb */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="verb">What did you do?</FieldLabel>
          <div className="relative">
            <select
              id="verb"
              value={selectedVerb}
              onChange={(e) => setSelectedVerb(e.target.value)}
              onFocus={() => setFocused("verb")}
              onBlur={() => setFocused(null)}
              className={selectClass(focused === "verb")}
              required
            >
              {verbs.map((v) => (
                <option key={v.uri} value={v.uri} className="bg-[#111827]">
                  {v.display}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
          {verbObj && (
            <div className="flex items-start gap-2 mt-1">
              <StageBadge stage={verbObj.stage} />
              <p className="text-xs text-[#7b8399] leading-relaxed">
                {verbObj.description}
              </p>
            </div>
          )}
        </div>

        {/* Learner Scenario */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="scenario">Learner Scenario</FieldLabel>
          <div className="relative">
            <select
              id="scenario"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              onFocus={() => setFocused("scenario")}
              onBlur={() => setFocused(null)}
              className={selectClass(focused === "scenario")}
              required
            >
              <option value="" disabled>
                Select your scenario
              </option>
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#111827]">
                  {s.label}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
          {selectedScenario && (
            <p className="text-xs text-[#7b8399] mt-1">
              {SCENARIOS.find((s) => s.id === selectedScenario)?.description}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="desc">
            Additional Description
            <span className="ml-1 normal-case tracking-normal text-[#7b8399]/60">
              (optional)
            </span>
          </FieldLabel>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setFocused("desc")}
            onBlur={() => setFocused(null)}
            placeholder="Add more context about what you did..."
            rows={3}
            className={`w-full bg-white/3 border rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none resize-none transition-all duration-200 placeholder:text-[#7b8399] ${
              focused === "desc"
                ? "border-gold shadow-[0_0_0_3px_var(--gold-dim)]"
                : "border-white/8 hover:border-white/[0.14]"
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            isJoining ||
            groupsLoading ||
            addingGroup ||
            !selectedGroup ||
            !selectedScenario
          }
          className="self-start flex items-center gap-2 px-6 py-3 bg-gold text-navy text-sm font-medium rounded-lg transition-all duration-200 hover:bg-[#d4b05a] hover:shadow-gold hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-navy/25 border-t-navy rounded-full animate-spin" />{" "}
              Sending...
            </>
          ) : (
            "Send xAPI Statement"
          )}
        </button>
      </form>

      {/* Statement preview */}
      <div className="w-full max-w-2xl bg-(--gold-dim) border border-gold/20 rounded-xl px-6 py-4">
        <p className="text-sm text-[#7b8399]">
          <span className="text-gold font-medium">What gets sent: </span>
          Actor:{" "}
          <span className="text-[#e8eaf0]">{user?.username ?? "You"}</span>
          {" · "}
          Verb:{" "}
          <span className="text-[#e8eaf0]">{verbObj?.display ?? "-"}</span>
          {" · "}
          Stage: <span className="text-[#e8eaf0]">{verbObj?.stage ?? "-"}</span>
          {" · "}
          Scenario:{" "}
          <span className="text-[#e8eaf0]">
            {SCENARIOS.find((s) => s.id === selectedScenario)?.label ?? "-"}
          </span>
          {" · "}
          Project:{" "}
          <span className="text-[#e8eaf0]">
            {selectedCourse?.project?.name ?? "-"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default StatementBuilder;
