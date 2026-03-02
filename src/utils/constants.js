export const GROUPS = [
    { id: "group-a", name: "Group A" },
    { id: "group-b", name: "Group B" },
    { id: "group-c", name: "Group C" },
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

// COMP 3609 - Game Programming
// Verbs reflect the actual development stages of a Java 2D platform game:
// design → implementation → asset work → physics/math → testing
const VERBS_3609 = [
    {
        display: "Designed",
        uri: "https://example.edu/comp3609/xapi/verbs/designed",
        description: "The student planned the game structure, screen layout, entity hierarchy, or level architecture before writing code.",
    },
    {
        display: "Implemented",
        uri: "https://example.edu/comp3609/xapi/verbs/implemented",
        description: "The student wrote code for a game feature or system - such as the game loop, input handling, or a game entity.",
    },
    {
        display: "Animated",
        uri: "https://example.edu/comp3609/xapi/verbs/animated",
        description: "The student set up sprite sheet loading, frame sequencing, or the AnimatedSprite class to bring a character or object to life.",
    },
    {
        display: "Integrated",
        uri: "https://example.edu/comp3609/xapi/verbs/integrated",
        description: "The student connected separate systems - such as wiring sound into gameplay events or linking tile maps to collision detection.",
    },
    {
        display: "Debugged",
        uri: "https://example.edu/comp3609/xapi/verbs/debugged",
        description: "The student identified and resolved a defect, such as a collision detection error, rendering glitch, or incorrect physics behaviour.",
    },
    {
        display: "Modelled",
        uri: "https://example.edu/comp3609/xapi/verbs/modelled",
        description: "The student created or refined the class structure for game entities, applying OOP principles such as inheritance, interfaces, or encapsulation.",
    },
    {
        display: "Applied",
        uri: "https://example.edu/comp3609/xapi/verbs/applied",
        description: "The student used a design pattern (Singleton, Composite, Object Pool) or a mathematical concept (projectile motion, Bezier curves) within the project.",
    },
    {
        display: "Constructed",
        uri: "https://example.edu/comp3609/xapi/verbs/constructed",
        description: "The student built a complete, playable level using the tiled map editor and integrated it into the game with proper map collision detection.",
    },
    {
        display: "Tested",
        uri: "https://example.edu/comp3609/xapi/verbs/tested",
        description: "The student ran the game to verify that a specific feature - input, physics, animation, or collision - behaved correctly under expected conditions.",
    },
    {
        display: "Optimised",
        uri: "https://example.edu/comp3609/xapi/verbs/optimised",
        description: "The student improved rendering performance, resolved double-buffering or screen-tearing issues, or refactored a system to reduce overhead.",
    },
];

// COMP 3610 - Big Data Analytics
// Verbs reflect the actual project milestones and workflow stages:
// proposal → data acquisition → processing → analysis → evaluation → reporting
const VERBS_3610 = [
    {
        display: "Proposed",
        uri: "https://example.edu/comp3610/xapi/verbs/proposed",
        description: "The student contributed to the project proposal, defining the problem, identifying the dataset, and outlining the intended analysis approach.",
    },
    {
        display: "Collected",
        uri: "https://example.edu/comp3610/xapi/verbs/collected",
        description: "The student sourced and acquired a real-world dataset from an appropriate data provider, API, or repository for use in the project.",
    },
    {
        display: "Cleaned",
        uri: "https://example.edu/comp3610/xapi/verbs/cleaned",
        description: "The student preprocessed raw data - handling missing values, correcting inconsistencies, and transforming it into a usable, analysis-ready format.",
    },
    {
        display: "Analysed",
        uri: "https://example.edu/comp3610/xapi/verbs/analysed",
        description: "The student applied algorithms or statistical methods to the dataset to extract patterns, trends, or insights relevant to the problem statement.",
    },
    {
        display: "Visualised",
        uri: "https://example.edu/comp3610/xapi/verbs/visualised",
        description: "The student created charts, graphs, or dashboards to clearly communicate findings from the data analysis to an audience unfamiliar with the project.",
    },
    {
        display: "Evaluated",
        uri: "https://example.edu/comp3610/xapi/verbs/evaluated",
        description: "The student assessed model or algorithm performance using appropriate metrics and interpreted the results in the context of the problem.",
    },
    {
        display: "Built",
        uri: "https://example.edu/comp3610/xapi/verbs/built",
        description: "The student developed a working application, dashboard, or interactive tool that demonstrates the project's analysis and allows a user to explore the findings.",
    },
    {
        display: "Documented",
        uri: "https://example.edu/comp3610/xapi/verbs/documented",
        description: "The student wrote a section of the progress report or final IEEE-formatted report, covering methodology, results, literature review, or reflections.",
    },
    {
        display: "Reviewed",
        uri: "https://example.edu/comp3610/xapi/verbs/reviewed",
        description: "The student conducted a literature review, surveying relevant papers and prior work to contextualise the project's problem and chosen methods.",
    },
    {
        display: "Presented",
        uri: "https://example.edu/comp3610/xapi/verbs/presented",
        description: "The student prepared or delivered part of a check-in update, progress presentation, or the final 15-20 minute project presentation and demo.",
    },
];

export const XAPI_VERBS = {
    comp3609: VERBS_3609,
    comp3610: VERBS_3610,
};