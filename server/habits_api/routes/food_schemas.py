from pydantic import BaseModel, Field


class FoodLogRequest(BaseModel):
    description: str = Field(min_length=1)
    meal_type: str = "other"


class FoodItemRequest(BaseModel):
    food: str = Field(min_length=1)
    quantity_g: float = Field(gt=0)


class FoodMacrosRequest(BaseModel):
    food: str = Field(min_length=1)
    quantity_g: float = Field(gt=0)
    calories: float = Field(ge=0)
    carbs: float = Field(ge=0)
    protein: float = Field(ge=0)
    fat: float = Field(ge=0)


class FoodUpdateRequest(BaseModel):
    food: str | None = None
    quantity_g: float | None = Field(default=None, gt=0)


class MealPlanLogRequest(BaseModel):
    meal: str = Field(..., min_length=1)
