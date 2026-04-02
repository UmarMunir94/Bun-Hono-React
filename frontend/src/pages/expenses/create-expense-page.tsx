import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoaderCircleIcon } from 'lucide-react';

import { createExpenseSchema, type CreateExpense } from '@server/sharedTypes';
import {
  createExpense,
  getAllExpensesQueryOptions,
  loadingCreateExpenseQueryOptions,
} from '@/lib/api';

export function CreateExpensePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CreateExpense>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: '',
      amount: '0',
      date: new Date().toISOString(),
    },
  });

  async function onSubmit(values: CreateExpense) {
    setIsProcessing(true);
    const existingExpenses = await queryClient.ensureQueryData(
      getAllExpensesQueryOptions
    );

    // Instead of Tanstack Router, we use React Router Dom for navigation
    navigate('/expenses');

    // loading state
    queryClient.setQueryData(loadingCreateExpenseQueryOptions.queryKey, {
      expense: values,
    });

    try {
      const newExpense = await createExpense({ value: values });

      queryClient.setQueryData(getAllExpensesQueryOptions.queryKey, {
        ...existingExpenses,
        expenses: [newExpense, ...(existingExpenses?.expenses ?? [])],
      });

      toast('Expense Created', {
        description: `Successfully created new expense: ${newExpense.id}`,
      });
    } catch (error) {
      toast('Error', {
        description: `Failed to create new expense`,
      });
    } finally {
      queryClient.setQueryData(loadingCreateExpenseQueryOptions.queryKey, {});
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Expense</CardTitle>
          <CardDescription>
            Add a new expense item to track your spending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Coffee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <div className="self-start">
                      <Calendar
                        mode="single"
                        selected={new Date(field.value)}
                        onSelect={(date) =>
                          field.onChange((date ?? new Date()).toISOString())
                        }
                        className="rounded-md border bg-card"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircleIcon className="h-4 w-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  'Create Expense'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
