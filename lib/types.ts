export interface TableHour {
  number: number;
  timeFrom: string;
  timeTo: string;
}

export interface ListItem {
  id: TableId;
  name: string;
}

export type TableType = "classes" | "teachers" | "rooms";

export type List = {
  [key in TableType]: ListItem[];
};

export interface TableLesson {
  subject: string;
  room?: string;
  roomId?: TableId;
  groupName?: string;
  teacher?: string;
  teacherId?: TableId;
  className?: string;
  classId?: TableId;
}

export interface TableId {
  value: string;
  type: TableType;
}
