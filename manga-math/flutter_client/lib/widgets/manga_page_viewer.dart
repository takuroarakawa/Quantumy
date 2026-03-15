import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import '../models/math_object.dart';
import '../services/api_service.dart';

/// マンガページ + 数式オブジェクトのインタラクティブビューア
///
/// ─ 設計思想（ネームの論理） ─────────────────────────────────
/// 1. 背景画像（マンガページ）を LayoutBuilder で可変サイズに対応
/// 2. 数式オブジェクトを相対座標(x, y)で Stack 上に配置
/// 3. タップ → Axum API → KaTeX 文字列返却 → flutter_math_fork でレンダリング
/// 4. ロング押しでドラッグ（管理者モード）
/// ───────────────────────────────────────────────────────────

class MangaPageViewer extends StatefulWidget {
  final String pageId;
  final String imageUrl;
  final MangaMathApiService apiService;
  final bool isAdminMode;

  const MangaPageViewer({
    super.key,
    required this.pageId,
    required this.imageUrl,
    required this.apiService,
    this.isAdminMode = false,
  });

  @override
  State<MangaPageViewer> createState() => _MangaPageViewerState();
}

class _MangaPageViewerState extends State<MangaPageViewer> {
  List<MathObject> _mathObjects = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMathObjects();
  }

  Future<void> _loadMathObjects() async {
    try {
      final objects = await widget.apiService.fetchMathObjects(widget.pageId);
      setState(() {
        _mathObjects = objects;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _handleTap(MathObject object) async {
    // タップ中はローディング表示
    setState(() {
      _mathObjects = _mathObjects.map((o) {
        return o.id == object.id
            ? o.copyWith(resolvedFormula: null) // ローディング中
            : o;
      }).toList();
    });

    try {
      final response = await widget.apiService.tapObject(object.id);

      if (!mounted) return;

      setState(() {
        _mathObjects = _mathObjects.map((o) {
          return o.id == object.id
              ? o.copyWith(
                  resolvedFormula: response.resolvedFormula,
                  currentValue: response.value,
                )
              : o;
        }).toList();
      });

      _showValueSnackbar(response);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('API エラー: $e'),
          backgroundColor: Colors.red[700],
        ),
      );
    }
  }

  void _showValueSnackbar(TapResponse response) {
    final label = response.label ?? '数値';
    final unit = response.unit != null ? ' ${response.unit}' : '';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.functions, color: Colors.white),
            const SizedBox(width: 8),
            Text('$label: ${response.value}$unit'),
          ],
        ),
        backgroundColor: const Color(0xFF7C3AED),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _handleDragEnd(MathObject object, DragEndDetails details, Size pageSize) async {
    if (!widget.isAdminMode) return;

    // ドラッグ後の相対座標を計算（RenderBox から変換）
    final renderBox = context.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    // NOTE: 実装では GestureDetector の onPanUpdate で座標を追跡する
    try {
      final updated = await widget.apiService.updatePosition(
        object.id,
        x: object.x, // ドラッグ後の新座標（実装では追跡済み値）
        y: object.y,
      );
      setState(() {
        _mathObjects = _mathObjects.map((o) => o.id == object.id ? updated : o).toList();
      });
    } catch (e) {
      debugPrint('位置更新エラー: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF7C3AED)),
      );
    }
    if (_error != null) {
      return Center(child: Text('エラー: $_error'));
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final pageWidth = constraints.maxWidth;
        final pageHeight = pageWidth * 1.5; // マンガページのアスペクト比 2:3

        return SizedBox(
          width: pageWidth,
          height: pageHeight,
          child: Stack(
            children: [
              // ─── 背景：マンガページ画像 ───────────────────────
              Positioned.fill(
                child: Image.network(
                  widget.imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: const Color(0xFF1A1A26),
                    child: const Center(
                      child: Icon(Icons.image_not_supported, color: Colors.grey),
                    ),
                  ),
                ),
              ),

              // ─── 数式オブジェクトを座標に配置 ────────────────
              ..._mathObjects.map((obj) {
                return _buildMathObjectWidget(obj, pageWidth, pageHeight);
              }),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMathObjectWidget(MathObject obj, double pageWidth, double pageHeight) {
    final left = obj.x * pageWidth;
    final top = obj.y * pageHeight;
    final width = obj.width * pageWidth;

    return Positioned(
      left: left,
      top: top,
      width: width,
      child: GestureDetector(
        onTap: () => _handleTap(obj),
        onLongPressEnd: widget.isAdminMode
            ? (details) => _handleDragEnd(obj, DragEndDetails(), Size(pageWidth, pageHeight))
            : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.7),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: const Color(0xFF7C3AED).withOpacity(0.8),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF7C3AED).withOpacity(0.3),
                blurRadius: 8,
                spreadRadius: 1,
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: _buildFormulaContent(obj),
        ),
      ),
    );
  }

  Widget _buildFormulaContent(MathObject obj) {
    // タップ前: テンプレート数式を表示（{{value}}はグレーで）
    // タップ後: 解決済み数式を KaTeX レンダリング
    final formulaStr = obj.resolvedFormula ?? _preparaDisplayTemplate(obj.formulaTemplate);
    final isResolved = obj.resolvedFormula != null;

    if (formulaStr.isEmpty) {
      return const SizedBox(
        height: 24,
        child: Center(
          child: SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: Color(0xFFA78BFA),
            ),
          ),
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (obj.label != null)
          Text(
            obj.label!,
            style: const TextStyle(
              color: Color(0xFFA78BFA),
              fontSize: 9,
              fontWeight: FontWeight.w500,
            ),
          ),
        Math.tex(
          formulaStr,
          textStyle: TextStyle(
            fontSize: 14,
            color: isResolved ? Colors.white : Colors.white60,
          ),
        ),
        if (obj.unit != null && isResolved)
          Text(
            '[${obj.unit}]',
            style: const TextStyle(
              color: Color(0xFFF59E0B),
              fontSize: 9,
            ),
          ),
      ],
    );
  }

  /// {{value}} を ??? に置換してテンプレート状態で表示
  String _preparaDisplayTemplate(String template) {
    return template.replaceAll('{{value}}', r'\text{?}');
  }
}
