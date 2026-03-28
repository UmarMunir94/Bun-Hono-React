import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueryOptions } from "@/lib/api";
import { signOut } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

function Profile() {
  const queryClient = useQueryClient();
  const { isPending, error, data } = useQuery(userQueryOptions);

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

  return (
    <div className="p-2">
      <div className="flex items-center gap-2">
        <Avatar>
          {data.user.image && (
            <AvatarImage src={data.user.image} alt={data.user.name} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <p>{data.user.name ?? data.user.email}</p>
      </div>
      <Button onClick={handleLogout} className="my-4">
        Logout
      </Button>
    </div>
  );
}
