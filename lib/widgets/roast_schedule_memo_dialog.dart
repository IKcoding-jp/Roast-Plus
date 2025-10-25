import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:roastplus/models/roast_schedule_models.dart';
import 'package:roastplus/models/theme_settings.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';

class RoastScheduleMemoDialog extends StatefulWidget {
  final RoastScheduleMemo? memo;
  final Function(RoastScheduleMemo) onSave;
  final Function()? onDelete;

  const RoastScheduleMemoDialog({
    super.key,
    this.memo,
    required this.onSave,
    this.onDelete,
  });

  @override
  State<RoastScheduleMemoDialog> createState() =>
      _RoastScheduleMemoDialogState();
}

class _RoastScheduleMemoDialogState extends State<RoastScheduleMemoDialog> {
  final _formKey = GlobalKey<FormState>();
  final _timeController = TextEditingController();
  String? _selectedRoastLevel;
  String? _selectedRoastMachineMode;
  String? _selectedBeanName;
  int? _selectedWeight;
  bool _isAfterPurge = false;
  bool _isRoasterOn = false;
  bool _isRoast = false;
  final _roastCountController = TextEditingController();
  int? _bagCount;

  final List<String> _roastLevels = ['浅煎り', '中煎り', '中深煎り', '深煎り'];
  final List<int> _weightOptions = [200, 300, 500];
  final List<int> _bagOptions = [1, 2];

  final Map<String, String> _beanToMachineMode = {
    // G1
    'ブラジル': 'G1',
    'ジャマイカ': 'G1',
    'ドミニカ': 'G1',
    'ベトナム': 'G1',
    'ハイチ': 'G1',
    // G2
    'ペルー': 'G2',
    'エルサルバドル': 'G2',
    'グアテマラ': 'G2',
    // G3
    'エチオピア': 'G3',
    'コロンビア': 'G3',
    'インドネシア': 'G3',
    'タンザニア': 'G3',
    'ルワンダ': 'G3',
    'マラウイ': 'G3',
    'インド': 'G3',
  };

  List<String> get _beanNames => _beanToMachineMode.keys.toList();

  @override
  void initState() {
    super.initState();
    if (widget.memo != null) {
      _timeController.text = widget.memo!.time;
      _selectedWeight = widget.memo!.weight;
      _selectedRoastLevel = widget.memo!.roastLevel;
      _selectedRoastMachineMode = widget.memo!.roastMachineMode;
      _isAfterPurge = widget.memo!.isAfterPurge;
      _isRoasterOn = widget.memo!.isRoasterOn;
      _isRoast = widget.memo!.isRoast;
      _bagCount = widget.memo!.bagCount;
      if (widget.memo!.roastCount != null) {
        _roastCountController.text = widget.memo!.roastCount.toString();
      }
      // 焙煎機オン時の豆の名前を復元
      if (_isRoasterOn && widget.memo!.beanName != null) {
        _selectedBeanName = widget.memo!.beanName;
      }
    } else {
      _timeController.text = '10:30';
    }
  }

  @override
  void dispose() {
    _timeController.dispose();
    _roastCountController.dispose();
    super.dispose();
  }

