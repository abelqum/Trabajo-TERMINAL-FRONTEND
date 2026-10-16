"use client";

import { createContext, useContext } from "react";

const DashboardSessionContext = createContext(null);

export function DashboardSessionProvider({ value, children }) {
  return (
    <DashboardSessionContext.Provider value={value}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  const context = useContext(DashboardSessionContext);

  if (!context) {
    throw new Error(
      "useDashboardSession debe utilizarse dentro del dashboard.",
    );
  }

  return context;
}
