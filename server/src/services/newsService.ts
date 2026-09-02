import axios from 'axios';
import { prisma } from '../config/prisma';

export interface CryptoNewsItem {
  id: string;
  externalId: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  imageUrl?: string;
  categories: string;
  publishedAt: Date;
}

// 精選即時快訊種子資料
const INITIAL_NEWS_ITEMS = [
  {
    externalId: 'radar-btc-whale-2026',
    title: '⚡ 比特幣突破關鍵阻力位，鏈上數據顯示巨鯨地址累積超 15,000 BTC',
    source: 'CryptoRadar Flash',
    url: 'https://coindesk.com',
    summary: '根據 Glassnode 與 CryptoQuant 鏈上監測，機構資金與長期持有者（Whales）在回調區間持續吸籌，多頭動能穩健。',
    categories: 'BTC|MARKET',
    publishedAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    externalId: 'radar-eth-l2-2026',
    title: '⚡ 以太坊 Layer 2 總鎖倉量 (TVL) 創歷史新高，Gas 費用顯著降低',
    source: 'Blockworks',
    url: 'https://cointelegraph.com',
    summary: 'Layer 2 擴容技術持續演進，Base、Arbitrum 與 Optimism 鏈上手續費降幅超 90%，帶動 DeFi 與鏈遊生態活躍度大幅飆升。',
    categories: 'ETH|LAYER2',
    publishedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    externalId: 'radar-sol-defi-2026',
    title: '⚡ Solana 鏈上去中心化交易所 (DEX) 交易量連續四週突破百億美元',
    source: 'Decrypt',
    url: 'https://decrypt.co',
    summary: 'Solana 生態系在極致 TPS 與低延遲加持下，迷因幣、DeFi 借貸協議手續費收入持續領跑主要公鏈。',
    categories: 'SOL|DEFI',
    publishedAt: new Date(Date.now() - 1000 * 60 * 65),
  },
  {
    externalId: 'radar-ai-crypto-2026',
    title: '⚡ AI Agent 與去中心化算力協議融資額激增，成下階段熱門賽道',
    source: 'The Block',
    url: 'https://theblock.co',
    summary: '多家頂級風投基金（VC）公佈最新投資組合，人工智慧與 Web3 結合的去中心化計算與儲存協議備受市場青睞。',
    categories: 'AI|COMPUTE',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    externalId: 'radar-etf-global-2026',
    title: '⚡ 全球多家主權財富基金與養老金擴大加密現貨 ETF 資產配置比例',
    source: 'Bloomberg Crypto',
    url: 'https://bloomberg.com/crypto',
    summary: '主流傳統金融機構加速納入加密資產作為抗通膨與多元化投資組合的一環，合規流入資金創下季度新高。',
    categories: 'REGULATION|INSTITUTION',
    publishedAt: new Date(Date.now() - 1000 * 60 * 180),
  },
];

let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 快取 2 分鐘

export async function fetchLatestCryptoNews(): Promise<CryptoNewsItem[]> {
  const now = Date.now();

  // 1. 如果資料庫已有新聞且快取未過期，直接從 Supabase 回傳
  if (now - lastFetchTime < CACHE_TTL_MS) {
    try {
      const cached = await prisma.newsItem.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 20,
      });
      if (cached.length > 0) {
        return cached.map(c => ({
          ...c,
          summary: c.summary || '',
          imageUrl: c.imageUrl || undefined,
          categories: c.categories || 'CRYPTO',
        }));
      }
    } catch (e) {
      console.warn('DB 讀取暫時失敗:', (e as Error).message);
    }
  }

  // 2. 嘗試從公開 RSS / 公開端點抓取最新新聞
  try {
    const rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcointelegraph.com%2Frss';
    const response = await axios.get(rssUrl, { timeout: 6000 });

    if (response.data && response.data.items && response.data.items.length > 0) {
      const parsedItems = response.data.items.slice(0, 10).map((it: any) => {
        // 清理 HTML tag
        const cleanSummary = (it.description || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .slice(0, 200) + '...';

        return {
          externalId: it.guid || it.link || `rss-${Date.now()}-${Math.random()}`,
          title: `⚡ ${it.title}`,
          source: 'CoinTelegraph',
          url: it.link,
          summary: cleanSummary,
          imageUrl: it.enclosure?.link || it.thumbnail || undefined,
          categories: (it.categories && it.categories[0]) ? it.categories[0].toUpperCase() : 'MARKET',
          publishedAt: new Date(it.pubDate || Date.now()),
        };
      });

      // 寫入 Supabase 資料庫保存
      for (const item of parsedItems) {
        await prisma.newsItem.upsert({
          where: { externalId: item.externalId },
          create: {
            externalId: item.externalId,
            title: item.title,
            source: item.source,
            url: item.url,
            summary: item.summary,
            imageUrl: item.imageUrl,
            categories: item.categories,
            publishedAt: item.publishedAt,
          },
          update: {
            title: item.title,
            summary: item.summary,
          },
        });
      }

      lastFetchTime = now;
      console.log('✅ 成功從 RSS 抓取新聞並快取至 Supabase news_items 表！');
    }
  } catch (rssErr) {
    console.warn('⚠️ 外部 RSS 抓取失敗，寫入種子快訊至 Supabase:', (rssErr as Error).message);

    // 若外部抓取失敗，將精選快訊寫入 Supabase 保證資料庫有資料
    for (const item of INITIAL_NEWS_ITEMS) {
      try {
        await prisma.newsItem.upsert({
          where: { externalId: item.externalId },
          create: item,
          update: { title: item.title, summary: item.summary },
        });
      } catch {}
    }
    lastFetchTime = now;
  }

  // 3. 從 Supabase 讀取並回傳
  try {
    const finalItems = await prisma.newsItem.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 15,
    });
    return finalItems.map(c => ({
      ...c,
      summary: c.summary || '',
      imageUrl: c.imageUrl || undefined,
      categories: c.categories || 'CRYPTO',
    }));
  } catch {
    return INITIAL_NEWS_ITEMS.map((it, idx) => ({ id: `seed-${idx}`, ...it }));
  }
}
