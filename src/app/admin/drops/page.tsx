"use client"

import { EventManager, type Event } from "@/components/ui/event-manager"

export default function DropManagementPage() {
  // Demo events with realistic drop-related data
  const demoEvents: Event[] = [
    {
      id: "1",
      title: "Summer Collection Drop",
      description: "Launch of the new summer collection with beachwear and accessories",
      startTime: new Date(2025, 9, 20, 10, 0),
      endTime: new Date(2025, 9, 20, 18, 0),
      color: "blue",
      category: "Product Launch",
      attendees: ["Fashion Team", "Marketing"],
      tags: ["Important", "Launch", "Summer"],
    },
    {
      id: "2",
      title: "Product Photo Shoot",
      description: "Professional photography session for the new jewelry collection",
      startTime: new Date(2025, 9, 21, 9, 0),
      endTime: new Date(2025, 9, 21, 17, 0),
      color: "purple",
      category: "Content Creation",
      tags: ["Photography", "Marketing"],
    },
    {
      id: "3",
      title: "Inventory Check",
      description: "Weekly inventory verification for all active products",
      startTime: new Date(2025, 9, 22, 8, 0),
      endTime: new Date(2025, 9, 22, 12, 0),
      color: "green",
      category: "Operations",
      tags: ["Inventory", "Weekly"],
    },
    {
      id: "4",
      title: "WhatsApp Campaign Planning",
      description: "Strategy meeting for the upcoming WhatsApp marketing campaign",
      startTime: new Date(2025, 9, 23, 14, 0),
      endTime: new Date(2025, 9, 23, 16, 0),
      color: "orange",
      category: "Marketing",
      attendees: ["Marketing Team"],
      tags: ["WhatsApp", "Campaign", "Strategy"],
    },
    {
      id: "5",
      title: "Customer Service Training",
      description: "Training session for handling customer inquiries and order management",
      startTime: new Date(2025, 9, 24, 10, 0),
      endTime: new Date(2025, 9, 24, 12, 0),
      color: "pink",
      category: "Training",
      tags: ["Customer Service", "Training"],
    },
    {
      id: "6",
      title: "Drop Performance Review",
      description: "Analysis of last month's drop performance and customer engagement metrics",
      startTime: new Date(2025, 9, 25, 15, 0),
      endTime: new Date(2025, 9, 25, 17, 0),
      color: "blue",
      category: "Analytics",
      attendees: ["Analytics Team"],
      tags: ["Performance", "Review", "Important"],
    },
    {
      id: "7",
      title: "Supplier Meeting",
      description: "Discussion with fabric suppliers for the winter collection",
      startTime: new Date(2025, 9, 26, 11, 0),
      endTime: new Date(2025, 9, 26, 13, 0),
      color: "red",
      category: "Supplier Relations",
      tags: ["Suppliers", "Winter Collection"],
    },
    {
      id: "8",
      title: "Quality Control Session",
      description: "Final quality check for products before they go into the next drop",
      startTime: new Date(2025, 9, 27, 9, 0),
      endTime: new Date(2025, 9, 27, 16, 0),
      color: "green",
      category: "Quality Control",
      tags: ["Quality", "Pre-Launch"],
    },
    {
      id: "9",
      title: "Social Media Content Creation",
      description: "Creating promotional content for Instagram and TikTok for the upcoming drop",
      startTime: new Date(2025, 9, 28, 13, 0),
      endTime: new Date(2025, 9, 28, 17, 0),
      color: "pink",
      category: "Content Creation",
      tags: ["Social Media", "Content"],
    },
    {
      id: "10",
      title: "Drop Launch Preparation",
      description: "Final preparations for the upcoming product drop including WhatsApp group setup",
      startTime: new Date(2025, 9, 29, 8, 0),
      endTime: new Date(2025, 9, 29, 18, 0),
      color: "orange",
      category: "Launch Preparation",
      attendees: ["All Teams"],
      tags: ["Launch", "Important", "Urgent"],
    },
  ]

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Drop Management Calendar</h1>
        <p className="text-gray-600">
          Manage your product drops, marketing campaigns, and operational tasks in one calendar view.
          This Google Calendar-style interface helps you plan and track all drop-related activities.
        </p>
      </div>

      <EventManager
        events={demoEvents}
        onEventCreate={(event) => console.log("Created drop event:", event)}
        onEventUpdate={(id, event) => console.log("Updated drop event:", id, event)}
        onEventDelete={(id) => console.log("Deleted drop event:", id)}
        categories={["Product Launch", "Marketing", "Operations", "Content Creation", "Training", "Analytics", "Supplier Relations", "Quality Control", "Launch Preparation"]}
        availableTags={["Important", "Urgent", "Launch", "WhatsApp", "Campaign", "Training", "Review", "Performance", "Quality", "Social Media", "Content", "Suppliers", "Pre-Launch", "Weekly"]}
        defaultView="month"
      />
    </div>
  )
}
