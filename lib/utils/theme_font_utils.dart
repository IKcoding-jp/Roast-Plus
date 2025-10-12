import 'package:flutter/material.dart';

import '../models/theme_settings.dart';

TextStyle _withFontFamily(
  TextStyle? style,
  TextStyle fallback,
  String fontFamily,
) {
  return (style ?? fallback).copyWith(fontFamily: fontFamily);
}

ButtonStyle _buttonStyleWithFontFamily(
  ButtonStyle? style,
  TextStyle fallback,
  String fontFamily,
) {
  final baseStyle = style ?? const ButtonStyle();
  final resolved = baseStyle.textStyle?.resolve(const <WidgetState>{}) ??
      fallback;
  final updated = resolved.copyWith(fontFamily: fontFamily);
  return baseStyle.copyWith(
    textStyle: WidgetStatePropertyAll<TextStyle>(updated),
  );
}

ThemeData buildThemeWithFontFamily(
  ThemeData baseTheme,
  ThemeSettings themeSettings,
) {
  final fontFamily = themeSettings.fontFamily;

  final textTheme = baseTheme.textTheme.apply(fontFamily: fontFamily);
  final primaryTextTheme =
      baseTheme.primaryTextTheme.apply(fontFamily: fontFamily);

  final fallbackBodyMedium = textTheme.bodyMedium ??
      baseTheme.textTheme.bodyMedium ??
      const TextStyle();
  final fallbackBodySmall = textTheme.bodySmall ??
      baseTheme.textTheme.bodySmall ??
      fallbackBodyMedium;
  final fallbackLabelLarge = textTheme.labelLarge ??
      baseTheme.textTheme.labelLarge ??
      fallbackBodyMedium;
  final fallbackTitleLarge = textTheme.titleLarge ??
      baseTheme.textTheme.titleLarge ??
      fallbackLabelLarge;
  final snackBarTextColor =
      baseTheme.snackBarTheme.contentTextStyle?.color ??
      baseTheme.colorScheme.onPrimary;
  final snackBarBaseStyle =
      baseTheme.snackBarTheme.contentTextStyle ??
      fallbackBodyMedium.copyWith(color: snackBarTextColor);
  final dialogTitleBaseStyle =
      baseTheme.dialogTheme.titleTextStyle ?? fallbackTitleLarge;
  final dialogContentBaseStyle =
      baseTheme.dialogTheme.contentTextStyle ?? fallbackBodyMedium;
  final popupMenuBaseStyle =
      baseTheme.popupMenuTheme.textStyle ?? fallbackBodyMedium;

  final snackBarTheme = baseTheme.snackBarTheme.copyWith(
    contentTextStyle: snackBarBaseStyle.copyWith(fontFamily: fontFamily),
  );

  final dialogTheme = baseTheme.dialogTheme.copyWith(
    titleTextStyle: dialogTitleBaseStyle.copyWith(fontFamily: fontFamily),
    contentTextStyle:
        dialogContentBaseStyle.copyWith(fontFamily: fontFamily),
  );

  final inputDecorationTheme = baseTheme.inputDecorationTheme.copyWith(
    labelStyle: _withFontFamily(
      baseTheme.inputDecorationTheme.labelStyle,
      fallbackBodyMedium,
      fontFamily,
    ),
    hintStyle: _withFontFamily(
      baseTheme.inputDecorationTheme.hintStyle,
      fallbackBodyMedium,
      fontFamily,
    ),
    helperStyle: _withFontFamily(
      baseTheme.inputDecorationTheme.helperStyle,
      fallbackBodySmall,
      fontFamily,
    ),
    errorStyle: _withFontFamily(
      baseTheme.inputDecorationTheme.errorStyle,
      fallbackBodySmall.copyWith(color: baseTheme.colorScheme.error),
      fontFamily,
    ),
    counterStyle: _withFontFamily(
      baseTheme.inputDecorationTheme.counterStyle,
      fallbackBodySmall,
      fontFamily,
    ),
  );

  final popupMenuTheme = baseTheme.popupMenuTheme.copyWith(
    textStyle: popupMenuBaseStyle.copyWith(fontFamily: fontFamily),
  );

  final textButtonTheme = TextButtonThemeData(
    style: _buttonStyleWithFontFamily(
      baseTheme.textButtonTheme.style,
      fallbackLabelLarge,
      fontFamily,
    ),
  );

  final elevatedButtonTheme = ElevatedButtonThemeData(
    style: _buttonStyleWithFontFamily(
      baseTheme.elevatedButtonTheme.style,
      fallbackLabelLarge,
      fontFamily,
    ),
  );

  final outlinedButtonTheme = OutlinedButtonThemeData(
    style: _buttonStyleWithFontFamily(
      baseTheme.outlinedButtonTheme.style,
      fallbackLabelLarge,
      fontFamily,
    ),
  );

  return baseTheme.copyWith(
    textTheme: textTheme,
    primaryTextTheme: primaryTextTheme,
    snackBarTheme: snackBarTheme,
    dialogTheme: dialogTheme,
    inputDecorationTheme: inputDecorationTheme,
    popupMenuTheme: popupMenuTheme,
    textButtonTheme: textButtonTheme,
    elevatedButtonTheme: elevatedButtonTheme,
    outlinedButtonTheme: outlinedButtonTheme,
  );
}
