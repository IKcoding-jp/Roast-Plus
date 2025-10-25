import 'dart:math';
import 'package:flame/game.dart';
import 'package:flame/components.dart';
import 'package:flame/effects.dart';
import 'package:flutter/material.dart';
import '../models/handpick_game_models.dart' as game_models;
import 'components/coffee_bean_component.dart';
import 'components/game_ui_overlay.dart';

/// ハンドピックゲームのメインクラス
class HandpickGame extends FlameGame {
  final Function(game_models.HandpickGameResult)? onGameComplete;
  final Function()? onGamePause;

  List<game_models.CoffeeBean> _beans = [];
  List<CoffeeBeanComponent> _beanComponents = [];
  GameUIOverlay? _uiOverlay;
  bool _isGameStarted = false;
  bool _isGameCompleted = false;
  bool _isShuffling = false;

  // ゲーム統計
  int _correctRemoved = 0;
  int _wrongRemoved = 0;
  int _missedDefects = 0;

  HandpickGame({this.onGameComplete, this.onGamePause});

  @override
  Future<void> onLoad() async {
    await _initializeGame();
  }

  Future<void> _initializeGame() async {
    // UIオーバーレイを追加
    _uiOverlay = GameUIOverlay(
      onShuffle: _onShuffle,
      onComplete: _onComplete,
      onPause: _onPause,
    );
    add(_uiOverlay!);

    // 豆を生成
    await _generateBeans();
  }

  Future<void> _generateBeans() async {
    _beans.clear();
    _beanComponents.clear();
    // 既存の豆コンポーネントを削除
    for (final component in _beanComponents) {
      component.removeFromParent();
    }

    // 豆の位置を生成（重ならないように）
    final positions = _generateBeanPositions();

    // 欠点豆のインデックスをランダムに選択
    final defectIndices = _generateDefectIndices();

    // 豆を生成
    for (int i = 0; i < game_models.HandpickGameConfig.totalBeans; i++) {
      final isDefect = defectIndices.contains(i);
      final beanType = isDefect
          ? _getRandomDefectType()
          : game_models.CoffeeBeanType.normal;

      final bean = game_models.CoffeeBean(
        id: 'bean_$i',
        type: beanType,
        position: game_models.Vector2(positions[i].x, positions[i].y),
        size: beanType == game_models.CoffeeBeanType.small
            ? const game_models.Vector2(15, 12)
            : const game_models.Vector2(20, 15),
        isDefect: isDefect,
        color: _getBeanColor(beanType),
      );

      _beans.add(bean);

      // 豆コンポーネントを作成
      final beanComponent = CoffeeBeanComponent(
        bean: bean,
        onTap: () => _onBeanTap(bean),
        onSelect: () => _onBeanSelect(bean),
        onBeanRemove: () => _onBeanRemove(bean),
      );

      _beanComponents.add(beanComponent);
      add(beanComponent);
    }

    _updateGameStats();
  }

  List<Vector2> _generateBeanPositions() {
    final positions = <Vector2>[];
    final random = Random();
    final minDistance = game_models.HandpickGameConfig.minDistance;

    // 画面のマージンを考慮した配置エリア
    final margin = 50.0;
    final availableWidth = size.x - margin * 2;
    final availableHeight = size.y - margin * 2 - 200; // UI分を除く（下のUIオーバーレイ分）

    for (int i = 0; i < game_models.HandpickGameConfig.totalBeans; i++) {
      Vector2 position;
      int attempts = 0;
      const maxAttempts = 100;

      do {
        position = Vector2(
          margin + random.nextDouble() * availableWidth,
          margin + random.nextDouble() * availableHeight,
        );
        attempts++;
      } while (_isPositionTooClose(position, positions, minDistance) &&
          attempts < maxAttempts);

      positions.add(position);
    }

    return positions;
  }

  bool _isPositionTooClose(
    Vector2 newPos,
    List<Vector2> existingPos,
    double minDistance,
  ) {
    for (final pos in existingPos) {
      if ((newPos - pos).length < minDistance) {
        return true;
      }
    }
    return false;
  }

  List<int> _generateDefectIndices() {
    final random = Random();
    final indices = <int>{};

    while (indices.length < game_models.HandpickGameConfig.defectBeans) {
      indices.add(random.nextInt(game_models.HandpickGameConfig.totalBeans));
    }

    return indices.toList();
  }

  game_models.CoffeeBeanType _getRandomDefectType() {
    final random = Random();
    final types = game_models.HandpickGameConfig.defectBeanDistribution.keys
        .toList();
    final weights = game_models.HandpickGameConfig.defectBeanDistribution.values
        .toList();

    final totalWeight = weights.reduce((a, b) => a + b);
    final randomValue = random.nextInt(totalWeight);

    int currentWeight = 0;
    for (int i = 0; i < types.length; i++) {
      currentWeight += weights[i];
      if (randomValue < currentWeight) {
        return types[i];
      }
    }

    return game_models.CoffeeBeanType.black; // フォールバック
  }

