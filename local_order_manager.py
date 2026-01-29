# local_order_manager.py
# 로컬 PC/모바일 운영용 스크립트 예시
# 목적: 로컬에서 주문을 간단히 기록/조회/상태변경 하기 위한 SQLite 기반 CLI 도구(플레이스홀더)

import sqlite3
from pathlib import Path
import sys

DB_PATH = Path(__file__).with_name('local_orders.db')

SCHEMA = '''
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    address TEXT,
    qty INTEGER,
    total TEXT,
    status TEXT DEFAULT '접수',
    created_at TEXT DEFAULT (datetime('now'))
);
'''

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()

def add_order(name, phone, address, qty, total):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('INSERT INTO orders (name,phone,address,qty,total) VALUES (?,?,?,?,?)', (name,phone,address,qty,total))
    conn.commit()
    conn.close()
    print('주문 추가 완료')

def list_orders():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('SELECT id,name,phone,qty,status,created_at FROM orders ORDER BY id DESC')
    rows = cur.fetchall()
    conn.close()
    for r in rows:
        print(r)

if __name__ == '__main__':
    init_db()
    # 간단한 CLI: python local_order_manager.py list
    if len(sys.argv) >= 2 and sys.argv[1] == 'list':
        list_orders()
    elif len(sys.argv) >= 6 and sys.argv[1] == 'add':
        _,_,name,phone,address,qty = sys.argv[:6]
        total = ''
        add_order(name,phone,address,int(qty), total)
    else:
        print('Usage:')
        print('  python local_order_manager.py list')
        print('  python local_order_manager.py add "이름" "전화" "주소" qty')
