import 'dart:convert';
import 'package:dio/dio.dart';
import '../models/math_object.dart';

/// Rust/Axum バックエンドとの通信レイヤー
class MangaMathApiService {
  final Dio _dio;

  MangaMathApiService({String baseUrl = 'http://localhost:8080'})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 10),
          headers: {'Content-Type': 'application/json'},
        ));

  /// ページ上の全数式オブジェクト取得
  Future<List<MathObject>> fetchMathObjects(String pageId) async {
    final response = await _dio.get('/pages/$pageId/math-objects');
    final List<dynamic> data = response.data as List<dynamic>;
    return data
        .map((e) => MathObject.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// タップイベント送信 → 数式解決済み文字列を受け取る
  Future<TapResponse> tapObject(
    String objectId, {
    Map<String, dynamic>? extraParams,
  }) async {
    final response = await _dio.post(
      '/math-objects/$objectId/tap',
      data: jsonEncode(extraParams),
    );
    return TapResponse.fromJson(response.data as Map<String, dynamic>);
  }

  /// 数式オブジェクトを新規作成（管理画面用）
  Future<MathObject> createMathObject({
    required String pageId,
    required String formulaTemplate,
    required double x,
    required double y,
    String? apiEndpoint,
    Map<String, dynamic>? apiParams,
    String? unit,
    String? label,
  }) async {
    final response = await _dio.post('/math-objects', data: {
      'page_id': pageId,
      'formula_template': formulaTemplate,
      'x': x,
      'y': y,
      'api_endpoint': apiEndpoint,
      'api_params': apiParams,
      'unit': unit,
      'label': label,
    });
    return MathObject.fromJson(response.data as Map<String, dynamic>);
  }

  /// ドラッグ後の座標更新
  Future<MathObject> updatePosition(
    String objectId, {
    required double x,
    required double y,
  }) async {
    final response = await _dio.patch(
      '/math-objects/$objectId',
      data: {'x': x, 'y': y},
    );
    return MathObject.fromJson(response.data as Map<String, dynamic>);
  }
}
