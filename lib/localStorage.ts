// ローカルストレージ管理

const SELECTED_MEMBER_ID_KEY = 'roastplus_selected_member_id';

/**
 * 選択されたメンバーIDを保存
 */
export function setSelectedMemberId(memberId: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (memberId === null) {
    localStorage.removeItem(SELECTED_MEMBER_ID_KEY);
  } else {
    localStorage.setItem(SELECTED_MEMBER_ID_KEY, memberId);
  }
}

/**
 * 選択されたメンバーIDを取得
 */
export function getSelectedMemberId(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(SELECTED_MEMBER_ID_KEY);
}

