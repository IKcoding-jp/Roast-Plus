import React from 'react';
import { MdInfoOutline } from 'react-icons/md';
import { Props } from './types';
import { useCellInteraction } from './useCellInteraction';
import { useTableEditing } from './useTableEditing';
import { DesktopTableView } from './DesktopTableView';
import { MobileListView } from './MobileListView';
import { TableModals } from './TableModals';

export const AssignmentTable: React.FC<Props> = (props) => {
    const {
        teams,
        taskLabels,
        assignments,
        members,
        tableSettings,
        onUpdateTableSettings,
        onUpdateMember,
        onAddMember,
        onDeleteMember,
        onUpdateTaskLabel,
        onAddTaskLabel,
        onDeleteTaskLabel,
        onAddTeam,
        onDeleteTeam,
        onUpdateTeam,
        onUpdateMemberName,
        onUpdateMemberExclusion,
        onSwapAssignments,
        onShuffle,
        isShuffleDisabled,
        isChristmasMode = false,
    } = props;

    const cellInteraction = useCellInteraction(members);
    const tableEditing = useTableEditing({
        teams,
        taskLabels,
        tableSettings,
        onUpdateTableSettings,
        onUpdateTaskLabel,
        onAddTaskLabel,
        onDeleteTaskLabel,
        onAddTeam,
        onDeleteTeam,
        onUpdateTeam,
        onAddMember,
        onUpdateMember,
    });

    const handleCellClick = (teamId: string, taskLabelId: string) => {
        cellInteraction.handleCellClick(teamId, taskLabelId, onSwapAssignments);
    };

    return (
        <div className="w-full max-w-full flex flex-col items-center gap-6">
            {/* データがない場合の初期ガイドメッセージ */}
            {teams.length === 0 && taskLabels.length === 0 && (
                <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-orange-100 p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-orange-50 rounded-full text-primary">
                            <MdInfoOutline size={32} />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">担当表をはじめましょう</h3>
                    <p className="text-gray-600 text-sm mb-6">
                        まずは「班」と「作業」を追加して、<br />
                        日々の役割分担を管理する表を作成しましょう。
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                        <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 rounded border border-primary/20">
                            <span className="font-bold text-primary">STEP 1</span>
                            <span>班を追加</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="font-bold">STEP 2</span>
                            <span>作業を追加</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="font-bold">STEP 3</span>
                            <span>割当開始</span>
                        </div>
                    </div>
                </div>
            )}

            <DesktopTableView
                teams={teams}
                taskLabels={taskLabels}
                assignments={assignments}
                members={members}
                tableSettings={tableSettings}
                selectedCell={cellInteraction.selectedCell}
                isAddingTeam={tableEditing.isAddingTeam}
                setIsAddingTeam={tableEditing.setIsAddingTeam}
                newTeamName={tableEditing.newTeamName}
                setNewTeamName={tableEditing.setNewTeamName}
                handleAddTeam={tableEditing.handleAddTeam}
                editingTeamId={tableEditing.editingTeamId}
                editTeamName={tableEditing.editTeamName}
                setEditTeamName={tableEditing.setEditTeamName}
                handleUpdateTeam={tableEditing.handleUpdateTeam}
                setActiveTeamActionId={tableEditing.setActiveTeamActionId}
                setActiveTeamName={tableEditing.setActiveTeamName}
                newLeftLabel={tableEditing.newLeftLabel}
                setNewLeftLabel={tableEditing.setNewLeftLabel}
                newRightLabel={tableEditing.newRightLabel}
                setNewRightLabel={tableEditing.setNewRightLabel}
                handleAddTaskLabel={tableEditing.handleAddTaskLabel}
                setWidthConfig={tableEditing.setWidthConfig}
                setHeightConfig={tableEditing.setHeightConfig}
                handleCellTouchStart={cellInteraction.handleCellTouchStart}
                handleCellTouchEnd={cellInteraction.handleCellTouchEnd}
                handleCellTouchMove={cellInteraction.handleCellTouchMove}
                handleCellClick={handleCellClick}
                onShuffle={onShuffle}
                isShuffleDisabled={isShuffleDisabled}
                isChristmasMode={isChristmasMode}
            />

            <MobileListView
                teams={teams}
                taskLabels={taskLabels}
                assignments={assignments}
                members={members}
                tableSettings={tableSettings}
                selectedCell={cellInteraction.selectedCell}
                editingLabelId={tableEditing.editingLabelId}
                editLeftLabel={tableEditing.editLeftLabel}
                setEditLeftLabel={tableEditing.setEditLeftLabel}
                editRightLabel={tableEditing.editRightLabel}
                setEditRightLabel={tableEditing.setEditRightLabel}
                startEditLabel={tableEditing.startEditLabel}
                saveLabel={tableEditing.saveLabel}
                handleDeleteTaskLabel={tableEditing.handleDeleteTaskLabel}
                handleCellTouchStart={cellInteraction.handleCellTouchStart}
                handleCellTouchEnd={cellInteraction.handleCellTouchEnd}
                handleCellTouchMove={cellInteraction.handleCellTouchMove}
                handleCellClick={handleCellClick}
                isChristmasMode={isChristmasMode}
            />

            <TableModals
                teams={teams}
                taskLabels={taskLabels}
                assignments={assignments}
                members={members}
                tableSettings={tableSettings}
                contextMenu={cellInteraction.contextMenu}
                setContextMenu={cellInteraction.setContextMenu}
                editingMemberName={cellInteraction.editingMemberName}
                setEditingMemberName={cellInteraction.setEditingMemberName}
                isExclusionSettingsOpen={cellInteraction.isExclusionSettingsOpen}
                setIsExclusionSettingsOpen={cellInteraction.setIsExclusionSettingsOpen}
                showMemberMenu={tableEditing.showMemberMenu}
                setShowMemberMenu={tableEditing.setShowMemberMenu}
                newMemberName={tableEditing.newMemberName}
                setNewMemberName={tableEditing.setNewMemberName}
                handleAddMember={tableEditing.handleAddMember}
                activeTeamActionId={tableEditing.activeTeamActionId}
                setActiveTeamActionId={tableEditing.setActiveTeamActionId}
                activeTeamName={tableEditing.activeTeamName}
                setActiveTeamName={tableEditing.setActiveTeamName}
                handleUpdateTeamFromModal={tableEditing.handleUpdateTeamFromModal}
                handleDeleteTeamFromModal={tableEditing.handleDeleteTeamFromModal}
                widthConfig={tableEditing.widthConfig}
                setWidthConfig={tableEditing.setWidthConfig}
                handleSaveWidth={tableEditing.handleSaveWidth}
                heightConfig={tableEditing.heightConfig}
                setHeightConfig={tableEditing.setHeightConfig}
                handleSaveRowConfig={tableEditing.handleSaveRowConfig}
                onUpdateMember={onUpdateMember}
                onUpdateMemberName={onUpdateMemberName}
                onUpdateMemberExclusion={onUpdateMemberExclusion}
                onDeleteMember={onDeleteMember}
                onDeleteTaskLabel={onDeleteTaskLabel}
                onUpdateTableSettings={onUpdateTableSettings}
                isChristmasMode={isChristmasMode}
            />
        </div>
    );
};
