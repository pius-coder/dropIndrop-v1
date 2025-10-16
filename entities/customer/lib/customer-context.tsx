/**
 * Customer Authentication Context
 * Manages customer session state and authentication
 */

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

interface CustomerContextType {
  customer: Customer | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, customer: Customer) => void;
  logout: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("customerToken");

    if (storedToken) {
      // Verify token and get customer data
      fetch("/api/customers/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.customer) {
            setCustomer(data.customer);
            setToken(storedToken);
          } else {
            // Token invalid, clear it
            localStorage.removeItem("customerToken");
          }
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem("customerToken");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, customerData: Customer) => {
    setToken(newToken);
    setCustomer(customerData);
    localStorage.setItem("customerToken", newToken);
  };

  const logout = () => {
    setToken(null);
    setCustomer(null);
    localStorage.removeItem("customerToken");
  };

  const value: CustomerContextType = {
    customer,
    token,
    isLoading,
    isAuthenticated: !!customer && !!token,
    login,
    logout,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}
