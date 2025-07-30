import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const birdCountSchema = z.object({
  dead: z.coerce.number().min(0, "Dead count must be non-negative").optional(),
  culled: z.coerce.number().min(0, "Culled count must be non-negative").optional(),
  offlaid: z.coerce.number().min(0, "Offlaid count must be non-negative").optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  return (data.dead && data.dead > 0) || 
         (data.culled && data.culled > 0) || 
         (data.offlaid && data.offlaid > 0);
}, {
  message: "At least one count (dead, culled, or offlaid) must be greater than 0",
  path: ["dead"], // This will show the error on the dead field
});

type FormData = z.infer<typeof birdCountSchema>;

interface Batch {
  id: string;
  name: string;
  originalCount: number;
  currentCount: number;
  dead: number;
  culled: number;
  offlaid: number;
  chickenType: string;
}

interface BirdCountUpdateDialogProps {
  batch: Batch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BirdCountUpdateDialog = ({
  batch,
  open,
  onOpenChange,
  onSuccess,
}: BirdCountUpdateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(birdCountSchema),
    defaultValues: {
      dead: 0,
      culled: 0,
      offlaid: 0,
      reason: '',
      notes: '',
    },
  });

  const accessToken = localStorage.getItem('accessToken');

  const onSubmit = async (data: FormData) => {
    if (!batch) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        dead: data.dead || 0,
        culled: data.culled || 0,
        offlaid: data.offlaid || 0,
        reason: data.reason,
        notes: data.notes,
      };

      await axios.patch(
        `http://92.112.180.180:3000/api/v1/batch/${batch.id}/counts`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating bird counts:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update bird counts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate potential new totals for validation display
  const currentDead = form.watch('dead') || 0;
  const currentCulled = form.watch('culled') || 0;
  const currentOfflaid = form.watch('offlaid') || 0;
  const totalToAdd = currentDead + currentCulled + currentOfflaid;
  const newCurrentCount = batch ? batch.currentCount - totalToAdd : 0;
  const wouldExceedLimit = batch ? (batch.dead + batch.culled + batch.offlaid + totalToAdd) > batch.originalCount : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Bird Counts</DialogTitle>
          <DialogDescription>
            Record changes in bird numbers for {batch?.name}
          </DialogDescription>
        </DialogHeader>

        {batch && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Batch:</span>
              <span>{batch.name} ({batch.chickenType})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Original Count:</span>
              <span>{batch.originalCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Current Count:</span>
              <span className="font-semibold">{batch.currentCount.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Badge variant="outline" className="text-center">
                Dead: {batch.dead}
              </Badge>
              <Badge variant="outline" className="text-center">
                Culled: {batch.culled}
              </Badge>
              <Badge variant="outline" className="text-center">
                Offlaid: {batch.offlaid}
              </Badge>
            </div>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {wouldExceedLimit && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Warning: Total counts would exceed original batch size!
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dead</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Birds that died
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="culled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Culled</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Birds culled
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offlaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offlaid</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Birds sold/removed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disease">Disease outbreak</SelectItem>
                        <SelectItem value="injury">Injury</SelectItem>
                        <SelectItem value="old_age">Old age</SelectItem>
                        <SelectItem value="poor_performance">Poor performance</SelectItem>
                        <SelectItem value="market_sale">Market sale</SelectItem>
                        <SelectItem value="routine_culling">Routine culling</SelectItem>
                        <SelectItem value="overcrowding">Overcrowding</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details about the changes"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {totalToAdd > 0 && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Summary of Changes
                  </span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Total birds to be removed: {totalToAdd}</div>
                  <div>New current count: {newCurrentCount}</div>
                  <div>
                    Remaining percentage: {batch ? ((newCurrentCount / batch.originalCount) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || wouldExceedLimit || totalToAdd === 0}
                className="bg-green-700 hover:bg-green-800"
              >
                {loading ? 'Updating...' : 'Update Counts'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};