  Future<void> _selectTime() async {
    final timeParts = _timeController.text.split(':');
    int hour = 10;
    int minute = 30;

    if (timeParts.length == 2) {
      hour = int.tryParse(timeParts[0]) ?? 10;
      minute = int.tryParse(timeParts[1]) ?? 30;
    }

    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: hour, minute: minute),
      builder: (BuildContext context, Widget? child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _timeController.text =
            '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
      });
    }
  }

  void _saveMemo() {
    if (_formKey.currentState!.validate()) {
      final now = DateTime.now();
      final today = DateTime.now();

      // ロースト選択時の回数をパース
      int? roastCount;
      if (_isRoast && _roastCountController.text.isNotEmpty) {
        roastCount = int.tryParse(_roastCountController.text);
      }

      final memo = RoastScheduleMemo(
        id: widget.memo?.id ?? const Uuid().v4(),
        time: _timeController.text,
        beanName: _isRoasterOn ? _selectedBeanName : null,
        weight: _selectedWeight,
        quantity: null,
        roastLevel: _selectedRoastLevel,
        roastMachineMode: _selectedRoastMachineMode,
        isAfterPurge: _isAfterPurge,
        isRoasterOn: _isRoasterOn,
        isRoast: _isRoast,
        roastCount: roastCount,
        bagCount: _isRoast ? _bagCount : null,
        date: widget.memo?.date ?? today,
        createdAt: widget.memo?.createdAt ?? now,
        updatedAt: now,
      );

      widget.onSave(memo);
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    final fontFamily = themeSettings.fontFamily;

    return Dialog(
      backgroundColor: themeSettings.dialogBackgroundColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: kIsWeb ? 500 : MediaQuery.of(context).size.width * 0.9,
          maxHeight: kIsWeb ? 700 : MediaQuery.of(context).size.height * 0.8,
        ),
        child: DefaultTextStyle.merge(
          style: TextStyle(fontFamily: fontFamily),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // ヘッダー
              Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: themeSettings.appBarColor,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.edit_note,
                      color: themeSettings.appBarTextColor,
                      size: 24,
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        widget.memo == null ? 'メモを追加' : 'メモを編集',
                        style: TextStyle(
                          color: themeSettings.appBarTextColor,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          fontFamily: fontFamily,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.close,
                        color: themeSettings.appBarTextColor,
                      ),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ),
              // フォーム
              Flexible(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(kIsWeb ? 24 : 20),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 時間
                        Text(
                          '時間',
                          style: TextStyle(
                            color: themeSettings.fontColor1,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            fontFamily: fontFamily,
                          ),
                        ),
                        SizedBox(height: 8),
                        GestureDetector(
                          onTap: _selectTime,
                          child: AbsorbPointer(
                            child: TextFormField(
                              controller: _timeController,
                              style: TextStyle(
                                color: themeSettings.fontColor1,
                                fontFamily: fontFamily,
                              ),
                              decoration: InputDecoration(
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                suffixIcon: Icon(Icons.access_time),
                                labelText: '時間を選択',
                                labelStyle: TextStyle(fontFamily: fontFamily),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return '時間を入力してください';
                                }
                                return null;
                              },
                            ),
                          ),
                        ),
                        SizedBox(height: 16),

                        // 焙煎機オンチェックボックス
                        if (!_isRoast) ...[
                          Row(
                            children: [
                              Checkbox(
                                value: _isRoasterOn,
                                onChanged: (value) {
                                  setState(() {
                                    _isRoasterOn = value ?? false;
                                    if (_isRoasterOn) {
                                      _isAfterPurge = false;
                                      _isRoast = false;
                                    }
                                  });
                                },
                              ),
                              Text(
                                '焙煎機オン',
                                style: TextStyle(
                                  color: themeSettings.fontColor1,
                                  fontSize: 16,
                                  fontFamily: fontFamily,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 16),
                        ],

                        // ロースト チェックボックス（焙煎機オン未選択時のみ表示）
                        if (!_isRoasterOn) ...[
                          Row(
                            children: [
                              Checkbox(
                                value: _isRoast,
                                onChanged: (value) {
                                  setState(() {
                                    _isRoast = value ?? false;
                                    if (_isRoast) {
                                      _isRoasterOn = false;
                                      _isAfterPurge = false;
                                    }
                                  });
                                },
                              ),
                              Text(
                                'ロースト',
                                style: TextStyle(
                                  color: themeSettings.fontColor1,
                                  fontSize: 16,
                                  fontFamily: fontFamily,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 16),
                        ],

                        // ロースト選択時の入力欄
                        if (_isRoast) ...[
                          Text(
                            '何回目',
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: fontFamily,
                            ),
                          ),
                          SizedBox(height: 8),
                          TextFormField(
                            controller: _roastCountController,
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontFamily: fontFamily,
                            ),
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              labelText: '回数を入力',
                              labelStyle: TextStyle(fontFamily: fontFamily),
                              hintText: '例: 1, 2, 3',
                              hintStyle: TextStyle(fontFamily: fontFamily),
                            ),
                            validator: (value) {
                              if (_isRoast &&
                                  (value == null || value.isEmpty)) {
                                return '回数を入力してください';
                              }
                              if (_isRoast &&
                                  int.tryParse(value ?? '') == null) {
                                return '数値を入力してください';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: 16),

                          Text(
                            '袋数',
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: fontFamily,
                            ),
                          ),
                          SizedBox(height: 8),
                          DropdownButtonFormField<int>(
                            initialValue: _bagCount,
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontFamily: fontFamily,
                            ),
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              labelText: '袋数を選択',
                              labelStyle: TextStyle(fontFamily: fontFamily),
                            ),
                            items: _bagOptions.map((bagCount) {
                              return DropdownMenuItem(
                                value: bagCount,
                                child: Text(bagCount.toString()),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                _bagCount = value;
                              });
                            },
                            validator: (value) {
                              if (_isRoast && value == null) {
                                return '袋数を選択してください';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: 16),
                        ],

                        // アフターパージチェックボックス（焙煎機オンでない場合のみ表示）
                        if (!_isRoasterOn && !_isRoast) ...[
                          Row(
                            children: [
                              Checkbox(
                                value: _isAfterPurge,
                                onChanged: (value) {
                                  setState(() {
                                    _isAfterPurge = value ?? false;
                                    if (_isAfterPurge) {
                                      _isRoasterOn = false;
                                      _isRoast = false;
                                    }
                                  });
                                },
                              ),
                              Text(
                                'アフターパージ',
                                style: TextStyle(
                                  color: themeSettings.fontColor1,
                                  fontSize: 16,
                                  fontFamily: fontFamily,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 16),
                        ],

                        // 豆の名前（焙煎機オンの場合のみ表示）
                        if (_isRoasterOn) ...[
                          Text(
                            '豆の名前',
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: fontFamily,
                            ),
                          ),
                          SizedBox(height: 8),
                          DropdownButtonFormField<String>(
                            initialValue: _selectedBeanName,
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontFamily: fontFamily,
                            ),
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              labelText: '豆の種類を選択',
                              labelStyle: TextStyle(fontFamily: fontFamily),
                            ),
                            items: _beanNames.map((bean) {
                              return DropdownMenuItem(
                                value: bean,
                                child: Text(bean),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                _selectedBeanName = value;
                                // 豆を選択したらG番号を自動設定
                                if (value != null) {
                                  _selectedRoastMachineMode =
                                      _beanToMachineMode[value];
                                }
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return '豆の名前を選択してください';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: 16),
                        ],

                        // 重さと焙煎度合い（焙煎機オンの場合のみ表示）
                        if (_isRoasterOn) ...[
                          Text(
                            '重さ（g）',
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: fontFamily,
                            ),
                          ),
                          SizedBox(height: 8),
                          DropdownButtonFormField<int>(
                            initialValue: _selectedWeight,
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontFamily: fontFamily,
                            ),
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              labelText: '重さを選択',
                              labelStyle: TextStyle(fontFamily: fontFamily),
                            ),
                            items: _weightOptions.map((weight) {
                              return DropdownMenuItem(
                                value: weight,
                                child: Text(weight.toString()),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                _selectedWeight = value;
                              });
                            },
                            validator: (value) {
                              if (value == null) {
                                return '重さを選択してください';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: 16),

                          // 焙煎度合い
                          Text(
                            '焙煎度合い',
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: fontFamily,
                            ),
                          ),
                          SizedBox(height: 8),
                          DropdownButtonFormField<String>(
                            initialValue: _selectedRoastLevel,
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontFamily: fontFamily,
                            ),
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              labelText: '焙煎度合いを選択',
                              labelStyle: TextStyle(fontFamily: fontFamily),
                            ),
                            items: _roastLevels.map((level) {
                              return DropdownMenuItem(
                                value: level,
                                child: Text(level),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                _selectedRoastLevel = value;
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return '焙煎度合いを選択してください';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: 16),
                        ],

                        // 焙煎機オンまたはアフターパージまたはロースト の情報表示
                        if (_isAfterPurge || _isRoasterOn || _isRoast) ...[
                          // 焙煎機オンまたはアフターパージまたはロースト の場合
                          Container(
                            padding: EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color:
                                  (_isAfterPurge
                                          ? Colors.blue
                                          : _isRoast
                                          ? Colors.brown
                                          : Colors.orange)
                                      .withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color:
                                    (_isAfterPurge
                                            ? Colors.blue
                                            : _isRoast
                                            ? Colors.brown
                                            : Colors.orange)
                                        .withValues(alpha: 0.3),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  _isAfterPurge
                                      ? Icons.ac_unit
                                      : _isRoast
                                      ? Icons.coffee_maker
                                      : Icons.local_fire_department,
                                  color: _isAfterPurge
                                      ? Colors.blue
                                      : _isRoast
                                      ? Colors.brown
                                      : Colors.orange,
                                ),
                                SizedBox(width: 12),
                                Text(
                                  _isAfterPurge
                                      ? 'アフターパージ'
                                      : _isRoast
                                      ? 'ロースト ${_roastCountController.text.isEmpty ? '?' : _roastCountController.text}回目、${_bagCount ?? '?'}袋'
                                      : '焙煎機オン',
                                  style: TextStyle(
                                    color: _isAfterPurge
                                        ? Colors.blue
                                        : _isRoast
                                        ? Colors.brown
                                        : Colors.orange,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: fontFamily,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
              // ボタン
              Container(
                padding: EdgeInsets.all(kIsWeb ? 24 : 20),
                child: Row(
                  children: [
                    if (widget.memo != null && widget.onDelete != null)
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                            widget.onDelete!();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: themeSettings.iconColor,
                            foregroundColor: themeSettings.fontColor2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: Text(
                            '削除',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: fontFamily,
                            ),
                          ),
                        ),
                      ),
                    if (widget.memo != null && widget.onDelete != null)
                      SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _saveMemo,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: themeSettings.appButtonColor,
                          foregroundColor: themeSettings.fontColor2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: Text(
                          '保存',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            fontFamily: fontFamily,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
