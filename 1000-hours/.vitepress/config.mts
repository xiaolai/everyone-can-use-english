import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import footnote from "markdown-it-footnote";
import sup from "markdown-it-sup";
import sub from "markdown-it-sub";
import mark from "markdown-it-mark";
import ins from "markdown-it-ins";

// import markdownit from 'markdown-it'

export default withMermaid(
  // https://vitepress.dev/reference/site-config
  defineConfig({
    title: "1000 小时",
    description: "用注意力填满 1000 小时就能练成任何你需要的技能……",
    head: [
      [
        "script",
        {
          async: "",
          src: "https://www.googletagmanager.com/gtag/js?id=G-Z2QZPX3T9W",
        },
      ],
      [
        "script",
        {},
        `window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-Z2QZPX3T9W');`,
      ],
      ["link", { rel: "icon", href: "/images/clock.svg" }],
    ],
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: "Home", link: "/" },
        { text: "Enjoy App", link: "/enjoy-app/", activeMatch: "/enjoy-app/" },
      ],

      search: {
        // provider: 'local'
        provider: "algolia",
        options: {
          appId: "KKK8CORNSR",
          apiKey: "d613ff31a535ff1e9535cf9c88ec420a",
          indexName: "1000h",
        },
      },

      sidebar: {
        "/": [
          // {
          //   text: "简要说明",
          //   collapsed: true,
          //   link: "/intro",
          //   items: [
          //     { text: "1. 要不要健脑？", link: "/why" },
          //     { text: "2. 什么最健脑？", link: "/what" },
          //   ],
          // },
          // {
          //   text: "训练任务",
          //   collapsed: true,
          //   items: [
          //     { text: "1. 启动任务", link: "/training-tasks/kick-off" },
          //     { text: "2. 训练方法", link: "/training-tasks/procedures" },
          //     {
          //       text: "3. 人工智能",
          //       collapsed: false,
          //       link: "/training-tasks/ai",
          //       items: [
          //         {
          //           text: "3.1. 基础语言能力",
          //           link: "/training-tasks/language",
          //         },
          //         {
          //           text: "3.2. 成年人的困境",
          //           link: "/training-tasks/predicaments",
          //         },
          //         {
          //           text: "3.3. 人工智能辅助",
          //           link: "/training-tasks/revolution",
          //         },
          //         { text: "3.4. 任务并不高级", link: "/training-tasks/ground" },
          //         { text: "3.5. 效果非常惊人", link: "/training-tasks/wonder" },
          //       ],
          //     },
          //     { text: "4. 意料之外", link: "/training-tasks/surprise" },
          //   ],
          // },
          {
            text: "语音塑造",
            link: "/sounds-of-american-english/1-basics",
            collapsed: true,
            items: [
              {
                text: "1. 基础",
                collapsed: true,
                link: "/sounds-of-american-english/1-basics",
                items: [
                  {
                    text: "1.1. 字母",
                    link: "/sounds-of-american-english/1.1-alphabet",
                  },
                  {
                    text: "1.2. 音素",
                    link: "/sounds-of-american-english/1.2-phonemes",
                  },
                ],
              },
              {
                text: "2. 发声器官",
                collapsed: true,
                link: "/sounds-of-american-english/2-articulators",
              },
              {
                text: "3. 详解",
                collapsed: true,
                link: "/sounds-of-american-english/3-details",
                items: [
                  {
                    text: "3.1. 元音",
                    link: "/sounds-of-american-english/3.1-vowels",
                    items: [
                      {
                        text: "3.1.1. 口型",
                        link: "/sounds-of-american-english/3.1.1-lips",
                      },
                      {
                        text: "3.1.2. ʌ/ɑ",
                        link: "/sounds-of-american-english/3.1.2-ʌ",
                      },
                      {
                        text: "3.1.3. e/æ",
                        link: "/sounds-of-american-english/3.1.3-e",
                      },
                      {
                        text: "3.1.4. ə/əː",
                        link: "/sounds-of-american-english/3.1.4-ə",
                      },
                      {
                        text: "3.1.5. ɪ/iː",
                        link: "/sounds-of-american-english/3.1.5-i",
                      },
                      {
                        text: "3.1.6. ʊ/uː",
                        link: "/sounds-of-american-english/3.1.6-u",
                      },
                      {
                        text: "3.1.7. ɔ/ɔː",
                        link: "/sounds-of-american-english/3.1.7-ɔ",
                      },
                      {
                        text: "3.1.8. aɪ... əʊ",
                        link: "/sounds-of-american-english/3.1.8-aɪ",
                      },
                    ]
                  },
                  {
                    text: "3.2. 辅音",
                    link: "/sounds-of-american-english/3.2-consonants",
                    items: [
                      {
                        text: "3.2.1. 分类",
                        link: "/sounds-of-american-english/3.2.1-categorization",
                      },
                      {
                        text: "3.2.2. p/b",
                        link: "/sounds-of-american-english/3.2.2-pb",
                      },
                      {
                        text: "3.2.3. t/d",
                        link: "/sounds-of-american-english/3.2.3-td",
                      },
                      {
                        text: "3.2.4. k/g",
                        link: "/sounds-of-american-english/3.2.4-kg",
                      },
                      {
                        text: "3.2.5. f/v",
                        link: "/sounds-of-american-english/3.2.5-fv",
                      },
                      {
                        text: "3.2.6. s/z",
                        link: "/sounds-of-american-english/3.2.6-sz",
                      },
                      {
                        text: "3.2.7. θ/ð",
                        link: "/sounds-of-american-english/3.2.7-θð",
                      },
                      {
                        text: "3.2.8. ʃ/ʒ",
                        link: "/sounds-of-american-english/3.2.8-ʃʒ",
                      },
                      {
                        text: "3.2.9. h",
                        link: "/sounds-of-american-english/3.2.9-h",
                      },
                      {
                        text: "3.2.10. tʃ/dʒ",
                        link: "/sounds-of-american-english/3.2.10-tʃdʒ",
                      },
                      {
                        text: "3.2.11. tr/dr",
                        link: "/sounds-of-american-english/3.2.11-trdr",
                      },
                      {
                        text: "3.2.12. ts/dz",
                        link: "/sounds-of-american-english/3.2.12-tsdz",
                      },
                      {
                        text: "3.2.13. m, n, ŋ",
                        link: "/sounds-of-american-english/3.2.13-mnŋ",
                      },
                      {
                        text: "3.2.14. l, r",
                        link: "/sounds-of-american-english/3.2.14-lr",
                      },
                      {
                        text: "3.2.15. j, w",
                        link: "/sounds-of-american-english/3.2.15-jw",
                      },
                    ]
                  },
                ],
              },
            ],
          },
          // {
          //   text: "语音塑造",
          //   collapsed: true,
          //   items: [
          //     {
          //       text: "1. 基础",
          //       collapsed: true,
          //       link: "/sounds-of-english/01-basics",
          //       items: [
          //         {
          //           text: "1.1. 音素",
          //           collapsed: true,
          //           link: "/sounds-of-english/01-phonemes",
          //           items: [
          //             {
          //               text: "1.1.1. 元音",
          //               link: "/sounds-of-english/01-1-vowels",
          //             },
          //             {
          //               text: "1.1.2. 辅音",
          //               link: "/sounds-of-english/01-2-consonants",
          //             },
          //             {
          //               text: "1.1.3. 美式语音标注",
          //               link: "/sounds-of-english/01-3-us-phonemes",
          //             },
          //             {
          //               text: "1.1.4. 示例",
          //               link: "/sounds-of-english/01-4-pangram",
          //             },
          //           ],
          //         },
          //         {
          //           text: "1.2. 音节",
          //           link: "/sounds-of-english/02-syllables",
          //         },
          //       ],
          //     },
          //     {
          //       text: "2. 详解",
          //       collapsed: true,
          //       link: "/sounds-of-english/03-details",
          //       items: [
          //         {
          //           text: "2.1. 元音",
          //           collapsed: false,
          //           link: "/sounds-of-english/03-vowels-overview",
          //           items: [
          //             {
          //               text: "2.1.1. 口腔内气流共鸣位置",
          //               link: "/sounds-of-english/04-vowel-positions",
          //             },
          //             { text: "2.1.2. ʌ/ɑː", link: "/sounds-of-english/05-Ʌ" },
          //             { text: "2.1.3. e/æ", link: "/sounds-of-english/06-e" },
          //             { text: "2.1.4. ə/əː", link: "/sounds-of-english/07-ə" },
          //             { text: "2.1.5. ɪ/iː", link: "/sounds-of-english/08-i" },
          //             { text: "2.1.6. ʊ/uː", link: "/sounds-of-english/09-u" },
          //             { text: "2.1.7. ɔ/ɔː", link: "/sounds-of-english/10-ɔ" },
          //             {
          //               text: "2.1.8. aɪ, eɪ, ɔɪ, aʊ, əʊ, eə, ɪə, ʊə",
          //               link: "/sounds-of-english/11-aɪ",
          //             },
          //           ],
          //         },
          //         {
          //           text: "2.2. 辅音",
          //           collapsed: false,
          //           link: "/sounds-of-english/12-consonants-overview",
          //           items: [
          //             {
          //               text: "2.2.1. p, b, m, n, f, k, g, h",
          //               link: "/sounds-of-english/13-pbmnfkgh",
          //             },
          //             { text: "2.2.2. f, v", link: "/sounds-of-english/14-fv" },
          //             {
          //               text: "2.2.3. m, n, ŋ",
          //               link: "/sounds-of-english/15-mn",
          //             },
          //             {
          //               text: "2.2.4. t, d, s, z; ʃ, tʃ, dʒ",
          //               link: "/sounds-of-english/16-tdsz",
          //             },
          //             { text: "2.2.5. t, d", link: "/sounds-of-english/17-td" },
          //             {
          //               text: "2.2.6. tr, dr, ts, dz",
          //               link: "/sounds-of-english/18-trdr",
          //             },
          //             {
          //               text: "2.2.7. sp, st, str, sk",
          //               link: "/sounds-of-english/19-sptk",
          //             },
          //             { text: "2.2.8. h", link: "/sounds-of-english/20-h" },
          //             { text: "2.2.9. θ, ð", link: "/sounds-of-english/21-θð" },
          //             { text: "2.2.10. r", link: "/sounds-of-english/22-r" },
          //             { text: "2.2.11. l", link: "/sounds-of-english/23-l" },
          //             { text: "2.2.12. ʒ", link: "/sounds-of-english/24-ʒ" },
          //             {
          //               text: "2.2.13. j, w",
          //               link: "/sounds-of-english/25-jw",
          //             },
          //           ],
          //         },
          //         {
          //           text: "2.3. 连读",
          //           link: "/sounds-of-english/26-catenation",
          //         },
          //         {
          //           text: "2.4. 音标学习",
          //           link: "/sounds-of-english/27-learning-phonetics",
          //         },
          //         {
          //           text: "2.4. 英美口音选择",
          //           link: "/sounds-of-english/28-choosing-accent",
          //         },
          //       ],
          //     },
          //     {
          //       text: "3. 进阶",
          //       collapsed: true,
          //       link: "/sounds-of-english/29-advanced",
          //       items: [
          //         {
          //           text: "3.1 什么更重要？",
          //           link: "/sounds-of-english/30-more-important",
          //         },
          //         { text: "3.2 停顿", link: "/sounds-of-english/31-pause" },
          //         { text: "3.3 高低", link: "/sounds-of-english/32-high-low" },
          //         { text: "3.4 起伏", link: "/sounds-of-english/33-up-down" },
          //         {
          //           text: "3.5 轻重",
          //           link: "/sounds-of-english/34-strong-weak",
          //         },
          //         { text: "3.6 缓急", link: "/sounds-of-english/35-fast-slow" },
          //         {
          //           text: "3.7 长短",
          //           link: "/sounds-of-english/36-long-short",
          //         },
          //       ],
          //     },
          //     {
          //       text: "4. 收官",
          //       collapsed: true,
          //       link: "/sounds-of-english/37-round-up",
          //       items: [
          //         { text: "4.1 流利", link: "/sounds-of-english/38-fluent" },
          //         { text: "4.2 情绪", link: "/sounds-of-english/39-emotional" },
          //       ],
          //     },
          //   ],
          // },
          // {
          //   text: "大脑内部",
          //   collapsed: true,
          //   items: [
          //     { text: "1. 小空间大世界", link: "/in-the-brain/01-inifinite" },
          //     { text: "2. 一切都是连接", link: "/in-the-brain/02-links" },
          //     { text: "3. 一切都是体育课", link: "/in-the-brain/03-sports" },
          //     {
          //       text: "4. 一切都是语文课",
          //       link: "/in-the-brain/04-literature",
          //     },
          //     { text: "5. 一切都需要能量", link: "/in-the-brain/05-energy" },
          //     {
          //       text: "6. 用进废退循环利用",
          //       link: "/in-the-brain/06-use-or-lose",
          //     },
          //     {
          //       text: "7. 短时间内足量重复",
          //       link: "/in-the-brain/07-repitition",
          //     },
          //     {
          //       text: "8. 新旧网络间的竞争",
          //       link: "/in-the-brain/08-compitition",
          //     },
          //     {
          //       text: "9. 注意不到就不存在",
          //       link: "/in-the-brain/09-unnoticed",
          //     },
          //     {
          //       text: "10. 熟练就是卸载负担",
          //       link: "/in-the-brain/10-unloading",
          //     },
          //     { text: "11. 被关注是最大负担", link: "/in-the-brain/11-burden" },
          //     {
          //       text: "12. 有限排它不可再生",
          //       link: "/in-the-brain/12-unreproducible",
          //     },
          //     {
          //       text: "13. 一切都是化学反应",
          //       link: "/in-the-brain/13-chemical",
          //     },
          //     {
          //       text: "14. 安全阈值决定成果",
          //       link: "/in-the-brain/14-threshold",
          //     },
          //   ],
          // },
          // {
          //   text: "自我训练",
          //   collapsed: true,
          //   link: `/self-training/00-intro`,
          //   items: [
          //     { text: "1. 用兵打仗", link: "/self-training/01-fight" },
          //     { text: "2. 只能自学", link: "/self-training/02-last-resort" },
          //     {
          //       text: "3. 生学硬练",
          //       link: "/self-training/03-trials-and-errors",
          //     },
          //     { text: "4. 走出迷宫", link: "/self-training/04-maze" },
          //     { text: "5. 自我纠正", link: "/self-training/05-correction" },
          //     { text: "6. 自主驱动", link: "/self-training/06-motives" },
          //     { text: "7. 自我鼓励", link: "/self-training/07-encouraging" },
          //     { text: "8. 自我监督", link: "/self-training/08-supervising" },
          //     { text: "9. 自主计划", link: "/self-training/09-planning" },
          //     { text: "10. 返璞归真", link: "/self-training/10-going-back" },
          //   ],
          // },
        ],

        // "/enjoy-app/": [
        //   {
        //     text: "快速开始",
        //     collapsed: false,
        //     items: [
        //       { text: "Enjoy 简介", link: "/enjoy-app/" },
        //       { text: "下载安装", link: "/enjoy-app/install" },
        //       { text: "软件设置", link: "/enjoy-app/settings" },
        //     ],
        //   },
        //   {
        //     text: "跟读训练",
        //     collapsed: false,
        //     items: [
        //       { text: "音频资源", link: "/enjoy-app/audios" },
        //       { text: "视频资源", link: "/enjoy-app/videos" },
        //     ],
        //   },
        //   {
        //     text: "阅读文本",
        //     collapsed: false,
        //     items: [
        //       { text: "在线文章", link: "/enjoy-app/webpage" },
        //       { text: "本地电子书", link: "/enjoy-app/ebook" },
        //     ],
        //   },
        //   {
        //     text: "智能助手",
        //     collapsed: false,
        //     items: [
        //       { text: "简介", link: "/enjoy-app/ai-assistant" },
        //       { text: "GPT 服务", link: "/enjoy-app/gpt-conversation" },
        //       { text: "TTS 服务", link: "/enjoy-app/tts-conversation" },
        //     ],
        //   },
        //   {
        //     text: "使用案例",
        //     collapsed: false,
        //     items: [
        //       {
        //         text: "利用 AI 生成训练材料",
        //         link: "/enjoy-app/use-case-generate-audio-resources",
        //       },
        //     ],
        //   },
        // ],
      },

      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/xiaolai/everyone-can-use-english/tree/main/1000-hours",
        },
      ],
    },

    markdown: {
      // https://vitepress.dev/reference/markdown
      math: true,
      config: (md) => {
        // use more markdown-it plugins!
        md.use(footnote);
        md.use(sub);
        md.use(sup);
        md.use(mark);
        md.use(ins);
      },
      // toc: {
      //   level: [2, 3, 4]
      // }
    },
  })
);
