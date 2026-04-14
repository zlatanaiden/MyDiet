"""
MyDiet 数据导入脚本
数据库: mydiet_nutrition
导入内容:
  1. dietary_references  ← Dietary_ Reference_Intakes.csv (20行)
  2. recipes             ← recipes.csv (20000+行，含R格式清洗)
"""

import csv
import json
import re
import os
import mysql.connector
from mysql.connector import Error

# ── 数据库连接配置 ────────────────────────────────────────────
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "11223355",
    "charset": "utf8mb4",
}
DB_NAME = "mydiet_nutrition"

# ── CSV 文件路径 ──────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DRI_CSV     = os.path.join(SCRIPT_DIR, "Dietary_ Reference_Intakes.csv")
RECIPES_CSV = os.path.join(SCRIPT_DIR, "recipes.csv")


# ════════════════════════════════════════════════════════════════
# 工具函数
# ════════════════════════════════════════════════════════════════

def parse_r_vector(s):
    """
    把 R 的 c("a", "b") 或 "single" 转为 Python list[str]。
    返回 None 表示空值/缺失。
    """
    if not s or s.strip() in ("character(0)", "NA", "NULL", ""):
        return None
    s = s.strip()
    # 带 c(...) 包裹
    if s.startswith("c(") and s.endswith(")"):
        inner = s[2:-1]
        matches = re.findall(r'"((?:[^"\\]|\\.)*)"', inner)
        return matches if matches else None
    # 裸字符串（单个值，带引号）
    m = re.match(r'^"(.*)"$', s, re.DOTALL)
    if m:
        return [m.group(1)]
    # 无引号的单个值
    return [s]


def to_json(lst):
    """list → JSON string，None → None（写入 SQL NULL）"""
    return json.dumps(lst, ensure_ascii=False) if lst is not None else None


def first_item(lst):
    """取列表第一个元素，None → None"""
    return lst[0] if lst else None


def to_float(s):
    try:
        return float(s)
    except (TypeError, ValueError):
        return None


def to_int(s):
    try:
        return int(float(s))
    except (TypeError, ValueError):
        return None


def nd_or_float(s):
    """DRI 中 'ND' 表示未设定，返回 None"""
    if s is None or s.strip() in ("ND", "NA", ""):
        return None
    return to_float(s)


# ════════════════════════════════════════════════════════════════
# 建库 & 建表
# ════════════════════════════════════════════════════════════════

CREATE_DB = f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

CREATE_DRI = """
CREATE TABLE IF NOT EXISTS dietary_references (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    category         VARCHAR(50)   COMMENT '年龄阶段，如 Infants / Children / Males',
    gender           VARCHAR(10)   COMMENT 'Both / Male / Female',
    min_age          FLOAT         COMMENT '最小年龄（岁）',
    max_age          FLOAT         COMMENT '最大年龄（岁）',
    age_unit         VARCHAR(20)   COMMENT 'Years / Months',
    protein_g        FLOAT,
    carbohydrate_g   FLOAT,
    fiber_g          FLOAT,
    water_l          FLOAT,
    vit_a_ug         FLOAT,
    vit_c_mg         FLOAT,
    vit_d_ug         FLOAT,
    vit_e_mg         FLOAT,
    vit_k_ug         FLOAT,
    thiamin_mg       FLOAT,
    riboflavin_mg    FLOAT,
    vit_b6_mg        FLOAT,
    vit_b12_ug       FLOAT,
    calcium_mg       FLOAT,
    iron_mg          FLOAT,
    magnesium_mg     FLOAT,
    phosphorus_mg    FLOAT,
    zinc_mg          FLOAT,
    sodium_mg        FLOAT,
    potassium_mg     FLOAT,
    target_calories  FLOAT         COMMENT '目标热量 kcal/天'
) ENGINE=InnoDB;
"""

