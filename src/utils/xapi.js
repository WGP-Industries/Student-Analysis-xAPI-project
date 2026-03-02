import { v4 as uuidv4 } from "uuid";

const VERB_MAP = {
    "logged-in": { id: "http://adlnet.gov/expapi/verbs/logged-in", display: { "en-US": "logged in" } },
    "logged-out": { id: "http://adlnet.gov/expapi/verbs/logged-out", display: { "en-US": "logged out" } },
    answered: { id: "http://adlnet.gov/expapi/verbs/answered", display: { "en-US": "answered" } },
    selected: { id: "http://adlnet.gov/expapi/verbs/selected", display: { "en-US": "selected" } },
    completed: { id: "http://adlnet.gov/expapi/verbs/completed", display: { "en-US": "completed" } },
    attempted: { id: "http://adlnet.gov/expapi/verbs/attempted", display: { "en-US": "attempted" } },
    failed: { id: "http://adlnet.gov/expapi/verbs/failed", display: { "en-US": "failed" } },
    passed: { id: "http://adlnet.gov/expapi/verbs/passed", display: { "en-US": "passed" } },
};

const FALLBACK_VERB = {
    id: "http://adlnet.gov/expapi/verbs/experienced",
    display: { "en-US": "experienced" },
};

export const getGroupActivity = (groupId, groups) => {
    const group = groups.find((g) => g.id === groupId);
    return {
        objectType: "Activity",
        id: `https://quiz.com/groups/${groupId}`,
        definition: {
            name: { "en-US": group ? group.name : groupId },
            description: { "en-US": `Learning group: ${group ? group.name : groupId}` },
        },
    };
};

export const buildStatement = ({ verb, data, userData, groups }) => {
    const homePage = window.location.origin;

    const actor = {
        objectType: "Agent",
        account: {
            homePage,
            name: data.userId || userData?.userId || data.email || "anonymous",
        },
        ...(data.username ? { name: data.username } : {}),
    };

    const resolvedVerb = data.customVerb
        ? { id: data.verbId, display: { "en-US": data.verbDisplay } }
        : VERB_MAP[verb] ?? FALLBACK_VERB;

    const object = {
        objectType: "Activity",
        id: data.activityId || `https://quiz.com/activity/${data.activity || "unknown"}`,
        definition: {
            type: data.activityType || "https://quiz.com/activity-types/activity",
            name: { "en-US": data.activity || "Activity" },
            description: { "en-US": data.description || "Learning activity" },
        },
    };

    const contextActivities = {};
    if (userData?.group) {
        contextActivities.grouping = [getGroupActivity(userData.group, groups)];
    }
    if (data.grouping) contextActivities.grouping = [data.grouping];
    if (data.parent) contextActivities.parent = [data.parent];
    if (data.category) contextActivities.category = [data.category];

    const context = {
        extensions: data.extensions || {},
        ...(Object.keys(contextActivities).length ? { contextActivities } : {}),
    };

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