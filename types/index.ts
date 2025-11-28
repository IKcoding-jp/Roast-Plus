// 迴ｭ・医メ繝ｼ繝・・
export interface Team {

  id: string;

  name: string;

  order?: number;

}



// 繝｡繝ｳ繝舌・

export interface Member {

  id: string;

  name: string;

  teamId: string; // 謇螻樒少ID

  excludedTaskLabelIds: string[]; // 諱剃ｹ・勁螟悶Λ繝吶ΝID縺ｮ驟榊・

  active?: boolean;

  order?: number;

}



// 邂｡逅・・
export interface Manager {

  id: string;

  name: string;

}



// 菴懈･ｭ繝ｩ繝吶Ν

export interface TaskLabel {

  id: string;

  leftLabel: string; // 蟾ｦ繝ｩ繝吶Ν・亥ｿ・茨ｼ・
  rightLabel?: string | null; // 蜿ｳ繝ｩ繝吶Ν・井ｻｻ諢擾ｼ・
  order?: number;

}



// 菴懈･ｭ繝ｩ繝吶Ν縺ｮ譌･莉伜挨繧ｹ繝翫ャ繝励す繝ｧ繝・ヨ

export interface TaskLabelSnapshot {

  date: string; // YYYY-MM-DD蠖｢蠑・
  labels: TaskLabel[]; // 縺昴・譌･莉倥・菴懈･ｭ繝ｩ繝吶Ν

}



// 蜑ｲ繧雁ｽ薙※・・縺､縺ｮ諡・ｽ難ｼ・
export interface Assignment {

  teamId: string;

  taskLabelId: string;

  memberId: string | null;

  assignedDate: string; // YYYY-MM-DD蠖｢蠑・
}

// 蜑ｲ繧雁ｽ薙※縺ｮ譌･谺｡繧ｹ繝翫ャ繝励す繝ｧ繝・ヨ
export interface AssignmentDay {
  date: string; // YYYY-MM-DD蠖｢蠑・  assignments: Assignment[];
  updatedAt?: any;
  createdAt?: any;
}






// 譎る俣繝ｩ繝吶Ν・域悽譌･縺ｮ繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ逕ｨ・・
export interface TimeLabel {

  id: string;

  time: string; // HH:mm蠖｢蠑・
  content: string; // 蜀・ｮｹ

  memo?: string; // 繝｡繝｢・井ｻｻ諢擾ｼ・
  order?: number; // 陦ｨ遉ｺ鬆・ｺ・
}



// 譛ｬ譌･縺ｮ繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ・域律谺｡繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ・・
export interface TodaySchedule {

  id: string;

  date: string; // YYYY-MM-DD蠖｢蠑・
  timeLabels: TimeLabel[];

}



// 繝ｭ繝ｼ繧ｹ繝医せ繧ｱ繧ｸ繝･繝ｼ繝ｫ

export interface RoastSchedule {

  id: string;

  date: string; // YYYY-MM-DD蠖｢蠑・
  time: string; // HH:mm蠖｢蠑擾ｼ医い繝輔ち繝ｼ繝代・繧ｸ縺ｮ蝣ｴ蜷医・遨ｺ譁・ｭ怜・繧ょ庄・・
  // 繝｡繝｢繧ｿ繧､繝暦ｼ域賜莉也噪・・
  isRoasterOn?: boolean; // 辟咏・讖滉ｺ育・

  isRoast?: boolean; // 繝ｭ繝ｼ繧ｹ繝・
  isAfterPurge?: boolean; // 繧｢繝輔ち繝ｼ繝代・繧ｸ

  isChaffCleaning?: boolean; // 繝√Ε繝輔・縺頑祉髯､

  // 辟咏・讖滉ｺ育・逕ｨ繝輔ぅ繝ｼ繝ｫ繝・
  beanName?: string; // 雎・・蜷榊燕

