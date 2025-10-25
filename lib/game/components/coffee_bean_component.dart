import 'package:flame/components.dart';
import 'package:flame/effects.dart';
import 'package:flutter/material.dart';
import '../../models/handpick_game_models.dart' as game_models;

/// コーヒー豆コンポーネント
class CoffeeBeanComponent extends PositionComponent {
  final game_models.CoffeeBean bean;
  final VoidCallback? onTap;
  final VoidCallback? onSelect;
  final VoidCallback? onBeanRemove;

  bool _isAnimating = false;
  late Paint _paint;
  late Paint _borderPaint;
  late Paint _selectedPaint;
  Sprite? _beanSprite;

  CoffeeBeanComponent({
    required this.bean,
    this.onTap,
    this.onSelect,
    this.onBeanRemove,
  }) : super(
         position: Vector2(bean.position.x, bean.position.y),
         size: Vector2(bean.size.x, bean.size.y),
         anchor: Anchor.center,
       );

  @override
  Future<void> onLoad() async {
    super.onLoad();
    _initializePaints();
    await _loadBeanSprite();
  }

  void _initializePaints() {
    // 豆の色
    _paint = Paint()
      ..color = bean.getBeanColor()
      ..style = PaintingStyle.fill;

    // 境界線
    _borderPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // 選択時の枠線
    _selectedPaint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
  }

  void _updatePaints() {
    // 状態に応じて色を更新
    _paint.color = bean.getBeanColor();

    // 除去済みの場合は半透明
    if (bean.isRemoved) {
      _paint.color = _paint.color.withValues(alpha: 0.3);
    }
  }

  Future<void> _loadBeanSprite() async {
    // 正常な豆のみ画像を使用
    if (bean.type == game_models.CoffeeBeanType.normal) {
      try {
        _beanSprite = await Sprite.load('beans/normal_bean.png');
      } catch (e) {
        print('画像の読み込みに失敗: $e');
        _beanSprite = null;
      }
    }
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);

    // 豆の楕円を描画
    final rect = Rect.fromCenter(
      center: Offset.zero,
      width: size.x,
      height: size.y,
    );

    // 正常な豆は画像を使用、それ以外は楕円図形
    if (bean.type == game_models.CoffeeBeanType.normal && _beanSprite != null) {
      // 画像で豆を描画
      _beanSprite!.render(canvas, size: size, anchor: Anchor.center);
    } else {
      // 楕円図形で豆を描画
      canvas.drawOval(rect, _paint);
      canvas.drawOval(rect, _borderPaint);
    }

    // 選択中の場合は枠線を表示
    if (bean.isSelected) {
      canvas.drawOval(rect, _selectedPaint);
    }

    // 除去済みの場合は半透明
    if (bean.isRemoved) {
      canvas.save();
      canvas.scale(0.3); // 小さく縮小
      if (bean.type == game_models.CoffeeBeanType.normal &&
          _beanSprite != null) {
        // 画像の場合
        _beanSprite!.render(canvas, size: size, anchor: Anchor.center);
      } else {
        // 楕円の場合
        canvas.drawOval(
          rect,
          Paint()..color = Colors.red.withValues(alpha: 0.5),
        );
      }
      canvas.restore();
    }

