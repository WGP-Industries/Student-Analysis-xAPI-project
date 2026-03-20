import { useSelector } from "react-redux";
import api from "../configs/api";
import { buildStatement } from "../utils/xapi";

export const useXAPI = () => {
    const { user, enrollments } = useSelector((s) => s.auth);

    const sendXAPI = async (verb, data) => {
        // Resolve group details from the enrollment for this course,
        let { groupId, groupName, groupSlug } = data;

        if (data.courseCode && enrollments.length > 0) {
            const enrollment = enrollments.find(
                (e) => e.course?.courseCode?.toLowerCase() === data.courseCode.toLowerCase()
            );
            if (enrollment?.group) {
                // enrollment.group is a populated object: { _id, name, slug }
                groupId   = groupId   ?? enrollment.group._id  ?? enrollment.group;
                groupName = groupName ?? enrollment.group.name ?? null;
                groupSlug = groupSlug ?? enrollment.group.slug ?? null;
            }
        }

        const statement = buildStatement({
            data: {
                ...data,
                // Actor fields — injected from Redux so callers don't need to pass them
                userId:   user?._id,
                username: user?.username,
                email:    user?.email,
                // Resolved group
                groupId,
                groupName,
                groupSlug,
            },
            userData: user,
        });

        const response = await api.post("/api/xapi", {
            statement,
            verbType:       verb,
            additionalData: { ...data, groupId, groupName, groupSlug },
        });

        return response.data;
    };

    return { sendXAPI };
};
