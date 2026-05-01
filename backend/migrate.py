"""
Script to migrate the existing TiDB database:
- Adds otp_expires_at column to users table
- Shrinks verification_token column to VARCHAR(10)
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import pymysql

load_dotenv(Path(__file__).parent / ".env")

db_url = os.getenv("TIDB_DATABASE_URL", "")
# Parse the URL manually
# mysql+pymysql://user:pass@host:port/dbname?...
import re
m = re.match(r"mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)", db_url)
if not m:
    print("Could not parse TIDB_DATABASE_URL")
    exit(1)

user, password, host, port, dbname = m.groups()

ssl_opts = {
    'ssl': {
        'verify_cert': True,
        'verify_identity': True,
    }
}

conn = pymysql.connect(
    host=host,
    port=int(port),
    user=user,
    password=password,
    database=dbname,
    ssl_verify_cert=True,
    ssl_verify_identity=True,
)

cursor = conn.cursor()

# Check if column already exists
cursor.execute("SHOW COLUMNS FROM users LIKE 'otp_expires_at'")
exists = cursor.fetchone()

if not exists:
    print("Adding otp_expires_at column to users table...")
    cursor.execute("ALTER TABLE users ADD COLUMN otp_expires_at DATETIME NULL")
    conn.commit()
    print("Done!")
else:
    print("Column otp_expires_at already exists.")

# Shrink verification_token if needed
cursor.execute("SHOW COLUMNS FROM users LIKE 'verification_token'")
col = cursor.fetchone()
print(f"verification_token column: {col}")

cursor.close()
conn.close()
print("Migration complete.")
