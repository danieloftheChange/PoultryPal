import logging
from typing import Dict, Any
from optimizer.models import (
    NutritionalRequirement, 
    BirdType, 
    ProductionStage,
    TargetNutrition
)

# Configure logging
logger = logging.getLogger("feed-optimizer.utils")

def get_default_requirements(
    bird_type: BirdType, 
    bird_age: int, 
    production_stage: ProductionStage,
    target_nutrition: TargetNutrition
) -> NutritionalRequirement:
    """
    Get default nutritional requirements based on bird type, age, and production stage
    
    Args:
        bird_type: Type of poultry
        bird_age: Age of birds in days
        production_stage: Current production stage
        target_nutrition: Target nutritional profile
        
    Returns:
        NutritionalRequirement object with default values
    """
    logger.info(f"Getting default requirements for {bird_type} at age {bird_age} in {production_stage} stage")
    
    # Base requirements by bird type and production stage
    requirements = {
        BirdType.LAYER: {
            ProductionStage.STARTER: NutritionalRequirement(
                min_protein_percentage=20.0,
                max_protein_percentage=22.0,
                min_energy_kcal_per_kg=2900,
                max_energy_kcal_per_kg=3100,
                min_calcium_percentage=1.0,
                max_calcium_percentage=1.2,
                min_phosphorus_percentage=0.45,
                max_phosphorus_percentage=0.55,
                max_fiber_percentage=4.0
            ),
            ProductionStage.GROWER: NutritionalRequirement(
                min_protein_percentage=16.0,
                max_protein_percentage=18.0,
                min_energy_kcal_per_kg=2800,
                max_energy_kcal_per_kg=3000,
                min_calcium_percentage=0.9,
                max_calcium_percentage=1.1,
                min_phosphorus_percentage=0.4,
                max_phosphorus_percentage=0.5,
                max_fiber_percentage=5.0
            ),
            ProductionStage.PRE_LAY: NutritionalRequirement(
                min_protein_percentage=17.0,
                max_protein_percentage=19.0,
                min_energy_kcal_per_kg=2850,
                max_energy_kcal_per_kg=3050,
                min_calcium_percentage=2.0,
                max_calcium_percentage=2.5,
                min_phosphorus_percentage=0.42,
                max_phosphorus_percentage=0.52,
                max_fiber_percentage=5.0
            ),
            ProductionStage.LAYER: NutritionalRequirement(
                min_protein_percentage=16.0,
                max_protein_percentage=18.0,
                min_energy_kcal_per_kg=2750,
                max_energy_kcal_per_kg=2950,
                min_calcium_percentage=3.5,
                max_calcium_percentage=4.2,
                min_phosphorus_percentage=0.32,
                max_phosphorus_percentage=0.45,
                max_fiber_percentage=5.0
            ),
        },
        BirdType.BROILER: {
            ProductionStage.STARTER: NutritionalRequirement(
                min_protein_percentage=22.0,
                max_protein_percentage=24.0,
                min_energy_kcal_per_kg=3000,
                max_energy_kcal_per_kg=3200,
                min_calcium_percentage=0.9,
                max_calcium_percentage=1.1,
                min_phosphorus_percentage=0.45,
                max_phosphorus_percentage=0.55,
                max_fiber_percentage=3.5
            ),
            ProductionStage.GROWER: NutritionalRequirement(
                min_protein_percentage=20.0,
                max_protein_percentage=22.0,
                min_energy_kcal_per_kg=3100,
                max_energy_kcal_per_kg=3300,
                min_calcium_percentage=0.85,
                max_calcium_percentage=1.0,
                min_phosphorus_percentage=0.42,
                max_phosphorus_percentage=0.52,
                max_fiber_percentage=4.0
            ),
            ProductionStage.FINISHER: NutritionalRequirement(
                min_protein_percentage=18.0,
                max_protein_percentage=20.0,
                min_energy_kcal_per_kg=3150,
                max_energy_kcal_per_kg=3350,
                min_calcium_percentage=0.8,
                max_calcium_percentage=0.95,
                min_phosphorus_percentage=0.38,
                max_phosphorus_percentage=0.48,
                max_fiber_percentage=4.5
            ),
        },
        BirdType.DUAL_PURPOSE: {
            ProductionStage.STARTER: NutritionalRequirement(
                min_protein_percentage=20.0,
                max_protein_percentage=22.0,
                min_energy_kcal_per_kg=2950,
                max_energy_kcal_per_kg=3150,
                min_calcium_percentage=0.95,
                max_calcium_percentage=1.15,
                min_phosphorus_percentage=0.45,
                max_phosphorus_percentage=0.55,
                max_fiber_percentage=4.0
            ),
            ProductionStage.GROWER: NutritionalRequirement(
                min_protein_percentage=18.0,
                max_protein_percentage=20.0,
                min_energy_kcal_per_kg=2900,
                max_energy_kcal_per_kg=3100,
                min_calcium_percentage=0.85,
                max_calcium_percentage=1.05,
                min_phosphorus_percentage=0.4,
                max_phosphorus_percentage=0.5,
                max_fiber_percentage=4.5
            ),
            ProductionStage.LAYER: NutritionalRequirement(
                min_protein_percentage=16.0,
                max_protein_percentage=18.0,
                min_energy_kcal_per_kg=2800,
                max_energy_kcal_per_kg=3000,
                min_calcium_percentage=3.3,
                max_calcium_percentage=4.0,
                min_phosphorus_percentage=0.35,
                max_phosphorus_percentage=0.45,
                max_fiber_percentage=5.0
            ),
        },
        BirdType.BREEDER: {
            ProductionStage.STARTER: NutritionalRequirement(
                min_protein_percentage=19.0,
                max_protein_percentage=21.0,
                min_energy_kcal_per_kg=2900,
                max_energy_kcal_per_kg=3100,
                min_calcium_percentage=1.0,
                max_calcium_percentage=1.2,
                min_phosphorus_percentage=0.45,
                max_phosphorus_percentage=0.55,
                max_fiber_percentage=4.0
            ),
            ProductionStage.GROWER: NutritionalRequirement(
                min_protein_percentage=15.0,
                max_protein_percentage=17.0,
                min_energy_kcal_per_kg=2750,
                max_energy_kcal_per_kg=2950,
                min_calcium_percentage=0.9,
                max_calcium_percentage=1.1,
                min_phosphorus_percentage=0.4,
                max_phosphorus_percentage=0.5,
                max_fiber_percentage=5.0
            ),
            ProductionStage.LAYER: NutritionalRequirement(
                min_protein_percentage=16.0,
                max_protein_percentage=18.0,
                min_energy_kcal_per_kg=2800,
                max_energy_kcal_per_kg=3000,
                min_calcium_percentage=3.0,
                max_calcium_percentage=3.8,
                min_phosphorus_percentage=0.35,
                max_phosphorus_percentage=0.45,
                max_fiber_percentage=5.0
            ),
        }
    }
    
    # Check if the specified combination exists
    if bird_type not in requirements or production_stage not in requirements[bird_type]:
        logger.warning(f"No default requirements found for {bird_type} in {production_stage} stage")
        # Return a generic requirement
        return NutritionalRequirement(
            min_protein_percentage=18.0,
            max_protein_percentage=22.0,
            min_energy_kcal_per_kg=2800,
            max_energy_kcal_per_kg=3200,
            min_calcium_percentage=1.0,
            max_calcium_percentage=1.5,
            min_phosphorus_percentage=0.4,
            max_phosphorus_percentage=0.5,
            max_fiber_percentage=5.0
        )
    
    # Get base requirements
    base_requirements = requirements[bird_type][production_stage]
    
    # Apply age-specific adjustments
    adjusted_requirements = adjust_for_age(base_requirements, bird_type, bird_age, production_stage)
    
    # Apply target nutrition adjustments
    final_requirements = adjust_for_target_nutrition(adjusted_requirements, target_nutrition)
    
    return final_requirements


