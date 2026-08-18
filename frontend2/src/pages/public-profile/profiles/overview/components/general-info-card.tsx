import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generalInfoQueryOptions, updateGeneralInfo } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  SquarePen,
  Mail,
  MapPin,
  Phone,
  User,
  Linkedin,
} from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  linkedinProfile: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function GeneralInfoCard() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(generalInfoQueryOptions);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      firstName: data?.generalInfo?.firstName || '',
      lastName: data?.generalInfo?.lastName || '',
      phone: data?.generalInfo?.phone || '',
      city: data?.generalInfo?.city || '',
      country: data?.generalInfo?.country || '',
      linkedinProfile: data?.generalInfo?.linkedinProfile || '',
    },
  });

  const mutation = useMutation({
    mutationFn: updateGeneralInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-general-info'] });
      setIsEditing(false);
      toast.success('General info updated successfully');
    },
    onError: () => {
      toast.error('Failed to update general info');
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate({ value: values });
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const info = data?.generalInfo;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>General Info</CardTitle>
        {!isEditing && (
          <Button variant="ghost" mode="icon" onClick={() => setIsEditing(true)}>
            <SquarePen className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input value={info?.email || ''} disabled />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedinProfile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="linkedin.com/in/johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="grid grid-cols-5 gap-y-4 gap-x-2.5">
            {/* Full Name */}
            <div className="col-span-2 pt-0.5">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5" />
                Full Name
              </div>
            </div>
            <div className="col-span-3">
              <div className="text-foreground">
                {info?.firstName || info?.lastName
                  ? `${info.firstName || ''} ${info.lastName || ''}`.trim()
                  : 'Not provided'}
              </div>
            </div>

            {/* Phone */}
            <div className="col-span-2 pt-0.5">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3.5" />
                Phone
              </div>
            </div>
            <div className="col-span-3">
              <div className="text-foreground">{info?.phone || 'Not provided'}</div>
            </div>

            {/* Email */}
            <div className="col-span-2 pt-0.5">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5" />
                Email
              </div>
            </div>
            <div className="col-span-3">
              <div className="text-foreground">{info?.email || 'Not provided'}</div>
            </div>

            {/* LinkedIn */}
            <div className="col-span-2 pt-0.5">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Linkedin className="size-3.5" />
                LinkedIn Profile
              </div>
            </div>
            <div className="col-span-3">
              <div className="text-foreground">
                {info?.linkedinProfile ? (
                  <a
                    href={
                      info.linkedinProfile.startsWith('http')
                        ? info.linkedinProfile
                        : `https://${info.linkedinProfile}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {info.linkedinProfile}
                  </a>
                ) : (
                  'Not provided'
                )}
              </div>
            </div>

            {/* Location */}
            <div className="col-span-2 pt-0.5">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                Location
              </div>
            </div>
            <div className="col-span-3">
              <div className="text-foreground">
                {info?.city || info?.country
                  ? `${info.city || ''}${info.city && info.country ? ', ' : ''}${info.country || ''}`
                  : 'Not provided'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
