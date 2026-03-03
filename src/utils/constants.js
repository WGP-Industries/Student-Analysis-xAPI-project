export const GROUPS = [
    { id: "group-a", name: "Group A" },
    { id: "group-b", name: "Group B" },
    { id: "group-c", name: "Group C" },
    { id: "group-d", name: "Group D" },
];

export const STAGES = [
    { id: "Planning", label: "Planning" },
    { id: "Exploration", label: "Exploration" },
    { id: "Construction", label: "Construction" },
    { id: "Testing", label: "Testing" },
    { id: "Reflection", label: "Reflection" },
];

// utils/constants.js
export const SCENARIOS = [
    {
        id: "Planner",
        label: "Planner",
        description:
            "This learner carefully plans each step of the project in advance. They focus on structured timelines, detailed task breakdowns, and predictable workflows. Their submissions often reflect a methodical approach to completing project milestones and documenting decisions.",
    },
    {
        id: "Tinkerer",
        label: "Tinkerer",
        description:
            "The tinkerer experiments and learns iteratively. They explore new tools, APIs, or frameworks without strict upfront planning. Their submissions capture trial-and-error approaches, creative problem-solving, and adaptation to unexpected challenges during the project.",
    },
    {
        id: "LateTester",
        label: "Late Tester",
        description:
            "This learner focuses on testing and validation after implementation. They may initially build features quickly and then rigorously debug or validate behavior later. Submissions reflect a focus on quality assurance, evaluating edge cases, and reflecting on the correctness of prior work.",
    },
];

export const COURSES = [
    {
        id: "comp3609",
        name: "COMP 3609 - Game Programming",
        uri: "https://example.edu/comp3609",
        description: "An introduction to game programming using Java, covering the game loop, 2D graphics, sprites, animation, sound, collision detection, physics, and design patterns. Students build a fully playable 2D platform game as their final project.",
        project: {
            name: "2D Platform Game",
            uri: "https://example.edu/comp3609/project",
            description:
                "Students design and develop a fully playable 2D platform game in Java using the Java 2D Graphics API. The game must incorporate a game loop, animated sprites, collision detection, user input, sound, parallax backgrounds, tile-based maps, and at least one design pattern. The final deliverable is a complete, runnable game.",
        },
    },
    {
        id: "comp3610",
        name: "COMP 3610 - Big Data Analytics",
        uri: "https://example.edu/comp3610",
        description: "A project-based course where student groups tackle a real-world data science problem. Students collect and process datasets, apply analysis algorithms, build an application to communicate their findings, and present results in a final report and live demo.",
        project: {
            name: "Data Analytics Application",
            uri: "https://example.edu/comp3610/project",
            description:
                "Groups of three identify a data science problem, source a real-world dataset, and apply appropriate analysis methods and algorithms. The project progresses through a proposal, two check-ins, a progress report, and culminates in a working application or dashboard, a 15-20 minute live presentation, and a final IEEE-formatted report with code. Overall worth 50% of the course grade.",
        },
    },
];

const VERBS_3609 = [
    // Core mandatory verbs
    { display: "Planned", uri: "https://example.edu/comp3609/xapi/verbs/planned", stage: "Planning", description: "The student planned an aspect of the game before writing code, such as level design, class structure, or feature scope." },
    { display: "Attempted", uri: "https://example.edu/comp3609/xapi/verbs/attempted", stage: "Exploration", description: "The student made an initial attempt at implementing a game feature or system, even if the result was incomplete." },
    { display: "Revised", uri: "https://example.edu/comp3609/xapi/verbs/revised", stage: "Reflection", description: "The student revisited and improved a previously written or designed component of the game." },
    { display: "Tested", uri: "https://example.edu/comp3609/xapi/verbs/tested", stage: "Testing", description: "The student ran the game to verify that a specific feature behaved correctly under expected conditions." },
    { display: "Reflected", uri: "https://example.edu/comp3609/xapi/verbs/reflected", stage: "Reflection", description: "The student reviewed their own progress, identified what worked and what did not, and recorded lessons learned." },
    // Emergent verbs
    { display: "Designed", uri: "https://example.edu/comp3609/xapi/verbs/designed", stage: "Planning", description: "The student planned the game structure, screen layout, entity hierarchy, or level architecture before writing code." },
    { display: "Implemented", uri: "https://example.edu/comp3609/xapi/verbs/implemented", stage: "Construction", description: "The student wrote code for a game feature or system such as the game loop, input handling, or a game entity." },
    { display: "Animated", uri: "https://example.edu/comp3609/xapi/verbs/animated", stage: "Construction", description: "The student set up sprite sheet loading, frame sequencing, or the AnimatedSprite class to bring a character or object to life." },
    { display: "Integrated", uri: "https://example.edu/comp3609/xapi/verbs/integrated", stage: "Construction", description: "The student connected separate systems such as wiring sound into gameplay events or linking tile maps to collision detection." },
    { display: "Debugged", uri: "https://example.edu/comp3609/xapi/verbs/debugged", stage: "Testing", description: "The student identified and resolved a defect such as a collision detection error, rendering glitch, or incorrect physics behaviour." },
    { display: "Modelled", uri: "https://example.edu/comp3609/xapi/verbs/modelled", stage: "Planning", description: "The student created or refined the class structure for game entities, applying OOP principles such as inheritance, interfaces, or encapsulation." },
    { display: "Applied", uri: "https://example.edu/comp3609/xapi/verbs/applied", stage: "Construction", description: "The student used a design pattern (Singleton, Composite, Object Pool) or a mathematical concept (projectile motion, Bezier curves) within the project." },
    { display: "Constructed", uri: "https://example.edu/comp3609/xapi/verbs/constructed", stage: "Construction", description: "The student built a complete, playable level using the tiled map editor and integrated it into the game with proper map collision detection." },
    { display: "Optimised", uri: "https://example.edu/comp3609/xapi/verbs/optimised", stage: "Reflection", description: "The student improved rendering performance, resolved double-buffering or screen-tearing issues, or refactored a system to reduce overhead." },
    { display: "Explored", uri: "https://example.edu/comp3609/xapi/verbs/explored", stage: "Exploration", description: "The student investigated an unfamiliar API, tool, or technique relevant to the game without yet committing to an implementation." },
];