  beanName2?: string; // 2遞ｮ鬘樒岼縺ｮ雎・・蜷榊燕・医・繝ｬ繝溘ャ繧ｯ繧ｹ逕ｨ・・
  blendRatio?: string; // 繝悶Ξ繝ｳ繝牙牡蜷茨ｼ井ｾ具ｼ壹・:5縲阪・:2縲榊ｽ｢蠑擾ｼ・
  roastMachineMode?: 'G1' | 'G2' | 'G3'; // 辟咏・讖溯ｨｭ螳壹Δ繝ｼ繝会ｼ郁ｱ・∈謚槭〒閾ｪ蜍戊ｨｭ螳夲ｼ・
  weight?: 200 | 300 | 500; // 驥阪＆・・・・
  roastLevel?: '豬・・繧・ | '荳ｭ辣弱ｊ' | '荳ｭ豺ｱ辣弱ｊ' | '豺ｱ辣弱ｊ'; // 辟咏・蠎ｦ蜷医＞

  // 繝ｭ繝ｼ繧ｹ繝育畑繝輔ぅ繝ｼ繝ｫ繝・
  roastCount?: number; // 菴募屓逶ｮ

  bagCount?: 1 | 2; // 陲区焚

  order?: number; // 譎る俣鬆・た繝ｼ繝育畑

}



// 隧ｦ鬟ｲ繧ｻ繝・す繝ｧ繝ｳ

export interface TastingSession {

  id: string;

  name?: string; // 繧ｻ繝・す繝ｧ繝ｳ蜷搾ｼ井ｻｻ諢擾ｼ・
  beanName: string; // 雎・・蜷榊燕・亥ｿ・茨ｼ・
  roastLevel: '豬・・繧・ | '荳ｭ辣弱ｊ' | '荳ｭ豺ｱ辣弱ｊ' | '豺ｱ辣弱ｊ'; // 辟咏・蠎ｦ蜷医＞・亥ｿ・茨ｼ・
  memo?: string; // 繝｡繝｢・井ｻｻ諢擾ｼ・
  createdAt: string; // ISO 8601蠖｢蠑・
  updatedAt: string; // ISO 8601蠖｢蠑・
  userId: string; // 繝ｦ繝ｼ繧ｶ繝ｼID

}



// 隧ｦ鬟ｲ險倬鹸

export interface TastingRecord {

  id: string;

  sessionId: string; // 繧ｻ繝・す繝ｧ繝ｳID・亥ｿ・茨ｼ・
  beanName: string; // 雎・・蜷榊燕

  tastingDate: string; // YYYY-MM-DD蠖｢蠑・
  roastLevel: '豬・・繧・ | '荳ｭ辣弱ｊ' | '荳ｭ豺ｱ辣弱ｊ' | '豺ｱ辣弱ｊ'; // 辟咏・蠎ｦ蜷医＞

  // 隧穂ｾ｡鬆・岼・・.0縲・.0縲・.125蛻ｻ縺ｿ・・
  bitterness: number; // 闍ｦ蜻ｳ

  acidity: number; // 驟ｸ蜻ｳ

  body: number; // 繝懊ョ繧｣

  sweetness: number; // 逕倥∩

  aroma: number; // 鬥吶ｊ

  overallRating: number; // 邱丞粋・医♀縺・＠縺包ｼ・
  overallImpression?: string; // 蜈ｨ菴鍋噪縺ｪ蜊ｰ雎｡・医ユ繧ｭ繧ｹ繝茨ｼ・
  createdAt: string; // ISO 8601蠖｢蠑・
  updatedAt: string; // ISO 8601蠖｢蠑・
  userId: string; // 繝ｦ繝ｼ繧ｶ繝ｼID

  memberId: string; // 繝｡繝ｳ繝舌・ID・亥ｿ・茨ｼ・
}



// 繝ｭ繝ｼ繧ｹ繝医ち繧､繝槭・險ｭ螳・
export interface RoastTimerSettings {

  goToRoastRoomTimeSeconds: number; // 辟咏・螳､縺ｫ陦後￥縺ｾ縺ｧ縺ｮ譎る俣・育ｧ偵√ョ繝輔か繝ｫ繝・0遘抵ｼ・
  timerSoundEnabled: boolean; // 繧ｿ繧､繝槭・髻ｳ縺ｮ譛牙柑/辟｡蜉ｹ

