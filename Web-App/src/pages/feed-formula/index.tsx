import { useState } from 'react';
import axios from 'axios';
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, MoreHorizontal, Search, Clipboard, Edit, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

// Formula type definition
interface FormulaIngredient {
  name: string;
  quantity: number;
}

interface Formula {
  id: string;
  name: string;
  ingredients: FormulaIngredient[];
  targetNutrition: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function FeedFormulaPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  
  // Fetch formulas
  const { data: formulas = [], isLoading, isError, refetch } = useQuery<Formula[]>({
    queryKey: ['formulas'],
    queryFn: async () => {
      try {
        const res = await fetch('http://92.112.180.180:3000/api/v1/feed-formula', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch feed formulas');
        return res.json();
      } catch (err) {
        console.error('Failed to fetch feed formulas:', err);
        throw err;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Handle delete formula
  const handleDeleteFormula = async () => {
    if (!selectedFormula) return;
    
    try {
      await axios.delete(`http://92.112.180.180:3000/api/v1/feed-formula/${selectedFormula.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedFormula(null);
      refetch();
    } catch (error) {
      console.error('Error deleting formula:', error);
    }
  };

  // Filter and search formulas
  const filteredFormulas = formulas
    .filter(formula => 
      formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.targetNutrition.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(formula => filterType === 'all' || formula.targetNutrition === filterType);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get badge color based on nutrition type
  const getNutritionBadgeColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'high protein':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'balanced':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'high vitamins & minerals':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'high calcium':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'high carbohydrate':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Layout>
      <Navbar2 />
      <div className="w-full space-y-4 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Feed Formulas</h2>
            <p className="text-muted-foreground">Manage and create custom feed formulations for your flock</p>
          </div>
          <Button 
            onClick={() => navigate('/feed-formula/create')} 
            className="bg-green-700 hover:bg-green-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Formula
          </Button>
        </div>

        {/* Search and filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Nutrition Types</SelectItem>
                <SelectItem value="high protein">High Protein</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="high vitamins & minerals">High Vitamins & Minerals</SelectItem>
                <SelectItem value="high calcium">High Calcium</SelectItem>
                <SelectItem value="high carbohydrate">High Carbohydrate</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterType('all'); }}>
              Reset
            </Button>
          </div>
        </div>

        {/* Formulas grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-20 bg-gray-100 rounded-t-lg"></CardHeader>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-100 rounded mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            <p>Failed to load feed formulas. Please try again later.</p>
          </div>
        ) : filteredFormulas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Clipboard />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No formulas found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || filterType !== 'all'
                ? "No formulas match your search criteria. Try adjusting your filters."
                : "Start by creating your first feed formula for your poultry."}
            </p>
            <Button 
              onClick={() => navigate('/feed-formula/create')} 
              variant="outline" 
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Formula
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFormulas.map((formula) => (
              <Card 
                key={formula.id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/feed-formula/${formula.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium">{formula.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Created {formatDate(formula.createdAt)}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/feed-formula/${formula.id}`);
                        }}>
                          <Search className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/feed-formula/edit/${formula.id}`);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Formula
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFormula(formula);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Formula
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 space-y-3">
                    <Badge className={getNutritionBadgeColor(formula.targetNutrition)}>
                      {formula.targetNutrition}
                    </Badge>
                    
                    <div className="text-sm text-gray-500">
                      <p><strong>Ingredients:</strong> {formula.ingredients.length}</p>
                      <p className="mt-1 line-clamp-2">
                        {formula.notes || "No additional notes provided."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete confirmation dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Formula</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the formula "{selectedFormula?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteFormula}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default FeedFormulaPage;