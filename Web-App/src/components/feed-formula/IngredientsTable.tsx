import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface Ingredient {
  name: string;
  quantity: number;
  cost: number;
  proteinContent: number;
  energyContent: number;
  calciumContent: number;
}

interface IngredientsTableProps {
  ingredients: Ingredient[];
  onUpdate: (index: number, field: keyof Ingredient, value: string | number) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}

export const IngredientsTable = ({ 
  ingredients, 
  onUpdate, 
  onRemove,
  readOnly = false
}: IngredientsTableProps) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleInputChange = (index: number, field: keyof Ingredient, value: string) => {
    // If the field should be a number, convert it
    const numericFields: (keyof Ingredient)[] = ['quantity', 'cost', 'proteinContent', 'energyContent', 'calciumContent'];
    
    if (numericFields.includes(field)) {
      // Remove any non-numeric characters except decimal point
      const sanitizedValue = value.replace(/[^0-9.]/g, '');
      // Convert to number or use 0 if empty/invalid
      const numericValue = sanitizedValue ? parseFloat(sanitizedValue) : 0;
      onUpdate(index, field, numericValue);
    } else {
      onUpdate(index, field, value);
    }
  };
  
  // Helper to format numbers nicely
  const formatNumber = (value: number) => {
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  // For mobile view, toggle expanded row
  const toggleExpandedRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // If no ingredients, show placeholder
  if (ingredients.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">No ingredients added yet</p>
        {!readOnly && (
          <p className="text-sm text-gray-400 mt-1">
            Click "Add Ingredient" to start building your formula
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Desktop view - table */}
      <div className="hidden md:block overflow-hidden border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Ingredient</TableHead>
              <TableHead>Quantity (kg)</TableHead>
              <TableHead>Cost ($)</TableHead>
              <TableHead>Protein (%)</TableHead>
              <TableHead>Energy (kcal)</TableHead>
              <TableHead>Calcium (%)</TableHead>
              {!readOnly && <TableHead className="w-16"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ingredient, index) => (
              <TableRow key={index}>
                <TableCell>
                  {readOnly ? (
                    ingredient.name
                  ) : (
                    <Input
                      value={ingredient.name}
                      onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="max-w-[200px]"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    formatNumber(ingredient.quantity)
                  ) : (
                    <Input
                      value={ingredient.quantity}
                      onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                      placeholder="0.00"
                      className="max-w-[100px]"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    formatNumber(ingredient.cost)
                  ) : (
                    <Input
                      value={ingredient.cost}
                      onChange={(e) => handleInputChange(index, 'cost', e.target.value)}
                      placeholder="0.00"
                      className="max-w-[100px]"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    formatNumber(ingredient.proteinContent)
                  ) : (
                    <Input
                      value={ingredient.proteinContent}
                      onChange={(e) => handleInputChange(index, 'proteinContent', e.target.value)}
                      placeholder="0.00"
                      className="max-w-[100px]"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    formatNumber(ingredient.energyContent)
                  ) : (
                    <Input
                      value={ingredient.energyContent}
                      onChange={(e) => handleInputChange(index, 'energyContent', e.target.value)}
                      placeholder="0.00"
                      className="max-w-[100px]"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    formatNumber(ingredient.calciumContent)
                  ) : (
                    <Input
                      value={ingredient.calciumContent}
                      onChange={(e) => handleInputChange(index, 'calciumContent', e.target.value)}
                      placeholder="0.00"
                      className="max-w-[100px]"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  )}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - stacked cards */}
      <div className="md:hidden space-y-4">
        {ingredients.map((ingredient, index) => (
          <div 
            key={index} 
            className="border rounded-md overflow-hidden"
          >
            <div 
              className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpandedRow(index)}
            >
              <div className="font-medium">
                {ingredient.name || `Ingredient ${index + 1}`}
              </div>
              <div className="flex items-center space-x-2">
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(index);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className={`p-3 ${expandedRow === index || readOnly ? '' : 'hidden'}`}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Name</label>
                  {readOnly ? (
                    <div>{ingredient.name}</div>
                  ) : (
                    <Input
                      value={ingredient.name}
                      onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Quantity (kg)</label>
                  {readOnly ? (
                    <div>{formatNumber(ingredient.quantity)}</div>
                  ) : (
                    <Input
                      value={ingredient.quantity}
                      onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Cost ($)</label>
                  {readOnly ? (
                    <div>{formatNumber(ingredient.cost)}</div>
                  ) : (
                    <Input
                      value={ingredient.cost}
                      onChange={(e) => handleInputChange(index, 'cost', e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Protein (%)</label>
                  {readOnly ? (
                    <div>{formatNumber(ingredient.proteinContent)}</div>
                  ) : (
                    <Input
                      value={ingredient.proteinContent}
                      onChange={(e) => handleInputChange(index, 'proteinContent', e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Energy (kcal)</label>
                  {readOnly ? (
                    <div>{formatNumber(ingredient.energyContent)}</div>
                  ) : (
                    <Input
                      value={ingredient.energyContent}
                      onChange={(e) => handleInputChange(index, 'energyContent', e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Calcium (%)</label>
                  {readOnly ? (
                    <div>{formatNumber(ingredient.calciumContent)}</div>
                  ) : (
                    <Input
                      value={ingredient.calciumContent}
                      onChange={(e) => handleInputChange(index, 'calciumContent', e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional nutritional information */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium mb-2">Total Nutritional Content</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-gray-500">Total Quantity</div>
            <div className="font-medium">
              {formatNumber(ingredients.reduce((sum, ing) => sum + ing.quantity, 0))} kg
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Cost</div>
            <div className="font-medium">
              ${formatNumber(ingredients.reduce((sum, ing) => sum + (ing.cost * ing.quantity), 0))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Avg. Protein</div>
            <div className="font-medium">
              {formatNumber(
                ingredients.reduce((sum, ing) => sum + (ing.proteinContent * ing.quantity), 0) / 
                ingredients.reduce((sum, ing) => sum + ing.quantity, 0) || 0
              )}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Cost per kg</div>
            <div className="font-medium">
              ${formatNumber(
                ingredients.reduce((sum, ing) => sum + (ing.cost * ing.quantity), 0) / 
                ingredients.reduce((sum, ing) => sum + ing.quantity, 0) || 0
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientsTable;