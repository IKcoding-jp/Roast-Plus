<!-- 9f03b921-de82-493a-9769-843b2500d5c1 2fe75f8e-d237-44e9-8462-f1c9a13dba82 -->
# 全ページフォント適用漏れ修正計画

## 問題の原因

DropdownButtonFormFieldやTextFieldで、`style`プロパティにフォントファミリーが設定されていない箇所が複数存在する。特にドロップダウンでは、`decoration`内の`hintStyle`だけでなく、ウィジェット自体の`style`プロパティにもフォント設定が必要。

## 修正対象ファイル（13ファイル）

### 1. 焙煎記録入力ページ

**ファイル**: `lib/pages/roast/roast_record_page.dart`

- 行182-212: 煎り度ドロップダウンに`style`プロパティを追加
  ```dart
  style: TextStyle(
    fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
  ),
  ```


### 2. 焙煎記録一覧ページ

**ファイル**: `lib/pages/roast/roast_record_list_page.dart`

- 行1398-1419: フィルタードロップダウンに`style`とアイテムのフォント設定を追加

### 3. ドリップカウンターページ

**ファイル**: `lib/pages/drip/drip_counter_page.dart`

- TextFieldとDropdownButtonFormFieldのヒントスタイルと入力スタイルにフォントファミリーを追加

### 4. その他のページ（10ファイル）

- `lib/pages/roast/roast_timer_page.dart`
- `lib/pages/drip/drip_pack_record_list_page.dart`
- `lib/pages/members/member_edit_page.dart`
- `lib/pages/settings/feedback_page.dart`
- `lib/pages/roast/roast_edit_page.dart`
- `lib/pages/roast/roast_time_advisor_page.dart`
- `lib/pages/tasting/tasting_session_detail_page.dart`
- `lib/pages/work_progress/work_progress_edit_page.dart`
- `lib/pages/tasting/tasting_record_edit_page.dart`
- `lib/pages/settings/passcode_recovery_setup_page.dart`

各ファイルで以下を確認・修正：

- DropdownButtonFormFieldの`style`プロパティにフォントファミリーを設定
- TextFieldの`style`プロパティにフォントファミリーを設定（未設定の場合）
- `hintStyle`にフォントファミリーを設定（未設定の場合）

## 修正方針

1. 優先度1: ユーザーが報告した焙煎記録入力ページの煎り度ドロップダウン
2. 優先度2: 焙煎記録一覧ページのフィルタードロップダウン
3. 優先度3: その他のページを順次修正

## 期待される結果

- すべてのテキスト入力フィールドとドロップダウンで、ユーザーが設定したフォントファミリー（きうい丸）が適用される
- ヒントテキストも選択したフォントで表示される

### To-dos

- [ ] 焙煎記録入力ページの煎り度ドロップダウンにstyleプロパティを追加
- [ ] 焙煎記録一覧ページのフィルタードロップダウンにフォント設定を追加
- [ ] ドリップカウンターページのテキストフィールドとドロップダウンにフォント設定を追加
- [ ] その他10ファイルのDropdownButtonFormFieldとTextFieldにフォント設定を追加
- [ ] 各ページでフォント設定が正しく適用されているか確認