import 'package:freezed_annotation/freezed_annotation.dart';

part 'math_object.freezed.dart';
part 'math_object.g.dart';

/// マンガページ上の数式オブジェクト（サーバーモデルと1:1対応）
@freezed
class MathObject with _$MathObject {
  const factory MathObject({
    required String id,
    required String pageId,

    /// KaTeX テンプレート文字列（例: `E = {{value}} \, \text{J}`）
    required String formulaTemplate,

    /// ページ幅に対する相対X座標 (0.0–1.0)
    required double x,

    /// ページ高に対する相対Y座標 (0.0–1.0)
    required double y,

    @Default(0.2) double width,
    @Default(0.05) double height,

    String? apiEndpoint,
    Map<String, dynamic>? apiParams,

    /// 最後に取得した数値
    double? currentValue,

    /// 解決済み KaTeX 文字列（タップ後に更新）
    String? resolvedFormula,

    String? unit,
    String? label,
  }) = _MathObject;

  factory MathObject.fromJson(Map<String, dynamic> json) =>
      _$MathObjectFromJson(json);
}

/// タップ後にサーバーから返ってくるレスポンス
@freezed
class TapResponse with _$TapResponse {
  const factory TapResponse({
    required String objectId,

    /// {{value}} が数値で置換された KaTeX 文字列
    required String resolvedFormula,

    required double value,
    String? unit,
    String? label,
    Map<String, dynamic>? rawApiResponse,
  }) = _TapResponse;

  factory TapResponse.fromJson(Map<String, dynamic> json) =>
      _$TapResponseFromJson(json);
}
