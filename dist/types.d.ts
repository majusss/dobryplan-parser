export interface TableHour {
    number: number;
    timeFrom: string;
    timeTo: string;
}
export interface ListItem {
    name: string;
    value: string;
}
export interface List {
    [key: string]: ListItem[];
}
export interface TableLesson {
    subject: string;
    room?: string;
    roomId?: string;
    groupName?: string;
    teacher?: string;
    teacherId?: string;
    className?: string;
    classId?: string;
}
