import 'package:flutter/material.dart';
import 'dart:math' as math;

/// コーヒー豆のタイプ
enum CoffeeBeanType {
  normal,    // 正常豆
  black,     // 黒変豆
  small,     // 小粒豆
  broken,    // 欠け豆
}

/// コーヒー豆の状態
enum CoffeeBeanState {
  normal,    // 通常状態
  selected,  // 選択中
  removed,   // 除去済み
}

/// コーヒー豆のモデル
class CoffeeBean {
  final String id;
  final CoffeeBeanType type;
  final Vector2 position;
  final Vector2 size;
  CoffeeBeanState state;
  final bool isDefect;
  final Color color;
  final double rotation;

  CoffeeBean({
    required this.id,
    required this.type,
    required this.position,
    required this.size,
    this.state = CoffeeBeanState.normal,
    required this.isDefect,
    required this.color,
    this.rotation = 0.0,
  });

  /// 欠点豆かどうか
  bool get isDefectBean => isDefect;

  /// 除去済みかどうか
  bool get isRemoved => state == CoffeeBeanState.removed;

  /// 選択中かどうか
  bool get isSelected => state == CoffeeBeanState.selected;

  /// 豆を選択
  void select() {
    if (state == CoffeeBeanState.normal) {
      state = CoffeeBeanState.selected;
    }
  }

  /// 豆を除去
  void remove() {
    state = CoffeeBeanState.removed;
  }

  /// 選択を解除
  void deselect() {
    if (state == CoffeeBeanState.selected) {
      state = CoffeeBeanState.normal;
    }
  }

  /// 豆の色を取得
  Color getBeanColor() {
    switch (type) {
      case CoffeeBeanType.normal:
        return const Color(0xFF8B4513); // 茶色
      case CoffeeBeanType.black:
        return const Color(0xFF2C1810); // 黒っぽい色
      case CoffeeBeanType.small:
        return const Color(0xFF8B4513); // 茶色（サイズで区別）
      case CoffeeBeanType.broken:
        return const Color(0xFF654321); // 少し暗い茶色
    }
  }

  /// 豆のサイズを取得
  Vector2 getBeanSize() {
    switch (type) {
      case CoffeeBeanType.normal:
        return const Vector2(20, 15); // 標準サイズ
      case CoffeeBeanType.black:
        return const Vector2(20, 15); // 標準サイズ（色で区別）
      case CoffeeBeanType.small:
        return const Vector2(15, 12); // 小さいサイズ
      case CoffeeBeanType.broken:
        return const Vector2(18, 10); // 変形サイズ
    }
  }

  CoffeeBean copyWith({
    String? id,
    CoffeeBeanType? type,
    Vector2? position,
    Vector2? size,
    CoffeeBeanState? state,
    bool? isDefect,
    Color? color,
    double? rotation,
  }) {
    return CoffeeBean(
      id: id ?? this.id,
      type: type ?? this.type,
      position: position ?? this.position,
      size: size ?? this.size,
      state: state ?? this.state,
      isDefect: isDefect ?? this.isDefect,
      color: color ?? this.color,
      rotation: rotation ?? this.rotation,
    );
  }
}

/// ゲーム設定
class HandpickGameConfig {
  static const int totalBeans = 100;
  static const int defectBeans = 10;
  static const int timeLimitSeconds = 60;
  static const double beanSize = 20.0;
  static const double beanHeight = 15.0;
  static const double minDistance = 25.0; // 豆同士の最小距離

  static const Map<CoffeeBeanType, int> defectBeanDistribution = {
    CoffeeBeanType.black: 4,    // 黒変豆4個
    CoffeeBeanType.small: 3,    // 小粒豆3個
    CoffeeBeanType.broken: 3,   // 欠け豆3個
  };
}

/// ゲーム結果
class HandpickGameResult {
  final int score;
  final int accuracy;
  final int timeTaken;
  final int correctRemoved;
  final int wrongRemoved;
  final int missedDefects;
  final int experiencePoints;
  final DateTime completedAt;

  const HandpickGameResult({
    required this.score,
    required this.accuracy,
    required this.timeTaken,
    required this.correctRemoved,
    required this.wrongRemoved,
    required this.missedDefects,
    required this.experiencePoints,
    required this.completedAt,
  });

