import React, { useState } from 'react';
import { Member, TaskLabel } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MdDelete, MdEdit, MdAdd } from 'react-icons/md';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    members: Member[];
    taskLabels: TaskLabel[];
    onAddMember: (member: Member) => Promise<void>;
    onDeleteMember: (memberId: string) => Promise<void>;
    onUpdateMember: (member: Member) => Promise<void>;
    onAddTaskLabel: (taskLabel: TaskLabel) => Promise<void>;
    onDeleteTaskLabel: (taskLabelId: string) => Promise<void>;
    onUpdateTaskLabel: (taskLabel: TaskLabel) => Promise<void>;
};

type Tab = 'members' | 'taskLabels';

export const ManagementDialog: React.FC<Props> = ({
    isOpen,
    onClose,
    members,
    taskLabels,
    onAddMember,
    onDeleteMember,
    onUpdateMember,
    onAddTaskLabel,
    onDeleteTaskLabel,
    onUpdateTaskLabel,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('members');

    // メンバー編集用
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberIsManager, setNewMemberIsManager] = useState(false);

    // ラベル編集用
    const [editingTaskLabel, setEditingTaskLabel] = useState<TaskLabel | null>(null);
    const [newTaskLabelName, setNewTaskLabelName] = useState('');
    const [newTaskLabelOrder, setNewTaskLabelOrder] = useState(0);

    if (!isOpen) return null;

    // メンバー追加・更新
    const handleSaveMember = async () => {
        if (!newMemberName.trim()) return;

        if (editingMember) {
            await onUpdateMember({
                ...editingMember,
                name: newMemberName,
                isManager: newMemberIsManager,
            });
        } else {
            await onAddMember({
                id: uuidv4(),
                name: newMemberName,
                isManager: newMemberIsManager,
                excludedTaskLabelIds: [],
            });
        }
        setEditingMember(null);
        setNewMemberName('');
        setNewMemberIsManager(false);
    };

    // ラベル追加・更新
    const handleSaveTaskLabel = async () => {
        if (!newTaskLabelName.trim()) return;

        if (editingTaskLabel) {
            await onUpdateTaskLabel({
                ...editingTaskLabel,
                name: newTaskLabelName,
                order: newTaskLabelOrder,
            });
        } else {
            // 新規作成時はorderの最大値+1をデフォルトに
            const maxOrder = taskLabels.length > 0 ? Math.max(...taskLabels.map(t => t.order)) : 0;
            await onAddTaskLabel({
                id: uuidv4(),
                name: newTaskLabelName,
                order: newTaskLabelOrder || maxOrder + 1,
            });
        }
        setEditingTaskLabel(null);
        setNewTaskLabelName('');
        setNewTaskLabelOrder(0);
    };

    const startEditMember = (m: Member) => {
        setEditingMember(m);
        setNewMemberName(m.name);
        setNewMemberIsManager(m.isManager);
    };

    const startEditTaskLabel = (t: TaskLabel) => {
        setEditingTaskLabel(t);
        setNewTaskLabelName(t.name);
        setNewTaskLabelOrder(t.order);
    };

    const handleDeleteMember = async (id: string) => {
        if (confirm('本当に削除しますか？')) {
            await onDeleteMember(id);
        }
    };

    const handleDeleteTaskLabel = async (id: string) => {
        if (confirm('本当に削除しますか？')) {
            await onDeleteTaskLabel(id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
                {/* ヘッダー */}
                <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-lg">管理設定</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-300 text-2xl">×</button>
                </div>

                {/* タブ */}
                <div className="flex border-b shrink-0">
                    <button
                        className={`flex-1 py-3 font-bold text-center transition-colors ${activeTab === 'members' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setActiveTab('members')}
                    >
                        メンバー管理
                    </button>
                    <button
                        className={`flex-1 py-3 font-bold text-center transition-colors ${activeTab === 'taskLabels' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setActiveTab('taskLabels')}
                    >
                        作業ラベル管理
                    </button>
                </div>

                {/* コンテンツエリア */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'members' ? (
                        <div className="space-y-6">
                            {/* 入力フォーム */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h4 className="font-bold text-gray-700 mb-3">{editingMember ? 'メンバー編集' : '新規メンバー追加'}</h4>
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="text"
                                        placeholder="名前"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                    <label className="flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={newMemberIsManager}
                                            onChange={(e) => setNewMemberIsManager(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        管理者（担当表には含まれません）
                                    </label>
                                    <div className="flex gap-2 justify-end mt-2">
                                        {editingMember && (
                                            <button
                                                onClick={() => {
                                                    setEditingMember(null);
                                                    setNewMemberName('');
                                                    setNewMemberIsManager(false);
                                                }}
                                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
                                            >
                                                キャンセル
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSaveMember}
                                            disabled={!newMemberName.trim()}
                                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                                        >
                                            {editingMember ? '更新' : '追加'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 一覧 */}
                            <div className="space-y-2">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-gray-100">
                                        <div>
                                            <span className="font-bold text-gray-800">{member.name}</span>
                                            {member.isManager && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">管理者</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditMember(member)} className="p-2 text-blue-500 hover:bg-blue-50 rounded">
                                                <MdEdit size={20} />
                                            </button>
                                            <button onClick={() => handleDeleteMember(member.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* 入力フォーム */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h4 className="font-bold text-gray-700 mb-3">{editingTaskLabel ? 'ラベル編集' : '新規ラベル追加'}</h4>
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="text"
                                        placeholder="作業名"
                                        value={newTaskLabelName}
                                        onChange={(e) => setNewTaskLabelName(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">表示順:</span>
                                        <input
                                            type="number"
                                            value={newTaskLabelOrder}
                                            onChange={(e) => setNewTaskLabelOrder(Number(e.target.value))}
                                            className="border p-2 rounded w-20"
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end mt-2">
                                        {editingTaskLabel && (
                                            <button
                                                onClick={() => {
                                                    setEditingTaskLabel(null);
                                                    setNewTaskLabelName('');
                                                    setNewTaskLabelOrder(0);
                                                }}
                                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
                                            >
                                                キャンセル
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSaveTaskLabel}
                                            disabled={!newTaskLabelName.trim()}
                                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                                        >
                                            {editingTaskLabel ? '更新' : '追加'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 一覧 */}
                            <div className="space-y-2">
                                {taskLabels.map(label => (
                                    <div key={label.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400 w-6 text-center">{label.order}</span>
                                            <span className="font-bold text-gray-800">{label.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditTaskLabel(label)} className="p-2 text-blue-500 hover:bg-blue-50 rounded">
                                                <MdEdit size={20} />
                                            </button>
                                            <button onClick={() => handleDeleteTaskLabel(label.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
