import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash } from 'lucide-react';
import { toast } from 'sonner';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllExpensesQueryOptions,
  loadingCreateExpenseQueryOptions,
  deleteExpense,
} from '@/lib/api';

export function ExpensesPage() {
  const { isPending, error, data } = useQuery(getAllExpensesQueryOptions);
  const { data: loadingCreateExpense } = useQuery(
    loadingCreateExpenseQueryOptions
  );

  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
        <p className="text-muted-foreground">List of all your expenses</p>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Id</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingCreateExpense?.expense && (
              <TableRow className="opacity-50">
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell>{loadingCreateExpense.expense.title}</TableCell>
                <TableCell>${loadingCreateExpense.expense.amount}</TableCell>
                <TableCell>
                  {loadingCreateExpense.expense.date.split('T')[0]}
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-4 ml-auto" />
                </TableCell>
              </TableRow>
            )}
            
            {isPending ? (
              Array(3).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.expenses?.length === 0 && !loadingCreateExpense?.expense ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              data?.expenses?.map((expense: any) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.id}</TableCell>
                  <TableCell>{expense.title}</TableCell>
                  <TableCell>${expense.amount}</TableCell>
                  <TableCell>{expense.date.split('T')[0]}</TableCell>
                  <TableCell className="text-right">
                    <ExpenseDeleteButton id={expense.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ExpenseDeleteButton({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteExpense,
    onError: () => {
      toast('Error', {
        description: `Failed to delete expense: ${id}`,
      });
    },
    onSuccess: () => {
      toast('Expense Deleted', {
        description: `Successfully deleted expense: ${id}`,
      });

      queryClient.setQueryData(
        getAllExpensesQueryOptions.queryKey,
        (existingExpenses: any) => {
          if (!existingExpenses) return undefined;
          return {
            ...existingExpenses,
            expenses: existingExpenses.expenses.filter((e: any) => e.id !== id),
          };
        }
      );
    },
  });

  return (
    <Button
      disabled={mutation.isPending}
      onClick={() => mutation.mutate({ id })}
      variant="ghost"
      size="icon"
      className="text-destructive hover:text-destructive/90"
    >
      {mutation.isPending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        <Trash className="h-4 w-4" />
      )}
    </Button>
  );
}
