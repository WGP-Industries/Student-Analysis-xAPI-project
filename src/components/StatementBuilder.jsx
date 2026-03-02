import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useXAPI } from "../hooks/useXAPI";
import { useEnrollment } from "../hooks/useEnrollment";
import { COURSES, XAPI_VERBS, GROUPS } from "../utils/constants";

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
    className="text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#4a5168]"
  >
    {children}
  </label>
);

const StatementBuilder = () => {
  const { user } = useSelector((s) => s.auth);
  const { sendXAPI } = useXAPI();
  const { getEnrollment, joinGroup } = useEnrollment();

  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]?.id ?? "");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedVerb, setSelectedVerb] = useState(
    XAPI_VERBS[COURSES[0]?.id]?.[0]?.uri ?? "",
  );
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [focused, setFocused] = useState(null);

  const courseObj = COURSES.find((c) => c.id === selectedCourse);
  const project = courseObj?.project;
  const verbs = XAPI_VERBS[selectedCourse] ?? [];
  const verbObj = verbs.find((v) => v.uri === selectedVerb);
  const enrollment = getEnrollment(selectedCourse);

  // When course changes, sync group dropdown to existing enrollment if any
  useEffect(() => {
    setSelectedGroup(enrollment?.group ?? "");
    setSelectedVerb(XAPI_VERBS[selectedCourse]?.[0]?.uri ?? "");
  }, [selectedCourse, enrollment?.group]);

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleGroupChange = async (e) => {
    const group = e.target.value;
    setSelectedGroup(group);

    if (!group) return;

    setIsJoining(true);
    try {
      await joinGroup(selectedCourse, group);
      toast.success(
        `Joined ${GROUPS.find((g) => g.id === group)?.name} for ${courseObj?.name}`,
      );
    } catch (err) {
      toast.error(
        "Failed to save group: " + (err.response?.data?.message || err.message),
      );
      setSelectedGroup(enrollment?.group ?? "");
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
    if (!verbObj || !courseObj || !project) return;

    setIsLoading(true);
    try {
      await sendXAPI("custom", {
        customVerb: true,
        verbId: verbObj.uri,
        verbDisplay: verbObj.display,
        username: user.username,
        email: user.email,
        userId: user._id,
        activity: project.name,
        activityId: project.uri,
        activityType: "https://example.edu/activity-types/project",
        description: description || verbObj.description,
        courseId: courseObj.id,
        parent: {
          objectType: "Activity",
          id: courseObj.uri,
          definition: {
            name: { "en-US": courseObj.name },
            description: { "en-US": courseObj.description },
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

  return (
    <div className="flex flex-col gap-8 items-center">
      <h2 className="font-display text-2xl text-[#e8eaf0]">
        Create xAPI Statement
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[#111827] border border-white/8 rounded-2xl p-8 flex flex-col gap-6 max-w-2xl"
      >
        {/* Course */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="course">Course</FieldLabel>
          <div className="relative">
            <select
              id="course"
              value={selectedCourse}
              onChange={handleCourseChange}
              onFocus={() => setFocused("course")}
              onBlur={() => setFocused(null)}
              className={selectClass(focused === "course")}
              required
            >
              {COURSES.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#111827]">
                  {c.name}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        {/* Group - student picks their group, saved to enrollment immediately */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="group">
            Group
            {isJoining && (
              <span className="ml-2 normal-case tracking-normal text-[#4a5168]/60">
                Saving...
              </span>
            )}
            {!isJoining && enrollment?.group && (
              <span className="ml-2 normal-case tracking-normal text-gold/60">
                Enrolled
              </span>
            )}
          </FieldLabel>
          <div className="relative">
            <select
              id="group"
              value={selectedGroup}
              onChange={handleGroupChange}
              onFocus={() => setFocused("group")}
              onBlur={() => setFocused(null)}
              className={selectClass(focused === "group")}
              disabled={isJoining}
              required
            >
              <option value="" disabled>
                Select your group
              </option>
              {GROUPS.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#111827]">
                  {g.name}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
          {!enrollment?.group && (
            <p className="text-xs text-[#4a5168] mt-1">
              Select a group to join the project. You can change this later.
            </p>
          )}
        </div>

        {/* Project - read only, derived from course */}
        {project && (
          <div className="flex flex-col gap-2">
            <span className="text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#4a5168]">
              Project
            </span>
            <div className="px-4 py-3 bg-white/2 border border-white/6 rounded-lg flex flex-col gap-1">
              <span className="text-sm text-[#e8eaf0] font-medium">
                {project.name}
              </span>
              <span className="text-xs text-[#4a5168] leading-relaxed">
                {project.description}
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
            <p className="text-xs text-[#4a5168] leading-relaxed mt-1">
              {verbObj.description}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="desc">
            Additional Description
            <span className="ml-1 normal-case tracking-normal text-[#4a5168]/60">
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
            className={`w-full bg-white/3 border rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none resize-none transition-all duration-200 placeholder:text-[#4a5168] ${
              focused === "desc"
                ? "border-gold shadow-[0_0_0_3px_var(--gold-dim)]"
                : "border-white/8 hover:border-white/[0.14]"
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isJoining || !selectedGroup}
          className="self-start flex items-center gap-2 px-6 py-3 bg-gold text-navy text-sm font-medium rounded-lg transition-all duration-200 hover:bg-[#d4b05a] hover:shadow-gold hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-navy/25 border-t-navy rounded-full animate-spin" />{" "}
              Sending…
            </>
          ) : (
            "Send xAPI Statement"
          )}
        </button>
      </form>

      {/* Statement preview */}
      <div className="max-w-2xl bg-(--gold-dim) border border-gold/20 rounded-xl px-6 py-4">
        <p className="text-sm text-[#7b8399]">
          <span className="text-gold font-medium">What gets sent: </span>
          Actor:{" "}
          <span className="text-[#e8eaf0]">{user?.username ?? "You"}</span>
          {" · "}Group:{" "}
          <span className="text-[#e8eaf0]">
            {selectedGroup
              ? GROUPS.find((g) => g.id === selectedGroup)?.name
              : "-"}
          </span>
          {" · "}Verb:{" "}
          <span className="text-[#e8eaf0]">{verbObj?.display ?? "-"}</span>
          {" · "}Project:{" "}
          <span className="text-[#e8eaf0]">{project?.name ?? "-"}</span>
        </p>
      </div>
    </div>
  );
};

export default StatementBuilder;