  /// スコアを計算
  static int calculateScore({
    required int correctRemoved,
    required int wrongRemoved,
    required int missedDefects,
    required int timeTaken,
  }) {
    // 基本スコア計算
    int score = 0;
    score += correctRemoved * 10;  // 正しく除去した欠点豆: +10点/個
    score -= wrongRemoved * 5;     // 誤って除去した正常豆: -5点/個
    score -= missedDefects * 10;   // 残した欠点豆: -10点/個
    
    // 時間ボーナス: (60秒 - 実際の秒数) × 2
    final timeBonus = (HandpickGameConfig.timeLimitSeconds - timeTaken).clamp(0, 60) * 2;
    score += timeBonus;
    
    return score.clamp(0, 100);
  }

  /// 正確度を計算（0-100%）
  static int calculateAccuracy({
    required int correctRemoved,
    required int wrongRemoved,
    required int missedDefects,
  }) {
    final totalDefects = correctRemoved + missedDefects;
    if (totalDefects == 0) return 0;
    
    final accuracy = (correctRemoved / totalDefects * 100).round();
    return accuracy.clamp(0, 100);
  }

  /// 経験値を計算
  static int calculateExperiencePoints({
    required int accuracy,
    required int timeTaken,
  }) {
    // 基本: 50XP + (accuracy * 5)
    // 時間ボーナス: (60 - timeTaken) * 2
    final accuracyBonus = (accuracy * 5).round();
    final timeBonus = (HandpickGameConfig.timeLimitSeconds - timeTaken).clamp(0, 60) * 2;
    final totalXp = 50 + accuracyBonus + timeBonus;
    
    return totalXp.clamp(0, 1000); // 最大1000XP
  }

  /// 結果からHandpickGameResultを作成
  factory HandpickGameResult.fromGameData({
    required int correctRemoved,
    required int wrongRemoved,
    required int missedDefects,
    required int timeTaken,
  }) {
    final score = calculateScore(
      correctRemoved: correctRemoved,
      wrongRemoved: wrongRemoved,
      missedDefects: missedDefects,
      timeTaken: timeTaken,
    );
    
    final accuracy = calculateAccuracy(
      correctRemoved: correctRemoved,
      wrongRemoved: wrongRemoved,
      missedDefects: missedDefects,
    );
    
    final experiencePoints = calculateExperiencePoints(
      accuracy: accuracy,
      timeTaken: timeTaken,
    );

    return HandpickGameResult(
      score: score,
      accuracy: accuracy,
      timeTaken: timeTaken,
      correctRemoved: correctRemoved,
      wrongRemoved: wrongRemoved,
      missedDefects: missedDefects,
      experiencePoints: experiencePoints,
      completedAt: DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'score': score,
      'accuracy': accuracy,
      'timeTaken': timeTaken,
      'correctRemoved': correctRemoved,
      'wrongRemoved': wrongRemoved,
      'missedDefects': missedDefects,
      'experiencePoints': experiencePoints,
      'completedAt': completedAt.toIso8601String(),
    };
  }

  factory HandpickGameResult.fromJson(Map<String, dynamic> json) {
    return HandpickGameResult(
      score: json['score'] ?? 0,
      accuracy: json['accuracy'] ?? 0,
      timeTaken: json['timeTaken'] ?? 0,
      correctRemoved: json['correctRemoved'] ?? 0,
      wrongRemoved: json['wrongRemoved'] ?? 0,
      missedDefects: json['missedDefects'] ?? 0,
      experiencePoints: json['experiencePoints'] ?? 0,
      completedAt: DateTime.parse(json['completedAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

/// 2Dベクトルクラス（FlameのVector2の代替）
class Vector2 {
  final double x;
  final double y;

  const Vector2(this.x, this.y);

  Vector2 operator +(Vector2 other) => Vector2(x + other.x, y + other.y);
  Vector2 operator -(Vector2 other) => Vector2(x - other.x, y - other.y);
  Vector2 operator *(double scalar) => Vector2(x * scalar, y * scalar);
  Vector2 operator /(double scalar) => Vector2(x / scalar, y / scalar);

  double get length => math.sqrt(x * x + y * y);
  Vector2 get normalized => length > 0 ? this / length : const Vector2(0, 0);

  static const Vector2 zero = Vector2(0, 0);

  @override
  String toString() => 'Vector2($x, $y)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Vector2 && runtimeType == other.runtimeType && x == other.x && y == other.y;

  @override
  int get hashCode => x.hashCode ^ y.hashCode;
}