  timerSoundFile: string; // 繧ｿ繧､繝槭・髻ｳ繝輔ぃ繧､繝ｫ繝代せ・医ョ繝輔か繝ｫ繝・ sounds/alarm/alarm01.mp3・・
  timerSoundVolume: number; // 繧ｿ繧､繝槭・髻ｳ驥擾ｼ・.0・・.0縲√ョ繝輔か繝ｫ繝・.5・・
  notificationSoundEnabled: boolean; // 騾夂衍髻ｳ縺ｮ譛牙柑/辟｡蜉ｹ

  notificationSoundFile: string; // 騾夂衍髻ｳ繝輔ぃ繧､繝ｫ繝代せ

  notificationSoundVolume: number; // 騾夂衍髻ｳ驥擾ｼ・.0・・.0・・
}

// 繝上Φ繝峨ヴ繝・け繧ｿ繧､繝槭・險ｭ螳・
export interface HandpickTimerSettings {

  soundEnabled: boolean; // 繧ｵ繧ｦ繝ｳ繝峨・譛牙柑/辟｡蜉ｹ・医げ繝ｭ繝ｼ繝舌Ν險ｭ螳夲ｼ・
  soundFile?: string; // 繧ｵ繧ｦ繝ｳ繝峨ヵ繧｡繧､繝ｫ繝代せ・亥ｾ梧婿莠呈鋤諤ｧ縺ｮ縺溘ａ谿九☆縲√ョ繝輔か繝ｫ繝・ sounds/alarm/alarm01.mp3・・
  soundVolume?: number; // 繧ｵ繧ｦ繝ｳ繝蛾浹驥擾ｼ亥ｾ梧婿莠呈鋤諤ｧ縺ｮ縺溘ａ谿九☆縲・.0・・.0縲√ョ繝輔か繝ｫ繝・.5・・
  startSoundEnabled: boolean; // 髢句ｧ矩浹縺ｮ譛牙柑/辟｡蜉ｹ

  startSoundFile: string; // 髢句ｧ矩浹繝輔ぃ繧､繝ｫ繝代せ・医ョ繝輔か繝ｫ繝・ sounds/alarm/alarm01.mp3・・
  startSoundVolume: number; // 髢句ｧ矩浹驥擾ｼ・.0・・.0縲√ョ繝輔か繝ｫ繝・.5・・
  completeSoundEnabled: boolean; // 螳御ｺ・浹縺ｮ譛牙柑/辟｡蜉ｹ

  completeSoundFile: string; // 螳御ｺ・浹繝輔ぃ繧､繝ｫ繝代せ・医ョ繝輔か繝ｫ繝・ sounds/alarm/alarm01.mp3・・
  completeSoundVolume: number; // 螳御ｺ・浹驥擾ｼ・.0・・.0縲√ョ繝輔か繝ｫ繝・.5・・
}



// 繝ｦ繝ｼ繧ｶ繝ｼ險ｭ螳・
export interface UserSettings {

  selectedMemberId?: string; // 隧ｦ鬟ｲ諢滓Φ險倬鹸逕ｨ縺ｮ繝｡繝ｳ繝舌・ID

  selectedManagerId?: string; // 繝・ヰ繧､繧ｹ菴ｿ逕ｨ閠・ｨｭ螳夂畑縺ｮ邂｡逅・・D

  roastTimerSettings?: RoastTimerSettings; // 繝ｭ繝ｼ繧ｹ繝医ち繧､繝槭・險ｭ螳・
  taskLabelHeaderTextLeft?: string; // 諡・ｽ楢｡ｨ縺ｮ蟾ｦ蛛ｴ菴懈･ｭ繝ｩ繝吶Ν繝倥ャ繝繝ｼ陦ｨ險假ｼ医ョ繝輔か繝ｫ繝・ 縲御ｽ懈･ｭ繝ｩ繝吶Ν縲搾ｼ・
  taskLabelHeaderTextRight?: string; // 諡・ｽ楢｡ｨ縺ｮ蜿ｳ蛛ｴ菴懈･ｭ繝ｩ繝吶Ν繝倥ャ繝繝ｼ陦ｨ險假ｼ医ョ繝輔か繝ｫ繝・ 縲御ｽ懈･ｭ繝ｩ繝吶Ν縲搾ｼ・
}



