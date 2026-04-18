"""
精简 recipes 表：
1. 删除无用列（不影响算法和前端展示）
2. 删除无图片的食谱
"""
import mysql.connector

conn = mysql.connector.connect(
    host="localhost", user="root", password="11223355",
    database="mydiet_nutrition", charset="utf8mb4"
)
cur = conn.cursor()

# ── 1. 统计当前状态 ───────────────────────────────────────────
cur.execute("SELECT COUNT(*) FROM recipes")
total = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM recipes WHERE image_url IS NULL OR image_url = ''")
no_img = cur.fetchone()[0]
print(f"当前总记录: {total}")
print(f"无图片记录（将删除）: {no_img}")
print(f"保留预计: {total - no_img}")

# ── 2. 删除无图片食谱 ─────────────────────────────────────────
print("\n正在删除无图片食谱...")
cur.execute("DELETE FROM recipes WHERE image_url IS NULL OR image_url = ''")
conn.commit()
print(f"  ✓ 已删除 {cur.rowcount} 条")

# ── 3. 删除不需要的列 ─────────────────────────────────────────
drop_cols = [
    "author_name",
    "cook_time",
    "prep_time",
    "date_published",
    "description",
    "rating",
    "review_count",
    "images_json",    # 只保留 image_url（封面第一张）
]
print("\n正在删除多余列...")
for col in drop_cols:
    try:
        cur.execute(f"ALTER TABLE recipes DROP COLUMN `{col}`")
        conn.commit()
        print(f"  ✓ 已删除列: {col}")
    except Exception as e:
        print(f"  ! 跳过 {col}: {e}")

# ── 4. 验证最终状态 ───────────────────────────────────────────
cur.execute("SELECT COUNT(*) FROM recipes")
final = cur.fetchone()[0]
cur.execute("SHOW COLUMNS FROM recipes")
cols = [c[0] for c in cur.fetchall()]
print(f"\n最终记录数: {final}")
print(f"保留列 ({len(cols)}): {', '.join(cols)}")

cur.close()
conn.close()
print("\n✅ 精简完成")
