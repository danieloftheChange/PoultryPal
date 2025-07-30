import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';
import { IngredientsTable } from './IngredientsTable';

// Define the ingredient schema
const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
  proteinContent: z.coerce.number().min(0, "Protein content must be a positive number").max(100, "Protein content cannot exceed 100%"),
  energyContent: z.coerce.number().min(0, "Energy content must be a positive number"),
  calciumContent: z.coerce.number().min(0, "Calcium content must be a positive number"),
});

// Define the formula schema
const formulaSchema = z.object({
  name: z.string().min(3, "Formula name must be at least 3 characters"),
  targetNutrition: z.enum([
    "high protein", 
    "balanced", 
    "high vitamins & minerals", 
    "high calcium", 
    "high carbohydrate"
  ], {
    required_error: "Please select a target nutrition type",
  }),
  notes: z.string().optional(),
  ingredients: z.array(ingredientSchema)
    .min(1, "At least one ingredient is required")
});

type FormData = z.infer<typeof formulaSchema>;
type IngredientData = z.infer<typeof ingredientSchema>;

interface FormulaFormProps {
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export const FormulaForm = ({ initialData, onSubmit, isLoading }: FormulaFormProps) => {
  const [ingredients, setIngredients] = useState<IngredientData[]>(
    initialData?.ingredients || []
  );
  const [optimizing, setOptimizing] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formulaSchema),
    defaultValues: initialData || {
      name: '',
      targetNutrition: 'balanced',
      notes: '',
      ingredients: [],
    },
  });

  // Update form values when ingredients change
  useEffect(() => {
    form.setValue('ingredients', ingredients);
  }, [ingredients, form]);

  // Reset form with initial data when it changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      setIngredients(initialData.ingredients || []);
    }
  }, [initialData, form]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { 
        name: '', 
        quantity: 0, 
        cost: 0, 
        proteinContent: 0, 
        energyContent: 0, 
        calciumContent: 0 
      }
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientData, value: string | number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    setIngredients(updatedIngredients);
  };

  const handleOptimize = async () => {
    try {
      setOptimizing(true);
      
      // Collect current form data
      const formData = form.getValues();
      
      // Send data to optimization API
      const response = await axios.post(
        'http://92.112.180.180:3000/api/v1/feed-formula/optimize',
        {
          targetNutrition: formData.targetNutrition,
          availableIngredients: ingredients.filter(i => i.name.trim() !== '')
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      // Update the form with optimized data
      if (response.data && response.data.optimizedIngredients) {
        setIngredients(response.data.optimizedIngredients);
      }
    } catch (error) {
      console.error('Error optimizing formula:', error);
      // Show error notification
    } finally {
      setOptimizing(false);
    }
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      ingredients: ingredients
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Formula Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formula Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter formula name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetNutrition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Nutrition Profile</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target nutrition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high protein">High Protein</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="high vitamins & minerals">High Vitamins & Minerals</SelectItem>
                        <SelectItem value="high calcium">High Calcium</SelectItem>
                        <SelectItem value="high carbohydrate">High Carbohydrate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any notes about this formula"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Formula Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <div className="text-sm text-gray-500">Total Protein</div>
                  <div className="text-2xl font-bold">
                    {ingredients.reduce((sum, ing) => sum + (ing.proteinContent * ing.quantity / 100), 0).toFixed(2)}%
                  </div>
                </div>
                
                <div className="border rounded p-4">
                  <div className="text-sm text-gray-500">Total Energy</div>
                  <div className="text-2xl font-bold">
                    {ingredients.reduce((sum, ing) => sum + (ing.energyContent * ing.quantity / 100), 0).toFixed(2)} kcal
                  </div>
                </div>
                
                <div className="border rounded p-4">
                  <div className="text-sm text-gray-500">Total Calcium</div>
                  <div className="text-2xl font-bold">
                    {ingredients.reduce((sum, ing) => sum + (ing.calciumContent * ing.quantity / 100), 0).toFixed(2)}%
                  </div>
                </div>
                
                <div className="border rounded p-4">
                  <div className="text-sm text-gray-500">Total Cost</div>
                  <div className="text-2xl font-bold">
                    ${ingredients.reduce((sum, ing) => sum + (ing.cost * ing.quantity), 0).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleOptimize}
                disabled={optimizing || ingredients.length === 0}
              >
                {optimizing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>Optimize Formula</>
                )}
              </Button>
              
              <div className="text-xs text-gray-500 mt-2">
                Click optimize to automatically adjust ingredient quantities for best nutritional balance at lowest cost.
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Ingredients</span>
              <Button 
                type="button" 
                size="sm" 
                onClick={addIngredient}
                className="bg-green-700 hover:bg-green-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IngredientsTable 
              ingredients={ingredients}
              onUpdate={updateIngredient}
              onRemove={removeIngredient}
            />
            
            {form.formState.errors.ingredients && (
              <p className="text-red-500 text-sm mt-2">
                {form.formState.errors.ingredients.message}
              </p>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button" 
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            className="bg-green-700 hover:bg-green-800"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Formula' : 'Save Formula'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormulaForm;