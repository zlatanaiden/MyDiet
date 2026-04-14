import mysql.connector as mc

c = mc.connect(host='localhost', user='root', password='11223355', database='mydiet_nutrition')
cur = c.cursor()

# Plain-text columns: fix all HTML entities
plain_cols = ['name', 'category']
plain_entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
}

for col in plain_cols:
    for html_ent, char in plain_entities.items():
        sql = f"UPDATE recipes SET `{col}` = REPLACE(`{col}`, %s, %s) WHERE `{col}` LIKE %s"
        cur.execute(sql, (html_ent, char, f'%{html_ent}%'))
        if cur.rowcount > 0:
            print(f"  {col}: replaced '{html_ent}' in {cur.rowcount} rows")

# JSON columns: only fix &amp; (safe for JSON structure)
json_cols = ['ingredients', 'quantities', 'instructions', 'keywords']
for col in json_cols:
    sql = f"UPDATE recipes SET `{col}` = REPLACE(`{col}`, %s, %s) WHERE `{col}` LIKE %s"
    cur.execute(sql, ('&amp;', '&', '%&amp;%'))
    if cur.rowcount > 0:
        print(f"  {col}: replaced '&amp;' in {cur.rowcount} rows")

c.commit()
print("Done!")
c.close()