def adjust_for_age(
    requirements: NutritionalRequirement,
    bird_type: BirdType,
    bird_age: int,
    production_stage: ProductionStage
) -> NutritionalRequirement:
    """
    Adjust nutritional requirements based on bird age
    
    Args:
        requirements: Base nutritional requirements
        bird_type: Type of poultry
        bird_age: Age of birds in days
        production_stage: Current production stage
        
    Returns:
        Adjusted NutritionalRequirement object
    """
    # Make a copy of the requirements
    adjusted = NutritionalRequirement(
        min_protein_percentage=requirements.min_protein_percentage,
        max_protein_percentage=requirements.max_protein_percentage,
        min_energy_kcal_per_kg=requirements.min_energy_kcal_per_kg,
        max_energy_kcal_per_kg=requirements.max_energy_kcal_per_kg,
        min_calcium_percentage=requirements.min_calcium_percentage,
        max_calcium_percentage=requirements.max_calcium_percentage,
        min_phosphorus_percentage=requirements.min_phosphorus_percentage,
        max_phosphorus_percentage=requirements.max_phosphorus_percentage,
        max_fiber_percentage=requirements.max_fiber_percentage
    )
    
    # Apply age-specific adjustments
    if bird_type == BirdType.LAYER:
        if production_stage == ProductionStage.LAYER:
            # Laying hens need more calcium as they get older
            if bird_age > 365:  # Older than 1 year
                adjusted.min_calcium_percentage = max(adjusted.min_calcium_percentage, 3.8)
                if adjusted.max_calcium_percentage:
                    adjusted.max_calcium_percentage = max(adjusted.max_calcium_percentage, 4.5)
            
            # Adjust protein for older layers
            if bird_age > 500:  # Very old layers
                adjusted.min_protein_percentage = max(adjusted.min_protein_percentage - 0.5, 15.0)
                if adjusted.max_protein_percentage:
                    adjusted.max_protein_percentage = max(adjusted.max_protein_percentage - 0.5, 17.0)
    
    elif bird_type == BirdType.BROILER:
        # Broilers need higher energy as they grow
        if production_stage == ProductionStage.FINISHER and bird_age > 35:
            adjusted.min_energy_kcal_per_kg = max(adjusted.min_energy_kcal_per_kg, 3200)
            if adjusted.max_energy_kcal_per_kg:
                adjusted.max_energy_kcal_per_kg = max(adjusted.max_energy_kcal_per_kg, 3400)
    
    # Return adjusted requirements
    return adjusted


