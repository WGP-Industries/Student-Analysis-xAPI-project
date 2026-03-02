import { useSelector } from "react-redux";
import api from "../configs/api";
import { buildStatement } from "../utils/xapi";

export const useXAPI = () => {
    const { user, enrollments } = useSelector((s) => s.auth);

    const sendXAPI = async (verb, data) => {

        let groupId = null;
        if (data.courseId && enrollments.length > 0) {
            const enrollment = enrollments.find(
                (e) => e.course?.courseCode?.toLowerCase() === data.courseId.toLowerCase()
            );
            groupId = enrollment?.group ?? null;
        }

        const statement = buildStatement({
            verb,
            data: { ...data, groupId },
            userData: user,
        });

        const response = await api.post("/api/xapi", {
            statement,
            verbType: verb,
            additionalData: { ...data, groupId },
        });

        return response.data;
    };

    return { sendXAPI };
};