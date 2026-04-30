"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import useUpdateRole from "@/services/roles/updateRole";
import useGetAllRoles from "@/services/roles/getAllRoles";

const EditRole = () => {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id as string;
  
  const [roleName, setRoleName] = useState<string>("");

  const { updateRole, loading: updating } = useUpdateRole();
  const { data: roles, loading: loadingRoles, getAllRoles } = useGetAllRoles();

  useEffect(() => {
    getAllRoles();
  }, []);

  useEffect(() => {
    if (roles && roleId) {
      const role = roles.find((r) => r.id === roleId);
      if (role) {
        setRoleName(role.name);
      }
    }
  }, [roles, roleId]);

  const handleUpdate = async () => {
    if (!roleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    try {
      const success = await updateRole({ id: roleId, name: roleName });
      if (success) {
        toast.success("Role updated successfully");
        router.push('/dashboard/roles');
      }
    } catch (error: any) {
      toast.error("Error updating role", {
        description: typeof error === 'string' ? error : error.message
      });
    }
  };

  if (loadingRoles) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12">
        <Card>
          <CardHeader className="border-b border-default-200 mb-6">
            <CardTitle>Edit Role</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">Role Name</Label>
              <Input 
                className="flex-1 min-w-[300px]"
                value={roleName} 
                onChange={(e) => setRoleName(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-center mt-6">
        <Button onClick={handleUpdate} disabled={updating} className="w-full max-w-[200px] gap-2">
          {updating ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
          Update Role
        </Button>
      </div>
    </div>
  );
};

export default EditRole;