def adjust_for_target_nutrition(
    requirements: NutritionalRequirement,
    target_nutrition: TargetNutrition
) -> NutritionalRequirement:
    """
    Adjust nutritional requirements based on target nutrition
    
    Args:
        requirements: Base nutritional requirements
        target_nutrition: Target nutritional profile
        
    Returns:
        Adjusted NutritionalRequirement object
    """
    # Make a copy of the requirements
    adjusted = NutritionalRequirement(
        min_protein_percentage=requirements.min_protein_percentage,
        max_protein_percentage=requirements.max_protein_percentage,
        min_energy_kcal_per_kg=requirements.min_energy_kcal_per_kg,
        max_energy_kcal_per_kg=requirements.max_energy_kcal_per_kg,
        min_calcium_percentage=requirements.min_calcium_percentage,
        max_calcium_percentage=requirements.max_calcium_percentage,
        min_phosphorus_percentage=requirements.min_phosphorus_percentage,
        max_phosphorus_percentage=requirements.max_phosphorus_percentage,
        max_fiber_percentage=requirements.max_fiber_percentage
    )
    
    # Apply adjustments based on target nutrition
    if target_nutrition == TargetNutrition.HIGH_PROTEIN:
        # Increase protein requirements
        adjusted.min_protein_percentage = adjusted.min_protein_percentage * 1.1  # 10% increase
        if adjusted.max_protein_percentage:
            adjusted.max_protein_percentage = adjusted.max_protein_percentage * 1.1  # 10% increase
    
    elif target_nutrition == TargetNutrition.HIGH_CALCIUM:
        # Increase calcium requirements
        adjusted.min_calcium_percentage = adjusted.min_calcium_percentage * 1.15  # 15% increase
        if adjusted.max_calcium_percentage:
            adjusted.max_calcium_percentage = adjusted.max_calcium_percentage * 1.15  # 15% increase
    
    elif target_nutrition == TargetNutrition.HIGH_CARBOHYDRATE:
        # Increase energy requirements
        adjusted.min_energy_kcal_per_kg = adjusted.min_energy_kcal_per_kg * 1.05  # 5% increase
        if adjusted.max_energy_kcal_per_kg:
            adjusted.max_energy_kcal_per_kg = adjusted.max_energy_kcal_per_kg * 1.05  # 5% increase
    
    elif target_nutrition == TargetNutrition.HIGH_VITAMINS:
        # This would be more complex in a real system, but for our purposes
        # we'll just increase phosphorus as a representative mineral
        adjusted.min_phosphorus_percentage = adjusted.min_phosphorus_percentage * 1.1  # 10% increase
        if adjusted.max_phosphorus_percentage:
            adjusted.max_phosphorus_percentage = adjusted.max_phosphorus_percentage * 1.1  # 10% increase
    
    # Return adjusted requirements
    return adjusted