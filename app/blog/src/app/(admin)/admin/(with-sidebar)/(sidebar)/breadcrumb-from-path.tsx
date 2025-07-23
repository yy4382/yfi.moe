"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { breadcrumbForPrefix, data } from "./route-data";
import { Fragment } from "react";

export function BreadcrumbFromPath() {
  const pathname = usePathname();
  const breadcrumb = breadcrumbForPrefix(pathname, data.navMain);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumb.map(({ title, url }, index) => (
          <Fragment key={url}>
            <BreadcrumbItem key={index}>
              <BreadcrumbLink href={url}>{title}</BreadcrumbLink>
            </BreadcrumbItem>
            {index < breadcrumb.length - 1 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
