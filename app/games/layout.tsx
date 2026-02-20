// app/playstation/layout.tsx
import WithSidebarLayout from "@/app/(with-sidebar)/layout";

export default function PlayStationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Next.js irá automaticamente passar os slots como props
  return <WithSidebarLayout>{children}</WithSidebarLayout>;
}