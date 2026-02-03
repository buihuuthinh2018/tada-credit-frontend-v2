export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  resource?: string;
  action?: string;
  description?: string;
}

export interface AssignRoleRequest {
  roleId: number;
}

export interface AssignPermissionRequest {
  permissionId: number;
}
