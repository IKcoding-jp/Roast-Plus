export type RecordItem = {
    id: string;
    name: string;
    value: number;
    createdAt: string; // ISO形式
    checked: boolean;
    type?: 'manual' | 'sum' | 'diff';
    sources?: { name: string; value: number }[];
};
