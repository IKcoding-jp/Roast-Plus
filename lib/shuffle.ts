import type { Member, TaskLabel, Assignment, AssignmentHistory } from '@/types';

// シャッフルアルゴリズム
export function shuffleAssignments(
  members: Member[],
  taskLabels: TaskLabel[],
  currentDate: string,
  previousHistories: AssignmentHistory[]
): Assignment {
  // アクティブなメンバーのみを対象
  const activeMembers = members.filter(m => m.active);
  
  // ラベルをIDでマッピング
  const labelMap = new Map(taskLabels.map(l => [l.id, l]));
  
  // 前日と2日前の日付を計算
  const today = new Date(currentDate);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const dayBeforeYesterdayStr = dayBeforeYesterday.toISOString().split('T')[0];
  
  // 前日と2日前の割り当てを取得
  const yesterdayAssignment = previousHistories.find(h => h.date === yesterdayStr);
  const dayBeforeYesterdayAssignment = previousHistories.find(h => h.date === dayBeforeYesterdayStr);
  
  // 直近3回の履歴から頻度を集計
  const frequencyMap = new Map<string, Map<string, number>>(); // memberId -> labelId -> count
  
  activeMembers.forEach(member => {
    frequencyMap.set(member.id, new Map());
  });
  
  previousHistories.forEach(history => {
    activeMembers.forEach(member => {
      const labelId = history.assignments[member.id];
      if (labelId && labelId !== '—') {
        const memberFreq = frequencyMap.get(member.id)!;
        memberFreq.set(labelId, (memberFreq.get(labelId) || 0) + 1);
      }
    });
  });
  
  // 各メンバーに対して割り当てを決定
  const assignments: { [memberId: string]: string | null } = {};
  const usedLabels = new Set<string>();
  
  // メンバーをランダムにシャッフル
  const shuffledMembers = [...activeMembers].sort(() => Math.random() - 0.5);
  
  shuffledMembers.forEach(member => {
    // 除外ラベルを除外
    const availableLabels = taskLabels.filter(
      label => !member.excludedLabelIds.includes(label.id)
    );
    
    // 前日と同じ担当を除外
    const yesterdayLabel = yesterdayAssignment?.assignments[member.id];
    const filteredLabels1 = yesterdayLabel
      ? availableLabels.filter(l => l.id !== yesterdayLabel)
      : availableLabels;
    
    // 2日前と同じ担当を除外
    const dayBeforeYesterdayLabel = dayBeforeYesterdayAssignment?.assignments[member.id];
    const filteredLabels2 = dayBeforeYesterdayLabel
      ? filteredLabels1.filter(l => l.id !== dayBeforeYesterdayLabel)
      : filteredLabels1;
    
    // 既に使用されたラベルを除外
    const availableLabels2 = filteredLabels2.filter(l => !usedLabels.has(l.id));
    
    // 重み付けを計算
    const weights = availableLabels2.map(label => {
      const frequency = frequencyMap.get(member.id)?.get(label.id) || 0;
      // 頻度が高いほど重みを下げる（逆数を使用）
      return {
        labelId: label.id,
        weight: 1 / (frequency + 1),
      };
    });
    
    // 重み付きランダム選択
    let selectedLabelId: string | null = null;
    
    if (weights.length > 0) {
      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const { labelId, weight } of weights) {
        random -= weight;
        if (random <= 0) {
          selectedLabelId = labelId;
          break;
        }
      }
    }
    
    // ラベルが足りない場合は"—"を割り当て
    if (!selectedLabelId) {
      selectedLabelId = '—';
    } else {
      // 使用済みラベルとして記録
      usedLabels.add(selectedLabelId);
    }
    
    assignments[member.id] = selectedLabelId;
  });
  
  return {
    date: currentDate,
    assignments,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// 日付をYYYY-MM-DD形式で取得
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

