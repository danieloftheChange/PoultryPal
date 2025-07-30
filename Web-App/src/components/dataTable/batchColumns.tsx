"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type Batch = {
  id: string
  name: string
  arrivalDate: Date
  ageAtArrival: number
  chickenType: string
  originalCount: number // Renamed from quantity
  currentCount: number // New virtual field
  supplier: string
  dead: number // New tracking attribute
  culled: number // New tracking attribute
  offlaid: number // New tracking attribute
  isArchived: boolean
}

export const columns: ColumnDef<Batch>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "item",
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
         Batch Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "arrivalDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Arrival Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("arrivalDate"))
      return <div>{date.toLocaleDateString()}</div>
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "ageAtArrival",
    header: "Age at Arrival (days)",
  },
  {
    id: "age",
    accessorFn: (row) => {
      const arrivalDate = new Date(row.arrivalDate)
      const currentDate = new Date()
      const daysDifference = Math.floor(
        (currentDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const totalAgeInDays = daysDifference + row.ageAtArrival
      return Math.floor(totalAgeInDays / 7) // Returns the age in weeks for sorting
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Age (Weeks)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("age")} weeks</div>,
    sortingFn: "auto", // Enables numerical sorting
  },
  {
    accessorKey: "chickenType",
    header: "Chicken Type",
  },
  {
    accessorKey: "originalCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Original Count
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("originalCount") as number;
      return <div className="font-medium">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "currentCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Current Count
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const batch = row.original;
      const currentCount = batch.originalCount - (batch.dead + batch.culled + batch.offlaid);
      const percentageRemaining = ((currentCount / batch.originalCount) * 100);
      
      let badgeColor = "bg-green-100 text-green-800";
      if (percentageRemaining < 50) {
        badgeColor = "bg-red-100 text-red-800";
      } else if (percentageRemaining < 80) {
        badgeColor = "bg-yellow-100 text-yellow-800";
      }
      
      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium">{currentCount.toLocaleString()}</div>
          <Badge variant="outline" className={`text-xs ${badgeColor}`}>
            {percentageRemaining.toFixed(1)}% remaining
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const batch = row.original;
      const totalLosses = batch.dead + batch.culled + batch.offlaid;
      const lossPercentage = (totalLosses / batch.originalCount) * 100;
      
      return (
        <div className="flex flex-col gap-1 text-xs">
          <div className="text-red-600">Dead: {batch.dead}</div>
          <div className="text-orange-600">Culled: {batch.culled}</div>
          <div className="text-blue-600">Offlaid: {batch.offlaid}</div>
          <div className="text-gray-500 font-medium">
            Loss: {lossPercentage.toFixed(1)}%
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const batch = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(batch.id)}
            >
              Copy Batch ID
            </DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Update Counts</DropdownMenuItem>
            <DropdownMenuItem>Offlay Batch</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]