import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { Users, Eye, EyeOff, User, Lock, LogIn } from "lucide-react";

const loginSchema = z.object({
  usuario: z.string().min(1, "Usuario no válido"),
  password: z.string().min(1, "Contraseña requerida"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: localStorage.getItem("remembered_user") ?? "",
      remember: !!localStorage.getItem("remembered_user"),
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    try {
      await login({
        username: data.usuario,
        password: data.password,
      });

      if (data.remember) {
        localStorage.setItem("remembered_user", data.usuario);
      } else {
        localStorage.removeItem("remembered_user");
      }

      navigate("/");
    } catch {
      setError("Credenciales inválidas. Intenta de nuevo.");
    }
  };

  return (
    <div className="relative flex min-h-screen">
      {/* Left side — Branding with bubble pattern (hidden on mobile) */}
      <div
        className="relative hidden lg:flex lg:w-[55%] flex-col items-center justify-center overflow-hidden px-12"
        style={{
          background: "linear-gradient(135deg, #323741 0%, #1E2237 100%)",
        }}
      >
        {/* Decorative circles (bubble pattern) */}
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-1/4 h-32 w-32 rounded-full bg-cyan-500/10" />

        {/* Large decorative people icon */}
        <Users
          className="absolute text-white/5"
          style={{
            fontSize: "18rem",
            right: "-2rem",
            bottom: "-2rem",
            width: "18rem",
            height: "18rem",
          }}
        />

        {/* Branding content */}
        <div className="relative z-10 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20">
              <Users className="h-10 w-10 text-cyan-300" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {APP_NAME}
          </h1>
          <div className="mx-auto my-5 h-1 w-12 rounded-full bg-cyan-500" />
          <p className="text-lg font-light text-cyan-300">Sistema de Gestión</p>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
            Administra contrataciones, asistencia, roles de descanso e informes
            desde un solo lugar.
          </p>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 text-xs text-white/40">
          &copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos
          reservados.
        </p>
      </div>

      {/* Mobile branding banner (visible only on small screens) */}
      <div
        className="flex items-center justify-center px-6 py-8 lg:hidden"
        style={{
          background: "linear-gradient(135deg, #323741 0%, #1E2237 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20">
            <Users className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
            <p className="text-xs text-cyan-300">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Right side — Login form */}
      <div className="flex w-full items-center justify-center bg-white p-4 lg:w-[45%]">
        <Card className="w-full max-w-md animate-scale-in border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ">
              &nbsp;
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-gray-800">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-gray-500">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Usuario field */}
              <div className="space-y-2">
                <Label
                  htmlFor="usuario"
                  className="text-sm font-medium text-gray-600"
                >
                  Usuario
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="Nombre de usuario"
                    {...register("usuario")}
                    autoFocus
                    className="pl-8"
                  />
                </div>
                {errors.usuario && (
                  <p className="text-xs text-destructive">
                    {errors.usuario.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-600"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    {...register("password")}
                    className="pl-8 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  {...register("remember")}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  Recordar sesión
                </Label>
              </div>

              {/* Error message */}
              {error && (
                <div className="animate-fade-in rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </>
                )}
              </Button>
            </form>

            {/* Forgot password link */}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <button
                type="button"
                className="cursor-pointer underline-offset-4 hover:text-primary hover:underline transition-colors"
                onClick={() => {
                  // TODO: Implement forgot password flow
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile footer */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground lg:hidden">
        &copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos
        reservados.
      </p>
    </div>
  );
}
