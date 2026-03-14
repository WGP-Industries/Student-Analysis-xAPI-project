import { v4 as uuidv4 } from "uuid";
import { BASE_URI } from "./constants";



// Activity types
const ACTIVITY_TYPES = {
    project: `${BASE_URI}/activity-types/project`,
    group: `${BASE_URI}/activity-types/group`,
};

// Extension URIs for pedagogical metadata attached to every project statement.
const EXT_STAGE = `${BASE_URI}/extensions/pedagogical-stage`;
const EXT_STEP = `${BASE_URI}/extensions/problem-step`;
// EXT_SCENARIO kept here for easy re-enable if needed
// const EXT_SCENARIO = `${BASE_URI}/extensions/learner-scenario`;

/**
 * Builds an Activity object representing a course project.
 * Uses the project URI from COURSES in constants.js if passed through,
 * otherwise falls back to a derived URI from the course code.
 */
export const getCourseProjectActivity = (courseCode, courseName, projectUri, projectDescription) => {
    const code = courseCode?.toLowerCase();
    return {
        objectType: "Activity",
        id: projectUri || `${BASE_URI}/activities/${code}/project`,
        definition: {
            type: ACTIVITY_TYPES.project,
            name: { "en-US": courseName || courseCode || "Course Project" },
            description: { "en-US": projectDescription || `${courseCode} course project` },
        },
    };
};

/**
 * Builds a grouping Activity for context.contextActivities.
 * Uses _id (MongoDB) with a fallback to id for normalised shapes.
 */
export const getGroupActivity = (groupId, groups) => {
    const group = groups?.find((g) => (g._id || g.id) === groupId);
    return {
        objectType: "Activity",
        id: `${BASE_URI}/activities/groups/${groupId}`,
        definition: {
            type: ACTIVITY_TYPES.group,
            name: { "en-US": group ? group.name : groupId },
            description: { "en-US": `Learning group: ${group ? group.name : groupId}` },
        },
    };
};

/**
 * Builds a complete xAPI statement.
 *
 * Expected fields in `data` for a course (project) statement:
 *   customVerb, verbId, verbDisplay  - verb taken directly from XAPI_VERBS
 *   userId, email, username          - actor
 *   courseCode, courseName           - used to build the object activity
 *   activityId                       - project URI from COURSES (project.uri)
 *   projectDescription               - goes into object definition description
 *   stage                            - context extension (EXT_STAGE)
 *   problemStep                      - context extension (EXT_STEP)
 *   description                      - optional free-text context
 *   parent                           - context activity (the course itself)
 *   grouping, category               - additional context activities
 *   result                           - optional xAPI result block
 *   extensions                       - any additional context extensions
 *
 * `userData` - Redux auth user, fallback for userId/group.
 * `groups`   - full groups array from the course, used by getGroupActivity.
 */
export const buildStatement = ({ verb, data, userData, groups }) => {
    const homePage = window.location.origin;

    // Actor
    const actor = {
        objectType: "Agent",
        account: {
            homePage,
            name: data.userId || userData?.userId || data.email || "anonymous",
        },
        ...(data.username ? { name: data.username } : {}),
    };

    // Verb - always passed directly from XAPI_VERBS via customVerb: true
    const resolvedVerb = {
        id: data.verbId,
        display: { "en-US": data.verbDisplay },
    };

    // Object - the course project activity
    const object = getCourseProjectActivity(
        data.courseCode,
        data.courseName,
        data.activityId,
        data.projectDescription
    );

    // Context activities
    const contextActivities = {};
    if (userData?.group) {
        contextActivities.grouping = [getGroupActivity(userData.group, groups)];
    }
    if (data.grouping) contextActivities.grouping = [data.grouping];
    if (data.parent) contextActivities.parent = [data.parent];
    if (data.category) contextActivities.category = [data.category];

    // Context extensions
    const extensions = { ...(data.extensions || {}) };
    if (data.stage) extensions[EXT_STAGE] = data.stage;
    if (data.problemStep) extensions[EXT_STEP] = data.problemStep;
    // re-enable scenario by uncommenting:
    // if (data.scenario) extensions[EXT_SCENARIO] = data.scenario;

    const context = {
        extensions,
        ...(Object.keys(contextActivities).length ? { contextActivities } : {}),
    };

    // Statement
    const statement = {
        id: uuidv4(),
        actor,
        verb: resolvedVerb,
        object,
        context,
        timestamp: new Date().toISOString(),
        version: "1.0.3",
    };

    if (data.result) statement.result = data.result;

    return statement;
};