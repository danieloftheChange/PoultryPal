from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Union
from enum import Enum
import datetime


class BirdType(str, Enum):
    """Enum for different types of poultry"""
    LAYER = "Layer"
    BROILER = "Broiler"
    DUAL_PURPOSE = "Dual Purpose"
    BREEDER = "Breeder"


class ProductionStage(str, Enum):
    """Enum for different production stages"""
    STARTER = "Starter"
    GROWER = "Grower"
    FINISHER = "Finisher"
    LAYER = "Layer"
    PRE_LAY = "Pre-Lay"


class TargetNutrition(str, Enum):
    """Enum for different nutritional targets"""
    HIGH_PROTEIN = "high protein"
    BALANCED = "balanced"
    HIGH_VITAMINS = "high vitamins & minerals"
    HIGH_CALCIUM = "high calcium"
    HIGH_CARBOHYDRATE = "high carbohydrate"


class Ingredient(BaseModel):
    """Model for a feed ingredient"""
    name: str
    available: bool = True
    price_per_kg: float = Field(..., gt=0)
    protein_percentage: float = Field(..., ge=0, le=100)
    energy_kcal_per_kg: float = Field(..., ge=0)
    calcium_percentage: Optional[float] = Field(0, ge=0, le=100)
    phosphorus_percentage: Optional[float] = Field(0, ge=0, le=100)
    fiber_percentage: Optional[float] = Field(0, ge=0, le=100)
    max_inclusion_percentage: Optional[float] = Field(100, ge=0, le=100)
    min_inclusion_percentage: Optional[float] = Field(0, ge=0, le=100)


class NutritionalRequirement(BaseModel):
    """Model for nutritional requirements"""
    min_protein_percentage: float = Field(..., ge=0, le=100)
    max_protein_percentage: Optional[float] = Field(None, ge=0, le=100)
    min_energy_kcal_per_kg: float = Field(..., ge=0)
    max_energy_kcal_per_kg: Optional[float] = Field(None, ge=0)
    min_calcium_percentage: Optional[float] = Field(0, ge=0, le=100)
    max_calcium_percentage: Optional[float] = Field(None, ge=0, le=100)
    min_phosphorus_percentage: Optional[float] = Field(0, ge=0, le=100)
    max_phosphorus_percentage: Optional[float] = Field(None, ge=0, le=100)
    max_fiber_percentage: Optional[float] = Field(None, ge=0, le=100)

    @validator('max_protein_percentage')
    def max_protein_must_be_greater_than_min(cls, v, values):
        if v is not None and 'min_protein_percentage' in values and v < values['min_protein_percentage']:
            raise ValueError('max_protein_percentage must be greater than min_protein_percentage')
        return v

    @validator('max_energy_kcal_per_kg')
    def max_energy_must_be_greater_than_min(cls, v, values):
        if v is not None and 'min_energy_kcal_per_kg' in values and v < values['min_energy_kcal_per_kg']:
            raise ValueError('max_energy_kcal_per_kg must be greater than min_energy_kcal_per_kg')
        return v


class FormulaRequest(BaseModel):
    """Request model for feed formula generation"""
    bird_type: BirdType
    bird_age: int = Field(..., gt=0, description="Age of birds in days")
    production_stage: ProductionStage
    target_nutrition: TargetNutrition = TargetNutrition.BALANCED
    batch_size_kg: Optional[float] = Field(100.0, gt=0, description="Size of batch to produce in kg")
    ingredients: List[Ingredient]
    custom_requirements: Optional[NutritionalRequirement] = None
    cost_optimization_priority: float = Field(1.0, ge=0, le=1.0, 
                                             description="Priority given to cost optimization vs. nutritional optimization (0-1)")


class IngredientResult(BaseModel):
    """Result model for an ingredient in the optimized formula"""
    name: str
    quantity_kg: float
    percentage: float
    cost: float
    protein_contribution: float
    energy_contribution: float
    calcium_contribution: Optional[float] = 0
    phosphorus_contribution: Optional[float] = 0
    fiber_contribution: Optional[float] = 0


class NutritionResult(BaseModel):
    """Result model for nutritional content of the formula"""
    protein_percentage: float
    energy_kcal_per_kg: float
    calcium_percentage: float
    phosphorus_percentage: float
    fiber_percentage: float
    meets_requirements: bool


class FormulaResponse(BaseModel):
    """Response model for an optimized feed formula"""
    formula_name: str = "Optimized Formula"
    bird_type: BirdType
    production_stage: ProductionStage
    ingredients: List[IngredientResult]
    nutrition: NutritionResult
    total_cost: float
    cost_per_kg: float
    batch_size_kg: float
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    notes: Optional[str] = None
    optimization_success: bool = True
    optimization_message: Optional[str] = None