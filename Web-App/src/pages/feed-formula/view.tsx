import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Check, ChevronLeft, Download, Edit, Info, Printer} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Ingredient {
  name: string;
  quantity: number;
}

interface FeedFormula {
  id: string;
  farm: string;
  name: string;
  ingredients: Ingredient[];
  targetNutrition: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock nutrition content calculations based on ingredients
const calculateNutritionContent = (ingredients: Ingredient[]) => {
  // Mock nutritional values for ingredients (in a real app, these would come from a database)
  const nutritionValues: Record<string, { protein: number; energy: number; calcium: number }> = {
    "Corn": { protein: 9, energy: 365, calcium: 0.02 },
    "Soybean Meal": { protein: 48, energy: 340, calcium: 0.3 },
    "Wheat Bran": { protein: 15, energy: 260, calcium: 0.12 },
    "Limestone": { protein: 0, energy: 0, calcium: 38 },
    "Fish Meal": { protein: 60, energy: 290, calcium: 4 },
    "Vitamin Premix": { protein: 0, energy: 0, calcium: 0 },
    "Salt": { protein: 0, energy: 0, calcium: 0 },
    // Default values for any ingredients not explicitly listed
    "default": { protein: 10, energy: 250, calcium: 0.5 }
  };

  let totalWeight = 0;
  let totalProtein = 0;
  let totalEnergy = 0;
  let totalCalcium = 0;

  ingredients.forEach(ingredient => {
    const nutrition = nutritionValues[ingredient.name] || nutritionValues.default;
    totalWeight += ingredient.quantity;
    totalProtein += (nutrition.protein * ingredient.quantity / 100);
    totalEnergy += (nutrition.energy * ingredient.quantity / 100);
    totalCalcium += (nutrition.calcium * ingredient.quantity / 100);
  });

  return {
    totalWeight,
    totalProtein,
    totalEnergy,
    totalCalcium,
    proteinPercentage: totalWeight > 0 ? (totalProtein / totalWeight * 100) : 0,
    calciumPercentage: totalWeight > 0 ? (totalCalcium / totalWeight * 100) : 0,
    energyAverage: totalWeight > 0 ? (totalEnergy / ingredients.length) : 0
  };
};

// Helper for formatting dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get the appropriate color for nutrition type badge
const getNutritionTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'high protein':
      return 'bg-blue-100 text-blue-800';
    case 'high calcium':
      return 'bg-green-100 text-green-800';
    case 'high carbohydrate':
      return 'bg-yellow-100 text-yellow-800';
    case 'high vitamins & minerals':
      return 'bg-purple-100 text-purple-800';
    default: // balanced
      return 'bg-gray-100 text-gray-800';
  }
};

