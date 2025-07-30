import { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, 
  AlertCircle, 
  Loader2, 
  Info, 
  Plus, 
  X 
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the schema for form validation
const formulaSchema = z.object({
  name: z.string().min(1, "Formula name is required"),
  targetNutrition: z.string().min(1, "Target nutrition type is required"),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, "Ingredient name is required"),
      quantity: z.number().min(0, "Quantity must be a positive number"),
    })
  ).min(1, "At least one ingredient is required"),
  notes: z.string().optional(),
});

// Ingredient options
const availableIngredients = [
  { id: 1, name: "Corn", defaultAmount: 50, unit: "kg", protein: 9, energy: 365, calcium: 0.02 },
  { id: 2, name: "Soybean Meal", defaultAmount: 25, unit: "kg", protein: 48, energy: 340, calcium: 0.3 },
  { id: 3, name: "Wheat Bran", defaultAmount: 15, unit: "kg", protein: 15, energy: 260, calcium: 0.12 },
  { id: 4, name: "Limestone", defaultAmount: 8, unit: "kg", protein: 0, energy: 0, calcium: 38 },
  { id: 5, name: "Fish Meal", defaultAmount: 5, unit: "kg", protein: 60, energy: 290, calcium: 4 },
  { id: 6, name: "Vitamin Premix", defaultAmount: 2, unit: "kg", protein: 0, energy: 0, calcium: 0 },
  { id: 7, name: "Salt", defaultAmount: 0.5, unit: "kg", protein: 0, energy: 0, calcium: 0 },
];

type FormData = z.infer<typeof formulaSchema>;

type Ingredient = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  protein: number;
  energy: number;
  calcium: number;
};

function FeedFormulaCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("manual");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formulaSchema),
    defaultValues: {
      name: "",
      targetNutrition: "balanced",
      ingredients: [],
      notes: "",
    },
  });

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Calculate nutritional totals
  const calculateNutritionTotals = () => {
    return selectedIngredients.reduce(
      (acc, ingredient) => {
        const quantity = ingredient.quantity;
        return {
          protein: acc.protein + (ingredient.protein * quantity / 100),
          energy: acc.energy + (ingredient.energy * quantity / 100),
          calcium: acc.calcium + (ingredient.calcium * quantity / 100),
          totalWeight: acc.totalWeight + quantity,
        };
      },
      { protein: 0, energy: 0, calcium: 0, totalWeight: 0 }
    );
  };

  const nutritionTotals = calculateNutritionTotals();

  // Handle adding ingredients
  const handleAddIngredient = (ingredientId: number) => {
    const ingredient = availableIngredients.find(ing => ing.id === ingredientId);
    if (ingredient) {
      const exists = selectedIngredients.some(ing => ing.id === ingredientId);
      if (!exists) {
        setSelectedIngredients([
          ...selectedIngredients,
          {
            id: ingredient.id,
            name: ingredient.name,
            quantity: ingredient.defaultAmount,
            unit: ingredient.unit,
            protein: ingredient.protein,
            energy: ingredient.energy,
            calcium: ingredient.calcium,
          },
        ]);
      }
    }
  };

  // Handle removing ingredients
  const handleRemoveIngredient = (ingredientId: number) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing.id !== ingredientId));
  };

  // Handle quantity change
  const handleQuantityChange = (ingredientId: number, value: number) => {
    setSelectedIngredients(
      selectedIngredients.map(ing => 
        ing.id === ingredientId ? { ...ing, quantity: value } : ing
      )
    );
  };

  // Run optimization
  const runOptimization = async () => {
    setOptimizing(true);
    try {
      // This would normally call an API endpoint
      // For now we'll simulate an optimization result
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate optimized results based on target nutrition
      const targetNutrition = form.getValues().targetNutrition;
      let optimizedIngredients = [];
      
      // Different optimizations based on target nutrition
      switch (targetNutrition) {
        case "high protein":
          optimizedIngredients = [
            { id: 2, name: "Soybean Meal", quantity: 40, unit: "kg", protein: 48, energy: 340, calcium: 0.3 },
            { id: 5, name: "Fish Meal", quantity: 15, unit: "kg", protein: 60, energy: 290, calcium: 4 },
            { id: 1, name: "Corn", quantity: 30, unit: "kg", protein: 9, energy: 365, calcium: 0.02 },
            { id: 4, name: "Limestone", quantity: 7, unit: "kg", protein: 0, energy: 0, calcium: 38 },
            { id: 6, name: "Vitamin Premix", quantity: 2, unit: "kg", protein: 0, energy: 0, calcium: 0 },
            { id: 7, name: "Salt", quantity: 0.5, unit: "kg", protein: 0, energy: 0, calcium: 0 },
          ];
          break;
        case "high calcium":
          optimizedIngredients = [
            { id: 1, name: "Corn", quantity: 35, unit: "kg", protein: 9, energy: 365, calcium: 0.02 },
            { id: 2, name: "Soybean Meal", quantity: 25, unit: "kg", protein: 48, energy: 340, calcium: 0.3 },
            { id: 4, name: "Limestone", quantity: 20, unit: "kg", protein: 0, energy: 0, calcium: 38 },
            { id: 3, name: "Wheat Bran", quantity: 10, unit: "kg", protein: 15, energy: 260, calcium: 0.12 },
            { id: 6, name: "Vitamin Premix", quantity: 2, unit: "kg", protein: 0, energy: 0, calcium: 0 },
            { id: 7, name: "Salt", quantity: 0.5, unit: "kg", protein: 0, energy: 0, calcium: 0 },
          ];
          break;
        case "high carbohydrate":
          optimizedIngredients = [
            { id: 1, name: "Corn", quantity: 60, unit: "kg", protein: 9, energy: 365, calcium: 0.02 },
            { id: 3, name: "Wheat Bran", quantity: 20, unit: "kg", protein: 15, energy: 260, calcium: 0.12 },
            { id: 2, name: "Soybean Meal", quantity: 10, unit: "kg", protein: 48, energy: 340, calcium: 0.3 },
            { id: 4, name: "Limestone", quantity: 5, unit: "kg", protein: 0, energy: 0, calcium: 38 },
            { id: 6, name: "Vitamin Premix", quantity: 2, unit: "kg", protein: 0, energy: 0, calcium: 0 },
            { id: 7, name: "Salt", quantity: 0.5, unit: "kg", protein: 0, energy: 0, calcium: 0 },
          ];
          break;
        case "high vitamins & minerals":
          optimizedIngredients = [
            { id: 1, name: "Corn", quantity: 40, unit: "kg", protein: 9, energy: 365, calcium: 0.02 },
            { id: 2, name: "Soybean Meal", quantity: 20, unit: "kg", protein: 48, energy: 340, calcium: 0.3 },
            { id: 6, name: "Vitamin Premix", quantity: 8, unit: "kg", protein: 0, energy: 0, calcium: 0 },
            { id: 4, name: "Limestone", quantity: 10, unit: "kg", protein: 0, energy: 0, calcium: 38 },
            { id: 3, name: "Wheat Bran", quantity: 10, unit: "kg", protein: 15, energy: 260, calcium: 0.12 },
            { id: 7, name: "Salt", quantity: 2, unit: "kg", protein: 0, energy: 0, calcium: 0 },
          ];
          break;
        default: // balanced
          optimizedIngredients = [
            { id: 1, name: "Corn", quantity: 45, unit: "kg", protein: 9, energy: 365, calcium: 0.02 },
            { id: 2, name: "Soybean Meal", quantity: 25, unit: "kg", protein: 48, energy: 340, calcium: 0.3 },
            { id: 3, name: "Wheat Bran", quantity: 15, unit: "kg", protein: 15, energy: 260, calcium: 0.12 },
            { id: 4, name: "Limestone", quantity: 8, unit: "kg", protein: 0, energy: 0, calcium: 38 },
            { id: 6, name: "Vitamin Premix", quantity: 2, unit: "kg", protein: 0, energy: 0, calcium: 0 },
            { id: 7, name: "Salt", quantity: 0.5, unit: "kg", protein: 0, energy: 0, calcium: 0 },
          ];
      }
      
      setOptimizationResults({
        ingredients: optimizedIngredients,
        summary: {
          protein: optimizedIngredients.reduce((sum, ing) => sum + (ing.protein * ing.quantity / 100), 0),
          energy: optimizedIngredients.reduce((sum, ing) => sum + (ing.energy * ing.quantity / 100), 0),
          calcium: optimizedIngredients.reduce((sum, ing) => sum + (ing.calcium * ing.quantity / 100), 0),
          totalWeight: optimizedIngredients.reduce((sum, ing) => sum + ing.quantity, 0),
        }
      });
      
      setActiveTab("optimized");
      setSuccessMessage("Feed formula has been optimized based on your requirements.");
    } catch (error) {
      console.error('Optimization error:', error);
      setErrorMessage("There was an error optimizing the feed formula. Please try again.");
    } finally {
      setOptimizing(false);
    }
  };

  // Apply optimization results
  const applyOptimizationResults = () => {
    if (optimizationResults) {
      setSelectedIngredients(optimizationResults.ingredients);
      setActiveTab("manual");
      setSuccessMessage("Optimized formula applied successfully.");
    }
  };

  // Form submission
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Prepare ingredient data
      const ingredientData = selectedIngredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
      }));
      
      // Prepare data to send to API
      const formData = {
        ...data,
        ingredients: ingredientData,
      };
      
      const accessToken = localStorage.getItem('accessToken');
      
      // Make API call
      // In a real implementation, you would make an actual API call here
      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccessMessage("Your feed formula has been saved successfully.");
      
      // Navigate to formula list page after a short delay
      setTimeout(() => {
        navigate('/feed-formula');
      }, 1500);
    } catch (error) {
      console.error('Error saving formula:', error);
      setErrorMessage("There was an error saving your formula. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Navbar2 />
      <div className="w-full space-y-4 p-4 md:p-8">
        {/* Success and Error Messages */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <Check className="h-4 w-4 mr-2" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Create Feed Formula</h2>
            <p className="text-gray-500">Design custom feed formulas for your poultry</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/feed-formula')}
            >
              Cancel
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={loading || selectedIngredients.length === 0}
              className="bg-green-700 hover:bg-green-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Formula'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Formula Details</CardTitle>
                <CardDescription>Enter basic information about this feed formula</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-4">
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
                          <FormLabel>Target Nutrition</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select target nutrition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="balanced">Balanced</SelectItem>
                                <SelectItem value="high protein">High Protein</SelectItem>
                                <SelectItem value="high calcium">High Calcium</SelectItem>
                                <SelectItem value="high carbohydrate">High Carbohydrate</SelectItem>
                                <SelectItem value="high vitamins & minerals">High Vitamins & Minerals</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter any notes about this formula" 
                              className="h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization</CardTitle>
                <CardDescription>Let the system optimize your formula based on your target nutrition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="bg-amber-50 p-4 rounded-md flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Optimization will suggest the best combination of ingredients based on your nutritional goals and available ingredients.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={runOptimization}
                    disabled={optimizing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {optimizing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Optimizing...
                      </>
                    ) : 'Optimize Formula'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Ingredients Management */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Formula Composition</CardTitle>
                <CardDescription>Design your feed formula by adding ingredients</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="manual">Manual Formula</TabsTrigger>
                    <TabsTrigger value="optimized" disabled={!optimizationResults}>Optimized Formula</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="manual">
                    <div className="space-y-6">
                      {/* Add Ingredients */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Add Ingredients</label>
                        <div className="flex flex-wrap gap-2">
                          {availableIngredients.map(ingredient => {
                            const isSelected = selectedIngredients.some(ing => ing.id === ingredient.id);
                            return (
                              <Button 
                                key={ingredient.id}
                                variant={isSelected ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => !isSelected && handleAddIngredient(ingredient.id)}
                                disabled={isSelected}
                              >
                                {!isSelected && <Plus className="h-4 w-4 mr-1" />}
                                {ingredient.name}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Ingredients */}
                      {selectedIngredients.length > 0 ? (
                        <div>
                          <label className="block text-sm font-medium mb-2">Selected Ingredients</label>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ingredient</TableHead>
                                <TableHead>Quantity (kg)</TableHead>
                                <TableHead>Protein (%)</TableHead>
                                <TableHead>Energy (kcal/kg)</TableHead>
                                <TableHead>Calcium (%)</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedIngredients.map(ingredient => (
                                <TableRow key={ingredient.id}>
                                  <TableCell>{ingredient.name}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Input
                                        type="number"
                                        value={ingredient.quantity}
                                        onChange={(e) => handleQuantityChange(ingredient.id, parseFloat(e.target.value) || 0)}
                                        className="w-20 h-8"
                                        min="0"
                                        step="0.1"
                                      />
                                      <span className="ml-1">{ingredient.unit}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{ingredient.protein}%</TableCell>
                                  <TableCell>{ingredient.energy}</TableCell>
                                  <TableCell>{ingredient.calcium}%</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveIngredient(ingredient.id)}
                                      className="h-8 w-8 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-6 text-center rounded-md">
                          <p className="text-gray-500">No ingredients selected. Add ingredients from the list above.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="optimized">
                    {optimizationResults && (
                      <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-md flex items-start">
                          <Info className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-green-800 font-medium">Optimization Results</p>
                            <p className="text-sm text-green-700 mt-1">
                              This formula has been optimized for {form.getValues().targetNutrition} nutrition. 
                              Review the results and apply them to your formula if desired.
                            </p>
                          </div>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ingredient</TableHead>
                              <TableHead>Quantity (kg)</TableHead>
                              <TableHead>Protein (%)</TableHead>
                              <TableHead>Energy (kcal/kg)</TableHead>
                              <TableHead>Calcium (%)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {optimizationResults.ingredients.map((ingredient: Ingredient) => (
                              <TableRow key={ingredient.id}>
                                <TableCell>{ingredient.name}</TableCell>
                                <TableCell>{ingredient.quantity} {ingredient.unit}</TableCell>
                                <TableCell>{ingredient.protein}%</TableCell>
                                <TableCell>{ingredient.energy}</TableCell>
                                <TableCell>{ingredient.calcium}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={applyOptimizationResults}
                            className="bg-green-700 hover:bg-green-800"
                          >
                            Apply This Formula
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Nutritional Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Analysis</CardTitle>
                <CardDescription>Calculated nutritional values based on current formula</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedIngredients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-blue-800 font-medium">Protein</p>
                      <div className="flex items-baseline mt-1">
                        <p className="text-2xl font-semibold text-blue-700">{nutritionTotals.protein.toFixed(2)}</p>
                        <p className="text-blue-600 ml-1">kg</p>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        {(nutritionTotals.protein / nutritionTotals.totalWeight * 100).toFixed(2)}% of total weight
                      </p>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-md">
                      <p className="text-amber-800 font-medium">Energy</p>
                      <div className="flex items-baseline mt-1">
                        <p className="text-2xl font-semibold text-amber-700">{nutritionTotals.energy.toFixed(2)}</p>
                        <p className="text-amber-600 ml-1">kcal/kg</p>
                      </div>
                      <p className="text-sm text-amber-600 mt-1">Average energy density</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="text-green-800 font-medium">Calcium</p>
                      <div className="flex items-baseline mt-1">
                        <p className="text-2xl font-semibold text-green-700">{nutritionTotals.calcium.toFixed(2)}</p>
                        <p className="text-green-600 ml-1">kg</p>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {(nutritionTotals.calcium / nutritionTotals.totalWeight * 100).toFixed(2)}% of total weight
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 text-center rounded-md">
                    <p className="text-gray-500">Add ingredients to see nutritional analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default FeedFormulaCreate;