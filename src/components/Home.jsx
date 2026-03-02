import { useSelector } from "react-redux";
import { useEnrollment } from "../hooks/useEnrollment";
import { COURSES, XAPI_VERBS, GROUPS } from "../utils/constants";

const Step = ({ number, title, children }) => (
  <div className="flex gap-5">
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="w-8 h-8 rounded-full border border-gold/40 bg-gold/10 flex items-center justify-center">
        <span className="text-gold text-xs font-semibold">{number}</span>
      </div>
      {number < 3 && <div className="w-px flex-1 bg-white/6" />}
    </div>
    <div className="pb-8 flex flex-col gap-1.5">
      <p className="text-sm font-medium text-[#e8eaf0]">{title}</p>
      <p className="text-sm text-[#4a5168] leading-relaxed">{children}</p>
    </div>
  </div>
);

const CourseCard = ({ course, enrollment }) => {
  const verbs = XAPI_VERBS[course.id] ?? [];
  const groupName = enrollment?.group
    ? GROUPS.find((g) => g.id === enrollment.group)?.name
    : null;

  return (
    <div className="bg-[#111827] border border-white/8 rounded-xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[0.65rem] font-medium tracking-[0.12em] uppercase text-[#4a5168]">
            {course.id.toUpperCase().replace("COMP", "COMP ")}
          </p>
          <p className="text-sm font-medium text-[#e8eaf0] leading-snug">
            {course.name.split(" - ")[1] ?? course.name}
          </p>
        </div>
        {groupName ? (
          <span className="shrink-0 text-[0.65rem] font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-gold/10 text-gold border border-gold/20">
            {groupName}
          </span>
        ) : (
          <span className="shrink-0 text-[0.65rem] font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-white/4 text-[#4a5168] border border-white/6">
            Not enrolled
          </span>
        )}
      </div>

      {/* Project */}
      <div className="px-4 py-3 bg-white/2 border border-white/5 rounded-lg flex flex-col gap-1">
        <p className="text-[0.65rem] font-medium tracking-widest uppercase text-[#4a5168]">
          Project
        </p>
        <p className="text-xs text-[#7b8399] leading-relaxed">
          {course.project.description}
        </p>
      </div>

      {/* Verbs */}
      <div className="flex flex-col gap-2">
        <p className="text-[0.65rem] font-medium tracking-widest uppercase text-[#4a5168]">
          Available verbs - {verbs.length}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {verbs.map((v) => (
            <span
              key={v.uri}
              className="text-[0.65rem] px-2 py-0.5 rounded bg-white/4 border border-white/6 text-[#7b8399]"
            >
              {v.display}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Home = ({ onNavigate }) => {
  const { user } = useSelector((s) => s.auth);
  const { getEnrollment } = useEnrollment();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="flex flex-col gap-10"
      style={{ animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      {/* Welcome */}
      <div className="flex flex-col gap-2">
        <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-gold/70">
          Student Portal
        </p>
        <h1 className="font-display text-3xl text-[#e8eaf0] leading-tight">
          {greeting},{" "}
          <span className="text-gold">{user?.username ?? "student"}</span>.
        </h1>
        <p className="text-sm text-[#4a5168] leading-relaxed max-w-xl mt-1">
          This portal lets you record your learning activity as xAPI statements
          throughout your project. Each statement you submit is stored here and
          forwarded to the Learning Record Store for your instructor to review.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/6" />

      {/* How it works */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-[#4a5168]">
            How it works
          </p>
          <h2 className="font-display text-xl text-[#e8eaf0]">
            Three steps to log your progress
          </h2>
        </div>

        <div className="max-w-xl">
          <Step number={1} title="Select your course and group">
            Navigate to the Create Statement tab. Choose your course and select
            the group you have been assigned to. Your group selection is saved
            automatically and only needs to be set once per course.
          </Step>
          <Step number={2} title="Choose a verb that describes your activity">
            Each course has a curated list of verbs that map to real project
            milestones - things like Designed, Implemented, Tested, or
            Visualized. Pick the one that best reflects what you did today.
          </Step>
          <Step number={3} title="Submit your statement">
            Add an optional description for extra context, then submit. Your
            statement is saved immediately and sent to the LRS in the
            background. You can review all submitted statements under the View
            Statements tab.
          </Step>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/6" />

      {/* Courses */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-[#4a5168]">
            Your courses
          </p>
          <h2 className="font-display text-xl text-[#e8eaf0]">
            Projects and available verbs
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={getEnrollment(course.id)}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/6" />

      {/* What is xAPI */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="flex flex-col gap-1">
          <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-[#4a5168]">
            Background
          </p>
          <h2 className="font-display text-xl text-[#e8eaf0]">
            What is an xAPI statement?
          </h2>
        </div>
        <p className="text-sm text-[#4a5168] leading-relaxed">
          xAPI (Experience API) is a specification for recording learning
          experiences in a standardised format. Every statement follows an Actor
          - Verb - Object structure: you (the actor) performed an action (the
          verb) on something (the object - in this case, your project).
        </p>
        <p className="text-sm text-[#4a5168] leading-relaxed">
          For example: <span className="text-[#7b8399]">Jane Doe</span>{" "}
          <span className="text-gold font-medium">Implemented</span>{" "}
          <span className="text-[#7b8399]">Game Programming Project</span>. That
          single statement gives your instructor a timestamped, structured
          record of your contribution - far more precise than a weekly update
          email.
        </p>
        <p className="text-sm text-[#4a5168] leading-relaxed">
          Statements are stored locally in this platform's database and
          simultaneously forwarded to a Learning Record Store (LRS), where they
          can be queried, aggregated, and analysed across the entire cohort.
        </p>
      </div>

      {/* CTA */}
      <div className="bg-(--gold-dim) border border-gold/20 rounded-xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-[#e8eaf0]">
            Ready to log your first statement?
          </p>
          <p className="text-xs text-[#4a5168]">
            Head to Create Statement and record what you worked on today.
          </p>
        </div>
        <button
          onClick={() => onNavigate("create")}
          className="shrink-0 px-5 py-2.5 bg-gold text-navy text-sm font-medium rounded-lg hover:bg-[#d4b05a] hover:-translate-y-px transition-all duration-200"
        >
          Create Statement
        </button>
      </div>
    </div>
  );
};

export default Home;
