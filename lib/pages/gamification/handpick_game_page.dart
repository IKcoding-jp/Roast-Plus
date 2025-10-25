import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flame/game.dart';
import 'package:flame/components.dart';
import '../../models/theme_settings.dart';
import '../../models/handpick_game_models.dart' as game_models;
import '../../models/group_provider.dart';
import '../../services/group_gamification_service.dart';
import '../../game/handpick_game.dart';

/// ハンドピックゲームページ
class HandpickGamePage extends StatefulWidget {
  const HandpickGamePage({super.key});

  @override
  State<HandpickGamePage> createState() => _HandpickGamePageState();
}

class _HandpickGamePageState extends State<HandpickGamePage>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  
  // ゲーム状態
  GameState _gameState = GameState.start;
  HandpickGame? _game;
  game_models.HandpickGameResult? _gameResult;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    
    _fadeController = AnimationController(
      duration: Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    ));
    
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _game = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(
              Icons.casino,
              color: themeSettings.iconColor,
              size: 24,
            ),
            SizedBox(width: 8),
            Text(
              'ハンドピックゲーム',
              style: TextStyle(
                color: themeSettings.appBarTextColor,
                fontSize: 20 * themeSettings.fontSizeScale,
                fontWeight: FontWeight.bold,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ],
        ),
        backgroundColor: themeSettings.appBarColor,
        iconTheme: IconThemeData(color: themeSettings.iconColor),
        elevation: 0,
      ),
      body: _buildBody(themeSettings),
    );
  }

  Widget _buildBody(ThemeSettings themeSettings) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            themeSettings.backgroundColor,
            themeSettings.backgroundColor.withValues(alpha: 0.8),
          ],
        ),
      ),
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: _buildCurrentScreen(themeSettings),
      ),
    );
  }

  Widget _buildCurrentScreen(ThemeSettings themeSettings) {
    switch (_gameState) {
      case GameState.start:
        return _buildStartScreen(themeSettings);
      case GameState.playing:
        return _buildGameScreen(themeSettings);
      case GameState.result:
        return _buildResultScreen(themeSettings);
    }
  }

  /// 開始画面
  Widget _buildStartScreen(ThemeSettings themeSettings) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(height: 40),
          
          // メインアイコン
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: themeSettings.iconColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(
                color: themeSettings.iconColor.withValues(alpha: 0.3),
                width: 2,
              ),
            ),
            child: Icon(
              Icons.casino,
              size: 60,
              color: themeSettings.iconColor,
            ),
          ),
          
          SizedBox(height: 32),
          
          // タイトル
          Text(
            'ハンドピックゲーム',
            style: TextStyle(
              fontSize: 28 * themeSettings.fontSizeScale,
              fontWeight: FontWeight.bold,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            textAlign: TextAlign.center,
          ),
          
          SizedBox(height: 24),
          
          // ルール説明
          Container(
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: themeSettings.cardBackgroundColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: themeSettings.iconColor.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ゲームルール',
                  style: TextStyle(
                    fontSize: 18 * themeSettings.fontSizeScale,
                    fontWeight: FontWeight.bold,
                    color: themeSettings.fontColor1,
                    fontFamily: themeSettings.fontFamily,
                  ),
                ),
                SizedBox(height: 12),
                _buildRuleItem(themeSettings, '100個のコーヒー豆の中から10個の欠点豆を見つけて除去してください'),
                _buildRuleItem(themeSettings, '制限時間は60秒です'),
                _buildRuleItem(themeSettings, '欠点豆の種類：黒変豆、小粒豆、欠け豆'),
                _buildRuleItem(themeSettings, '正確度と時間に応じて経験値を獲得できます'),
                _buildRuleItem(themeSettings, 'シャッフルボタンで豆を再配置できます'),
              ],
            ),
          ),
          
          SizedBox(height: 32),
          
          // スタートボタン
          ElevatedButton.icon(
            onPressed: _startGame,
            icon: Icon(Icons.play_arrow),
            label: Text('ゲーム開始'),
            style: ElevatedButton.styleFrom(
              backgroundColor: themeSettings.buttonColor,
              foregroundColor: themeSettings.fontColor2,
              padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          
          SizedBox(height: 16),
          
          // 戻るボタン
          TextButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.arrow_back),
            label: Text('戻る'),
            style: TextButton.styleFrom(
              foregroundColor: themeSettings.fontColor1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRuleItem(ThemeSettings themeSettings, String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.check_circle_outline,
            color: themeSettings.iconColor,
            size: 16,
          ),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14 * themeSettings.fontSizeScale,
                color: themeSettings.fontColor1,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// ゲーム画面
  Widget _buildGameScreen(ThemeSettings themeSettings) {
    return Stack(
      children: [
        // ゲーム本体
        if (_game != null)
          GestureDetector(
            onTapDown: (details) {
              final tapPosition = Vector2(
                details.localPosition.dx,
                details.localPosition.dy,
              );
              _game!.handleTap(tapPosition);
            },
            child: GameWidget(game: _game!),
          ),
        
        // ローディング表示
        if (_isLoading)
          Container(
            color: Colors.black.withValues(alpha: 0.5),
            child: Center(
              child: CircularProgressIndicator(
                color: themeSettings.iconColor,
              ),
            ),
          ),
      ],
    );
  }

  /// 結果画面
  Widget _buildResultScreen(ThemeSettings themeSettings) {
    if (_gameResult == null) return Container();

    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(height: 40),
          
          // 結果アイコン
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: _getResultColor(themeSettings).withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(
                color: _getResultColor(themeSettings),
                width: 3,
              ),
            ),
            child: Icon(
              _getResultIcon(),
              size: 50,
              color: _getResultColor(themeSettings),
            ),
          ),
          
          SizedBox(height: 24),
          
          // 結果タイトル
          Text(
            _getResultTitle(),
            style: TextStyle(
              fontSize: 24 * themeSettings.fontSizeScale,
              fontWeight: FontWeight.bold,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            textAlign: TextAlign.center,
          ),
          
          SizedBox(height: 32),
          
          // 結果詳細
          Container(
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: themeSettings.cardBackgroundColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: themeSettings.iconColor.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Column(
              children: [
                _buildResultItem(themeSettings, 'スコア', '${_gameResult!.score}点'),
                _buildResultItem(themeSettings, '正確度', '${_gameResult!.accuracy}%'),
                _buildResultItem(themeSettings, '時間', '${_gameResult!.timeTaken}秒'),
                _buildResultItem(themeSettings, '正解除去', '${_gameResult!.correctRemoved}個'),
                _buildResultItem(themeSettings, '誤除去', '${_gameResult!.wrongRemoved}個'),
                _buildResultItem(themeSettings, '見逃し', '${_gameResult!.missedDefects}個'),
                Divider(color: themeSettings.iconColor.withValues(alpha: 0.3)),
                _buildResultItem(themeSettings, '獲得経験値', '${_gameResult!.experiencePoints}XP'),
              ],
            ),
          ),
          
          SizedBox(height: 32),
          
          // ボタン群
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton.icon(
                onPressed: _playAgain,
                icon: Icon(Icons.refresh),
                label: Text('再プレイ'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: themeSettings.buttonColor,
                  foregroundColor: themeSettings.fontColor2,
                ),
              ),
              TextButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: Icon(Icons.home),
                label: Text('ホーム'),
                style: TextButton.styleFrom(
                  foregroundColor: themeSettings.fontColor1,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildResultItem(ThemeSettings themeSettings, String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 16 * themeSettings.fontSizeScale,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 16 * themeSettings.fontSizeScale,
              fontWeight: FontWeight.bold,
              color: themeSettings.iconColor,
              fontFamily: themeSettings.fontFamily,
            ),
          ),
        ],
      ),
    );
  }

  Color _getResultColor(ThemeSettings themeSettings) {
    if (_gameResult == null) return themeSettings.iconColor;
    
    if (_gameResult!.accuracy >= 90) return Colors.green;
    if (_gameResult!.accuracy >= 70) return Colors.orange;
    return Colors.red;
  }

  IconData _getResultIcon() {
    if (_gameResult == null) return Icons.help;
    
    if (_gameResult!.accuracy >= 90) return Icons.emoji_events;
    if (_gameResult!.accuracy >= 70) return Icons.thumb_up;
    return Icons.thumb_down;
  }

  String _getResultTitle() {
    if (_gameResult == null) return '結果';
    
    if (_gameResult!.accuracy >= 90) return '素晴らしい！';
    if (_gameResult!.accuracy >= 70) return '良い結果！';
    return 'もう少し練習が必要です';
  }

  void _startGame() {
    setState(() {
      _gameState = GameState.playing;
      _isLoading = true;
    });

    // ゲームを初期化
    _game = HandpickGame(
      onGameComplete: _onGameComplete,
      onGamePause: _onGamePause,
    );

    // ゲーム開始を少し遅らせる
    Future.delayed(const Duration(milliseconds: 100), () {
      _game!.startGame();
      setState(() {
        _isLoading = false;
      });
    });
  }

  void _onGameComplete(game_models.HandpickGameResult result) async {
    setState(() {
      _gameResult = result;
      _gameState = GameState.result;
    });

    // グループ経験値を追加
    final groupProvider = Provider.of<GroupProvider>(context, listen: false);
    final currentGroup = groupProvider.currentGroup;
    
    if (currentGroup != null) {
      try {
        await GroupGamificationService.recordHandpickGame(
          currentGroup.id,
          result.accuracy,
          result.timeTaken,
        );
      } catch (e) {
        // エラーは無視（ゲーム結果は表示する）
        print('経験値追加エラー: $e');
      }
    }
  }

  void _onGamePause() {
    // 一時停止処理（必要に応じて）
  }

  void _playAgain() {
    setState(() {
      _gameState = GameState.start;
      _gameResult = null;
    });
    
    _game = null;
  }
}

/// ゲーム状態
enum GameState {
  start,    // 開始画面
  playing,  // ゲーム中
  result,   // 結果画面
}
