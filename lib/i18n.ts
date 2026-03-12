export const locales = ["ja", "en"] as const;
export type Locale = (typeof locales)[number];

type Messages = {
  siteTitle: string;
  siteDescription: string;
  nav: {
    home: string;
    meetingPack: string;
    logs: string;
    ideas: string;
  };
  home: {
    heading: string;
    subheading: string;
    cards: {
      meetingPackTitle: string;
      meetingPackBody: string;
      logsTitle: string;
      logsBody: string;
      ideasTitle: string;
      ideasBody: string;
      roadmapTitle: string;
      roadmapBody: string;
    };
  };
  meetingPack: {
    heading: string;
    body: string;
  };
  logs: {
    heading: string;
    body: string;
    empty: string;
  };
  ideas: {
    heading: string;
    body: string;
  };
};

const dictionaries: Record<Locale, Messages> = {
  ja: {
    siteTitle: "Dr.CANVAS Knowledge Base",
    siteDescription:
      "融資準備、法務メモ、開発ログ、意思決定履歴を蓄積する社内外向けサイト",
    nav: {
      home: "ホーム",
      meetingPack: "面談資料",
      logs: "開発ログ",
      ideas: "日次アイデア",
    },
    home: {
      heading: "Dr.CANVAS 公式ナレッジ基盤（MVP）",
      subheading:
        "多言語公開を前提に、事業計画・法務・開発の記録を一元化します。まずは融資面談に必要な資料を優先して公開可能な形に整理します。",
      cards: {
        meetingPackTitle: "面談資料セット",
        meetingPackBody:
          "岡山支店面談向けのA4資料5枚を保存。事業概要、収益計画、資金使途、権利運用、Q&Aを即参照可能。",
        logsTitle: "開発ログ",
        logsBody:
          "要件、判断理由、変更履歴を時系列で記録。将来の監査・引継ぎ・採用教育に活用可能。",
        ideasTitle: "アイデア入力",
        ideasBody:
          "日々の着想を入力すると、開発ログを自動生成。制作の思考痕跡を資産化。",
        roadmapTitle: "次フェーズ",
        roadmapBody:
          "Notion連携、投稿規約の本実装、多言語UIの翻訳管理、一般公開モードの導入を段階実施。",
      },
    },
    meetingPack: {
      heading: "面談資料（A4 5枚）",
      body: "docs/meeting-pack 配下の資料を印刷し、実績証跡とあわせて持参してください。",
    },
    logs: {
      heading: "開発ログ",
      body: "決定事項を毎日残し、法務・開発・事業の整合を維持します。",
      empty: "まだログがありません。",
    },
    ideas: {
      heading: "日次アイデア入力 → 自動ログ化",
      body: "入力内容はJSONとMarkdownに保存され、開発ログ画面に即反映されます。",
    },
  },
  en: {
    siteTitle: "Dr.CANVAS Knowledge Base",
    siteDescription:
      "A unified hub for funding prep, legal notes, dev logs, and decision history",
    nav: {
      home: "Home",
      meetingPack: "Meeting Pack",
      logs: "Dev Logs",
      ideas: "Daily Ideas",
    },
    home: {
      heading: "Dr.CANVAS Official Knowledge Hub (MVP)",
      subheading:
        "Built for multilingual launch from day one. We centralize planning, legal ops, and product decisions, starting with investor/loan meeting readiness.",
      cards: {
        meetingPackTitle: "Meeting Pack",
        meetingPackBody:
          "A4-ready materials for the loan interview: business summary, revenue model, funding use, legal ops, and Q&A.",
        logsTitle: "Development Logs",
        logsBody:
          "Capture requirements, decisions, and changes over time for onboarding, governance, and scaling.",
        ideasTitle: "Idea Input",
        ideasBody:
          "Capture daily ideas and auto-generate development logs as reusable project assets.",
        roadmapTitle: "Next Phase",
        roadmapBody:
          "Add Notion sync, full policy implementation, translation workflow, and public-facing publishing mode.",
      },
    },
    meetingPack: {
      heading: "Meeting Materials (A4 x5)",
      body: "Print docs under docs/meeting-pack and bring evidence of achievements.",
    },
    logs: {
      heading: "Development Logs",
      body: "Keep daily records to align legal, product, and business operations.",
      empty: "No logs yet.",
    },
    ideas: {
      heading: "Daily idea input → Auto log",
      body: "Your input is stored in JSON and Markdown, then reflected on the logs page immediately.",
    },
  },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}
