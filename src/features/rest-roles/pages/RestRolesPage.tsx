import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ListChecks,
} from "lucide-react";
import api from "@/lib/api";
import { restRoleService } from "../services/restRoleService";
import type { RestRole } from "../types";

export default function RestRolesPage() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<RestRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchIdRef = useRef(0);
  const mySupervisorIdRef = useRef<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RestRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    api.get("/direct-supervisors/me")
      .then((r) => {
        mySupervisorIdRef.current = r.data?._id || null;
      })
      .catch(() => {
        mySupervisorIdRef.current = null;
      });
  }, []);

  const fetchData = useCallback(
    async (pageNum: number, searchTerm: string) => {
      const id = ++fetchIdRef.current;
      setIsLoading(true);
      try {
        const params: Record<string, unknown> = { page: pageNum, limit: 10 };
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (mySupervisorIdRef.current) params.direct_supervisor_id = mySupervisorIdRef.current;
        const { data } = await api.get("/rest-roles", { params });
        if (id === fetchIdRef.current) {
          const result = data as { data: RestRole[]; total: number; page: number; total_pages: number };
          setRoles(result.data ?? []);
          setTotal(result.total ?? 0);
          setPage(result.page ?? 1);
          setTotalPages(result.total_pages ?? 0);
        }
      } catch {
        if (id === fetchIdRef.current) {
          setRoles([]);
          setTotal(0);
        }
      } finally {
        if (id === fetchIdRef.current) setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(1, search), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchData]);

  const refresh = () => fetchData(page, search);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await restRoleService.delete(deleteTarget._id);
      setDeleteTarget(null);
      refresh();
    } catch {
      // handled
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Roles de Descanso
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión de roles de descanso y asignación de empleados
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="btn-primary-action"
          onClick={() => navigate("/rest-roles/new")}
        >
          <Plus className="h-4 w-4" />
          Agregar Rol de Descanso
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por unidad de negocio o tipo..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ListChecks className="h-4 w-4 text-primary" />
            {total} roles de descanso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidad de negocio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Jefe Directo</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Semana</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && roles.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-6 bg-muted/40 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    {search ? `Sin resultados para "${search}"` : "No hay roles de descanso registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role, i) => (
                  <TableRow
                    key={role._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <TableCell>
                      <span className="font-medium">{role.business_unit}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={role.type === "fijo" ? "info" : "warning"}
                        className="text-white"
                      >
                        {role.type === "fijo" ? "Fijo" : "Recorrido"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell>{role.week}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer text-muted-foreground hover:text-primary"
                          onClick={() => navigate(`/rest-roles/${role._id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(role)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({total} registros)
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => fetchData(page - 1, search)}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => fetchData(page + 1, search)}
              className="cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        dismissible={false}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar rol de descanso
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar el rol de descanso{" "}
              <strong>{deleteTarget?.business_unit}</strong>?
              <br />
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
