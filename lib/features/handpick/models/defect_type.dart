/// コーヒー豆の欠陥タイプを定義する列挙型
enum DefectType {
  /// 正常な豆
  normal,

  /// カビ豆
  moldy,

  /// 未熟豆（キヌグナ）
  quaker,

  /// 貝殻豆
  shell,

  /// 破損豆
  broken,

  /// 虫食い豆
  insectDamage,

  /// 発酵豆
  fermented,

  /// 黒豆
  black,

  /// シワ豆
  shriveled,

  /// 浮遊豆
  floater,
}

extension DefectTypeExtension on DefectType {
  /// 欠陥タイプの表示名を取得
  String get displayName {
    switch (this) {
      case DefectType.normal:
        return '正常';
      case DefectType.moldy:
        return 'カビ';
      case DefectType.quaker:
        return '未熟豆';
      case DefectType.shell:
        return '貝殻豆';
      case DefectType.broken:
        return '破損豆';
      case DefectType.insectDamage:
        return '虫食い';
      case DefectType.fermented:
        return '発酵豆';
      case DefectType.black:
        return '黒豆';
      case DefectType.shriveled:
        return 'シワ豆';
      case DefectType.floater:
        return '浮遊豆';
    }
  }

  /// 欠陥タイプの画像パスを取得
  String get imagePath {
    switch (this) {
      case DefectType.normal:
        return 'assets/images/beans/normal.png';
      case DefectType.moldy:
        return 'assets/images/beans/moldy.png';
      case DefectType.quaker:
        return 'assets/images/beans/quaker.png';
      case DefectType.shell:
        return 'assets/images/beans/shell.png';
      case DefectType.broken:
        return 'assets/images/beans/broken.png';
      case DefectType.insectDamage:
        return 'assets/images/beans/insect_damage.png';
      case DefectType.fermented:
        return 'assets/images/beans/fermented.png';
      case DefectType.black:
        return 'assets/images/beans/black.png';
      case DefectType.shriveled:
        return 'assets/images/beans/shriveled.png';
      case DefectType.floater:
        return 'assets/images/beans/floater.png';
    }
  }

  /// 欠陥の重大度（0-10のスケール）
  int get severity {
    switch (this) {
      case DefectType.normal:
        return 0;
      case DefectType.quaker:
        return 1;
      case DefectType.shriveled:
        return 2;
      case DefectType.floater:
        return 3;
      case DefectType.broken:
        return 4;
      case DefectType.shell:
        return 5;
      case DefectType.insectDamage:
        return 6;
      case DefectType.fermented:
        return 7;
      case DefectType.black:
        return 8;
      case DefectType.moldy:
        return 9;
    }
  }

  /// 欠陥豆かどうか
  bool get isDefect => this != DefectType.normal;
}
