import pulp
import logging
from typing import Dict, Optional, List
import pandas as pd

from optimizer.models import (
    FormulaRequest, 
    FormulaResponse, 
    IngredientResult, 
    NutritionResult, 
    ProductionStage, 
    BirdType,
    TargetNutrition
)
from optimizer.utils import get_default_requirements

# Configure logging
logger = logging.getLogger("feed-optimizer.optimizer")

def generate_feed_formula(request: FormulaRequest) -> FormulaResponse:
    """
    Generate an optimized feed formula based on nutritional requirements
    and available ingredients
    
    Args:
        request: FormulaRequest object containing all parameters
        
    Returns:
        FormulaResponse object with the optimized formula
    """
    logger.info(f"Starting feed formula optimization for {request.bird_type}")
    
    # Get nutritional requirements based on bird type, age, stage
    requirements = get_default_requirements(
        request.bird_type, 
        request.bird_age, 
        request.production_stage,
        request.target_nutrition
    )
    
    # Override with custom requirements if provided
    if request.custom_requirements:
        requirements = request.custom_requirements
    
    # Filter available ingredients
    available_ingredients = [i for i in request.ingredients if i.available]
    
    if len(available_ingredients) == 0:
        return FormulaResponse(
            formula_name=f"{request.bird_type} {request.production_stage} Formula",
            bird_type=request.bird_type,
            production_stage=request.production_stage,
            ingredients=[],
            nutrition=NutritionResult(
                protein_percentage=0,
                energy_kcal_per_kg=0,
                calcium_percentage=0,
                phosphorus_percentage=0,
                fiber_percentage=0,
                meets_requirements=False
            ),
            total_cost=0,
            cost_per_kg=0,
            batch_size_kg=request.batch_size_kg,
            optimization_success=False,
            optimization_message="No available ingredients for optimization"
        )
    
    try:
        # Create optimization model
        model = pulp.LpProblem("FeedFormulaOptimization", pulp.LpMinimize)
        
        # Create decision variables for each ingredient (kg to include)
        ingredient_vars = {
            ingredient.name: pulp.LpVariable(
                f"ingredient_{ingredient.name}", 
                lowBound=ingredient.min_inclusion_percentage * request.batch_size_kg / 100,  
                upBound=ingredient.max_inclusion_percentage * request.batch_size_kg / 100
            ) 
            for ingredient in available_ingredients
        }
        
        # Objective function: minimize cost
        model += pulp.lpSum([
            ingredient_vars[ingredient.name] * ingredient.price_per_kg 
            for ingredient in available_ingredients
        ]), "Total_Cost"
        
        # Constraints
        
        # Total weight constraint
        model += pulp.lpSum(list(ingredient_vars.values())) == request.batch_size_kg, "Total_Weight"
        
        # Protein constraints
        protein_content = pulp.lpSum([
            ingredient_vars[ingredient.name] * ingredient.protein_percentage / 100
            for ingredient in available_ingredients
        ])
        
        model += protein_content >= requirements.min_protein_percentage * request.batch_size_kg / 100, "Min_Protein"
        
        if requirements.max_protein_percentage:
            model += protein_content <= requirements.max_protein_percentage * request.batch_size_kg / 100, "Max_Protein"
        
        # Energy constraints
        energy_content = pulp.lpSum([
            ingredient_vars[ingredient.name] * ingredient.energy_kcal_per_kg
            for ingredient in available_ingredients
        ])
        
        model += energy_content >= requirements.min_energy_kcal_per_kg * request.batch_size_kg, "Min_Energy"
        
        if requirements.max_energy_kcal_per_kg:
            model += energy_content <= requirements.max_energy_kcal_per_kg * request.batch_size_kg, "Max_Energy"
        
        # Calcium constraints
        if requirements.min_calcium_percentage > 0:
            calcium_content = pulp.lpSum([
                ingredient_vars[ingredient.name] * ingredient.calcium_percentage / 100
                for ingredient in available_ingredients
            ])
            
            model += calcium_content >= requirements.min_calcium_percentage * request.batch_size_kg / 100, "Min_Calcium"
            
            if requirements.max_calcium_percentage:
                model += calcium_content <= requirements.max_calcium_percentage * request.batch_size_kg / 100, "Max_Calcium"
        
        # Phosphorus constraints
        if requirements.min_phosphorus_percentage > 0:
            phosphorus_content = pulp.lpSum([
                ingredient_vars[ingredient.name] * ingredient.phosphorus_percentage / 100
                for ingredient in available_ingredients
            ])
            
            model += phosphorus_content >= requirements.min_phosphorus_percentage * request.batch_size_kg / 100, "Min_Phosphorus"
            
            if requirements.max_phosphorus_percentage:
                model += phosphorus_content <= requirements.max_phosphorus_percentage * request.batch_size_kg / 100, "Max_Phosphorus"
        
        # Fiber constraint
        if requirements.max_fiber_percentage:
            fiber_content = pulp.lpSum([
                ingredient_vars[ingredient.name] * ingredient.fiber_percentage / 100
                for ingredient in available_ingredients
            ])
            
            model += fiber_content <= requirements.max_fiber_percentage * request.batch_size_kg / 100, "Max_Fiber"
        
        # Solve the model
        logger.info("Running optimization solver")
        result = model.solve()
        
        # Check if the model was solved successfully
        if result != pulp.LpStatusOptimal:
            logger.warning(f"Optimization failed with status: {pulp.LpStatus[result]}")
            return FormulaResponse(
                formula_name=f"{request.bird_type} {request.production_stage} Formula",
                bird_type=request.bird_type,
                production_stage=request.production_stage,
                ingredients=[],
                nutrition=NutritionResult(
                    protein_percentage=0,
                    energy_kcal_per_kg=0,
                    calcium_percentage=0,
                    phosphorus_percentage=0,
                    fiber_percentage=0,
                    meets_requirements=False
                ),
                total_cost=0,
                cost_per_kg=0,
                batch_size_kg=request.batch_size_kg,
                optimization_success=False,
                optimization_message=f"Optimization failed: {pulp.LpStatus[result]}"
            )
        
        # Extract results
        logger.info("Extracting optimization results")
        ingredient_results = []
        total_protein = 0
        total_energy = 0
        total_calcium = 0
        total_phosphorus = 0
        total_fiber = 0
        total_cost = 0
        
        for ingredient in available_ingredients:
            quantity = ingredient_vars[ingredient.name].value()
            
            # Skip ingredients with zero or very small quantities
            if quantity is None or quantity < 0.001:
                continue
                
            percentage = (quantity / request.batch_size_kg) * 100
            cost = quantity * ingredient.price_per_kg
            
            protein_contrib = quantity * ingredient.protein_percentage / 100
            energy_contrib = quantity * ingredient.energy_kcal_per_kg
            calcium_contrib = quantity * ingredient.calcium_percentage / 100
            phosphorus_contrib = quantity * ingredient.phosphorus_percentage / 100
            fiber_contrib = quantity * ingredient.fiber_percentage / 100
            
            total_protein += protein_contrib
            total_energy += energy_contrib
            total_calcium += calcium_contrib
            total_phosphorus += phosphorus_contrib
            total_fiber += fiber_contrib
            total_cost += cost
            
            ingredient_results.append(
                IngredientResult(
                    name=ingredient.name,
                    quantity_kg=round(quantity, 3),
                    percentage=round(percentage, 2),
                    cost=round(cost, 2),
                    protein_contribution=round(protein_contrib, 3),
                    energy_contribution=round(energy_contrib, 0),
                    calcium_contribution=round(calcium_contrib, 3),
                    phosphorus_contribution=round(phosphorus_contrib, 3),
                    fiber_contribution=round(fiber_contrib, 3)
                )
            )
        
        # Calculate final nutritional values
        protein_percentage = (total_protein / request.batch_size_kg) * 100
        energy_kcal_per_kg = total_energy / request.batch_size_kg
        calcium_percentage = (total_calcium / request.batch_size_kg) * 100
        phosphorus_percentage = (total_phosphorus / request.batch_size_kg) * 100
        fiber_percentage = (total_fiber / request.batch_size_kg) * 100
        
        # Determine if formula meets all requirements
        meets_requirements = (
            protein_percentage >= requirements.min_protein_percentage and
            (requirements.max_protein_percentage is None or protein_percentage <= requirements.max_protein_percentage) and
            energy_kcal_per_kg >= requirements.min_energy_kcal_per_kg and
            (requirements.max_energy_kcal_per_kg is None or energy_kcal_per_kg <= requirements.max_energy_kcal_per_kg) and
            calcium_percentage >= requirements.min_calcium_percentage and
            (requirements.max_calcium_percentage is None or calcium_percentage <= requirements.max_calcium_percentage) and
            phosphorus_percentage >= requirements.min_phosphorus_percentage and
            (requirements.max_phosphorus_percentage is None or phosphorus_percentage <= requirements.max_phosphorus_percentage) and
            (requirements.max_fiber_percentage is None or fiber_percentage <= requirements.max_fiber_percentage)
        )
        
        # Sort ingredients by quantity in descending order
        ingredient_results.sort(key=lambda x: x.quantity_kg, reverse=True)
        
        # Generate formula name
        formula_name = f"{request.bird_type.value} {request.production_stage.value} Formula"
        
        # Create response
        response = FormulaResponse(
            formula_name=formula_name,
            bird_type=request.bird_type,
            production_stage=request.production_stage,
            ingredients=ingredient_results,
            nutrition=NutritionResult(
                protein_percentage=round(protein_percentage, 2),
                energy_kcal_per_kg=round(energy_kcal_per_kg, 0),
                calcium_percentage=round(calcium_percentage, 2),
                phosphorus_percentage=round(phosphorus_percentage, 2),
                fiber_percentage=round(fiber_percentage, 2),
                meets_requirements=meets_requirements
            ),
            total_cost=round(total_cost, 2),
            cost_per_kg=round(total_cost / request.batch_size_kg, 2),
            batch_size_kg=request.batch_size_kg,
            optimization_success=True,
            optimization_message="Optimization completed successfully"
        )
        
        logger.info(f"Optimization completed with {len(ingredient_results)} ingredients and total cost: {total_cost:.2f}")
        return response
        
    except Exception as e:
        logger.error(f"Error in feed formula optimization: {str(e)}")
        raise