// 繧ｷ繝｣繝・ヵ繝ｫ繧､繝吶Φ繝茨ｼ医・繝ｫ繝√ョ繝舌う繧ｹ蜷梧悄逕ｨ・・
export interface ShuffleEvent {

  date?: string; // Document ID (YYYY-MM-DD)

  // 譌｢蟄伜ｮ夂ｾｩ
  startTime?: string; // ISO 8601形式のタイムスタンプ
  targetDate?: string; // シャッフル結果の基準日（Firestoreが真）
  shuffledAssignments?: Assignment[]; // 繧ｷ繝｣繝・ヵ繝ｫ邨先棡

  // 霑ｽ蜉螳夂ｾｩ (Assignment讖溯・縺ｧ菴ｿ逕ｨ)
  eventId?: string;
  state?: 'running' | 'done';
  startedAt?: any; // Timestamp or ISO string
  durationMs?: number;
  resultAssignments?: Assignment[];

}

// 繧ｷ繝｣繝・ヵ繝ｫ螻･豁ｴ・医す繝｣繝・ヵ繝ｫ縺斐→縺ｮ險倬鹸・・
export interface ShuffleHistory {

  id: string; // 荳諢上・ID・・UID・・
  createdAt: any; // 菴懈・譌･譎ゑｼ医し繝ｼ繝舌・繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝暦ｼ・
  assignments: Assignment[]; // 繧ｷ繝｣繝・ヵ繝ｫ邨先棡

  targetDate: string; // 蟇ｾ雎｡譌･莉假ｼ・YYY-MM-DD・・
}



// 繝ｭ繝ｼ繧ｹ繝医ち繧､繝槭・險倬鹸

export interface RoastTimerRecord {

  id: string;

  beanName: string; // 雎・・蜷榊燕

  weight: 200 | 300 | 500; // 驥阪＆・・・・
  roastLevel: '豬・・繧・ | '荳ｭ辣弱ｊ' | '荳ｭ豺ｱ辣弱ｊ' | '豺ｱ辣弱ｊ'; // 辟咏・蠎ｦ蜷医＞

  duration: number; // 螳滄圀縺ｮ繝ｭ繝ｼ繧ｹ繝域凾髢難ｼ育ｧ抵ｼ・
  roastDate: string; // 辟咏・譌･・・YYY-MM-DD蠖｢蠑擾ｼ・
  createdAt: string; // ISO 8601蠖｢蠑・
  userId: string; // 繝ｦ繝ｼ繧ｶ繝ｼID

  groupId?: string; // 繧ｰ繝ｫ繝ｼ繝悠D・医げ繝ｫ繝ｼ繝苓ｨ倬鹸逕ｨ縲√が繝励す繝ｧ繝翫Ν・・
}



// 繝ｭ繝ｼ繧ｹ繝医ち繧､繝槭・迥ｶ諷・
export type RoastTimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type RoastTimerDialogState = 'completion' | 'continuousRoast' | 'afterPurge' | null;



export interface RoastTimerState {

  status: RoastTimerStatus; // 繧ｿ繧､繝槭・縺ｮ迥ｶ諷・
  duration: number; // 險ｭ螳壽凾髢難ｼ育ｧ抵ｼ・
  elapsed: number; // 邨碁℃譎る俣・育ｧ抵ｼ・
  remaining: number; // 谿九ｊ譎る俣・育ｧ抵ｼ・
  pausedElapsed?: number; // 邏ｯ遨堺ｸ譎ょ●豁｢譎る俣・育ｧ抵ｼ・
  beanName?: string; // 雎・・蜷榊燕

  weight?: 200 | 300 | 500; // 驥阪＆・・・・
  roastLevel?: '豬・・繧・ | '荳ｭ辣弱ｊ' | '荳ｭ豺ｱ辣弱ｊ' | '豺ｱ辣弱ｊ'; // 辟咏・蠎ｦ蜷医＞

