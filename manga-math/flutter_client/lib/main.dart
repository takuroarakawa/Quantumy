import 'package:flutter/material.dart';
import 'screens/manga_reader_screen.dart';

void main() {
  runApp(const ElementaryApp());
}

class ElementaryApp extends StatelessWidget {
  const ElementaryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Elementary',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF7C3AED),
          secondary: const Color(0xFFF59E0B),
          surface: const Color(0xFF12121A),
          background: const Color(0xFF0A0A0F),
        ),
        scaffoldBackgroundColor: const Color(0xFF0A0A0F),
        useMaterial3: true,
      ),
      home: const MangaReaderScreen(
        mangaId: 'demo-manga-001',
        mangaTitle: '物理で解く世界の謎',
      ),
    );
  }
}
