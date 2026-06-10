import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@admin/components/ui/card";
import { Button } from "@admin/components/ui/button";
import { Input } from "@admin/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@shared/hooks/use-toast";
import { useCreatePhotographer, useGetRoleSources } from "@admin/services/api";
import { getShootRoleOptions } from "@admin/services/roles";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function PhotographerNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPhotographer = useCreatePhotographer();
  const roleSources = useGetRoleSources();
  const roleOptions = useMemo(() => getShootRoleOptions(roleSources.services), [roleSources.services]);
  const [selectedRole, setSelectedRole] = useState(roleOptions[0]?.value || "");

  useEffect(() => {
    if (!selectedRole && roleOptions[0]?.value) {
      setSelectedRole(roleOptions[0].value);
    }
  }, [roleOptions, selectedRole]);

  const currentRole = selectedRole;

  const handleSave = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!currentRole) {
      toast({ title: "Role required", description: "Select a role or add a new one." });
      return;
    }

    const payload = new FormData();
    payload.append("name", form.get("name"));
    payload.append("email", form.get("email"));
    payload.append("phone", form.get("phone"));
    payload.append("city", form.get("city"));
    payload.append("role", currentRole);
    payload.append("perDayRate", String(Number(form.get("perDayRate"))));

    const avatar = form.get("avatar");
    if (avatar instanceof File && avatar.size > 0) payload.append("avatar", avatar);

    createPhotographer.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Photographer Created", description: "Successfully added new photographer." });
        navigate("/admin/photographers");
      },
      onError: (err) => toast({ title: "Create failed", description: err.message }),
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/photographers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Add New Photographer</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create a new photographer profile</p>
        </div>
      </div>
      
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Photographer Details</CardTitle>
            <CardDescription>Enter the personal and professional details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input name="name" placeholder="Rahul Patel" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input name="email" type="email" placeholder="rahul@gmail.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input name="phone" placeholder="9876543210" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input name="city" placeholder="Ahmedabad" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} required className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm">
                {!roleOptions.length && <option value="">No shoot services found</option>}
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>
              <Input name="avatar" type="file" accept="image/*" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Per Day Rate</label>
              <Input name="perDayRate" type="number" placeholder="3000" required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-5">
            <Button variant="outline" type="button" onClick={() => navigate("/admin/photographers")}>Cancel</Button>
            <Button type="submit" disabled={createPhotographer.isPending} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Save className="h-4 w-4" /> {createPhotographer.isPending ? "Saving..." : "Save Photographer"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
