# Amazon Scraper API Research - Budget $5-10/month

## Current Status
- **Current API**: Scout Amazon Data (RapidAPI)
- **Working**: ✅ Real-time prices, product info, ratings
- **Missing**: Price history, Buy Box winner tracking

## Cost-Effective Options

### 1. Rainforest API (RECOMMENDED)
**Website**: https://www.rainforestapi.com/
**Pricing**: $50/month for 5,000 requests (~$0.01 per request)
**Features**:
- ✅ Real-time Amazon.sa prices
- ✅ Buy Box winner detection
- ✅ Product details, ratings, reviews
- ✅ Search results
- ✅ Category browsing
- ❌ No built-in price history (need to track ourselves)

**Budget Analysis**:
- $50/month = TOO EXPENSIVE for $5-10 budget
- Would need 500 requests/month to stay under $10 = ~16 requests/day
- NOT VIABLE for this budget

### 2. ScrapingDog
**Website**: https://www.scrapingdog.com/
**Pricing**: $20/month for 10,000 requests (~$0.002 per request)
**Features**:
- ✅ Amazon scraping support
- ✅ Real-time data
- ✅ Rotating proxies
- ❌ No structured Amazon API (need to parse HTML)
- ❌ No Buy Box detection built-in
- ❌ No price history

**Budget Analysis**:
- $20/month = STILL TOO EXPENSIVE
- Would need custom HTML parsing
- NOT VIABLE for this budget

### 3. RapidAPI Amazon APIs (CURRENT - BEST FOR BUDGET)
**Current**: Scout Amazon Data
**Pricing**: FREE tier available, paid from $10/month
**Features**:
- ✅ Real-time Amazon.sa prices
- ✅ Product search
- ✅ Product details
- ✅ Ratings and reviews
- ❌ No price history
- ❌ No Buy Box winner

**Budget Analysis**:
- FREE tier: 100 requests/month
- Basic plan: $10/month for 1,000 requests
- FITS BUDGET PERFECTLY

### 4. Alternative RapidAPI Options

#### Real-Time Amazon Data API
**Link**: https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data
**Pricing**:
- Free: 100 requests/month
- Basic: $10/month for 1,000 requests
**Features**:
- ✅ Real-time prices
- ✅ Product details
- ✅ Search results
- ✅ Buy Box winner (available in product details)
- ❌ No price history

#### Amazon Data Scraper v2
**Link**: https://rapidapi.com/restyler/api/amazon-data-scraper127
**Pricing**:
- Free: 100 requests/month
- Basic: $5/month for 500 requests
**Features**:
- ✅ Product details
- ✅ Search results
- ✅ Reviews
- ❌ No price history

## RECOMMENDATION: Hybrid Approach

### Phase 1: Use Current API + Build Price History (FREE)
1. **Keep Scout Amazon Data API** (current)
   - Already working
   - Free tier: 100 requests/month
   - Provides real-time prices

2. **Build Price History Tracking**
   - Store prices in Cloudflare D1 database (FREE)
   - Track price changes daily
   - Build historical data over time
   - Cost: $0 (D1 free tier: 5GB storage, 5M reads/day)

3. **Implementation**:
   ```typescript
   // Store price in D1 when fetching products
   await env.DB.prepare(
     'INSERT INTO price_history (asin, price, timestamp) VALUES (?, ?, ?)'
   ).bind(asin, price, Date.now()).run();

   // Query price history
   const history = await env.DB.prepare(
     'SELECT price, timestamp FROM price_history WHERE asin = ? ORDER BY timestamp DESC LIMIT 30'
   ).bind(asin).all();
   ```

### Phase 2: Upgrade if Needed ($10/month)
If free tier isn't enough:
- Upgrade Scout Amazon Data to Basic: $10/month (1,000 requests)
- Or switch to Real-Time Amazon Data: $10/month (includes Buy Box)

## Buy Box Winner Detection

Most RapidAPI Amazon APIs include Buy Box winner in product details:
```json
{
  "buybox_winner": {
    "seller_name": "Amazon.sa",
    "price": 1999.00,
    "is_prime": true
  }
}
```

Need to check if Scout Amazon Data API provides this field.

## Price History Solution

**Best approach for budget**: Build it ourselves
1. Use Cloudflare D1 (free tier)
2. Store price snapshots daily
3. Query historical data when needed
4. Cost: $0

**Schema**:
```sql
CREATE TABLE price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asin TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  currency TEXT DEFAULT 'SAR',
  timestamp INTEGER NOT NULL,
  INDEX idx_asin_timestamp (asin, timestamp)
);
```

## Final Recommendation

**Stay with current Scout Amazon Data API** because:
1. ✅ Already working
2. ✅ Free tier (100 requests/month)
3. ✅ Real-time prices
4. ✅ Fits $0-10 budget
5. ✅ Can upgrade to $10/month if needed

**Add price history tracking**:
1. Use Cloudflare D1 (free)
2. Store prices daily
3. Build historical data over time

**Total cost**: $0-10/month (within budget)

## Next Steps

1. Check if Scout Amazon Data provides Buy Box winner
2. Implement D1 price history tracking
3. Add price history endpoint to API
4. Test with real data

This approach gives you everything you need within budget!
