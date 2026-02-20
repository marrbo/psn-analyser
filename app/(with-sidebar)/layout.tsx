// app/(with-sidebar)/layout.tsx
'use client';

import { HeaderProvider } from "@/providers/HeaderContext";
import RouteBackComponent from "@/app/components/RouteBack";
import BackgroundImage from "@/app/components/ui/BackgroundImage";
import NavigationBarComponent from "../components/NavigationBar";

export default function WithSidebarLayout({
  children,
  childrenRight,
}: {
  children: React.ReactNode;
  childrenRight?: React.ReactNode;
}) {
  return (
    <HeaderProvider>
      
      <BackgroundImage />
      
      <NavigationBarComponent />
      
      <div className="container max-w-screen h-screen w-full flex relative">
        <RouteBackComponent />  
        <div className={`w-full min-w-100 left-0 top-0 right-0 bottom-0 overflow-hidden`}>
          {childrenRight}
        </div>
        <div id="layout" className={`absolute p-0 pb-0 top-30 lg:top-32 bottom-0 left-0 lg:left-105 right-0`}>
          {children}
        </div>
      </div>
    </HeaderProvider>
  );
}