const VERBS_3610 = [
    // Core mandatory verbs
    { display: "Planned", uri: "https://example.edu/comp3610/xapi/verbs/planned", stage: "Planning", description: "The student planned the analysis approach, dataset strategy, or project structure before beginning implementation." },
    { display: "Attempted", uri: "https://example.edu/comp3610/xapi/verbs/attempted", stage: "Exploration", description: "The student made an initial attempt at applying an algorithm, query, or analytical method, even if the result was incomplete." },
    { display: "Revised", uri: "https://example.edu/comp3610/xapi/verbs/revised", stage: "Reflection", description: "The student revisited and improved a previously written pipeline, model, or report section based on new findings or feedback." },
    { display: "Tested", uri: "https://example.edu/comp3610/xapi/verbs/tested", stage: "Testing", description: "The student tested a pipeline, model, or application component to verify it produced correct and expected results." },
    { display: "Reflected", uri: "https://example.edu/comp3610/xapi/verbs/reflected", stage: "Reflection", description: "The student reviewed their own progress, evaluated decisions made during the project, and recorded lessons learned." },
    // Emergent verbs
    { display: "Proposed", uri: "https://example.edu/comp3610/xapi/verbs/proposed", stage: "Planning", description: "The student contributed to the project proposal, defining the problem, identifying the dataset, and outlining the intended analysis approach." },
    { display: "Collected", uri: "https://example.edu/comp3610/xapi/verbs/collected", stage: "Exploration", description: "The student sourced and acquired a real-world dataset from an appropriate data provider, API, or repository for use in the project." },
    { display: "Cleaned", uri: "https://example.edu/comp3610/xapi/verbs/cleaned", stage: "Construction", description: "The student preprocessed raw data, handling missing values, correcting inconsistencies, and transforming it into a usable, analysis-ready format." },
    { display: "Analysed", uri: "https://example.edu/comp3610/xapi/verbs/analysed", stage: "Construction", description: "The student applied algorithms or statistical methods to the dataset to extract patterns, trends, or insights relevant to the problem statement." },
    { display: "Visualised", uri: "https://example.edu/comp3610/xapi/verbs/visualised", stage: "Construction", description: "The student created charts, graphs, or dashboards to clearly communicate findings from the data analysis." },
    { display: "Evaluated", uri: "https://example.edu/comp3610/xapi/verbs/evaluated", stage: "Testing", description: "The student assessed model or algorithm performance using appropriate metrics and interpreted the results in context." },
    { display: "Built", uri: "https://example.edu/comp3610/xapi/verbs/built", stage: "Construction", description: "The student developed a working application, dashboard, or interactive tool that demonstrates the project analysis." },
    { display: "Documented", uri: "https://example.edu/comp3610/xapi/verbs/documented", stage: "Reflection", description: "The student wrote a section of the progress report or final IEEE-formatted report, covering methodology, results, literature review, or reflections." },
    { display: "Reviewed", uri: "https://example.edu/comp3610/xapi/verbs/reviewed", stage: "Exploration", description: "The student conducted a literature review, surveying relevant papers and prior work to contextualise the project problem and chosen methods." },
    { display: "Presented", uri: "https://example.edu/comp3610/xapi/verbs/presented", stage: "Reflection", description: "The student prepared or delivered part of a check-in update, progress presentation, or the final 15-20 minute project presentation and demo." },
];

export const XAPI_VERBS = {
    comp3609: VERBS_3609,
    comp3610: VERBS_3610,
};