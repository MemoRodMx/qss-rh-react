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
import { ShieldCheck, Eye, EyeOff, User, Lock, LogIn } from "lucide-react";

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
      {/* Left side — Login form */}
      <div className="flex w-full items-center justify-center p-4 lg:w-[45%]">
        <Card className="w-full max-w-md animate-scale-in border-border/40 bg-card/80 shadow-[var(--shadow-4)] backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-[var(--shadow-2)]">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {APP_NAME}
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Usuario field */}
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="usuario@ejemplo.com"
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
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
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
                variant="teal"
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

      {/* Right side — Hero visual */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary/80">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 shadow-[var(--shadow-4)] backdrop-blur-sm">
            <ShieldCheck className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Controla tu fuerza laboral de seguridad
          </h2>
          <p className="max-w-md text-lg text-white/80">
            Gestiona contrataciones, asistencias, vacaciones y roles de descanso
            desde un solo lugar.
          </p>

          {/* Feature indicators */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { label: "Empleados", value: "Activos" },
              { label: "Asistencia", value: "Tiempo real" },
              { label: "Reportes", value: "Automáticos" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-xs font-medium text-white/60">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 text-xs text-white/40">
          &copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos
          reservados.
        </p>
      </div>

      {/* Mobile footer */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground lg:hidden">
        &copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos
        reservados.
      </p>
    </div>
  );
}
