"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  CalendarIcon,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for demonstration - replace with actual API calls
const mockDrops = [
  {
    id: "1",
    name: "Summer Collection Drop",
    scheduledDate: new Date(2024, 11, 15), // Dec 15, 2024
    status: "SCHEDULED",
    products: [
      { id: "p1", name: "Summer Dress", price: 25000 },
      { id: "p2", name: "Beach Hat", price: 15000 },
    ],
    groups: [
      { id: "g1", name: "Fashion Group" },
      { id: "g2", name: "Ladies Fashion" },
    ],
  },
  {
    id: "2",
    name: "Tech Gadgets Drop",
    scheduledDate: new Date(2024, 11, 20), // Dec 20, 2024
    status: "DRAFT",
    products: [
      { id: "p3", name: "Wireless Earbuds", price: 45000 },
      { id: "p4", name: "Smart Watch", price: 120000 },
    ],
    groups: [{ id: "g3", name: "Tech Enthusiasts" }],
  },
  {
    id: "3",
    name: "Holiday Special",
    scheduledDate: new Date(2024, 11, 25), // Dec 25, 2024
    status: "SENT",
    products: [
      { id: "p5", name: "Christmas Ornament", price: 8000 },
      { id: "p6", name: "Gift Basket", price: 35000 },
    ],
    groups: [
      { id: "g1", name: "Fashion Group" },
      { id: "g4", name: "Holiday Shoppers" },
    ],
  },
];

const mockProducts = [
  {
    id: "p1",
    name: "Summer Dress",
    price: 25000,
    category: { name: "Clothing" },
  },
  {
    id: "p2",
    name: "Beach Hat",
    price: 15000,
    category: { name: "Accessories" },
  },
  {
    id: "p3",
    name: "Wireless Earbuds",
    price: 45000,
    category: { name: "Electronics" },
  },
  {
    id: "p4",
    name: "Smart Watch",
    price: 120000,
    category: { name: "Electronics" },
  },
  {
    id: "p5",
    name: "Christmas Ornament",
    price: 8000,
    category: { name: "Decor" },
  },
  { id: "p6", name: "Gift Basket", price: 35000, category: { name: "Gifts" } },
];

const mockGroups = [
  { id: "g1", name: "Fashion Group", isActive: true },
  { id: "g2", name: "Ladies Fashion", isActive: true },
  { id: "g3", name: "Tech Enthusiasts", isActive: true },
  { id: "g4", name: "Holiday Shoppers", isActive: true },
];

