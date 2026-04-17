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
    sys.exit(1)

# ── Config (TiDB Cloud) ──
DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
DB_PORT = 4000            
DB_USER = "2EEf5pf252AuRRc.root"
DB_PASS = "hx7xCt3MGnlHSw2S"
DB_NAME = "mydiet_nutrition"
CSV_PATH = os.path.join(os.path.dirname(__file__), "数据库表格", "recipes.csv")
DRI_CSV_PATH = os.path.join(os.path.dirname(__file__), "数据库表格", "Dietary_ Reference_Intakes.csv")

def main():
    print(f"Connecting to TiDB Cloud {DB_HOST}:{DB_PORT} ...")
    conn = mysql.connector.connect(
        host=DB_HOST, 
        port=DB_PORT, 
        user=DB_USER, 
        password=DB_PASS,
        ssl_disabled=False
    )
    cursor = conn.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    cursor.execute(f"USE `{DB_NAME}`")

    print("Checking recipes table...")
    cursor.execute("SHOW TABLES LIKE 'recipes'")
    if cursor.fetchone():
        cursor.execute("SELECT COUNT(*) FROM recipes")
        existing = cursor.fetchone()[0]
        if existing > 100000:
            print(f"✅ Awesome! Recipes already imported ({existing} rows). Skipping to save time!")
    
    if os.path.exists(DRI_CSV_PATH):
        print(f"\nImporting dietary references from {DRI_CSV_PATH} ...")
        
        cursor.execute("DROP TABLE IF EXISTS `dietary_references`")
        
        cursor.execute("""
            CREATE TABLE `dietary_references` (
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
        
        def to_float(val):
            if val is None or val == '' or val == 'NA': return None
            try: return float(val)
            except: return None

        def to_str(val):
            if val is None or val == '' or val == 'NA': return None
            return val

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
            print(f"✅ Successfully imported {len(dri_rows)} dietary reference rows.")
            
    conn.close()
    print("\n🎉 ALL DONE! Your database is completely ready!")

if __name__ == '__main__':
    main()
