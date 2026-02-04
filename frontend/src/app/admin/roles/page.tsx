"use client";

import { useState, useMemo } from "react";
import {
  useRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAssignPermissionToRole,
  useRemovePermissionFromRole,
  useRole,
} from "@/hooks/use-users";
import type { Role, Permission } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Key, Plus, Pencil, Trash2, Settings, Search, Users } from "lucide-react";
import { toast } from "sonner";

// Helper to parse permission code into resource:action
function parsePermissionCode(code: string) {
  const parts = code.split(":");
  if (parts.length >= 2) {
    return {
      resource: parts[0],
      action: parts.slice(1).join(":"),
    };
  }
  return { resource: code, action: "-" };
}

// Group permissions by resource
function groupPermissionsByResource(permissions: Permission[]) {
  const groups: Record<string, Permission[]> = {};
  permissions.forEach((perm) => {
    const { resource } = parsePermissionCode(perm.code);
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(perm);
  });
  return groups;
}

export default function AdminRolesPage() {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: permissions, isLoading: permissionsLoading } = usePermissions();

  // Role CRUD
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  // Permission assignment
  const assignPermissionMutation = useAssignPermissionToRole();
  const removePermissionMutation = useRemovePermissionFromRole();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showManagePermissionsDialog, setShowManagePermissionsDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });

  // Search states
  const [permissionSearch, setPermissionSearch] = useState("");

  // Get selected role with permissions
  const { data: roleDetail, isLoading: roleDetailLoading } = useRole(
    selectedRole?.id || ""
  );

  // Filter permissions for search
  const filteredPermissions = useMemo(() => {
    if (!permissions) return [];
    if (!permissionSearch) return permissions;
    const search = permissionSearch.toLowerCase();
    return permissions.filter(
      (p) =>
        p.code.toLowerCase().includes(search) ||
        p.name.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
    );
  }, [permissions, permissionSearch]);

  // Group filtered permissions by resource
  const groupedPermissions = useMemo(
    () => groupPermissionsByResource(filteredPermissions),
    [filteredPermissions]
  );

  // Check if permission is assigned to selected role
  const isPermissionAssigned = (permissionId: string) => {
    return roleDetail?.permissions?.some((p) => p.id === permissionId) || false;
  };

  // Handlers
  const handleCreateRole = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      return toast.error("Vui lòng nhập mã và tên vai trò");
    }

    createRoleMutation.mutate(
      {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setFormData({ code: "", name: "", description: "" });
        },
      }
    );
  };

  const handleUpdateRole = () => {
    if (!selectedRole || !formData.name.trim()) {
      return toast.error("Vui lòng nhập tên vai trò");
    }

    updateRoleMutation.mutate(
      {
        id: selectedRole.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowEditDialog(false);
          setSelectedRole(null);
          setFormData({ code: "", name: "", description: "" });
        },
      }
    );
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;

    deleteRoleMutation.mutate(selectedRole.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setSelectedRole(null);
      },
    });
  };

  const handleTogglePermission = (permissionId: string) => {
    if (!selectedRole) return;

    if (isPermissionAssigned(permissionId)) {
      removePermissionMutation.mutate({
        roleId: selectedRole.id,
        permissionId,
      });
    } else {
      assignPermissionMutation.mutate({
        roleId: selectedRole.id,
        permissionId,
      });
    }
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      code: role.code,
      name: role.name,
      description: role.description || "",
    });
    setShowEditDialog(true);
  };

  const openManagePermissionsDialog = (role: Role) => {
    setSelectedRole(role);
    setPermissionSearch("");
    setShowManagePermissionsDialog(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Phân quyền</h1>
        <p className="text-muted-foreground">Xem và quản lý các vai trò và quyền hạn</p>
      </div>

      {/* Roles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Danh sách Vai trò
            </CardTitle>
            <CardDescription>
              Các vai trò được định nghĩa trong hệ thống
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo vai trò
          </Button>
        </CardHeader>
        <CardContent>
          {rolesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : roles && roles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên vai trò</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Số quyền hạn</TableHead>
                  <TableHead>Số người dùng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Badge variant="outline">{role.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {role.name}
                      {role.is_system && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Hệ thống
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {role._count?.permissions || role.permissions?.length || 0} quyền
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{role._count?.users || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openManagePermissionsDialog(role)}
                          title="Quản lý quyền hạn"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(role)}
                          title="Chỉnh sửa"
                          disabled={role.is_system}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(role)}
                          title="Xóa"
                          disabled={role.is_system}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chưa có vai trò nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Danh sách Quyền hạn
          </CardTitle>
          <CardDescription>
            Các quyền hạn được định nghĩa trong hệ thống ({permissions?.length || 0} quyền)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : permissions && permissions.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupPermissionsByResource(permissions)).map(
                ([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        {resource}
                      </Badge>
                      <span className="text-muted-foreground text-sm font-normal">
                        ({perms.length} quyền)
                      </span>
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Mã quyền</TableHead>
                          <TableHead className="w-[200px]">Tên</TableHead>
                          <TableHead>Mô tả</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {perms.map((perm) => {
                          const { action } = parsePermissionCode(perm.code);
                          return (
                            <TableRow key={perm.id}>
                              <TableCell>
                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                  {perm.code}
                                </code>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{action}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {perm.description || perm.name}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Key className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chưa có quyền hạn nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo vai trò mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cho vai trò mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mã vai trò *</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
                placeholder="VD: EDITOR, REVIEWER"
              />
            </div>
            <div className="space-y-2">
              <Label>Tên vai trò *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="VD: Biên tập viên"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Mô tả về vai trò..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? "Đang tạo..." : "Tạo vai trò"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa vai trò</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin vai trò: {selectedRole?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mã vai trò</Label>
              <Input value={formData.code} disabled />
            </div>
            <div className="space-y-2">
              <Label>Tên vai trò *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="VD: Biên tập viên"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Mô tả về vai trò..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={showManagePermissionsDialog}
        onOpenChange={setShowManagePermissionsDialog}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý quyền hạn cho vai trò: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Chọn hoặc bỏ chọn các quyền hạn cho vai trò này
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm quyền hạn..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Permission groups */}
            {roleDetailLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <h4 className="font-semibold capitalize flex items-center gap-2">
                      <Badge variant="outline">{resource}</Badge>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {perms.map((perm) => {
                        const isAssigned = isPermissionAssigned(perm.id);
                        const { action } = parsePermissionCode(perm.code);
                        return (
                          <div
                            key={perm.id}
                            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                              isAssigned ? "border-primary bg-primary/5" : ""
                            }`}
                            onClick={() => handleTogglePermission(perm.id)}
                          >
                            <Checkbox
                              checked={isAssigned}
                              disabled={
                                assignPermissionMutation.isPending ||
                                removePermissionMutation.isPending
                              }
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {action}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {perm.description || perm.name}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowManagePermissionsDialog(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa vai trò</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vai trò &quot;{selectedRole?.name}&quot;? 
              Hành động này không thể hoàn tác.
              {selectedRole?._count?.users && selectedRole._count.users > 0 && (
                <span className="block mt-2 text-destructive">
                  Cảnh báo: Có {selectedRole._count.users} người dùng đang được gán vai trò này.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRoleMutation.isPending ? "Đang xóa..." : "Xóa vai trò"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
