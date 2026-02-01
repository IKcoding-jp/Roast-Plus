// 欠点豆関連の型定義

export interface DefectBean {
  id: string;
  name: string;
  imageUrl: string;
  characteristics: string;
  tasteImpact: string;
  removalReason: string;
  isMaster: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  createdBy?: string;
}

export type DefectBeanSettings = {
  [defectBeanId: string]: {
    shouldRemove: boolean;
  };
};
