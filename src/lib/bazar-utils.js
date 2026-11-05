// Converts English digits (0-9) to Bengali digits (০-৯)
export const toBn = (val) => {
  if (val === undefined || val === null) return '০';
  const map = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  return String(val).replace(/[0-9]/g, (d) => map[d]);
};

// Converts Bengali or English string/object into a real JavaScript number
export const toNum = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object') {
    const candidate =
      val.today ?? val.current ?? val.avg ?? val.average ?? val.price ?? val.value ?? val.amount ?? val.pct ?? val.percent ?? val.min ?? 0;
    return toNum(candidate);
  }
  const bnToEn = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  const clean = String(val)
    .replace(/[০-৯]/g, (d) => bnToEn[d])
    .replace(/[^0-9.-]/g, '');
  return parseFloat(clean) || 0;
};

// Translates English units (kg, litre, dozen, piece) to Bangla units
export const formatUnit = (rawUnit, withPrefix = true) => {
  let u = '';
  if (rawUnit && typeof rawUnit === 'object') {
    u = rawUnit.bn || rawUnit.name || rawUnit.label || rawUnit.en || '';
  } else {
    u = String(rawUnit || '');
  }
  const lower = u.toLowerCase().replace('প্রতি', '').trim();
  let bnUnit = 'কেজি';
  if (lower === 'kg' || lower === 'kilogram' || lower.includes('কেজি')) bnUnit = 'কেজি';
  else if (lower === 'litre' || lower === 'liter' || lower === 'l' || lower.includes('লিটার')) bnUnit = 'লিটার';
  else if (lower === 'dozen' || lower === 'doz' || lower.includes('ডজন')) bnUnit = 'ডজন';
  else if (lower === 'piece' || lower === 'pc' || lower === 'pcs' || lower.includes('পিস') || lower.includes('হালি')) bnUnit = 'পিস';
  else if (lower) bnUnit = lower;

  return withPrefix ? `প্রতি ${bnUnit}` : bnUnit;
};

// Default emoji by category or product name
export const getProductEmoji = (item) => {
  if (typeof item?.emoji === 'string' && item.emoji.trim()) return item.emoji;
  if (typeof item?.icon === 'string' && item.icon.trim() && !item.icon.startsWith('http')) return item.icon;
  const cat = String(item?.categorySlug || item?.category?.slug || item?.category || '').toLowerCase();
  if (cat.includes('chal') || cat.includes('চাল') || cat.includes('rice')) return '🍚';
  if (cat.includes('dal') || cat.includes('ডাল') || cat.includes('lentil')) return '🫘';
  if (cat.includes('tel') || cat.includes('তেল') || cat.includes('oil')) return '🛢️';
  if (cat.includes('shobji') || cat.includes('sobji') || cat.includes('সবজি') || cat.includes('veg')) return '🥬';
  if (cat.includes('mach') || cat.includes('fish') || cat.includes('মাছ')) return '🐟';
  if (cat.includes('mangsho') || cat.includes('meat') || cat.includes('মাংস')) return '🍗';
  if (cat.includes('dim') || cat.includes('dudh') || cat.includes('ডিম') || cat.includes('দুধ')) return '🥚';
  if (cat.includes('moshla') || cat.includes('mosla') || cat.includes('মসলা') || cat.includes('spice')) return '🌶️';
  return '🛒';
};

// Extracts product Bangla name from any API structure
export const getProductName = (item) => {
  if (!item) return 'পণ্য';
  if (typeof item.name === 'object' && item.name !== null) {
    return item.name.bn || item.name.bangla || item.name.title || item.name.en || 'পণ্য';
  }
  return (
    item.nameBn ||
    item.bnName ||
    item.banglaName ||
    item.titleBn ||
    item.name ||
    item.title ||
    item.productName ||
    item.label ||
    'পণ্য'
  );
};

// Extracts numeric price from any API structure
export const getProductPriceNum = (item) => {
  if (!item) return 0;
  const candidates = [
    item.todayPrice,
    item.currentPrice,
    item.latestPrice,
    item.price,
    item.avgPrice,
    item.averagePrice,
    item.priceBn,
    item.rate,
    item.today,
    item.prices?.today,
    item.prices?.avg,
    item.prices?.current,
    item.priceSummary?.avg,
    item.priceSummary?.today,
    item.marketPrices?.[0]?.avgPrice,
    item.marketPrices?.[0]?.price,
    item.markets?.[0]?.avgPrice,
    item.markets?.[0]?.avg,
    item.markets?.[0]?.price,
    item.bazar?.[0]?.avg,
  ];
  for (const c of candidates) {
    const n = toNum(c);
    if (n > 0) return n;
  }
  // Scan any key containing 'price' or 'avg' or 'rate'
  for (const key of Object.keys(item)) {
    if (/price|avg|rate|taka|dam|today/i.test(key)) {
      const n = toNum(item[key]);
      if (n > 0) return n;
    }
  }
  return 65;
};

// Extracts signed percentage change (+ for up, - for down, 0 for flat)
export const getSignedChange = (item) => {
  if (!item) return 0;
  const raw = item.change ?? item.priceChange ?? item.changePercent ?? item.pctChange ?? 0;
  if (raw && typeof raw === 'object') {
    const dir = String(raw.dir || raw.trend || raw.direction || raw.status || '').toLowerCase();
    const num = Math.abs(toNum(raw.pct ?? raw.percent ?? raw.value ?? raw.amount ?? 0));
    if (dir === 'down' || dir === 'fall' || dir === 'decrease' || String(raw.pct || '').includes('-')) {
      return -num;
    }
    if (dir === 'up' || dir === 'rise' || dir === 'increase' || String(raw.pct || '').includes('+')) {
      return num;
    }
    return 0;
  }
  const num = Math.abs(toNum(raw));
  const trend = String(item.trend || item.dir || item.direction || '').toLowerCase();
  if (trend === 'down' || String(raw).includes('-') || String(raw).includes('▼') || (typeof raw === 'number' && raw < 0)) {
    return -num;
  }
  if (trend === 'up' || String(raw).includes('+') || String(raw).includes('▲') || (typeof raw === 'number' && raw > 0)) {
    return num;
  }
  return 0;
};

// Matches category slug smoothly (handles shobji/sobji, moshla/mosla, dim-dudh/dim, etc.)
export const matchesCategorySlug = (item, routeSlug) => {
  if (!item || !routeSlug) return false;
  const rawCat =
    item.categorySlug ||
    item.category?.slug ||
    item.category?.en ||
    item.category?.name ||
    item.categoryName ||
    item.category ||
    '';
  const c = String(rawCat).toLowerCase().trim();
  const s = String(routeSlug).toLowerCase().trim();

  if (c === s) return true;

  const aliases = {
    chal: ['chal', 'chaal', 'rice', 'চাল'],
    dal: ['dal', 'daal', 'lentil', 'lentils', 'ডাল'],
    tel: ['tel', 'oil', 'তেল'],
    shobji: ['shobji', 'sobji', 'sabji', 'vegetable', 'vegetables', 'veg', 'সবজি'],
    mach: ['mach', 'maach', 'fish', 'মাছ'],
    mangsho: ['mangsho', 'mangso', 'meat', 'মাংস'],
    'dim-dudh': ['dim-dudh', 'dim', 'dudh', 'egg', 'milk', 'dairy', 'egg-milk', 'ডিম-দুধ', 'ডিম', 'দুধ'],
    moshla: ['moshla', 'mosla', 'masala', 'spice', 'spices', 'মসলা'],
  };

  const allowed = aliases[s] || [s];
  return allowed.some((alias) => c.includes(alias));
};