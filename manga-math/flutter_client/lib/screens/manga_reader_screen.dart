import 'package:flutter/material.dart';
import '../widgets/manga_page_viewer.dart';
import '../services/api_service.dart';

/// マンガリーダー画面
/// - スワイプでページ送り
/// - 各ページに数式オブジェクトをオーバーレイ
class MangaReaderScreen extends StatefulWidget {
  final String mangaId;
  final String mangaTitle;

  const MangaReaderScreen({
    super.key,
    required this.mangaId,
    required this.mangaTitle,
  });

  @override
  State<MangaReaderScreen> createState() => _MangaReaderScreenState();
}

class _MangaReaderScreenState extends State<MangaReaderScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  // デモ用ページデータ（実際はAPIから取得）
  final List<Map<String, String>> _pages = [
    {
      'id': 'page-001',
      'imageUrl': 'https://picsum.photos/seed/manga1/800/1200',
    },
    {
      'id': 'page-002',
      'imageUrl': 'https://picsum.photos/seed/manga2/800/1200',
    },
    {
      'id': 'page-003',
      'imageUrl': 'https://picsum.photos/seed/manga3/800/1200',
    },
  ];

  late final MangaMathApiService _apiService;

  @override
  void initState() {
    super.initState();
    _apiService = MangaMathApiService(
      baseUrl: const String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'http://localhost:8080',
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF12121A),
        title: Text(
          widget.mangaTitle,
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
        actions: [
          Text(
            '${_currentPage + 1} / ${_pages.length}',
            style: const TextStyle(color: Color(0xFF6B7280), fontSize: 13),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: PageView.builder(
        controller: _pageController,
        itemCount: _pages.length,
        onPageChanged: (page) => setState(() => _currentPage = page),
        itemBuilder: (context, index) {
          final page = _pages[index];
          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: MangaPageViewer(
                pageId: page['id']!,
                imageUrl: page['imageUrl']!,
                apiService: _apiService,
              ),
            ),
          );
        },
      ),
      bottomNavigationBar: _buildPageIndicator(),
    );
  }

  Widget _buildPageIndicator() {
    return Container(
      height: 40,
      color: const Color(0xFF12121A),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(_pages.length, (i) {
          return AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.symmetric(horizontal: 4),
            width: i == _currentPage ? 24 : 8,
            height: 8,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: i == _currentPage
                  ? const Color(0xFF7C3AED)
                  : const Color(0xFF2A2A3E),
            ),
          );
        }),
      ),
    );
  }
}
