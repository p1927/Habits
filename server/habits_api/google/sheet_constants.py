SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
]

# Daily calculation tab layout (from Nutrition.xlsx)
DAILY_LOG_DATA_START_ROW = 3
DAILY_COLS = {"food": "A", "qty": "B", "calories": "C", "carbs": "D", "protein": "E", "fat": "F"}

# Nutritional Data API tab — food DB rows start at 13
FOOD_DB_DATA_START_ROW = 13
FOOD_DB_COLS = {
    "food": "B",
    "ref_qty": "C",
    "ref_grams": "E",
    "calories": "H",
    "carbs": "I",
    "protein": "J",
    "fat": "K",
}
