import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userService } from "../services/userService";
import {
  PRIVILEGE_RESOURCES,
  PRIV_OPS,
  ALL_ROLE_OPTIONS,
  type UserFormValues,
  type EmployeeOption,
} from "../types";

// ── Zod schema ───────────────────────────────────────────────────────────────
const createSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "El nombre de usuario es obligatorio")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z
    .string()
    .trim()
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.string().min(1, "El rol es obligatorio"),
  employee_id: z.string().optional().default(""),
});

const editSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "El nombre de usuario es obligatorio")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .optional()
    .refine((v) => !v || v.length >= 8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    }),
  role: z.string().min(1, "El rol es obligatorio"),
  employee_id: z.string().optional().default(""),
});

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useUserForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | null>(null);
  const [employeeSuggestions, setEmployeeSuggestions] = useState<
    EmployeeOption[]
  >([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeOption | null>(null);
  const [canAssignSystemRole, setCanAssignSystemRole] = useState(false);

  // Build default privilege values
  const buildDefaultPrivileges = useCallback((): Record<string, boolean> => {
    const defaults: Record<string, boolean> = {};
    for (const res of PRIVILEGE_RESOURCES) {
      for (const op of PRIV_OPS) {
        defaults[`resources.${res.key}.${op}`] = true;
      }
    }
    return defaults;
  }, []);

  const schema = isEditMode ? editSchema : createSchema;

  const form = useForm<UserFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      username: "",
      password: "",
      role: "",
      employee_id: "",
      ...buildDefaultPrivileges(),
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState } = form;
  const { errors } = formState;

  // ── Load record for edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    async function load() {
      try {
        const user = await userService.getById(id!);
        if (cancelled) return;

        // Build values from user data
        const values: Record<string, unknown> = {
          username: user.username,
          password: "",
          role: user.role,
          employee_id: user.employee_id ?? "",
        };

        // Set privilege values
        const privileges = user.privileges ?? {};
        for (const res of PRIVILEGE_RESOURCES) {
          const ops = privileges[res.key];
          values[`resources.${res.key}.view`] = ops?.view === true;
          values[`resources.${res.key}.create`] = ops?.create === true;
          values[`resources.${res.key}.edit`] = ops?.edit === true;
          values[`resources.${res.key}.delete`] = ops?.delete === true;
        }

        reset(values as unknown as UserFormValues);

        // Load linked employee if exists
        if (user.employee_id) {
          const employee = await userService.getEmployeeById(user.employee_id);
          if (!cancelled) setSelectedEmployee(employee);
        }
      } catch {
        setServerError("Error al cargar los datos del usuario");
      } finally {
        if (!cancelled) setIsLoadingRecord(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, reset]);

  // ── Build privileges payload ──────────────────────────────────────────────
  function buildPrivilegesPayload(
    values: Record<string, unknown>,
  ): Record<
    string,
    { view: boolean; create: boolean; edit: boolean; delete: boolean }
  > {
    const resources: Record<
      string,
      { view: boolean; create: boolean; edit: boolean; delete: boolean }
    > = {};
    for (const res of PRIVILEGE_RESOURCES) {
      resources[res.key] = {
        view: !!(values[`resources.${res.key}.view`] as boolean),
        create: !!(values[`resources.${res.key}.create`] as boolean),
        edit: !!(values[`resources.${res.key}.edit`] as boolean),
        delete: !!(values[`resources.${res.key}.delete`] as boolean),
      };
    }
    return resources;
  }

  // ── Search employees ──────────────────────────────────────────────────────
  const searchEmployees = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setEmployeeSuggestions([]);
      return;
    }

    try {
      const results = await userService.searchEmployees(query);
      setEmployeeSuggestions(results);
    } catch {
      setEmployeeSuggestions([]);
    }
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────────
  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload: Record<string, unknown> = {
        username: values.username,
        role: values.role,
        ...(selectedEmployee?._id ? { employee_id: selectedEmployee._id } : {}),
        privileges: buildPrivilegesPayload(
          values as unknown as Record<string, unknown>,
        ),
      };

      if (values.password?.trim()) {
        payload.password = values.password.trim();
      }

      if (isEditMode) {
        await userService.update(id!, payload);
      } else {
        await userService.create(payload);
      }

      navigate("/users");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };
      setServerError(
        err?.response?.data?.message ||
          "Ocurrió un error al guardar el usuario",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Role options (filter System if not allowed) ────────────────────────────
  const roleOptions = canAssignSystemRole
    ? ALL_ROLE_OPTIONS
    : ALL_ROLE_OPTIONS.filter((r) => r.value !== "System");

  return {
    // State
    isSubmitting,
    isLoadingRecord,
    serverError,
    isEditMode,
    selectedEmployee,
    setSelectedEmployee,
    employeeSuggestions,
    setEmployeeSuggestions,
    canAssignSystemRole,
    setCanAssignSystemRole,

    // Form
    form,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,

    // Data
    roleOptions,

    // Actions
    onSubmit,
    searchEmployees,
    navigate,
  };
}
