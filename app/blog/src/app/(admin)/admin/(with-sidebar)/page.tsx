import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function AdminDashboard() {
  const adminModules = [
    {
      title: "Comments",
      description: "Manage and moderate blog comments",
      href: "/admin/comments",
      icon: "💬",
    },
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      href: "/admin/users",
      icon: "👥",
    },
    {
      title: "Analytics",
      description: "View website analytics and insights",
      href: "/admin/analytics",
      icon: "📊",
      subModules: [
        {
          title: "Umami",
          description: "Umami analytics dashboard",
          href: "/admin/analytics/umami",
        },
        {
          title: "Posthog",
          description: "Posthog analytics dashboard",
          href: "/admin/analytics/posthog",
        },
      ],
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminModules.map((module) => (
          <div key={module.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{module.icon}</span>
                  {module.title}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              {module.subModules && (
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium">Quick Access:</p>
                    {module.subModules.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block hover:text-foreground transition-colors ml-2"
                        // onClick={(e) => e.stopPropagation()}
                      >
                        • {sub.title}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