  Color _getBeanColor(game_models.CoffeeBeanType type) {
    switch (type) {
      case game_models.CoffeeBeanType.normal:
        return const Color(0xFF8B4513); // 茶色
      case game_models.CoffeeBeanType.black:
        return const Color(0xFF2C1810); // 黒っぽい色
      case game_models.CoffeeBeanType.small:
        return const Color(0xFF8B4513); // 茶色（サイズで区別）
      case game_models.CoffeeBeanType.broken:
        return const Color(0xFF654321); // 少し暗い茶色
    }
  }

  void _onBeanTap(game_models.CoffeeBean bean) {
    if (_isGameCompleted || _isShuffling) return;

    // 豆の状態を更新
    if (bean.state == game_models.CoffeeBeanState.normal) {
      bean.select();
    } else if (bean.state == game_models.CoffeeBeanState.selected) {
      bean.remove();
    }

    _updateGameStats();
  }

  void _onBeanSelect(game_models.CoffeeBean bean) {
    // 選択時の処理（必要に応じて）
  }

  void _onBeanRemove(game_models.CoffeeBean bean) {
    if (bean.isDefect) {
      _correctRemoved++;
    } else {
      _wrongRemoved++;
    }

    _updateGameStats();
  }

  void _onShuffle() {
    if (_isShuffling || _isGameCompleted) return;

    _isShuffling = true;
    _shuffleBeans();
  }

  Future<void> _shuffleBeans() async {
    // 豆の位置を再生成
    final newPositions = _generateBeanPositions();

    // アニメーション付きで位置を更新
    for (int i = 0; i < _beanComponents.length; i++) {
      final component = _beanComponents[i];
      final newPosition = newPositions[i];

      component.add(
        MoveEffect.to(
          newPosition,
          EffectController(duration: 0.5, curve: Curves.easeInOut),
        ),
      );
    }

    // アニメーション完了を待つ
    await Future.delayed(const Duration(milliseconds: 500));
    _isShuffling = false;
  }

  void _onComplete() {
    if (_isGameCompleted) return;

    _isGameCompleted = true;
    _calculateFinalStats();

    final result = game_models.HandpickGameResult.fromGameData(
      correctRemoved: _correctRemoved,
      wrongRemoved: _wrongRemoved,
      missedDefects: _missedDefects,
      timeTaken:
          (game_models.HandpickGameConfig.timeLimitSeconds -
                  (_uiOverlay?.timeRemaining ?? 0))
              .round(),
    );

    onGameComplete?.call(result);
  }

  void _onPause() {
    onGamePause?.call();
  }

  void _updateGameStats() {
    // 除去された豆の数をカウント
    final removedCount = _beans.where((bean) => bean.isRemoved).length;
    _uiOverlay?.updateRemovedCount(removedCount);

    // 残りの欠点豆をカウント
    _missedDefects = _beans
        .where((bean) => bean.isDefect && !bean.isRemoved)
        .length;
  }

  void _calculateFinalStats() {
    _missedDefects = _beans
        .where((bean) => bean.isDefect && !bean.isRemoved)
        .length;
  }

  /// ゲームを開始
  void startGame() {
    _isGameStarted = true;
    _isGameCompleted = false;
    _correctRemoved = 0;
    _wrongRemoved = 0;
    _missedDefects = 0;

    _uiOverlay?.startGame();
  }

  /// ゲームをリセット
  void resetGame() {
    _isGameStarted = false;
    _isGameCompleted = false;
    _isShuffling = false;
    _correctRemoved = 0;
    _wrongRemoved = 0;
    _missedDefects = 0;

    // 豆をリセット
    for (final bean in _beans) {
      bean.state = game_models.CoffeeBeanState.normal;
    }

    for (final component in _beanComponents) {
      component.resetBean();
    }

    _uiOverlay?.resetUI();
  }

  /// ゲームを一時停止
  void pauseGame() {
    _uiOverlay?.stopGame();
  }

  /// ゲームを再開
  void resumeGame() {
    _uiOverlay?.startGame();
  }

  /// ゲームが開始されているか
  bool get isGameStarted => _isGameStarted;

  /// ゲームが完了しているか
  bool get isGameCompleted => _isGameCompleted;

  /// シャッフル中か
  bool get isShuffling => _isShuffling;

  /// 現在の豆のリスト
  List<game_models.CoffeeBean> get beans => List.unmodifiable(_beans);

  /// 除去された豆の数
  int get removedCount => _beans.where((bean) => bean.isRemoved).length;

  /// 正しく除去された欠点豆の数
  int get correctRemoved => _correctRemoved;

  /// 誤って除去された正常豆の数
  int get wrongRemoved => _wrongRemoved;

  /// 残った欠点豆の数
  int get missedDefects => _missedDefects;

  void handleTap(Vector2 tapPosition) {
    // UIオーバーレイのタップ処理
    if (_uiOverlay?.handleTap(tapPosition) == true) {
      return;
    }

    // 豆のタップ処理
    for (final beanComponent in _beanComponents) {
      if (beanComponent.handleTap(tapPosition)) {
        return;
      }
    }
  }
}
