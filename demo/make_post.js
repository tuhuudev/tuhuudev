// Tạo infographic từ dữ liệu thật: vcb.xml (Vietcombank) + xau.json (gold-api.com)
const fs = require('fs');
const { chromium } = require('playwright');

const xml = fs.readFileSync('vcb.xml', 'utf8');
const xau = JSON.parse(fs.readFileSync('xau.json', 'utf8'));
const vcbTime = xml.match(/<DateTime>(.*?)<\/DateTime>/)[1];
const num = s => parseFloat(s.replace(/,/g, ''));
const rate = code => {
  const m = xml.match(new RegExp(`CurrencyCode="${code}"[^>]*Buy="([^"]+)"[^>]*Transfer="([^"]+)"[^>]*Sell="([^"]+)"`));
  return { buy: num(m[1]), sell: num(m[3]) };
};

const OZ_PER_LUONG = 37.5 / 31.1034768;
const usd = rate('USD');
const goldVnd = xau.price * OZ_PER_LUONG * usd.sell;
const fmt = (n, d = 0) => n.toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });

const currencies = [['USD', '🇺🇸', 'Đô la Mỹ'], ['EUR', '🇪🇺', 'Euro'], ['GBP', '🇬🇧', 'Bảng Anh'],
  ['JPY', '🇯🇵', 'Yên Nhật'], ['CNY', '🇨🇳', 'Nhân dân tệ'], ['SGD', '🇸🇬', 'Đô la Sing'], ['KRW', '🇰🇷', 'Won Hàn']];
const rows = currencies.map(([c, f, n]) => {
  const r = rate(c), d = r.buy < 100 ? 2 : 0;
  return `<tr><td><b>${c}</b><span>${n}</span></td><td>${fmt(r.buy, d)}</td><td>${fmt(r.sell, d)}</td></tr>`;
}).join('');

const [m, dd, y] = vcbTime.split(' ')[0].split('/');
const dateVi = `${dd.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1080px;height:1350px;font-family:'DejaVu Sans',sans-serif;color:#f4efe6;
 background:radial-gradient(circle at 85% 8%,#3a2f12 0,#14161c 45%,#0d0f13 100%);padding:60px 76px;position:relative}
.tag{display:inline-block;font-size:24px;letter-spacing:4px;color:#d9b45a;border:2px solid #d9b45a;padding:8px 18px;border-radius:40px}
h1{font-size:70px;line-height:1.05;margin:22px 0 8px;font-weight:800}
.date{font-size:30px;color:#a9a39a}
.gold{margin-top:36px;padding:34px 44px;border-radius:28px;
 background:linear-gradient(135deg,#e9c46a 0%,#c9962b 55%,#8a6418 100%);color:#1b1407}
.gold .lbl{font-size:26px;font-weight:700;letter-spacing:1px;opacity:.85}
.gold .big{font-size:96px;font-weight:800;line-height:1.1;margin:6px 0}
.gold .big small{font-size:34px;font-weight:700}
.gold .sub{font-size:25px;opacity:.85}
.gold .row{display:flex;justify-content:space-between;margin-top:22px;padding-top:20px;border-top:2px solid rgba(27,20,7,.25);font-size:28px;font-weight:700}
h2{font-size:30px;margin:38px 0 12px;color:#d9b45a;letter-spacing:1px}
table{width:100%;border-collapse:collapse;font-size:30px}
th{text-align:right;color:#8d877d;font-weight:400;font-size:22px;padding-bottom:10px}
th:first-child{text-align:left}
td{padding:10px 0;border-top:1px solid #2a2d35;text-align:right;font-variant-numeric:tabular-nums}
td:first-child{text-align:left}
td span{font-size:22px;color:#8d877d;margin-left:14px}
.foot{position:absolute;left:76px;right:76px;bottom:40px;font-size:19px;color:#77726a;line-height:1.5}
</style></head><body>
<div class="tag">BẢN TIN THỊ TRƯỜNG</div>
<h1>Vàng &amp; Tỷ giá<br>hôm nay</h1>
<div class="date">${dateVi} · cập nhật ${vcbTime.split(' ').slice(1).join(' ')}</div>
<div class="gold">
 <div class="lbl">VÀNG THẾ GIỚI QUY ĐỔI</div>
 <div class="big">${fmt(goldVnd / 1e6, 1)} <small>triệu đ/lượng</small></div>
 <div class="sub">Tham khảo · chưa gồm thuế, phí, chênh lệch thị trường trong nước</div>
 <div class="row"><span>XAU/USD</span><span>$${fmt(xau.price, 2)}/oz</span></div>
</div>
<h2>TỶ GIÁ VIETCOMBANK</h2>
<table><tr><th>Ngoại tệ</th><th>Mua tiền mặt</th><th>Bán</th></tr>${rows}</table>
<div class="foot">Nguồn: Vietcombank, gold-api.com. Quy đổi: giá XAU × ${fmt(OZ_PER_LUONG, 4)} oz/lượng × tỷ giá USD bán ra VCB.
Thông tin chỉ mang tính tham khảo, không phải khuyến nghị đầu tư.</div>
</body></html>`;

fs.writeFileSync('post.html', html);
fs.writeFileSync('data.json', JSON.stringify({ vcbTime, usd, xau: xau.price, xauUpdated: xau.updatedAt, goldVnd }, null, 1));

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.setContent(html);
  await p.screenshot({ path: 'post.png' });
  await b.close();
  console.log(JSON.stringify({ vcbTime, usdSell: usd.sell, xau: xau.price, goldVnd: Math.round(goldVnd) }));
})();