CREATE_RECIPES = """
CREATE TABLE IF NOT EXISTS recipes (
    id               INT PRIMARY KEY    COMMENT 'Food.com RecipeId',
    name             VARCHAR(255)       NOT NULL,
    author_name      VARCHAR(100),
    cook_time        VARCHAR(30)        COMMENT 'ISO 8601，如 PT25M',
    prep_time        VARCHAR(30),
    total_time       VARCHAR(30),
    date_published   VARCHAR(40),
    description      TEXT,
    image_url        VARCHAR(600)       COMMENT '封面图（第一张）',
    images_json      JSON               COMMENT '全部图片 URL 数组',
    category         VARCHAR(100),
    keywords         JSON,
    ingredients      JSON               COMMENT '食材名称数组',
    quantities       JSON               COMMENT '对应用量数组',
    instructions     JSON               COMMENT '步骤数组',
    calories         FLOAT,
    fat_g            FLOAT,
    saturated_fat_g  FLOAT,
    cholesterol_mg   FLOAT,
    sodium_mg        FLOAT,
    carbohydrate_g   FLOAT,
    fiber_g          FLOAT,
    sugar_g          FLOAT,
    protein_g        FLOAT,
    servings         INT,
    recipe_yield     VARCHAR(100),
    rating           FLOAT,
    review_count     INT
) ENGINE=InnoDB;
"""


# ════════════════════════════════════════════════════════════════
# 导入 DRI
# ════════════════════════════════════════════════════════════════

INSERT_DRI = """
INSERT INTO dietary_references
  (category, gender, min_age, max_age, age_unit,
   protein_g, carbohydrate_g, fiber_g, water_l,
   vit_a_ug, vit_c_mg, vit_d_ug, vit_e_mg, vit_k_ug,
   thiamin_mg, riboflavin_mg, vit_b6_mg, vit_b12_ug,
   calcium_mg, iron_mg, magnesium_mg, phosphorus_mg,
   zinc_mg, sodium_mg, potassium_mg, target_calories)
VALUES (%s,%s,%s,%s,%s, %s,%s,%s,%s, %s,%s,%s,%s,%s,
        %s,%s,%s,%s, %s,%s,%s,%s, %s,%s,%s,%s)
"""