  startedAt?: string; // 髢句ｧ区凾蛻ｻ・・SO 8601蠖｢蠑擾ｼ・
  pausedAt?: string; // 荳譎ょ●豁｢譎ょ綾・・SO 8601蠖｢蠑擾ｼ・
  lastUpdatedAt: string; // 譛邨よ峩譁ｰ譎ょ綾・・SO 8601蠖｢蠑擾ｼ・
  notificationId?: number; // 騾夂衍ID・・=謇句虚縲・=縺翫☆縺吶ａ・・
  triggeredByDeviceId?: string; // 謫堺ｽ懊ｒ螳溯｡後＠縺溘ョ繝舌う繧ｹID

  completedByDeviceId?: string; // 螳御ｺ・ｒ讀懷・縺励◆繝・ヰ繧､繧ｹID

  dialogState?: RoastTimerDialogState; // 繝繧､繧｢繝ｭ繧ｰ縺ｮ陦ｨ遉ｺ迥ｶ諷具ｼ医・繝ｫ繝√ョ繝舌う繧ｹ蜷梧悄逕ｨ・・
}

// 蜑ｲ繧雁ｽ薙※陦ｨ縺ｮ陦ｨ遉ｺ險ｭ螳夲ｼ亥ｹ・・鬮倥＆・・export interface TableSettings {
  colWidths: {
    taskLabel: number; // 蟾ｦ遶ｯ蛻・    note: number;      // 蜿ｳ遶ｯ蛻・    teams: Record<string, number>; // 繝√・繝ID -> 蟷・  };
  rowHeights: Record<string, number>; // 菴懈･ｭ繝ｩ繝吶ΝID -> 鬮倥＆
}

// 繧｢繝励Μ蜈ｨ菴薙・繝・・繧ｿ讒矩

export interface AppData {
  // 豕ｨ諢・ teams, members, manager, taskLabels, assignments 縺ｯ
  // 諡・ｽ楢｡ｨ讖溯・縺ｧ迢ｬ遶九＠縺溘さ繝ｬ繧ｯ繧ｷ繝ｧ繝ｳ・・teams, /members, /taskLabels, /assignmentDays・峨〒邂｡逅・＆繧後※縺・∪縺・
  todaySchedules: TodaySchedule[]; // 譛ｬ譌･縺ｮ繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ

  roastSchedules: RoastSchedule[]; // 繝ｭ繝ｼ繧ｹ繝医せ繧ｱ繧ｸ繝･繝ｼ繝ｫ

  tastingSessions: TastingSession[]; // 隧ｦ鬟ｲ繧ｻ繝・す繝ｧ繝ｳ

  tastingRecords: TastingRecord[]; // 隧ｦ鬟ｲ險倬鹸

  notifications: Notification[]; // 騾夂衍

  userSettings?: UserSettings; // 繝ｦ繝ｼ繧ｶ繝ｼ險ｭ螳・
  shuffleEvent?: ShuffleEvent; // 繧ｷ繝｣繝・ヵ繝ｫ繧､繝吶Φ繝茨ｼ医・繝ｫ繝√ョ繝舌う繧ｹ蜷梧悄逕ｨ・・
  encouragementCount?: number; // 蠢懈抄繧ｫ繧ｦ繝ｳ繝茨ｼ亥・繝ｦ繝ｼ繧ｶ繝ｼ縺ｧ蜈ｱ譛会ｼ・
  roastTimerRecords: RoastTimerRecord[]; // 繝ｭ繝ｼ繧ｹ繝医ち繧､繝槭・險倬鹸

  roastTimerState?: RoastTimerState; // 繝ｭ繝ｼ繧ｹ繝医ち繧､繝槭・迥ｶ諷・
  defectBeans?: DefectBean[]; // 繝ｦ繝ｼ繧ｶ繝ｼ霑ｽ蜉谺轤ｹ雎・ョ繝ｼ繧ｿ

