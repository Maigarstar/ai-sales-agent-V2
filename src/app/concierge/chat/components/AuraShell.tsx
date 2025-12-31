"use client";

import React, { useState, useEffect } from "react";
import AuraSidebar from "./AuraSidebar";
import AuraTopBar from "./AuraTopBar";

export default function AuraShell({ children, session, userType }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLightMode, setIsLightMode] = useState(false);

  // Sync theme with local storage for my build only
  useEffect(() => {
    const saved = localStorage.getItem("aura_build_theme");
    if (saved === "light") setIsLightMode(true);
  }, []);

  const toggleTheme = () => {
    const next = !isLightMode;
    setIsLightMode(next);
    localStorage.setItem("aura_build_theme", next ? "light" : "dark");
  };

  return (
    <div className={`flex h-screen transition-all duration-500 ${
      isLightMode ? "bg-[#F9F9F7]" : "bg-[#0E100F]"
    }`}>
      {/* Isolated Aura Sidebar */}
      <AuraSidebar 
        open={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        isLightMode={isLightMode}
        userType={userType}
      />

      <div className="flex min-w-0 flex-1 flex-col relative">
        {/* Isolated Aura TopBar */}
        <AuraTopBar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          isLightMode={isLightMode}
          onToggleTheme={toggleTheme}
          session={session}
          userType={userType}
        />

        {/* Main Chat Canvas */}
        <main className="flex-1 overflow-hidden relative">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, { 
                isLightMode, 
                session, 
                userType 
              });
            }
            return child;
          })}
        </main>
      </div>
    </div>
  );
}