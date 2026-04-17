"""
MyDiet Recipe CSV Importer
==========================
Imports recipes.csv (165,969 rows) into MySQL database mydiet_nutrition.

Prerequisites:
  - MySQL 8.0 installed and running on localhost:3306
  - Python 3 installed
  - pip install mysql-connector-python

Usage:
  python import_recipes.py

The script will:
  1. Create database mydiet_nutrition if not exists
  2. Create recipes table if not exists
  3. Import all rows from 数据库表格/recipes.csv
"""

import csv
import os
import sys

try:
    import mysql.connector
except ImportError:
    print("ERROR: mysql-connector-python not installed.")
    print("Run:  pip install mysql-connector-python")
    sys.exit(1)

# ── Config (TiDB Cloud) ──
DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
DB_PORT = 4000            
DB_USER = "3sTQ2mBhRjP6pH9.root"
DB_PASS = "VfY5VCClx7lfLqjc"
DB_NAME = "mydiet_nutrition"
CSV_PATH = os.path.join(os.path.dirname(__file__), "数据库表格", "recipes.csv")
DRI_CSV_PATH = os.path.join(os.path.dirname(__file__), "数据库表格", "Dietary_ Reference_Intakes.csv")

def main():
    if not os.path.exists(CSV_PATH):
        print(f"ERROR: CSV file not found at: {CSV_PATH}")
        print("Make sure 数据库表格/recipes.csv exists in the project root.")
        sys.exit(1)

    print(f"Connecting to TiDB Cloud {DB_HOST}:{DB_PORT} ...")
    
    conn = mysql.connector.connect(
        host=DB_HOST, 
        port=DB_PORT, 
        user=DB_USER, 
        password=DB_PASS,
        ssl_disabled=False
    )
    cursor = conn.cursor()
    # Create database
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    cursor.execute(f"USE `{DB_NAME}`")

    # Create table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS `recipes` (
          `id` INT NOT NULL PRIMARY KEY,
          `name` VARCHAR(255) NOT NULL,
          `total_time` VARCHAR(255),
          `image_url` VARCHAR(600),
          `category` VARCHAR(255),
          `keywords` JSON,
          `ingredients` JSON,
          `quantities` JSON,
          `instructions` JSON,
          `calories` FLOAT,
          `fat_g` FLOAT,
          `saturated_fat_g` FLOAT,
          `cholesterol_mg` FLOAT,
          `sodium_mg` FLOAT,
          `carbohydrate_g` FLOAT,
          `fiber_g` FLOAT,
          `sugar_g` FLOAT,
          `protein_g` FLOAT,
          `servings` INT,
          `recipe_yield` VARCHAR(100)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)

    # Check if already imported
    cursor.execute("SELECT COUNT(*) FROM recipes")
    existing = cursor.fetchone()[0]
    if existing > 0:
        print(f"Table already has {existing} rows.")
        answer = input("Drop and re-import? (y/N): ").strip().lower()
        if answer != 'y':
            print("Skipped. Exiting.")
            conn.close()
            return
        cursor.execute("TRUNCATE TABLE recipes")
        print("Table truncated.")

    # Read and insert CSV
    print(f"Reading {CSV_PATH} ...")
    insert_sql = """
        INSERT INTO recipes
        (id, name, total_time, image_url, category, keywords,
         ingredients, quantities, instructions,
         calories, fat_g, saturated_fat_g, cholesterol_mg, sodium_mg,
         carbohydrate_g, fiber_g, sugar_g, protein_g, servings, recipe_yield)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """

    batch = []
    count = 0
    BATCH_SIZE = 1000

    def to_float(val):
        if val is None or val == '' or val == 'NA':
            return None
        return float(val)

    def to_int(val):
        if val is None or val == '' or val == 'NA':
            return None
        return int(float(val))

    def to_str(val):
        if val is None or val == '' or val == 'NA':
            return None
        return val

    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            batch.append((
                int(row['RecipeId']),
                row['Name'],
                to_str(row.get('TotalTime')),
                to_str(row.get('Images')),
                to_str(row.get('RecipeCategory')),
                to_str(row.get('Keywords')),
                to_str(row.get('RecipeIngredientParts')),
                to_str(row.get('RecipeIngredientQuantities')),
                to_str(row.get('RecipeInstructions')),
                to_float(row.get('Calories')),
                to_float(row.get('FatContent')),
                to_float(row.get('SaturatedFatContent')),
                to_float(row.get('CholesterolContent')),
                to_float(row.get('SodiumContent')),
                to_float(row.get('CarbohydrateContent')),
                to_float(row.get('FiberContent')),
                to_float(row.get('SugarContent')),
                to_float(row.get('ProteinContent')),
                to_int(row.get('RecipeServings')),
                to_str(row.get('RecipeYield')),
            ))
            if len(batch) >= BATCH_SIZE:
                cursor.executemany(insert_sql, batch)
                conn.commit()
                count += len(batch)
                print(f"  Inserted {count} rows ...", end='\r')
                batch = []

    if batch:
        cursor.executemany(insert_sql, batch)
        conn.commit()
        count += len(batch)

    print(f"\nDone! Imported {count} recipes into mydiet_nutrition.recipes")

    # ── Import dietary_references ──
    if os.path.exists(DRI_CSV_PATH):
        print(f"\nImporting dietary references from {DRI_CSV_PATH} ...")
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `dietary_references` (
              `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              `category` VARCHAR(255),
              `gender` VARCHAR(255),
              `min_age` FLOAT,
              `max_age` FLOAT,
              `age_unit` VARCHAR(255),
              `protein_g` FLOAT,
              `carbohydrate_g` FLOAT,
              `fiber_g` FLOAT,
              `water_l` FLOAT,
              `vit_a_ug` FLOAT,
              `vit_c_mg` FLOAT,
              `vit_d_ug` FLOAT,
              `vit_e_mg` FLOAT,
              `vit_k_ug` FLOAT,
              `thiamin_mg` FLOAT,
              `riboflavin_mg` FLOAT,
              `vit_b6_mg` FLOAT,
              `vit_b12_ug` FLOAT,
              `calcium_mg` FLOAT,
              `iron_mg` FLOAT,
              `magnesium_mg` FLOAT,
              `phosphorus_mg` FLOAT,
              `zinc_mg` FLOAT,
              `sodium_mg` FLOAT,
              `potassium_mg` FLOAT,
              `target_calories` FLOAT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        cursor.execute("SELECT COUNT(*) FROM dietary_references")
        dri_existing = cursor.fetchone()[0]
        if dri_existing > 0:
            print(f"  dietary_references already has {dri_existing} rows, skipping.")
        else:
            dri_sql = """
                INSERT INTO dietary_references
                (category, gender, min_age, max_age, age_unit,
                 protein_g, carbohydrate_g, fiber_g, water_l,
                 vit_a_ug, vit_c_mg, vit_d_ug, vit_e_mg, vit_k_ug,
                 thiamin_mg, riboflavin_mg, vit_b6_mg, vit_b12_ug,
                 calcium_mg, iron_mg, magnesium_mg, phosphorus_mg,
                 zinc_mg, sodium_mg, potassium_mg, target_calories)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """
            with open(DRI_CSV_PATH, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                dri_rows = []
                for row in reader:
                    dri_rows.append((
                        to_str(row.get('Category')),
                        to_str(row.get('Gender')),
                        to_float(row.get('Min_Age')),
                        to_float(row.get('Max_Age')),
                        to_str(row.get('Unit')),
                        to_float(row.get('Protein_g_day')),
                        to_float(row.get('Carbohydrate_g_day')),
                        to_float(row.get('Fiber_g_day')),
                        to_float(row.get('Water_L_day')),
                        to_float(row.get('Vit_A_ug')),
                        to_float(row.get('Vit_C_mg')),
                        to_float(row.get('Vit_D_ug')),
                        to_float(row.get('Vit_E_mg')),
                        to_float(row.get('Vit_K_ug')),
                        to_float(row.get('Thiamin_mg')),
                        to_float(row.get('Riboflavin_mg')),
                        to_float(row.get('Vit_B6_mg')),
                        to_float(row.get('Vit_B12_ug')),
                        to_float(row.get('Calcium_mg')),
                        to_float(row.get('Iron_mg')),
                        to_float(row.get('Magnesium_mg')),
                        to_float(row.get('Phosphorus_mg')),
                        to_float(row.get('Zinc_mg')),
                        to_float(row.get('Sodium_mg')),
                        to_float(row.get('Potassium_mg')),
                        to_float(row.get('Target_Calories_kcal')),
                    ))
                cursor.executemany(dri_sql, dri_rows)
                conn.commit()
                print(f"  Imported {len(dri_rows)} dietary reference rows.")
        cursor.close()
    else:
        print(f"\nWARNING: DRI CSV not found at {DRI_CSV_PATH}, skipping dietary_references import.")

    conn.close()

if __name__ == '__main__':
    main()