    // 豆の種類に応じた特徴を描画
    _drawBeanCharacteristics(canvas, rect);
  }

  void _drawBeanCharacteristics(Canvas canvas, Rect rect) {
    switch (bean.type) {
      case game_models.CoffeeBeanType.normal:
        // 正常豆は何も追加しない
        break;
      case game_models.CoffeeBeanType.black:
        // 黒変豆は黒い斑点を描画
        _drawBlackSpots(canvas, rect);
        break;
      case game_models.CoffeeBeanType.small:
        // 小粒豆は小さなサイズ（既にサイズで区別済み）
        break;
      case game_models.CoffeeBeanType.broken:
        // 欠け豆は欠けた部分を描画
        _drawBrokenPart(canvas, rect);
        break;
    }
  }

  void _drawBlackSpots(Canvas canvas, Rect rect) {
    final spotPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.7)
      ..style = PaintingStyle.fill;

    // 2-3個の黒い斑点を描画
    final spots = [
      Offset(
        rect.center.dx - rect.width * 0.2,
        rect.center.dy - rect.height * 0.2,
      ),
      Offset(
        rect.center.dx + rect.width * 0.15,
        rect.center.dy + rect.height * 0.1,
      ),
      Offset(
        rect.center.dx - rect.width * 0.1,
        rect.center.dy + rect.height * 0.2,
      ),
    ];

    for (final spot in spots) {
      canvas.drawCircle(spot, 2.0, spotPaint);
    }
  }

  void _drawBrokenPart(Canvas canvas, Rect rect) {
    final brokenPaint = Paint()
      ..color = Colors.brown.withValues(alpha: 0.8)
      ..style = PaintingStyle.fill;

    // 欠けた部分を描画（不規則な形状）
    final path = Path();
    path.moveTo(rect.left + rect.width * 0.3, rect.top);
    path.lineTo(rect.right - rect.width * 0.1, rect.top + rect.height * 0.2);
    path.lineTo(rect.right, rect.top + rect.height * 0.4);
    path.lineTo(rect.right - rect.width * 0.2, rect.top + rect.height * 0.6);
    path.lineTo(rect.left + rect.width * 0.4, rect.top + rect.height * 0.8);
    path.lineTo(rect.left + rect.width * 0.2, rect.top + rect.height * 0.6);
    path.close();

    canvas.drawPath(path, brokenPaint);
  }

  bool handleTap(Vector2 tapPosition) {
    if (_isAnimating || bean.isRemoved) return false;

    // 豆の位置を考慮したタップ位置の計算
    final localTapPosition = tapPosition - position;

    // タップ位置が豆の範囲内かチェック
    final rect = Rect.fromCenter(
      center: Offset.zero,
      width: size.x,
      height: size.y,
    );

    if (!rect.contains(Offset(localTapPosition.x, localTapPosition.y))) {
      return false;
    }

    // タップアニメーション
    _animateTap();

    // 豆の状態を更新
    if (bean.state == game_models.CoffeeBeanState.normal) {
      bean.select();
      print('豆を選択: ${bean.id}');
      onSelect?.call();
    } else if (bean.state == game_models.CoffeeBeanState.selected) {
      bean.remove();
      print('豆を除去: ${bean.id}');
      onBeanRemove?.call();
    }

    // 状態変更後に再描画を促す
    _updatePaints();

    onTap?.call();
    return true;
  }

  void _animateTap() {
    _isAnimating = true;

    // タップ時のスケールアニメーション
    add(
      ScaleEffect.to(
        Vector2.all(0.9),
        EffectController(duration: 0.1),
        onComplete: () {
          add(
            ScaleEffect.to(
              Vector2.all(1.0),
              EffectController(duration: 0.1),
              onComplete: () {
                _isAnimating = false;
              },
            ),
          );
        },
      ),
    );
  }

  /// 豆の状態を更新
  void updateBeanState() {
    // 状態に応じて色を更新
    _paint.color = bean.getBeanColor();

    // 除去済みの場合は半透明
    if (bean.isRemoved) {
      _paint.color = _paint.color.withValues(alpha: 0.3);
    }
  }

  /// 豆をリセット
  void resetBean() {
    bean.state = game_models.CoffeeBeanState.normal;
    _paint.color = bean.getBeanColor();
    _isAnimating = false;
  }

  /// 豆の位置を更新
  void updatePosition(Vector2 newPosition) {
    position = newPosition;
  }

  /// 豆のサイズを更新
  void updateSize(Vector2 newSize) {
    size = newSize;
  }

  @override
  void update(double dt) {
    super.update(dt);
    updateBeanState();
  }
}