function FeedFormulaView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formula, setFormula] = useState<FeedFormula | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("composition");
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormula = async () => {
      setLoading(true);
      try {
        // In a real application, you would call your API here
        // For this example, we'll use a mock formula data
        
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock formula data
        const mockFormula: FeedFormula = {
          id: id || 'mock-id',
          farm: 'Farm 1',
          name: 'Layer Production Formula',
          ingredients: [
            { name: 'Corn', quantity: 45 },
            { name: 'Soybean Meal', quantity: 25 },
            { name: 'Wheat Bran', quantity: 15 },
            { name: 'Limestone', quantity: 8 },
            { name: 'Vitamin Premix', quantity: 2 },
            { name: 'Salt', quantity: 0.5 }
          ],
          targetNutrition: 'balanced',
          notes: 'This formula is designed for layer hens in peak production phase. Adjust calcium levels if egg shell quality decreases.',
          createdAt: '2025-05-01T08:30:00Z',
          updatedAt: '2025-05-12T14:15:00Z'
        };
        
        setFormula(mockFormula);
        
        // Calculate nutrition content based on ingredients
        const nutrition = calculateNutritionContent(mockFormula.ingredients);
        setNutritionData(nutrition);
      } catch (err) {
        console.error('Error fetching formula:', err);
        setError('Failed to load formula details. Please try again later.');
        setErrorMessage('There was a problem loading the formula details.');
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchFormula();
  }, [id]);

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

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!formula) return;
    
    try {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Feed Formula: " + formula.name + "\r\n";
      csvContent += "Target Nutrition: " + formula.targetNutrition + "\r\n\r\n";
      csvContent += "Ingredient,Quantity (kg)\r\n";
      
      formula.ingredients.forEach(ing => {
        csvContent += `${ing.name},${ing.quantity}\r\n`;
      });
      
      // Create download link and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${formula.name.replace(/\s+/g, '_')}_formula.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage("Formula has been exported as CSV file.");
    } catch (error) {
      setErrorMessage("Failed to export formula. Please try again.");
      console.error("Export error:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar2 />
        <div className="w-full space-y-4 p-4 md:p-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full" />
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !formula) {
    return (
      <Layout>
        <Navbar2 />
        <div className="w-full space-y-4 p-4 md:p-8">
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Formula</h3>
              <p className="text-red-700 mt-1">{error || "Formula not found"}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/feed-formula')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Return to Formula List
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {/* Header with Title and Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/feed-formula')}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-2xl font-semibold">{formula.name}</h2>
            <Badge className={`ml-2 ${getNutritionTypeColor(formula.targetNutrition)}`}>
              {formula.targetNutrition}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              size="sm"
              className="bg-green-700 hover:bg-green-800"
              onClick={() => navigate(`/feed-formula/edit/${formula.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Formula Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Formula Details</CardTitle>
                <CardDescription>Created {formatDate(formula.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                  <p>{formatDate(formula.updatedAt)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Target Nutrition</h4>
                  <p className="capitalize">{formula.targetNutrition}</p>
                </div>
                
                {formula.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                    <p className="text-sm whitespace-pre-line">{formula.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Nutrition Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Summary</CardTitle>
                <CardDescription>Calculated nutritional profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Weight:</span>
                    <span className="font-semibold">{nutritionData.totalWeight.toFixed(1)} kg</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Protein Content:</span>
                      <span className="font-semibold">{nutritionData.proteinPercentage.toFixed(2)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${Math.min(nutritionData.proteinPercentage * 4, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Calcium Content:</span>
                      <span className="font-semibold">{nutritionData.calciumPercentage.toFixed(2)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-green-600 rounded-full" 
                        style={{ width: `${Math.min(nutritionData.calciumPercentage * 8, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Energy Density:</span>
                      <span className="font-semibold">{nutritionData.energyAverage.toFixed(0)} kcal/kg</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Application Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Application Guide</CardTitle>
                <CardDescription>Recommended usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Best suited for:</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {formula.targetNutrition === 'high protein' && 'Young layers starting production'}
                        {formula.targetNutrition === 'high calcium' && 'Mature layers in peak production'}
                        {formula.targetNutrition === 'high carbohydrate' && 'Birds in cold weather conditions'}
                        {formula.targetNutrition === 'high vitamins & minerals' && 'Birds recovering from illness'}
                        {formula.targetNutrition === 'balanced' && 'General maintenance for healthy adult layers'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Typical feeding rate:</span>
                    <span>110-120g per bird/day</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Water availability:</span>
                    <span>Ad libitum</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Storage:</span>
                    <span>Cool, dry place</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Composition and Usage */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList>
                    <TabsTrigger value="composition">Formula Composition</TabsTrigger>
                    <TabsTrigger value="nutrition">Nutritional Analysis</TabsTrigger>
                    <TabsTrigger value="usage">Usage History</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <TabsContent value="composition" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Ingredient</TableHead>
                        <TableHead>Quantity (kg)</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formula.ingredients.map((ingredient, index) => (
                        <TableRow key={`${ingredient.name}-${index}`}>
                          <TableCell className="font-medium">{ingredient.name}</TableCell>
                          <TableCell>{ingredient.quantity} kg</TableCell>
                          <TableCell className="text-right">
                            {((ingredient.quantity / nutritionData.totalWeight) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableCaption>
                      Total Weight: {nutritionData.totalWeight.toFixed(1)} kg
                    </TableCaption>
                  </Table>
                </TabsContent>
                
                <TabsContent value="nutrition" className="mt-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-md">
                        <p className="text-blue-800 font-medium">Protein</p>
                        <div className="flex items-baseline mt-1">
                          <p className="text-2xl font-semibold text-blue-700">{nutritionData.totalProtein.toFixed(2)}</p>
                          <p className="text-blue-600 ml-1">kg</p>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                          {nutritionData.proteinPercentage.toFixed(2)}% of total weight
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-md">
                        <p className="text-amber-800 font-medium">Energy</p>
                        <div className="flex items-baseline mt-1">
                          <p className="text-2xl font-semibold text-amber-700">{nutritionData.energyAverage.toFixed(0)}</p>
                          <p className="text-amber-600 ml-1">kcal/kg</p>
                        </div>
                        <p className="text-sm text-amber-600 mt-1">Average energy density</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-md">
                        <p className="text-green-800 font-medium">Calcium</p>
                        <div className="flex items-baseline mt-1">
                          <p className="text-2xl font-semibold text-green-700">{nutritionData.totalCalcium.toFixed(2)}</p>
                          <p className="text-green-600 ml-1">kg</p>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          {nutritionData.calciumPercentage.toFixed(2)}% of total weight
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Nutritional Requirements for Layers</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nutrient</TableHead>
                            <TableHead>Recommended</TableHead>
                            <TableHead>This Formula</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Protein</TableCell>
                            <TableCell>16-18%</TableCell>
                            <TableCell>{nutritionData.proteinPercentage.toFixed(2)}%</TableCell>
                            <TableCell>
                              {nutritionData.proteinPercentage >= 16 && nutritionData.proteinPercentage <= 18 ? (
                                <span className="flex items-center text-green-600">
                                  <Check className="h-4 w-4 mr-1" /> Optimal
                                </span>
                              ) : nutritionData.proteinPercentage > 14 && nutritionData.proteinPercentage < 20 ? (
                                <span className="flex items-center text-amber-600">
                                  <Info className="h-4 w-4 mr-1" /> Acceptable
                                </span>
                              ) : (
                                <span className="flex items-center text-red-600">
                                  <AlertTriangle className="h-4 w-4 mr-1" /> Needs adjustment
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Calcium</TableCell>
                            <TableCell>3.5-4.0%</TableCell>
                            <TableCell>{nutritionData.calciumPercentage.toFixed(2)}%</TableCell>
                            <TableCell>
                              {nutritionData.calciumPercentage >= 3.5 && nutritionData.calciumPercentage <= 4.0 ? (
                                <span className="flex items-center text-green-600">
                                  <Check className="h-4 w-4 mr-1" /> Optimal
                                </span>
                              ) : nutritionData.calciumPercentage > 3.0 && nutritionData.calciumPercentage < 4.5 ? (
                                <span className="flex items-center text-amber-600">
                                  <Info className="h-4 w-4 mr-1" /> Acceptable
                                </span>
                              ) : (
                                <span className="flex items-center text-red-600">
                                  <AlertTriangle className="h-4 w-4 mr-1" /> Needs adjustment
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Energy</TableCell>
                            <TableCell>270-290 kcal/kg</TableCell>
                            <TableCell>{nutritionData.energyAverage.toFixed(0)} kcal/kg</TableCell>
                            <TableCell>
                              {nutritionData.energyAverage >= 270 && nutritionData.energyAverage <= 290 ? (
                                <span className="flex items-center text-green-600">
                                  <Check className="h-4 w-4 mr-1" /> Optimal
                                </span>
                              ) : nutritionData.energyAverage > 250 && nutritionData.energyAverage < 310 ? (
                                <span className="flex items-center text-amber-600">
                                  <Info className="h-4 w-4 mr-1" /> Acceptable
                                </span>
                              ) : (
                                <span className="flex items-center text-red-600">
                                  <AlertTriangle className="h-4 w-4 mr-1" /> Needs adjustment
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="usage" className="mt-0">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                      <p className="text-blue-800">This formula has not been applied to any batches yet.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-3">How to apply this formula:</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>Go to the Batches section</li>
                        <li>Select the batch you want to apply this formula to</li>
                        <li>Click on "Feeding" tab</li>
                        <li>Select "Apply Formula" and choose this formula from the list</li>
                      </ol>
                      <Button
                        className="mt-4 bg-green-700 hover:bg-green-800"
                        onClick={() => navigate('/birds')}
                      >
                        Go to Batches
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
            
            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Estimated formula cost based on current market prices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Quantity (kg)</TableHead>
                        <TableHead>Est. Price/kg</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formula.ingredients.map((ingredient, index) => {
                        // Mock prices - in a real app these would come from inventory
                        const priceMap: Record<string, number> = {
                          "Corn": 0.40,
                          "Soybean Meal": 0.65,
                          "Wheat Bran": 0.30,
                          "Limestone": 0.25,
                          "Fish Meal": 1.20,
                          "Vitamin Premix": 3.50,
                          "Salt": 0.20,
                        };
                        const price = priceMap[ingredient.name] || 0.50; // Default price
                        const total = price * ingredient.quantity;
                        
                        return (
                          <TableRow key={`${ingredient.name}-cost-${index}`}>
                            <TableCell>{ingredient.name}</TableCell>
                            <TableCell>{ingredient.quantity} kg</TableCell>
                            <TableCell>${price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${total.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableCaption>
                      <div className="flex justify-between font-medium">
                        <span>Total Estimated Cost:</span>
                        <span>
                          ${formula.ingredients.reduce((total, ing) => {
                            const priceMap: Record<string, number> = {
                              "Corn": 0.40,
                              "Soybean Meal": 0.65,
                              "Wheat Bran": 0.30,
                              "Limestone": 0.25,
                              "Fish Meal": 1.20,
                              "Vitamin Premix": 3.50,
                              "Salt": 0.20,
                            };
                            const price = priceMap[ing.name] || 0.50;
                            return total + (price * ing.quantity);
                          }, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Estimated cost per kg:</span>
                        <span>
                          ${(formula.ingredients.reduce((total, ing) => {
                            const priceMap: Record<string, number> = {
                              "Corn": 0.40,
                              "Soybean Meal": 0.65,
                              "Wheat Bran": 0.30,
                              "Limestone": 0.25,
                              "Fish Meal": 1.20,
                              "Vitamin Premix": 3.50,
                              "Salt": 0.20,
                            };
                            const price = priceMap[ing.name] || 0.50;
                            return total + (price * ing.quantity);
                          }, 0) / nutritionData.totalWeight).toFixed(2)}
                        </span>
                      </div>
                    </TableCaption>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default FeedFormulaView;