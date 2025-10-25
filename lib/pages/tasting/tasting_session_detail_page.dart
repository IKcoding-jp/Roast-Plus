import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../models/tasting_models.dart';
import '../../models/theme_settings.dart';
import '../../models/group_provider.dart';
import '../../services/group_gamification_service.dart';
import '../../services/tasting_firestore_service.dart';
import '../../widgets/lottie_animation_widget.dart';

class TastingSessionDetailPage extends StatefulWidget {
  final String? sessionId;
  final String? beanName;
  final String? roastLevel;

  const TastingSessionDetailPage({
    super.key,
    this.sessionId,
    this.beanName,
    this.roastLevel,
  });

  @override
  State<TastingSessionDetailPage> createState() =>
      _TastingSessionDetailPageState();
}

class _TastingSessionDetailPageState extends State<TastingSessionDetailPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _beanCtrl = TextEditingController();
  final TextEditingController _commentCtrl = TextEditingController();

  String _roastLevel = '中深煎り';
  String? _sessionId;
  bool _creating = false;
  bool _prefilledOnce = false;

  // エントリ（自分）の値
  double _bitterness = 3;
  double _acidity = 3;
  double _body = 3;
  double _sweetness = 3;
  double _aroma = 3;
  double _overall = 3;

  @override
  void initState() {
    super.initState();
    if (widget.beanName != null) _beanCtrl.text = widget.beanName!;
    if (widget.roastLevel != null) _roastLevel = widget.roastLevel!;
    _sessionId = widget.sessionId;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final groupProvider = context.read<GroupProvider>();
      if (!groupProvider.hasGroup) return;
      final groupId = groupProvider.currentGroup!.id;
      // セッションIDがある場合は購読開始
      if (_sessionId != null) {
        context.read<TastingProvider>().loadEntries(groupId, _sessionId!);
        _prefillFromMyEntry();
      }
    });
  }

  @override
  void dispose() {
    _beanCtrl.dispose();
    _commentCtrl.dispose();
    super.dispose();
  }

  Future<void> _ensureSession() async {
    debugPrint('_ensureSession 開始');
    if (_sessionId != null) {
      debugPrint('_ensureSession: セッションIDが既に存在: $_sessionId');
      return;
    }
    if (!_formKey.currentState!.validate()) {
      debugPrint('_ensureSession: フォームバリデーション失敗');
      return;
    }
    final groupProvider = context.read<GroupProvider>();
    if (!groupProvider.hasGroup) {
      debugPrint('_ensureSession: グループが選択されていない');
      return;
    }
    final groupId = groupProvider.currentGroup!.id;
    final tastingProvider = context.read<TastingProvider>();
    debugPrint(
      '_ensureSession: セッション作成開始 - groupId: $groupId, beanName: ${_beanCtrl.text.trim()}, roastLevel: $_roastLevel',
    );
    setState(() => _creating = true);
    try {
      final session = await TastingFirestoreService.createOrGetSession(
        groupId,
        _beanCtrl.text.trim(),
        _roastLevel,
      );
      debugPrint('_ensureSession: セッション作成完了 - sessionId: ${session.id}');
      setState(() => _sessionId = session.id);
      tastingProvider.loadEntries(groupId, session.id);
    } catch (e) {
      debugPrint('_ensureSession: セッション作成エラー: $e');
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  void _prefillFromMyEntry() {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null || _sessionId == null) return;
    final entries = context.read<TastingProvider>().getEntriesOf(_sessionId!);
    final mine = entries.where((e) => e.userId == uid).toList();
    if (mine.isNotEmpty) {
      final e = mine.first;
      _bitterness = e.bitterness;
      _acidity = e.acidity;
      _body = e.body;
      _sweetness = e.sweetness;
      _aroma = e.aroma;
      _overall = e.overall;
      _commentCtrl.text = e.comment;
      _prefilledOnce = true;
      setState(() {});
    }
  }

  Future<void> _saveMyEntry() async {
    debugPrint('_saveMyEntry 開始');
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) {
      debugPrint('_saveMyEntry: uidがnull');
      return;
    }
    if (_sessionId == null) {
      debugPrint('_saveMyEntry: _sessionIdがnull');
      return;
    }
    final groupProvider = context.read<GroupProvider>();
    final groupId = groupProvider.currentGroup!.id;
    debugPrint(
      '_saveMyEntry: 保存開始 - groupId: $groupId, sessionId: $_sessionId, uid: $uid',
    );

    // 既存エントリがあるかチェック（新規エントリかどうかの判定）
    final tastingProvider = context.read<TastingProvider>();
    final hadMyEntry = tastingProvider.hasMyEntry(_sessionId!, uid);
    debugPrint('_saveMyEntry: 既存エントリの有無: $hadMyEntry');

    final entry = TastingEntry(
      id: uid,
      userId: uid,
      bitterness: _bitterness,
      acidity: _acidity,
      body: _body,
      sweetness: _sweetness,
      aroma: _aroma,
      overall: _overall,
      comment: _commentCtrl.text.trim(),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    try {
      // 1. エントリを保存
      await TastingFirestoreService.upsertEntry(groupId, _sessionId!, entry);
      debugPrint('_saveMyEntry: 保存完了');

      // 2. 新規エントリの場合のみ経験値を付与
      if (!hadMyEntry) {
        debugPrint('_saveMyEntry: 新規エントリのため経験値を付与');
        try {
          final result = await GroupGamificationService.recordTasting(groupId);

          debugPrint(
            '_saveMyEntry: 経験値付与結果 - success: ${result.success}, xp: ${result.experienceGained}, message: ${result.message}',
          );

          if (result.success && mounted) {
            debugPrint('_saveMyEntry: 経験値付与成功 - ${result.experienceGained}XP');

            // UIの更新を待ってからアニメーションを表示
            await Future.delayed(Duration(milliseconds: 100));

            // 経験値獲得アニメーションを表示
            if (!mounted) return;
            try {
              AnimationHelper.showExperienceGainAnimation(
                context,
                xpGained: result.experienceGained,
                description: result.message,
                onComplete: () {
                  debugPrint('_saveMyEntry: アニメーション完了');
                },
              );
              debugPrint('_saveMyEntry: アニメーション表示開始');
            } catch (animationError) {
              debugPrint('_saveMyEntry: アニメーション表示エラー: $animationError');
              // アニメーション表示に失敗した場合はスナックバーで通知
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('+${result.experienceGained}XP 獲得！'),
                    backgroundColor: Colors.green,
                    duration: Duration(seconds: 3),
                  ),
                );
              }
            }
          } else {
            debugPrint('_saveMyEntry: 経験値付与失敗 - ${result.message}');
          }
        } catch (xpError) {
          debugPrint('_saveMyEntry: 経験値付与エラー: $xpError');
          // 経験値付与に失敗してもエントリ保存は成功として扱う
        }
      } else {
        debugPrint('_saveMyEntry: 既存エントリの更新のため経験値は付与しない');
      }

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('保存しました')));
    } catch (e) {
      debugPrint('_saveMyEntry: 保存エラー: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('保存に失敗しました: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _deleteMyEntry() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null || _sessionId == null) return;
    final groupId = context.read<GroupProvider>().currentGroup!.id;

    try {
      await TastingFirestoreService.deleteEntry(groupId, _sessionId!, uid);
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('削除しました')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('削除に失敗しました: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeSettings>(context);
    final baseTheme = Theme.of(context);
    final fontFamily = theme.fontFamily;
    final textTheme = baseTheme.textTheme.apply(fontFamily: fontFamily);
    final primaryTextTheme = baseTheme.primaryTextTheme.apply(
      fontFamily: fontFamily,
    );
    final appBarTitleStyle =
        (baseTheme.appBarTheme.titleTextStyle ??
                primaryTextTheme.titleLarge ??
                const TextStyle())
            .copyWith(fontFamily: fontFamily);
    final inputLabelStyle =
        (baseTheme.inputDecorationTheme.labelStyle ??
                textTheme.bodyMedium ??
                const TextStyle())
            .copyWith(fontFamily: fontFamily);
    final inputHintStyle =
        (baseTheme.inputDecorationTheme.hintStyle ??
                textTheme.bodyMedium ??
                const TextStyle())
            .copyWith(fontFamily: fontFamily);
    final inputHelperStyle =
        (baseTheme.inputDecorationTheme.helperStyle ??
                textTheme.bodySmall ??
                const TextStyle())
            .copyWith(fontFamily: fontFamily);
    final snackBarContentStyle =
        (baseTheme.snackBarTheme.contentTextStyle ??
                textTheme.bodyMedium ??
                const TextStyle())
            .copyWith(fontFamily: fontFamily);
    final dropdownTextStyle =
        (baseTheme.dropdownMenuTheme.textStyle ?? textTheme.bodyMedium)
            ?.copyWith(fontFamily: fontFamily);
    final groupProvider = Provider.of<GroupProvider>(context);
    final tastingProvider = Provider.of<TastingProvider>(context);
    final hasGroup = groupProvider.hasGroup;
    final uid = FirebaseAuth.instance.currentUser?.uid;

    // デバッグログ: Web版での状態確認
    debugPrint('試飲セッション詳細ページ - Web版デバッグ:');
    debugPrint('  _sessionId: $_sessionId');
    debugPrint('  hasGroup: $hasGroup');
    debugPrint('  uid: $uid');
    debugPrint('  sessions count: ${tastingProvider.sessions.length}');

    final session = (_sessionId == null)
        ? null
        : tastingProvider.sessions.firstWhere(
            (s) => s.id == _sessionId,
            orElse: () => TastingSession(
              id: _sessionId!,
              beanName: widget.beanName ?? _beanCtrl.text,
              roastLevel: widget.roastLevel ?? _roastLevel,
              createdAt: DateTime.now(),
              updatedAt: DateTime.now(),
              createdBy: uid ?? '',
              entriesCount: 0,
              avgBitterness: 0,
              avgAcidity: 0,
              avgBody: 0,
              avgSweetness: 0,
              avgAroma: 0,
              avgOverall: 0,
            ),
          );

    // エントリストリームからの遅延到着に合わせて初回プリフィル
    if (!_prefilledOnce && _sessionId != null) {
      final entries = context.watch<TastingProvider>().getEntriesOf(
        _sessionId!,
      );
      final uidNow = FirebaseAuth.instance.currentUser?.uid;
      if (uidNow != null) {
        final mineNow = entries.where((e) => e.userId == uidNow).toList();
        if (mineNow.isNotEmpty) {
          final e = mineNow.first;
          _bitterness = e.bitterness;
          _acidity = e.acidity;
          _body = e.body;
          _sweetness = e.sweetness;
          _aroma = e.aroma;
          _overall = e.overall;
          _commentCtrl.text = e.comment;
          _prefilledOnce = true;
        }
      }
    }

    final media = MediaQuery.of(context);
    final bottomPad = 16.0 + media.padding.bottom + media.viewInsets.bottom;

    return Theme(
      data: baseTheme.copyWith(
        textTheme: textTheme,
        primaryTextTheme: primaryTextTheme,
        appBarTheme: baseTheme.appBarTheme.copyWith(
          titleTextStyle: appBarTitleStyle,
        ),
        inputDecorationTheme: baseTheme.inputDecorationTheme.copyWith(
          labelStyle: inputLabelStyle,
          hintStyle: inputHintStyle,
          helperStyle: inputHelperStyle,
        ),
        dropdownMenuTheme: baseTheme.dropdownMenuTheme.copyWith(
          textStyle: dropdownTextStyle,
        ),
        snackBarTheme: baseTheme.snackBarTheme.copyWith(
          contentTextStyle: snackBarContentStyle,
        ),
      ),
      child: DefaultTextStyle.merge(
        style: TextStyle(fontFamily: fontFamily),
        child: Scaffold(
          appBar: AppBar(
            title: Text('試飲セッション'),
            backgroundColor: theme.appBarColor,
            foregroundColor: theme.appBarTextColor,
          ),
          body: !hasGroup
              ? Center(child: Text('グループが選択されていません'))
              : Center(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.fromLTRB(16, 16, 16, bottomPad),
                    keyboardDismissBehavior:
                        ScrollViewKeyboardDismissBehavior.onDrag,
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width > 600
                            ? 600
                            : double.infinity,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_sessionId == null)
                            _buildCreateSessionCard(theme)
                          else
                            _buildSessionHeaderCard(theme, session!),
                          SizedBox(height: 16),
                          if (_sessionId != null) _buildMyEntryForm(theme),
                          SizedBox(height: 16),
                        ],
                      ),
                    ),
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildCreateSessionCard(ThemeSettings theme) {
    final roasts = ['浅煎り', '中煎り', '中深煎り', '深煎り'];
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'セッションを開始',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: theme.fontColor1,
                ),
              ),
              SizedBox(height: 12),
              TextFormField(
                controller: _beanCtrl,
                decoration: InputDecoration(
                  labelText: '豆の名前 *',
                  border: OutlineInputBorder(),
                ),
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? '豆の名前を入力してください' : null,
              ),
              SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _roastLevel,
                items: roasts
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (v) =>
                    setState(() => _roastLevel = v ?? _roastLevel),
                decoration: InputDecoration(
                  labelText: '焙煎度合い *',
                  border: OutlineInputBorder(),
                ),
              ),
              SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _creating ? null : _ensureSession,
                  child: Text(_creating ? '作成中...' : '開始'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSessionHeaderCard(ThemeSettings theme, TastingSession session) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              session.beanName,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: theme.fontColor1,
              ),
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(width: 12),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.brown.shade200,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                session.roastLevel,
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyEntryForm(ThemeSettings theme) {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    final entries = (_sessionId == null)
        ? const <TastingEntry>[]
        : context.watch<TastingProvider>().getEntriesOf(_sessionId!);
    final mine = (uid == null)
        ? null
        : entries.firstWhere(
            (e) => e.userId == uid,
            orElse: () => TastingEntry(
              id: uid,
              userId: uid,
              bitterness: _bitterness,
              acidity: _acidity,
              body: _body,
              sweetness: _sweetness,
              aroma: _aroma,
              overall: _overall,
              comment: _commentCtrl.text,
              createdAt: DateTime.now(),
              updatedAt: DateTime.now(),
            ),
          );

    final isEditing = mine != null && entries.any((e) => e.userId == uid);

    // デバッグログ: 保存ボタン表示条件の確認
    debugPrint('_buildMyEntryForm - デバッグ:');
    debugPrint('  _sessionId: $_sessionId');
    debugPrint('  uid: $uid');
    debugPrint('  entries count: ${entries.length}');
    debugPrint('  mine: $mine');
    debugPrint('  isEditing: $isEditing');

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '自分のエントリ',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: theme.fontColor1,
              ),
            ),
            SizedBox(height: 12),
            _slider('苦味', _bitterness, (v) => setState(() => _bitterness = v)),
            _slider('酸味', _acidity, (v) => setState(() => _acidity = v)),
            _slider('ボディ', _body, (v) => setState(() => _body = v)),
            _slider('甘み', _sweetness, (v) => setState(() => _sweetness = v)),
            _slider('香り', _aroma, (v) => setState(() => _aroma = v)),
            _slider('総合', _overall, (v) => setState(() => _overall = v)),
            SizedBox(height: 8),
            TextFormField(
              controller: _commentCtrl,
              decoration: InputDecoration(
                labelText: 'コメント',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _saveMyEntry,
                    child: Text(isEditing ? '更新' : '保存'),
                  ),
                ),
                SizedBox(width: 8),
                if (isEditing)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _deleteMyEntry,
                      child: Text('削除'),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _slider(String label, double value, ValueChanged<double> onChanged) {
    final theme = Provider.of<ThemeSettings>(context, listen: false);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: theme.fontColor1,
              ),
            ),
            Text(
              value.toStringAsFixed(1),
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: theme.fontColor1,
              ),
            ),
          ],
        ),
        Slider(
          value: value,
          min: 1.0,
          max: 5.0,
          divisions: 8,
          activeColor: theme.buttonColor,
          inactiveColor: theme.fontColor1.withValues(alpha: 0.3),
          onChanged: onChanged,
        ),
      ],
    );
  }
}