  defectBeanSettings?: DefectBeanSettings; // 谺轤ｹ雎・ｨｭ螳夲ｼ育怐縺・逵√°縺ｪ縺・ｼ・
  workProgresses: WorkProgress[]; // 菴懈･ｭ騾ｲ謐・
  counterRecords: CounterRecord[]; // 繧ｫ繧ｦ繝ｳ繧ｿ繝ｼ險倬鹸

}



// 騾夂衍

export type NotificationType = 'update' | 'announcement' | 'improvement' | 'request' | 'bugfix';



export interface Notification {

  id: string;

  title: string;

  content: string;

  date: string; // YYYY-MM-DD蠖｢蠑・
  type: NotificationType;

  order?: number; // 陦ｨ遉ｺ鬆・ｺ擾ｼ磯幕逋ｺ閠・Δ繝ｼ繝峨〒荳ｦ縺ｳ譖ｿ縺亥庄閭ｽ・・
}



// 谺轤ｹ雎・
export interface DefectBean {

  id: string;

  name: string; // 谺轤ｹ雎・・蜷咲ｧｰ

  imageUrl: string; // Firebase Storage縺ｮ逕ｻ蜒酋RL

  characteristics: string; // 迚ｹ蠕ｴ・郁ｦ九◆逶ｮ縺ｮ隱ｬ譏趣ｼ・
  tasteImpact: string; // 蜻ｳ縺ｸ縺ｮ蠖ｱ髻ｿ

  removalReason: string; // 逵√￥逅・罰

  isMaster: boolean; // 繝槭せ繧ｿ繝ｼ繝・・繧ｿ縺ｧ縺ゅｋ縺薙→繧堤､ｺ縺吶ヵ繝ｩ繧ｰ

  order?: number; // 陦ｨ遉ｺ鬆・ｺ・
  createdAt: string; // ISO 8601蠖｢蠑・
  updatedAt: string; // ISO 8601蠖｢蠑・
  userId?: string; // 霑ｽ蜉縺励◆繝ｦ繝ｼ繧ｶ繝ｼID・医Θ繝ｼ繧ｶ繝ｼ霑ｽ蜉繝・・繧ｿ縺ｮ蝣ｴ蜷茨ｼ・
  createdBy?: string; // 霑ｽ蜉縺励◆繝｡繝ｳ繝舌・ID・医Θ繝ｼ繧ｶ繝ｼ霑ｽ蜉繝・・繧ｿ縺ｮ蝣ｴ蜷茨ｼ・
}



// 谺轤ｹ雎・ｨｭ螳夲ｼ育怐縺・逵√°縺ｪ縺・ｼ・
export type DefectBeanSettings = {

  [defectBeanId: string]: {

    shouldRemove: boolean; // true: 逵√￥, false: 逵√°縺ｪ縺・
  };

};



// 菴懈･ｭ騾ｲ謐礼憾諷・
// 作業進捗状況
export type WorkProgressStatus = 'pending' | 'in_progress' | 'completed';

// 進捗記録エントリ
export interface ProgressEntry {
  id: string;
  date: string; // ISO 8601
  amount: number; // 進捗量 or 完了数の差分
  memo?: string;
}

// 進捗管理モード
export type WorkProgressMode = 'target' | 'count' | 'unset';

// 目標情報
export interface WorkProgressGoal {
  mode: WorkProgressMode;
  targetAmount?: number; // mode=target のときのみ利用
  unit?: string; // kg / 個 など
}

// 進捗の状態
export interface WorkProgressProgress {
  currentAmount?: number; // mode=target の現在量
  completedCount?: number; // mode=count の累積
  history?: ProgressEntry[]; // 履歴（mode共通）
}

// 作業進捗
export interface WorkProgress {
  id: string;
  groupName?: string;
  taskName?: string;
  weight?: string; // 互換用の生文字列（表示・後方互換）
  status: WorkProgressStatus;
  memo?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  goal: WorkProgressGoal;
  progress: WorkProgressProgress;
  archivedAt?: string;
}

export interface CounterRecord {

  id: string;

  name: string;

  value: number;

  createdAt: string; // ISO蠖｢蠑・
  checked: boolean;

  type?: 'manual' | 'sum' | 'diff';

  sources?: { name: string; value: number }[];

}



