import { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buildBreadcrumbTrail } from "@/lib/breadcrumbs";

export function Breadcrumbs() {
  const { pathname } = useLocation();

  const items = useMemo(() => buildBreadcrumbTrail(pathname), [pathname]);

  if (items.length <= 1) return null;

  return (
    <Breadcrumb className="mb-6 animate-fade-in">
      <BreadcrumbList>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <Fragment key={item.path ?? item.label}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : item.path ? (
                  <BreadcrumbLink
                    render={
                      <Link
                        to={item.path}
                        className="transition-colors duration-200 hover:text-[hsl(var(--sidebar-accent))]"
                      />
                    }
                  >
                    {i === 0 ? (
                      <LayoutDashboard className="h-3.5 w-3.5" />
                    ) : (
                      item.label
                    )}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="[&>svg]:text-[hsl(var(--sidebar-accent)_/_0.4)]" />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
