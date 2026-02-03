"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Search, Filter } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");

  const { data: logs, isLoading } = useAuditLogs({
    page,
    limit: 20,
    ...(actionFilter !== "all" && { action: actionFilter }),
    ...(resourceFilter !== "all" && { resource: resourceFilter }),
  });

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "success" | "destructive" | "warning"> = {
      CREATE: "success",
      UPDATE: "secondary",
      DELETE: "destructive",
      LOGIN: "default",
      LOGOUT: "default",
    };
    return (
      <Badge variant={variants[action] || "secondary"}>
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-gray-600">Theo dõi tất cả hoạt động trong hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lịch sử hoạt động</CardTitle>
              <CardDescription>
                Tổng cộng {logs?.total || 0} bản ghi
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={actionFilter}
                onValueChange={(value) => {
                  setActionFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Lọc action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả action</SelectItem>
                  <SelectItem value="CREATE">CREATE</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="LOGIN">LOGIN</SelectItem>
                  <SelectItem value="LOGOUT">LOGOUT</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={resourceFilter}
                onValueChange={(value) => {
                  setResourceFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Lọc resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả resource</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="withdrawals">Withdrawals</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="workflows">Workflows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs?.data && logs.data.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <>
                            {log.user.firstName} {log.user.lastName}
                            <br />
                            <span className="text-xs text-gray-500">
                              #{log.userId}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">#{log.userId}</span>
                        )}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.targetType && log.targetId && (
                          <span className="text-sm">
                            {log.targetType} #{log.targetId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {log.ipAddress || "-"}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {log.changes && Object.keys(log.changes).length > 0 ? (
                          <code className="text-xs bg-gray-100 p-1 rounded">
                            {JSON.stringify(log.changes).slice(0, 50)}...
                          </code>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trang trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {page} / {Math.ceil((logs.total || 0) / 20)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil((logs.total || 0) / 20)}
                >
                  Trang sau
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chưa có audit log nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
