import 'package:flame/components.dart';
import 'package:flame/effects.dart';
import 'package:flutter/material.dart';
import '../../models/handpick_game_models.dart' as game_models;

/// ゲームUIオーバーレイ
class GameUIOverlay extends Component {
  final VoidCallback? onShuffle;
  final VoidCallback? onComplete;
  final VoidCallback? onPause;
  
  double _timeRemaining = game_models.HandpickGameConfig.timeLimitSeconds.toDouble();
  int _removedCount = 0;
  bool _isGameActive = false; // 初期状態では停止
  bool _isShuffling = false;

  late TextComponent _timeText;
  late TextComponent _countText;
  late TextComponent _instructionText;
  late RectangleComponent _shuffleButton;
  late RectangleComponent _completeButton;
  late RectangleComponent _pauseButton;

  GameUIOverlay({
    this.onShuffle,
    this.onComplete,
    this.onPause,
  });

  @override
  Future<void> onLoad() async {
    super.onLoad();
    await _initializeUI();
  }

  Future<void> _initializeUI() async {
    // 画面サイズを取得（ゲームサイズから）
    final game = findGame();
    final screenSize = game?.size ?? Vector2(800, 600);
    final centerX = screenSize.x / 2;
    final bottomY = screenSize.y - 120; // 下から120px上

    // 時間表示
    _timeText = TextComponent(
      text: '残り時間: ${_timeRemaining.round()}秒',
      position: Vector2(centerX - 100, bottomY - 80),
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
    add(_timeText);

    // 除去カウント表示
    _countText = TextComponent(
      text: '除去: $_removedCount個',
      position: Vector2(centerX - 100, bottomY - 50),
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
    add(_countText);

    // 説明テキスト
    _instructionText = TextComponent(
      text: '欠点豆をタップして除去してください',
      position: Vector2(centerX - 150, bottomY - 20),
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 16,
        ),
      ),
    );
    add(_instructionText);

    // シャッフルボタン
    _shuffleButton = RectangleComponent(
      position: Vector2(centerX - 180, bottomY + 10),
      size: Vector2(120, 40),
      paint: Paint()..color = Colors.blue.withValues(alpha: 0.8),
    );
    add(_shuffleButton);

    final shuffleText = TextComponent(
      text: 'シャッフル',
      position: Vector2(centerX - 120, bottomY + 30),
      anchor: Anchor.center,
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
    add(shuffleText);

    // 完了ボタン
    _completeButton = RectangleComponent(
      position: Vector2(centerX - 30, bottomY + 10),
      size: Vector2(120, 40),
      paint: Paint()..color = Colors.green.withValues(alpha: 0.8),
    );
    add(_completeButton);

    final completeText = TextComponent(
      text: '完了',
      position: Vector2(centerX + 30, bottomY + 30),
      anchor: Anchor.center,
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
    add(completeText);

    // 一時停止ボタン
    _pauseButton = RectangleComponent(
      position: Vector2(centerX + 120, bottomY + 10),
      size: Vector2(80, 40),
      paint: Paint()..color = Colors.orange.withValues(alpha: 0.8),
    );
    add(_pauseButton);

    final pauseText = TextComponent(
      text: '一時停止',
      position: Vector2(centerX + 160, bottomY + 30),
      anchor: Anchor.center,
      textRenderer: TextPaint(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
    add(pauseText);
  }

  @override
  void update(double dt) {
    super.update(dt);
    
    if (_isGameActive && !_isShuffling) {
      _timeRemaining -= dt;
      if (_timeRemaining <= 0) {
        _timeRemaining = 0;
        _isGameActive = false;
        _timeText.text = '時間切れ！';
        onComplete?.call();
      } else {
        _timeText.text = '残り時間: ${_timeRemaining.round()}秒';
      }
    }
  }

  bool handleTap(Vector2 tapPosition) {
    // シャッフルボタン
    if (_shuffleButton.containsPoint(tapPosition) && !_isShuffling) {
      _onShuffleTap();
      return true;
    }

    // 完了ボタン
    if (_completeButton.containsPoint(tapPosition)) {
      _onCompleteTap();
      return true;
    }

    // 一時停止ボタン
    if (_pauseButton.containsPoint(tapPosition)) {
      _onPauseTap();
      return true;
    }

    return false;
  }

  void _onShuffleTap() {
    if (_isShuffling) return;
    
    _isShuffling = true;
    _shuffleButton.paint.color = Colors.grey.withValues(alpha: 0.8);
    
    // シャッフルアニメーション
    add(
      ScaleEffect.to(
        Vector2.all(0.95),
        EffectController(duration: 0.1),
        onComplete: () {
          add(
            ScaleEffect.to(
              Vector2.all(1.0),
              EffectController(duration: 0.1),
              onComplete: () {
                _isShuffling = false;
                _shuffleButton.paint.color = Colors.blue.withValues(alpha: 0.8);
                onShuffle?.call();
              },
            ),
          );
        },
      ),
    );
  }

  void _onCompleteTap() {
    onComplete?.call();
  }

  void _onPauseTap() {
    _isGameActive = !_isGameActive;
    _pauseButton.paint.color = _isGameActive 
        ? Colors.orange.withValues(alpha: 0.8)
        : Colors.red.withValues(alpha: 0.8);
    
    final pauseText = children.whereType<TextComponent>().firstWhere(
      (text) => text.text == '一時停止',
      orElse: () => TextComponent(text: ''),
    );
    pauseText.text = _isGameActive ? '一時停止' : '再開';
    
    onPause?.call();
  }

  /// 除去カウントを更新
  void updateRemovedCount(int count) {
    _removedCount = count;
    _countText.text = '除去: $_removedCount個';
  }

  /// ゲームを開始
  void startGame() {
    _isGameActive = true;
    _timeRemaining = game_models.HandpickGameConfig.timeLimitSeconds.toDouble();
    _removedCount = 0;
    _timeText.text = '残り時間: ${_timeRemaining.round()}秒';
    _countText.text = '除去: $_removedCount個';
  }

  /// ゲームを停止
  void stopGame() {
    _isGameActive = false;
  }

  /// UIをリセット
  void resetUI() {
    _isGameActive = false;
    _timeRemaining = game_models.HandpickGameConfig.timeLimitSeconds.toDouble();
    _removedCount = 0;
    _isShuffling = false;
    _timeText.text = '残り時間: ${_timeRemaining.round()}秒';
    _countText.text = '除去: $_removedCount個';
    _shuffleButton.paint.color = Colors.blue.withValues(alpha: 0.8);
  }

  /// シャッフル状態をリセット
  void resetShuffle() {
    _isShuffling = false;
    _shuffleButton.paint.color = Colors.blue.withValues(alpha: 0.8);
  }

  /// 残り時間を取得
  double get timeRemaining => _timeRemaining;

  /// ゲームがアクティブかどうか
  bool get isGameActive => _isGameActive;

  /// シャッフル中かどうか
  bool get isShuffling => _isShuffling;

  /// 除去カウントを取得
  int get removedCount => _removedCount;

  /// 時間警告を表示
  void showTimeWarning() {
    if (_timeRemaining <= 10) {
      _timeText.textRenderer = TextPaint(
        style: const TextStyle(
          color: Colors.red,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      );
    } else {
      _timeText.textRenderer = TextPaint(
        style: const TextStyle(
          color: Colors.white,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      );
    }
  }

  /// 完了メッセージを表示
  void showCompletionMessage(String message) {
    _instructionText.text = message;
    _instructionText.textRenderer = TextPaint(
      style: const TextStyle(
        color: Colors.green,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    );
  }

}
