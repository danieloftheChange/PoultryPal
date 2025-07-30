import { useState, useRef, useCallback } from 'react';
import { DataTable } from '@/components/dataTable/dataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Stock, columns } from "@/components/dataTable/stockColumns";
import Layout from '@/components/layout';
import Navbar2 from '@/components/navBar2';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Package,
  AlertTriangle,
  Filter,
  Plus,
  ChevronDown,
  LucideRefreshCw,
  PlusCircle,
  ShoppingCart,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  X,
  FileText,
  Users,
  RotateCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Enhanced schemas
const stockSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(0, "Quantity must be at least 0"),
  threshold: z.coerce.number().min(0, "Threshold must be at least 0"),
  notes: z.string().optional(),
  supplier: z.string().optional(),
  unitPrice: z.coerce.number().optional(),
  unit: z.string().optional().default("kg"),
});

const bulkAddItemSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(0, "Quantity must be at least 0"),
  threshold: z.coerce.number().min(0, "Threshold must be at least 0"),
  unit: z.string().min(1, "Unit is required"),
  supplier: z.string().optional(),
  unitPrice: z.coerce.number().optional(),
});

const bulkRestockSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    currentQuantity: z.number(),
    addQuantity: z.coerce.number().min(0, "Add quantity must be at least 0"),
  })).min(1, "At least one item must be selected"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof stockSchema>;
type BulkAddItem = z.infer<typeof bulkAddItemSchema>;
type BulkRestockData = z.infer<typeof bulkRestockSchema>;

// CSV template data
const csvTemplate = [
  {
    item: "Layer Feed",
    category: "Feed",
    quantity: 100,
    threshold: 20,
    unit: "kg",
    supplier: "Feed Supplier Co.",
    unitPrice: 15.50
  },
  {
    item: "Vitamins",
    category: "Medicine",
    quantity: 50,
    threshold: 10,
    unit: "bottles",
    supplier: "Vet Supplies Ltd.",
    unitPrice: 25.00
  }
];

// Bulk Operations Components
const BulkAddDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [items, setItems] = useState<BulkAddItem[]>([{
    item: "",
    category: "",
    quantity: 0,
    threshold: 0,
    unit: "kg",
    supplier: "",
    unitPrice: 0,
  }]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const accessToken = localStorage.getItem('accessToken');

  const addItem = () => {
    setItems([...items, {
      item: "",
      category: "",
      quantity: 0,
      threshold: 0,
      unit: "kg",
      supplier: "",
      unitPrice: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BulkAddItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);
    setErrors([]);

    const validItems = items.filter(item => item.item && item.category);
    
    if (validItems.length === 0) {
      setErrors(["At least one valid item is required"]);
      setLoading(false);
      return;
    }

    const newErrors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < validItems.length; i++) {
      try {
        await axios.post(
          'http://92.112.180.180:3000/api/v1/stock',
          validItems[i],
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        successCount++;
      } catch (error) {
        newErrors.push(`Failed to add "${validItems[i].item}": ${error.response?.data?.message || 'Unknown error'}`);
      }
      
      setProgress(((i + 1) / validItems.length) * 100);
    }

    setErrors(newErrors);
    
    if (successCount > 0) {
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setItems([{
          item: "",
          category: "",
          quantity: 0,
          threshold: 0,
          unit: "kg",
          supplier: "",
          unitPrice: 0,
        }]);
        setProgress(0);
      }, 1000);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Add Items</DialogTitle>
          <DialogDescription>
            Add multiple inventory items at once. Fill in the details for each item below.
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="text-red-800 text-sm">{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing items...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Item {index + 1}</h4>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Item Name</label>
                  <Input
                    value={item.item}
                    onChange={(e) => updateItem(index, 'item', e.target.value)}
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={item.category} 
                    onValueChange={(value) => updateItem(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Feed">Feed</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Select 
                    value={item.unit} 
                    onValueChange={(value) => updateItem(index, 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="bottles">Bottles</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Threshold</label>
                  <Input
                    type="number"
                    value={item.threshold}
                    onChange={(e) => updateItem(index, 'threshold', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Unit Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Supplier</label>
                <Input
                  value={item.supplier}
                  onChange={(e) => updateItem(index, 'supplier', e.target.value)}
                  placeholder="Enter supplier name"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addItem}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Item
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || items.every(item => !item.item || !item.category)}
            className="bg-green-700 hover:bg-green-800"
          >
            {loading ? 'Adding Items...' : `Add ${items.filter(item => item.item && item.category).length} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const BulkRestockDialog = ({
  open,
  onOpenChange,
  selectedItems,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: Stock[];
  onSuccess: () => void;
}) => {
  const [restockData, setRestockData] = useState<{[key: string]: number}>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const accessToken = localStorage.getItem('accessToken');

  const updateQuantity = (itemId: string, quantity: number) => {
    setRestockData(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);
    setErrors([]);

    const itemsToRestock = selectedItems.filter(item => restockData[item.id] > 0);
    
    if (itemsToRestock.length === 0) {
      setErrors(["At least one item must have a quantity greater than 0"]);
      setLoading(false);
      return;
    }

    const newErrors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < itemsToRestock.length; i++) {
      const item = itemsToRestock[i];
      const addQuantity = restockData[item.id];
      
      try {
        await axios.patch(
          `http://92.112.180.180:3000/api/v1/stock/${item.id}`,
          {
            quantity: item.quantity + addQuantity,
            notes: notes ? `${item.notes || ''}\n${new Date().toLocaleString()}: Bulk restocked +${addQuantity} ${item.unit || 'kg'} - ${notes}` : item.notes
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        successCount++;
      } catch (error) {
        newErrors.push(`Failed to restock "${item.item}": ${error.response?.data?.message || 'Unknown error'}`);
      }
      
      setProgress(((i + 1) / itemsToRestock.length) * 100);
    }

    setErrors(newErrors);
    
    if (successCount > 0) {
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setRestockData({});
        setNotes('');
        setProgress(0);
      }, 1000);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Restock Items</DialogTitle>
          <DialogDescription>
            Add stock quantities to {selectedItems.length} selected items.
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="text-red-800 text-sm">{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Restocking items...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="space-y-4">
          <div className="grid gap-4">
            {selectedItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{item.item}</h4>
                    <p className="text-sm text-gray-500">
                      Current: {item.quantity} {item.unit || 'kg'} • Category: {item.category}
                    </p>
                  </div>
                  <Badge variant={item.quantity <= item.threshold ? "destructive" : "outline"}>
                    {item.quantity <= item.threshold ? "Low Stock" : "In Stock"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Add Quantity</label>
                    <Input
                      type="number"
                      min="0"
                      value={restockData[item.id] || 0}
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">New Total</label>
                    <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                      {item.quantity + (restockData[item.id] || 0)} {item.unit || 'kg'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this bulk restock operation"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || selectedItems.every(item => !restockData[item.id] || restockData[item.id] <= 0)}
            className="bg-green-700 hover:bg-green-800"
          >
            {loading ? 'Restocking...' : 'Restock Items'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const BulkCheckoutDialog = ({
  open,
  onOpenChange,
  selectedItems,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: Stock[];
  onSuccess: () => void;
}) => {
  const [checkoutData, setCheckoutData] = useState<{[key: string]: number}>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const accessToken = localStorage.getItem('accessToken');

  const updateQuantity = (itemId: string, quantity: number) => {
    setCheckoutData(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);
    setErrors([]);

    const itemsToCheckout = selectedItems.filter(item => checkoutData[item.id] > 0);
    
    if (itemsToCheckout.length === 0) {
      setErrors(["At least one item must have a quantity greater than 0"]);
      setLoading(false);
      return;
    }

    const newErrors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < itemsToCheckout.length; i++) {
      const item = itemsToCheckout[i];
      const removeQuantity = checkoutData[item.id];
      
      if (removeQuantity > item.quantity) {
        newErrors.push(`Cannot checkout ${removeQuantity} ${item.unit || 'kg'} of "${item.item}" - only ${item.quantity} available`);
        setProgress(((i + 1) / itemsToCheckout.length) * 100);
        continue;
      }
      
      try {
        await axios.patch(
          `http://92.112.180.180:3000/api/v1/stock/${item.id}`,
          {
            quantity: item.quantity - removeQuantity,
            notes: notes ? `${item.notes || ''}\n${new Date().toLocaleString()}: Bulk checkout -${removeQuantity} ${item.unit || 'kg'} - ${notes}` : item.notes
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        successCount++;
      } catch (error) {
        newErrors.push(`Failed to checkout "${item.item}": ${error.response?.data?.message || 'Unknown error'}`);
      }
      
      setProgress(((i + 1) / itemsToCheckout.length) * 100);
    }

    setErrors(newErrors);
    
    if (successCount > 0) {
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setCheckoutData({});
        setNotes('');
        setProgress(0);
      }, 1000);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Checkout Items</DialogTitle>
          <DialogDescription>
            Remove stock quantities from {selectedItems.length} selected items.
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="text-red-800 text-sm">{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing checkout...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="space-y-4">
          <div className="grid gap-4">
            {selectedItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{item.item}</h4>
                    <p className="text-sm text-gray-500">
                      Available: {item.quantity} {item.unit || 'kg'} • Category: {item.category}
                    </p>
                  </div>
                  <Badge variant={item.quantity <= item.threshold ? "destructive" : "outline"}>
                    {item.quantity <= item.threshold ? "Low Stock" : "In Stock"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Remove Quantity</label>
                    <Input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={checkoutData[item.id] || 0}
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Remaining</label>
                    <div className={`flex items-center h-10 px-3 border rounded-md ${
                      (item.quantity - (checkoutData[item.id] || 0)) < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                    }`}>
                      {item.quantity - (checkoutData[item.id] || 0)} {item.unit || 'kg'}
                    </div>
                  </div>
                </div>
                
                {(checkoutData[item.id] || 0) > item.quantity && (
                  <p className="text-red-600 text-sm">
                    Cannot remove more than available quantity
                  </p>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this bulk checkout operation"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || selectedItems.every(item => !checkoutData[item.id] || checkoutData[item.id] <= 0)}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Processing...' : 'Checkout Items'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CSVImportDialog = ({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [validData, setValidData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accessToken = localStorage.getItem('accessToken');

  const downloadTemplate = () => {
    const csvContent = [
      ['item', 'category', 'quantity', 'threshold', 'unit', 'supplier', 'unitPrice'],
      ...csvTemplate.map(item => [
        item.item,
        item.category,
        item.quantity,
        item.threshold,
        item.unit,
        item.supplier,
        item.unitPrice
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = useCallback((text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { data: [], errors: ['CSV file is empty or invalid'] };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['item', 'category', 'quantity', 'threshold'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return { 
        data: [], 
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`] 
      };
    }

    const data: any[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        parseErrors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      // Validate required fields
      if (!rowData.item || !rowData.category) {
        parseErrors.push(`Row ${i + 1}: Missing item name or category`);
        continue;
      }

      // Convert numeric fields
      rowData.quantity = Number(rowData.quantity) || 0;
      rowData.threshold = Number(rowData.threshold) || 0;
      rowData.unitPrice = Number(rowData.unitprice || rowData['unit price'] || 0);

      // Set defaults
      rowData.unit = rowData.unit || 'kg';
      rowData.supplier = rowData.supplier || '';

      data.push(rowData);
    }

    return { data, errors: parseErrors };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const { data, errors } = parseCSV(text);
        setCsvData(data);
        setValidData(data);
        setErrors(errors);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (validData.length === 0) return;

    setLoading(true);
    setProgress(0);
    setErrors([]);

    const importErrors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < validData.length; i++) {
      try {
        await axios.post(
          'http://92.112.180.180:3000/api/v1/stock',
          validData[i],
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        successCount++;
      } catch (error) {
        importErrors.push(`Row ${i + 1} (${validData[i].item}): ${error.response?.data?.message || 'Unknown error'}`);
      }
      
      setProgress(((i + 1) / validData.length) * 100);
    }

    setErrors(importErrors);
    
    if (successCount > 0) {
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setFile(null);
        setCsvData([]);
        setValidData([]);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Inventory from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple inventory items at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Download Template
            </Button>
            <span className="text-sm text-gray-500">
              Use this template to format your CSV file correctly
            </span>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <div className="space-y-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Choose CSV File
                </Button>
                <p className="text-sm text-gray-500">
                  Or drag and drop your CSV file here
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {file && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Selected File</h4>
              <p className="text-blue-800">{file.name}</p>
              <p className="text-sm text-blue-600">
                {csvData.length} items found
              </p>
            </div>
          )}

          {errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-red-800 text-sm">{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing items...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {validData.length > 0 && !loading && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b">
                <h4 className="font-medium">Preview ({validData.length} items)</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">Quantity</th>
                      <th className="px-3 py-2 text-left">Unit</th>
                      <th className="px-3 py-2 text-left">Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validData.slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{item.item}</td>
                        <td className="px-3 py-2">{item.category}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">{item.unit}</td>
                        <td className="px-3 py-2">{item.threshold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validData.length > 10 && (
                  <div className="p-3 text-center text-sm text-gray-500 border-t">
                    ... and {validData.length - 10} more items
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={loading || validData.length === 0}
            className="bg-green-700 hover:bg-green-800"
          >
            {loading ? 'Importing...' : `Import ${validData.length} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function StockPage() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Stock | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);
  const [restockNote, setRestockNote] = useState<string>('');
  const [restockLoading, setRestockLoading] = useState(false);
  
  // New state for bulk operations
  const [selectedItems, setSelectedItems] = useState<Stock[]>([]);
  const [bulkAddDialogOpen, setBulkAddDialogOpen] = useState(false);
  const [bulkRestockDialogOpen, setBulkRestockDialogOpen] = useState(false);
  const [bulkCheckoutDialogOpen, setBulkCheckoutDialogOpen] = useState(false);
  const [csvImportDialogOpen, setCsvImportDialogOpen] = useState(false);
  
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;

  const form = useForm<FormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      item: "",
      category: "",
      quantity: 0,
      threshold: 0,
      notes: "",
      supplier: "",
      unitPrice: 0,
      unit: "kg",
    },
  });

  const accessToken = localStorage.getItem('accessToken');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await axios.post(
        'http://92.112.180.180:3000/api/v1/stock',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      console.log('New Stock Added:', res.data);
      form.reset();
      setOpen(false);
      refetch();
    } catch (error) {
      console.error(
        'Stock creation error:',
        error instanceof Error ? error.message : error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!selectedItem) return;

    setRestockLoading(true);
    try {
      const res = await axios.patch(
        `http://92.112.180.180:3000/api/v1/stock/${selectedItem.id}`,
        {
          quantity: selectedItem.quantity + restockAmount,
          notes: restockNote ? `${selectedItem.notes || ''}\n${new Date().toLocaleString()}: Restocked +${restockAmount} ${selectedItem.unit || 'kg'} - ${restockNote}` : selectedItem.notes
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      console.log('Stock Updated:', res.data);
      setRestockDialogOpen(false);
      setSelectedItem(null);
      setRestockAmount(0);
      setRestockNote('');
      refetch();
    } catch (error) {
      console.error(
        'Stock update error:',
        error instanceof Error ? error.message : error
      );
    } finally {
      setRestockLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['item', 'category', 'quantity', 'threshold', 'unit', 'supplier', 'unitPrice', 'notes'],
      ...stock.map(item => [
        item.item,
        item.category,
        item.quantity,
        item.threshold,
        item.unit || 'kg',
        item.supplier || '',
        item.unitPrice || 0,
        (item.notes || '').replace(/\n/g, ' ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const { data: stock = [], isLoading, isError, refetch } = useQuery<Stock[]>({
    queryKey: ['stock'],
    queryFn: async () => {
      try {
        const res = await fetch('http://92.112.180.180:3000/api/v1/stock', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch stock data');
        return res.json();
      } catch (err) {
        console.error('Failed to fetch stock data:', err);
        throw err;
      }
    },
    refetchInterval: 30000,
  });

  // Calculate stock statistics
  const totalItems = stock.length;
  const lowStockItems = stock.filter(item => item.quantity <= item.threshold).length;
  const totalByCategory = stock.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Filter stock based on selected filter
  const filteredStock = stock.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'low') return item.quantity <= item.threshold;
    return item.category === filter;
  });

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const handleSelectionChange = (selectedRows: any[]) => {
    setSelectedItems(selectedRows);
  };

  return (
    <TooltipProvider>
      <Layout>
        <Navbar2 />
        <div className="w-full p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Inventory Management</h2>
              <p className="text-gray-500">Track and manage your farm's inventory levels with bulk operations</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={filter === 'all' ? 'bg-accent text-accent-foreground' : ''}
                    onClick={() => handleFilterChange('all')}
                  >
                    All Items
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={filter === 'low' ? 'bg-accent text-accent-foreground' : ''}
                    onClick={() => handleFilterChange('low')}
                  >
                    Low Stock Items
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {Object.keys(totalByCategory).map(category => (
                    <DropdownMenuItem
                      key={category}
                      className={filter === category ? 'bg-accent text-accent-foreground' : ''}
                      onClick={() => handleFilterChange(category)}
                    >
                      {category} ({totalByCategory[category]})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                title="Refresh stock data"
              >
                <LucideRefreshCw className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export to CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user?.role !== "Worker" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setCsvImportDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import CSV
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-green-700 hover:bg-green-800 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Items
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Single Item
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setBulkAddDialogOpen(true)}>
                        <Users className="mr-2 h-4 w-4" />
                        Bulk Add Items
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>

          {/* Bulk Operations Bar */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkRestockDialogOpen(true)}
                    className="text-green-700 border-green-700 hover:bg-green-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Bulk Restock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkCheckoutDialogOpen(true)}
                    className="text-red-700 border-red-700 hover:bg-red-50"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Bulk Checkout
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItems([])}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stock Overview Cards */}
          {user?.role !== "Worker" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-700 mr-2" />
                    <span className="text-2xl font-bold">{totalItems}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(totalByCategory).map(([category, count]) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}: {count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className={lowStockItems > 0 ? "border-amber-200 bg-amber-50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm font-medium ${lowStockItems > 0 ? "text-amber-700" : "text-gray-500"}`}>
                    Low Stock Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <AlertTriangle className={`h-5 w-5 mr-2 ${lowStockItems > 0 ? "text-amber-600" : "text-gray-700"}`} />
                    <span className={`text-2xl font-bold ${lowStockItems > 0 ? "text-amber-700" : ""}`}>
                      {lowStockItems}
                    </span>
                  </div>
                  {lowStockItems > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
                      onClick={() => handleFilterChange('low')}
                    >
                      View Low Stock Items
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setBulkAddDialogOpen(true)}
                        >
                          <Users className="h-3.5 w-3.5" />
                          Bulk Add
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add multiple items at once</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setCsvImportDialogOpen(true)}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Import
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Import from CSV file</TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filter indication */}
          {filter !== 'all' && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700">
                  {filter === 'low' ? 'Showing low stock items only' : `Filtered by category: ${filter}`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                onClick={() => handleFilterChange('all')}
              >
                Clear Filter
              </Button>
            </div>
          )}

          {/* Enhanced Data Table with selection */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-1">Inventory Items</h3>
              <p className="text-sm text-gray-500">
                {filter === 'all'
                  ? 'Showing all inventory items'
                  : filter === 'low'
                    ? 'Showing low stock items'
                    : `Showing ${filter} items`
                } • Select items for bulk operations
              </p>
            </div>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading inventory data...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-8 bg-red-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">Failed to load inventory data</p>
                <p className="text-red-500 text-sm mt-1">Please check your connection and try again</p>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : filteredStock.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No items found</p>
                {filter !== 'all' ? (
                  <p className="text-gray-500 text-sm mt-1">Try clearing your filter or adding more items</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1">Add your first inventory item to get started</p>
                )}
                <div className="flex gap-2 justify-center mt-4">
                  <Button
                    className="bg-green-700 hover:bg-green-800"
                    onClick={() => setOpen(true)}
                  >
                    Add Single Item
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setBulkAddDialogOpen(true)}
                  >
                    Bulk Add Items
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border">
                <DataTable
                  columns={[
                    ...columns.slice(0, -1),
                    {
                      id: "status",
                      header: "Status",
                      cell: ({ row }) => {
                        const item = row.original;
                        const percentage = Math.min(Math.round((item.quantity / Math.max(item.threshold, 1)) * 100), 100);
                        let statusColor = "bg-green-500";
                        let statusText = "Good";

                        if (item.quantity <= item.threshold) {
                          statusColor = "bg-red-500";
                          statusText = "Low";
                        } else if (item.quantity <= item.threshold * 1.5) {
                          statusColor = "bg-amber-500";
                          statusText = "Warning";
                        }

                        return (
                          <div className="w-28">
                            <div className="flex justify-between items-center mb-1 text-xs">
                              <span>{statusText}</span>
                              <span>{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" indicatorClassName={statusColor} />
                          </div>
                        );
                      },
                    },
                    {
                      id: "actions",
                      header: "Actions",
                      cell: ({ row }) => {
                        const item = row.original;
                        return (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-green-700 border-green-700 hover:bg-green-50"
                              onClick={() => {
                                setSelectedItem(item);
                                setRestockAmount(Math.max(item.threshold * 2 - item.quantity, 10));
                                setRestockDialogOpen(true);
                              }}
                            >
                              Restock
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Checkout</DropdownMenuItem>
                                {user?.role !== "Worker" && (
                                  <>
                                    <DropdownMenuItem>View History</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      },
                    }
                  ]}
                  data={filteredStock}
                  onSelectionChange={handleSelectionChange}
                />
              </div>
            )}
          </div>

          {/* Dialogs */}
          {/* Single item add dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your inventory. Fill out the details below.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Item Details</TabsTrigger>
                  <TabsTrigger value="advanced">Additional Info</TabsTrigger>
                </TabsList>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
                    <TabsContent value="details" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="item"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter item name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Feed">Feed</SelectItem>
                                  <SelectItem value="Medicine">Medicine</SelectItem>
                                  <SelectItem value="Equipment">Equipment</SelectItem>
                                  <SelectItem value="Supplies">Supplies</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter quantity" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                    <SelectItem value="bags">Bags</SelectItem>
                                    <SelectItem value="pcs">Pieces</SelectItem>
                                    <SelectItem value="bottles">Bottles</SelectItem>
                                    <SelectItem value="boxes">Boxes</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Low Stock Threshold</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Enter threshold" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="advanced" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter supplier name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unitPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price (Optional)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Enter unit price" {...field} />
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
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter any additional notes or information about this item"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-green-700 hover:bg-green-800"
                        disabled={loading}
                      >
                        {loading ? 'Adding...' : 'Add Item'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* Restock dialog */}
          <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Restock Inventory</DialogTitle>
                <DialogDescription>
                  Add more stock to {selectedItem?.item}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium">{selectedItem?.item}</p>
                    <div className="flex justify-between mt-1 text-sm">
                      <span className="text-gray-500">Current Stock:</span>
                      <span>{selectedItem?.quantity} {selectedItem?.unit || 'kg'}</span>
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span className="text-gray-500">Threshold:</span>
                      <span>{selectedItem?.threshold} {selectedItem?.unit || 'kg'}</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="amount" className="text-sm font-medium">
                      Amount to Add
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="notes" className="text-sm font-medium">
                      Notes (Optional)
                    </label>
                    <Textarea
                      id="notes"
                      placeholder="Enter details about this restock (supplier, cost, etc.)"
                      value={restockNote}
                      onChange={(e) => setRestockNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRestockDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-700 hover:bg-green-800"
                  onClick={handleRestock}
                  disabled={restockLoading || restockAmount <= 0}
                >
                  {restockLoading ? 'Processing...' : 'Confirm Restock'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Operation Dialogs */}
          <BulkAddDialog
            open={bulkAddDialogOpen}
            onOpenChange={setBulkAddDialogOpen}
            onSuccess={() => {
              refetch();
              setSelectedItems([]);
            }}
          />

          <BulkRestockDialog
            open={bulkRestockDialogOpen}
            onOpenChange={setBulkRestockDialogOpen}
            selectedItems={selectedItems}
            onSuccess={() => {
              refetch();
              setSelectedItems([]);
            }}
          />

          <BulkCheckoutDialog
            open={bulkCheckoutDialogOpen}
            onOpenChange={setBulkCheckoutDialogOpen}
            selectedItems={selectedItems}
            onSuccess={() => {
              refetch();
              setSelectedItems([]);
            }}
          />

          <CSVImportDialog
            open={csvImportDialogOpen}
            onOpenChange={setCsvImportDialogOpen}
            onSuccess={() => {
              refetch();
              setSelectedItems([]);
            }}
          />

          {/* Enhanced Inventory Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-blue-800 font-medium mb-2">Enhanced Inventory Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="list-disc text-blue-700 text-sm ml-5 space-y-1">
                <li>Use bulk operations to efficiently manage multiple items at once</li>
                <li>Import inventory data from CSV files for faster setup</li>
                <li>Export data regularly for backup and analysis purposes</li>
                <li>Select multiple items to perform bulk restocking or checkout</li>
              </ul>
              <ul className="list-disc text-blue-700 text-sm ml-5 space-y-1">
                <li>Set appropriate threshold values to get timely low stock alerts</li>
                <li>Use filters to quickly identify categories needing attention</li>
                <li>Track supplier information for easier reordering</li>
                <li>Add notes to document important details about items</li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    </TooltipProvider>
  );
}

export default StockPage;