export default function DropCalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<any>(null);

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Saturday

    const weeks = [];
    let currentWeek = [];
    let currentDatePointer = new Date(startDate);

    while (currentDatePointer <= endDate) {
      currentWeek.push(new Date(currentDatePointer));

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDatePointer.setDate(currentDatePointer.getDate() + 1);
    }

    return { weeks, month, year };
  }, [currentDate]);

  // Get drops for current month
  const monthDrops = useMemo(() => {
    return mockDrops.filter((drop) => {
      const dropDate = new Date(drop.scheduledDate);
      return (
        dropDate.getMonth() === currentDate.getMonth() &&
        dropDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [currentDate, mockDrops]);

  // Get drops for selected date
  const selectedDateDrops = useMemo(() => {
    if (!selectedDate) return [];
    return mockDrops.filter((drop) => {
      const dropDate = new Date(drop.scheduledDate);
      return dropDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, mockDrops]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "SCHEDULED":
        return <Clock className="h-3 w-3 text-blue-600" />;
      case "DRAFT":
        return <AlertCircle className="h-3 w-3 text-amber-600" />;
      case "CANCELLED":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-green-100 text-green-800 border-green-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DRAFT":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCreateDrop = async (data: any) => {
    try {
      // TODO: Implement API call to create drop
      console.log("Creating drop:", data);
      setShowCreateDialog(false);
      // Refresh data
    } catch (error) {
      console.error("Failed to create drop:", error);
    }
  };

  const handleSendDrop = async (dropId: string) => {
    if (confirm("Are you sure you want to send this drop now?")) {
      try {
        // TODO: Implement API call to send drop
        console.log("Sending drop:", dropId);
        // Refresh data
      } catch (error) {
        console.error("Failed to send drop:", error);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Drop Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage your WhatsApp drops
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "month" ? "week" : "month")}
          >
            {viewMode === "month" ? "Week View" : "Month View"}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Drop
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drops</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDrops.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDrops.filter((d) => d.status === "SCHEDULED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDrops.filter((d) => d.status === "SENT").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthDrops.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              <CardDescription>
                {monthDrops.length} drops scheduled this month
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarData.weeks.map((week, weekIndex) =>
              week.map((date, dayIndex) => {
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const dayDrops = mockDrops.filter((drop) => {
                  const dropDate = new Date(drop.scheduledDate);
                  return dropDate.toDateString() === date.toDateString();
                });

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "min-h-[120px] p-2 border cursor-pointer hover:bg-muted/50 transition-colors",
                      !isCurrentMonth && "text-muted-foreground bg-muted/20",
                      isToday && "bg-primary/10 border-primary"
                    )}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-sm font-medium mb-1">
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayDrops.slice(0, 3).map((drop) => (
                        <div
                          key={drop.id}
                          className={cn(
                            "text-xs px-1 py-0.5 rounded border text-center truncate",
                            getStatusColor(drop.status)
                          )}
                          title={`${drop.name} - ${drop.status}`}
                        >
                          {drop.name}
                        </div>
                      ))}
                      {dayDrops.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayDrops.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Drops for{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
            <CardDescription>
              {selectedDateDrops.length} drop
              {selectedDateDrops.length !== 1 ? "s" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateDrops.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No drops scheduled for this date</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Drop
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateDrops.map((drop) => (
                  <Card key={drop.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{drop.name}</h3>
                            <Badge className={getStatusColor(drop.status)}>
                              {getStatusIcon(drop.status)}
                              <span className="ml-1">{drop.status}</span>
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium mb-1">
                                Products ({drop.products.length})
                              </p>
                              <div className="space-y-1">
                                {drop.products.map((product: any) => (
                                  <div
                                    key={product.id}
                                    className="flex justify-between"
                                  >
                                    <span>{product.name}</span>
                                    <span className="font-medium">
                                      {product.price.toLocaleString()} XAF
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="font-medium mb-1">
                                Groups ({drop.groups.length})
                              </p>
                              <div className="space-y-1">
                                {drop.groups.map((group: any) => (
                                  <div
                                    key={group.id}
                                    className="flex items-center gap-2"
                                  >
                                    <span>{group.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDrop(drop)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {drop.status === "DRAFT" ||
                          drop.status === "SCHEDULED" ? (
                            <Button
                              size="sm"
                              onClick={() => handleSendDrop(drop.id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send Now
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Drop Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Drop</DialogTitle>
            <DialogDescription>
              Schedule a new drop with products and WhatsApp groups
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            <p>
              Drop creation form would go here with product and group selection.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drop Details Dialog */}
      <Dialog
        open={!!selectedDrop}
        onOpenChange={(open) => !open && setSelectedDrop(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDrop?.name}</DialogTitle>
            <DialogDescription>
              Drop scheduled for{" "}
              {selectedDrop?.scheduledDate.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {selectedDrop && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selectedDrop.status)}>
                  {getStatusIcon(selectedDrop.status)}
                  <span className="ml-1">{selectedDrop.status}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Products</h4>
                  <div className="space-y-2">
                    {selectedDrop.products.map((product: any) => (
                      <div
                        key={product.id}
                        className="flex justify-between items-center p-2 border rounded"
                      >
                        <span>{product.name}</span>
                        <span className="font-medium">
                          {product.price.toLocaleString()} XAF
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">WhatsApp Groups</h4>
                  <div className="space-y-2">
                    {selectedDrop.groups.map((group: any) => (
                      <div key={group.id} className="p-2 border rounded">
                        {group.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
