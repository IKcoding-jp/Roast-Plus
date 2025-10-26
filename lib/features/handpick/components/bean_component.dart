import 'dart:math';
import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flame/effects.dart';
import 'package:flame/collisions.dart';
import 'package:flutter/material.dart';
import '../models/defect_type.dart';

/// コーヒー豆コンポーネント（画像使用、ランダム位置・角度）
class BeanComponent extends SpriteComponent with TapCallbacks, HasGameRef {
  final bool isDefect;
  final DefectType? defectType;
  final VoidCallback? onTap;
  final VoidCallback? onMiss;
  final Vector2? initialSize; // 初期サイズ（指定があれば使用）

  late double _rotation;

  BeanComponent({
    required this.isDefect,
    this.defectType,
    this.onTap,
    this.onMiss,
    this.initialSize,
    super.position,
  });

  @override
  Future<void> onLoad() async {
    try {
      // 画像を読み込み
      final imagePath = isDefect
          ? (defectType != null
                ? defectType!.imagePath
                : 'beans/bean_defect.png') // フォールバック
          : 'beans/bean_normal.png'; // 通常豆の画像

      sprite = await Sprite.load(imagePath);

      // ランダムな回転角
      final random = Random();
      _rotation = random.nextDouble() * 2 * pi;

      // サイズを設定（指定があれば使用、なければ画像比率からランダム）
      if (initialSize != null) {
        size = initialSize!.clone();
      } else {
        final naturalSize = sprite!.srcSize;
        var aspectRatio = naturalSize.y / naturalSize.x; // height / width

        // 黒豆は細長いため、アスペクト比を1:1に正規化して丸くする
        if (isDefect && defectType == DefectType.black) {
          aspectRatio = 1.0; // 正方形にして丸くする
        }

        final baseWidth = 36 + random.nextDouble() * 4; // 36-40px
        final baseHeight = baseWidth * aspectRatio; // アスペクト比を維持
        size = Vector2(baseWidth, baseHeight);
      }

      // 回転を適用
      angle = _rotation;

      // タップ判定エリアを設定
      add(RectangleHitbox());
    } catch (e) {
      // 画像読み込みに失敗した場合は円で描画
      print('画像読み込みエラー: $e');
      _createFallbackBean();
    }
  }

  void _createFallbackBean() {
    // フォールバック用の円を描画
    final random = Random();
    _rotation = random.nextDouble() * 2 * pi;

    if (initialSize != null) {
      size = initialSize!.clone();
    } else {
      final baseWidth = 40 + random.nextDouble() * 20;
      final baseHeight = 30 + random.nextDouble() * 20;
      size = Vector2(baseWidth, baseHeight);
    }

    angle = _rotation;

    // タップ判定エリアを設定
    add(RectangleHitbox());
  }

  @override
  void render(Canvas canvas) {
    if (sprite == null) {
      _renderFallback(canvas);
    } else {
      // 画像が読み込まれている場合は親クラスのrenderを使用
      super.render(canvas);
    }
  }

  void _renderFallback(Canvas canvas) {
    // フォールバック用の円を描画
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = isDefect ? const Color(0xFF654321) : const Color(0xFF8B4513);

    final rect = Rect.fromLTWH(0, 0, size.x, size.y);
    canvas.drawOval(rect, paint);

    // 欠点豆には小さな点を追加
    if (isDefect) {
      final defectPaint = Paint()
        ..color = Colors.red.shade700
        ..style = PaintingStyle.fill;

      final defectRadius = min(size.x, size.y) * 0.15;
      canvas.drawCircle(
        Offset(size.x * 0.3, size.y * 0.3),
        defectRadius,
        defectPaint,
      );
    }
  }

  @override
  bool onTapDown(TapDownEvent event) {
    if (isDefect) {
      _handleDefectTap();
    } else {
      _handleMissTap();
    }
    return true;
  }

  void _handleDefectTap() {
    // 正解エフェクト：外方向に飛んで消える
    final random = Random();
    final direction = Vector2(
      (random.nextDouble() - 0.5) * 2,
      (random.nextDouble() - 0.5) * 2,
    ).normalized();

    add(MoveByEffect(direction * 200, EffectController(duration: 0.3)));

    add(
      OpacityEffect.fadeOut(
        EffectController(duration: 0.3),
        onComplete: () {
          removeFromParent();
          onTap?.call();
        },
      ),
    );
  }

  void _handleMissTap() {
    // ミスエフェクト：軽くスケールダウンして警告
    add(
      ScaleEffect.by(
        Vector2.all(0.8),
        EffectController(duration: 0.1, reverseDuration: 0.1),
      ),
    );

    // 色を一時的に赤に変更（画像の色調を変更）
  }
}
