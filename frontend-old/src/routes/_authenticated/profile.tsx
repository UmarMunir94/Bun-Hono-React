import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueryOptions, getAllEducationQueryOptions } from "@/lib/api";
import { signOut } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/profile")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getAllEducationQueryOptions),
  component: Profile,
});

function Profile() {
  const queryClient = useQueryClient();
  const { isPending, error, data } = useQuery(userQueryOptions);
  const { data: eduData } = useQuery(getAllEducationQueryOptions);

  if (isPending) return "loading";
  if (error) return "not logged in";

  if ("error" in data) {
    return <div>{data.error}</div>;
  }

  const initials = data.user.name
    ? data.user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : (data.user.email?.[0] ?? "?").toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            queryClient.clear();
            window.location.href = "/";
          },
        },
      });
    } catch (err) {
      console.error("Logout exception:", err);
      alert("An unexpected error occurred during logout.");
    }
  };

  const educationEntries = eduData?.education ?? [];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* User info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          {data.user.image && (
            <AvatarImage src={data.user.image} alt={data.user.name} />
          )}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xl font-semibold">
            {data.user.name ?? data.user.email}
          </p>
          <p className="text-sm text-muted-foreground">{data.user.email}</p>
        </div>
      </div>

      <Button onClick={handleLogout} variant="outline">
        Logout
      </Button>

      <Separator />

      {/* Education section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Education</h2>
        {educationEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No education entries yet.
          </p>
        ) : (
          educationEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-4 space-y-0.5">
                <p className="font-semibold">{entry.degree}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.institution} · {entry.fieldOfStudy}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.startYear} – {entry.endYear ?? "Present"}
                </p>
                {entry.description && (
                  <p className="text-sm pt-1">{entry.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
