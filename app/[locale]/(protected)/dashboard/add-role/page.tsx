"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import useInsertRole from "@/services/roles/insertRole";

const AddRole = () => {
  const router = useRouter();
  const [roleName, setRoleName] = useState<string>("");

  const { insertRole, loading } = useInsertRole();

  const onSubmit = async () => {
    if (!roleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    try {
      const success = await insertRole({ roleName });
      if (success) {
        toast.success("Role created successfully");
        router.push("/dashboard/roles");
      }
    } catch (error: any) {
      toast.error("Error creating role", {
        description: typeof error === 'string' ? error : error.message
      });
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12 space-y-4">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle>Role Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-2">
                <Label className="w-[120px]">Role Name</Label>
                <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g. Manager" />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-end mt-4">
        <Button onClick={onSubmit} disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default AddRole;
