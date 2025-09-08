import os, re, glob
import pandas as pd
from datetime import datetime, timezone
from clickhouse_connect import get_client

# ใช้ timezone-aware UTC เพื่อตัด DeprecationWarning
SNAPSHOT_TS = datetime.now(timezone.utc)
DATA_DIR = os.path.join(os.getcwd(), 'dataset')
PLATFORM_RE = re.compile(r'([a-z]+)-products\.csv$', re.I)

def to_date_key(dt): return int(dt.strftime('%Y%m%d'))
def norm_curr(x): return (x or 'UNK').strip().upper()[:3]
def avail_flag(x):
    s = str(x or '').lower()
    return 1 if ('in stock' in s or 'available' in s) else 0
def arr_cats(x):
    if isinstance(x, str):
        parts = re.split(r'>|,', x)
        return [p.strip() for p in parts if p.strip()]
    return []

def sk_hash(client, s: str) -> int:
    # surrogate key เร็วๆ จาก cityHash64 แล้วตัดให้เป็น UInt32
    return int(client.query("SELECT cityHash64(%(s)s)", {'s': s}).result_rows[0][0] & 0xFFFFFFFF)

def main():
    client = get_client(host='localhost', port=9000, interface='native', username='default', password='', database='dw')

    date_key = to_date_key(SNAPSHOT_TS)

    seen_platform, seen_seller, seen_product = set(), set(), set()

    def upsert_platform(name: str) -> int:
        if name in seen_platform:
            return sk_hash(client, name)
        key = sk_hash(client, name)
        # ใช้ client.insert แทน command()
        client.insert('dw.dim_platform', [{'platform_key': key, 'platform_name': name}])
        seen_platform.add(name)
        return key

    def upsert_seller(name: str) -> int:
        if not name:
            return 0
        if name in seen_seller:
            return sk_hash(client, name)
        key = sk_hash(client, name)
        client.insert('dw.dim_seller', [{'seller_key': key, 'seller_name': name}])
        seen_seller.add(name)
        return key

    def insert_product_version(row: dict, pid_col: str) -> int:
        product_id_src = str(row.get(pid_col) or '').strip()
        if not product_id_src:
            return None
        prod_key = sk_hash(client, product_id_src)
        if product_id_src not in seen_product:
            client.insert('dw.dim_product', [{
                'product_key': prod_key,
                'product_id_src': product_id_src,
                'title': str(row.get('title') or ''),
                'brand': str(row.get('brand') or ''),
                'categories': arr_cats(row.get('categories')),
                'url': str(row.get('url') or ''),
                'image_url': str(row.get('image_url') or ''),
                'features': str(row.get('features') or ''),
                'valid_from': SNAPSHOT_TS,
                'valid_to': datetime(9999, 12, 31, tzinfo=timezone.utc),
                'is_current': 1
            }])
            seen_product.add(product_id_src)
        return prod_key

    files = glob.glob(os.path.join(DATA_DIR, '*-products.csv'))
    if not files:
        print(f'No CSV files found in {DATA_DIR}')
        return

    for path in files:
        fname = os.path.basename(path)
        m = PLATFORM_RE.search(fname)
        platform = m.group(1).lower() if m else 'unknown'
        pkey = upsert_platform(platform)

        df = pd.read_csv(path)

        pid_col = next((c for c in ['asin','sku','url','title'] if c in df.columns), None)
        if not pid_col:
            print(f"SKIP {fname}: no suitable product id column")
            continue

        # ทำความสะอาด
        if 'currency' in df.columns:
            df['currency'] = df['currency'].map(norm_curr)
        else:
            df['currency'] = 'UNK'
        df['availability_flag'] = df.get('availability').map(avail_flag)

        for col, typ in [('rating', float), ('reviews_count', int), ('images_count', int),
                         ('initial_price', float), ('final_price', float)]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(typ)

        if 'initial_price' in df.columns and 'final_price' in df.columns:
            df['discount_amount'] = (df['initial_price'] - df['final_price']).clip(lower=0)
            # หลีกเลี่ยงหารด้วยศูนย์
            base = df['initial_price'].replace(0, pd.NA)
            df['discount_rate'] = (df['discount_amount'] / base).fillna(0.0)
        else:
            df['discount_amount'] = 0.0
            df['discount_rate'] = 0.0

        fact_rows = []
        for _, r in df.iterrows():
            prod_key = insert_product_version(r, pid_col)
            if prod_key is None:
                continue
            seller_key = upsert_seller(str(r.get('seller_name') or '')) if 'seller_name' in df.columns else 0

            fact_rows.append({
                'date_key': date_key,
                'snapshot_ts': SNAPSHOT_TS,
                'platform_key': pkey,
                'product_key': prod_key,
                'seller_key': seller_key,
                'currency': str(r.get('currency') or 'UNK')[:3],
                'initial_price': float(r.get('initial_price', 0.0)),
                'final_price': float(r.get('final_price', 0.0)),
                'discount_amount': float(r.get('discount_amount', 0.0)),
                'discount_rate': float(r.get('discount_rate', 0.0)),
                'availability_flag': int(r.get('availability_flag', 0)),
                'rating': float(r.get('rating', 0.0)),
                'reviews_count': int(r.get('reviews_count', 0)),
                'images_count': int(r.get('images_count', 0)),
                'delivery': str(r.get('delivery') or '')
            })

        if fact_rows:
            client.insert('dw.fact_product_snapshot', fact_rows)
            print(f"Loaded {len(fact_rows):,} rows from {fname}")

if __name__ == '__main__':
    main()