def import_dri(cursor):
    print("── 导入 dietary_references ──")
    cursor.execute("TRUNCATE TABLE dietary_references;")
    count = 0
    with open(DRI_CSV, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            vals = (
                row["Category"],
                row["Gender"],
                to_float(row["Min_Age"]),
                to_float(row["Max_Age"]),
                row["Unit"],
                nd_or_float(row["Protein_g_day"]),
                nd_or_float(row["Carbohydrate_g_day"]),
                nd_or_float(row["Fiber_g_day"]),
                nd_or_float(row["Water_L_day"]),
                nd_or_float(row["Vit_A_ug"]),
                nd_or_float(row["Vit_C_mg"]),
                nd_or_float(row["Vit_D_ug"]),
                nd_or_float(row["Vit_E_mg"]),
                nd_or_float(row["Vit_K_ug"]),
                nd_or_float(row["Thiamin_mg"]),
                nd_or_float(row["Riboflavin_mg"]),
                nd_or_float(row["Vit_B6_mg"]),
                nd_or_float(row["Vit_B12_ug"]),
                nd_or_float(row["Calcium_mg"]),
                nd_or_float(row["Iron_mg"]),
                nd_or_float(row["Magnesium_mg"]),
                nd_or_float(row["Phosphorus_mg"]),
                nd_or_float(row["Zinc_mg"]),
                nd_or_float(row["Sodium_mg"]),
                nd_or_float(row["Potassium_mg"]),
                to_float(row["Target_Calories_kcal"]),
            )
            cursor.execute(INSERT_DRI, vals)
            count += 1
    print(f"   ✓ 导入 {count} 条 DRI 记录")


# ════════════════════════════════════════════════════════════════
# 导入 Recipes
# ════════════════════════════════════════════════════════════════

INSERT_RECIPE = """
INSERT IGNORE INTO recipes
  (id, name, author_name, cook_time, prep_time, total_time,
   date_published, description,
   image_url, images_json,
   category, keywords, ingredients, quantities, instructions,
   calories, fat_g, saturated_fat_g, cholesterol_mg, sodium_mg,
   carbohydrate_g, fiber_g, sugar_g, protein_g,
   servings, recipe_yield, rating, review_count)
VALUES
  (%s,%s,%s,%s,%s,%s, %s,%s, %s,%s, %s,%s,%s,%s,%s,
   %s,%s,%s,%s,%s, %s,%s,%s,%s, %s,%s,%s,%s)
"""

def import_recipes(cursor):
    print("── 导入 recipes（50 MB，请耐心等待）──")
    count = 0
    skip  = 0
    batch = []
    BATCH_SIZE = 500

    with open(RECIPES_CSV, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                recipe_id = to_int(row.get("RecipeId"))
                if recipe_id is None:
                    skip += 1
                    continue

                imgs   = parse_r_vector(row.get("Images", ""))
                kwds   = parse_r_vector(row.get("Keywords", ""))
                ingps  = parse_r_vector(row.get("RecipeIngredientParts", ""))
                ingqs  = parse_r_vector(row.get("RecipeIngredientQuantities", ""))
                instrs = parse_r_vector(row.get("RecipeInstructions", ""))

                vals = (
                    recipe_id,
                    (row.get("Name") or "")[:255],
                    (row.get("AuthorName") or "")[:100],
                    (row.get("CookTime") or "")[:30] or None,
                    (row.get("PrepTime") or "")[:30] or None,
                    (row.get("TotalTime") or "")[:30] or None,
                    (row.get("DatePublished") or "")[:40] or None,
                    row.get("Description") or None,
                    first_item(imgs),       # image_url（封面）
                    to_json(imgs),          # images_json
                    (row.get("RecipeCategory") or "")[:100] or None,
                    to_json(kwds),
                    to_json(ingps),
                    to_json(ingqs),
                    to_json(instrs),
                    to_float(row.get("Calories")),
                    to_float(row.get("FatContent")),
                    to_float(row.get("SaturatedFatContent")),
                    to_float(row.get("CholesterolContent")),
                    to_float(row.get("SodiumContent")),
                    to_float(row.get("CarbohydrateContent")),
                    to_float(row.get("FiberContent")),
                    to_float(row.get("SugarContent")),
                    to_float(row.get("ProteinContent")),
                    to_int(row.get("RecipeServings")),
                    (row.get("RecipeYield") or "")[:100] or None,
                    to_float(row.get("AggregatedRating")),
                    to_int(row.get("ReviewCount")),
                )
                batch.append(vals)

                if len(batch) >= BATCH_SIZE:
                    cursor.executemany(INSERT_RECIPE, batch)
                    count += len(batch)
                    batch.clear()
                    print(f"   已导入 {count} 条...", end="\r")

            except Exception as e:
                skip += 1
                if skip <= 5:
                    print(f"   [跳过] id={row.get('RecipeId','?')} 错误: {e}")

    # 剩余批次
    if batch:
        cursor.executemany(INSERT_RECIPE, batch)
        count += len(batch)

    print(f"\n   ✓ 导入 {count} 条食谱，跳过 {skip} 条")


# ════════════════════════════════════════════════════════════════
# 主流程
# ════════════════════════════════════════════════════════════════

def main():
    try:
        print(f"连接 MySQL root@localhost ...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1. 创建数据库
        cursor.execute(CREATE_DB)
        cursor.execute(f"USE `{DB_NAME}`;")
        print(f"✓ 数据库 [{DB_NAME}] 已就绪")

        # 2. 建表
        cursor.execute(CREATE_DRI)
        cursor.execute(CREATE_RECIPES)
        print("✓ 数据表已创建")

        # 3. 导入 DRI
        import_dri(cursor)
        conn.commit()

        # 4. 导入 Recipes
        import_recipes(cursor)
        conn.commit()

        print("\n🎉 全部完成！")
        print(f"   数据库: {DB_NAME}")
        print(f"   表: dietary_references, recipes")

    except Error as e:
        print(f"❌ 数据库错误: {e}")
    finally:
        if 'cursor' in dir():
            cursor.close()
        if 'conn' in dir() and conn.is_connected():
            conn.close()


if __name__ == "__main__":
    main()
