import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("vi");

type DateInput = string | Date | number | null | undefined;

export const formatDate = (date: DateInput, format?: string) => {
    if (date === null || date === undefined) return "";
    const parsed = dayjs(date);
    if (!parsed.isValid()) return "";
    return parsed.format(format ?? "DD/MM/YYYY");
};

export const formatTime = (date: DateInput) => {
    if (date === null || date === undefined) return "";
    const parsed = dayjs(date);
    if (!parsed.isValid()) return "";
    return parsed.format("HH:mm");
};

export const formatRelativeTime = (date: DateInput) => {
    if (date === null || date === undefined) return "";
    const parsed = dayjs(date);
    if (!parsed.isValid()) return "";
    if (dayjs().diff(parsed, "day") < 6) return parsed.fromNow();
    return parsed.format("DD/MM/YYYY");
};
