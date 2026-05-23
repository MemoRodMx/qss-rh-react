import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { GuestRoute } from "@/features/auth/components/GuestRoute";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CustomersPage } from "@/features/customers/pages/CustomersPage";
import { CustomerFormPage } from "@/features/customers/pages/CustomerFormPage";
import { CompaniesPage } from "@/features/companies/pages/CompaniesPage";
import { CompanyFormPage } from "@/features/companies/pages/CompanyFormPage";
import { StatesPage } from "@/features/catalogs/pages/StatesPage";
import { CitiesPage } from "@/features/catalogs/pages/CitiesPage";
import { ZipcodesPage } from "@/features/catalogs/pages/ZipcodesPage";
import { ColoniesPage } from "@/features/catalogs/pages/ColoniesPage";
import { PublicHolidaysPage } from "@/features/catalogs/pages/PublicHolidaysPage";
import { PayrollCalendarsPage } from "@/features/catalogs/pages/PayrollCalendarsPage";
import { ShiftsSchedulesPage } from "@/features/catalogs/pages/ShiftsSchedulesPage";
import { EmployeesPage } from "@/features/employees/pages/EmployeesPage";
import { EmployeeFormPage } from "@/features/employees/pages/EmployeeFormPage";
import { RestRolesPage } from "@/features/rest-roles/pages/RestRolesPage";
import { RestRoleFormPage } from "@/features/rest-roles/pages/RestRoleFormPage";
import { RestRoleDetailPage } from "@/features/rest-roles/pages/RestRoleDetailPage";
import { RestRoleReviewPage } from "@/features/rest-roles/pages/RestRoleReviewPage";

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "customers", element: <CustomersPage /> },
          { path: "customers/new", element: <CustomerFormPage /> },
          { path: "customers/:id/edit", element: <CustomerFormPage /> },
          { path: "companies", element: <CompaniesPage /> },
          { path: "companies/new", element: <CompanyFormPage /> },
          { path: "companies/:id/edit", element: <CompanyFormPage /> },
          { path: "catalogs/states", element: <StatesPage /> },
          { path: "catalogs/cities", element: <CitiesPage /> },
          { path: "catalogs/zipcodes", element: <ZipcodesPage /> },
          { path: "catalogs/colonies", element: <ColoniesPage /> },
          { path: "catalogs/public-holidays", element: <PublicHolidaysPage /> },
          {
            path: "catalogs/payroll-calendars",
            element: <PayrollCalendarsPage />,
          },
          {
            path: "catalogs/shifts-schedules",
            element: <ShiftsSchedulesPage />,
          },
          { path: "employees", element: <EmployeesPage /> },
          { path: "employees/new", element: <EmployeeFormPage /> },
          { path: "employees/:id/edit", element: <EmployeeFormPage /> },
          { path: "rest-roles", element: <RestRolesPage /> },
          { path: "rest-roles/new", element: <RestRoleFormPage /> },
          { path: "rest-roles/:id", element: <RestRoleDetailPage /> },
          { path: "rest-roles/:id/edit", element: <RestRoleFormPage /> },
          { path: "rest-roles/:id/review", element: <RestRoleReviewPage /> },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
