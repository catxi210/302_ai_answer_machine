export type SEOData = {
  supportLanguages: string[];
  fallbackLanguage: string;
  languages: Record<
    string,
    { title: string; description: string; image: string }
  >;
};

export const SEO_DATA: SEOData = {
  // TODO: Change to your own support languages
  supportLanguages: ["zh", "en", "ja"],
  fallbackLanguage: "en",
  // TODO: Change to your own SEO data
  languages: {
    zh: {
      title: "AI 答题机",
      description: "使用AI进行题目解答",
      image: "/images/global/desc_zh.png",
    },
    en: {
      title: "AI Answer Machine",
      description: "Use AI to solve questions",
      image: "/images/global/desc_en.png",
    },
    ja: {
      title: "AI 解答機",
      description: "AI を使用して問題を解答する",
      image: "/images/global/desc_ja.png",
    },
  },
};
