import { Clock, Info } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Ingredient {
  name: string;
  quantity: number;
  cost: number;
  proteinContent: number;
  energyContent: number;
  calciumContent: number;
}

interface FormulaCardProps {
  id: string;
  name: string;
  targetNutrition: string;
  ingredients: Ingredient[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FormulaCard = ({
  id,
  name,
  targetNutrition,
  ingredients,
  notes,
  createdAt,
  onView,
  onEdit,
  onDelete
}: FormulaCardProps) => {
  // Calculate formula statistics
  const totalProtein = ingredients.reduce((sum, ing) => sum + (ing.proteinContent * ing.quantity / 100), 0).toFixed(2);
  const totalEnergy = ingredients.reduce((sum, ing) => sum + (ing.energyContent * ing.quantity / 100), 0).toFixed(2);
  const totalCalcium = ingredients.reduce((sum, ing) => sum + (ing.calciumContent * ing.quantity / 100), 0).toFixed(2);
  const totalCost = ingredients.reduce((sum, ing) => sum + (ing.cost * ing.quantity), 0).toFixed(2);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Get target nutrition badge color
  const getNutritionBadgeColor = (target: string) => {
    switch(target) {
      case 'high protein':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'balanced':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'high vitamins & minerals':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'high calcium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high carbohydrate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-800">{name}</CardTitle>
          <Badge variant="outline" className={getNutritionBadgeColor(targetNutrition)}>
            {targetNutrition}
          </Badge>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Clock className="h-3 w-3 mr-1" />
          <span>{formatDate(createdAt)}</span>
        </div>
      </CardHeader>
      
      <CardContent className="py-3">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="border rounded p-2">
            <div className="text-xs text-gray-500">Protein</div>
            <div className="text-sm font-semibold">{totalProtein}%</div>
          </div>
          
          <div className="border rounded p-2">
            <div className="text-xs text-gray-500">Energy</div>
            <div className="text-sm font-semibold">{totalEnergy} kcal</div>
          </div>
          
          <div className="border rounded p-2">
            <div className="text-xs text-gray-500">Calcium</div>
            <div className="text-sm font-semibold">{totalCalcium}%</div>
          </div>
          
          <div className="border rounded p-2">
            <div className="text-xs text-gray-500">Cost</div>
            <div className="text-sm font-semibold">${totalCost}</div>
          </div>
        </div>
        
        <div className="text-sm text-gray-700">
          <div className="font-semibold mb-1">Ingredients: {ingredients.length}</div>
          <div className="flex flex-wrap gap-1">
            {ingredients.slice(0, 3).map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {ingredient.name}
              </Badge>
            ))}
            
            {ingredients.length > 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs cursor-help">
                      +{ingredients.length - 3} more
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {ingredients.slice(3).map((ingredient, index) => (
                        <div key={index}>{ingredient.name}</div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        
        {notes && notes.trim() !== '' && (
          <div className="mt-3 flex items-start">
            <Info className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-500 line-clamp-2">{notes}</div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex gap-2">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 bg-green-700 hover:bg-green-800"
          onClick={() => onView(id)}
        >
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onEdit(id)}
        >
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FormulaCard;