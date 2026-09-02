const API_BASE_URL = 'http://localhost:5001/api';

// 取得儲存在瀏覽器的 JWT Token
function getAuthHeaders() {
  const token = localStorage.getItem('cryptoradar_auth_token_v1');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // 1. 取得使用者在雲端的追蹤清單
  async getWatchlist(): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/watchlist`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.watchlist)) {
        return data.data.watchlist.map((item: any) => item.symbol);
      }
      return [];
    } catch (err) {
      console.error('獲取雲端追蹤清單失敗:', err);
      return [];
    }
  },

  // 2. 新增幣種到雲端追蹤清單
  async addToWatchlist(symbol: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/watchlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('加入追蹤清單失敗:', err);
      return false;
    }
  },

  // 3. 從雲端追蹤清單移除幣種
  async removeFromWatchlist(symbol: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/watchlist/${symbol}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('移除追蹤清單失敗:', err);
      return false;
    }
  },

  // 4. 取得即時加密快訊 (從後端獲取)
  async getNews() {
    try {
      const res = await fetch(`${API_BASE_URL}/news`);
      const data = await res.json();
      return data.success ? data.data.news : [];
    } catch (err) {
      console.error('獲取新聞快訊失敗:', err);
      return [];
    }
  },
};
