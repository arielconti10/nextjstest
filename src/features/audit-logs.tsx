"use client";

import * as React from "react";
import { Calendar, User, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuditLog {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  target: string;
  date: string;
}

const AUDIT_LOGS: AuditLog[] = [
  {
    id: "1",
    user: {
      name: "Albert Flores",
      email: "chambers@acmelabs.com",
      avatar: "AF",
    },
    action: "Edited",
    target: "Private page",
    date: "2022/11/05 11:23 PM",
  },
  {
    id: "2",
    user: {
      name: "Kristin Watson",
      email: "jackson.graham@gmail.com",
      avatar: "KW",
    },
    action: "Viewed",
    target: "Secret Project Q4",
    date: "2022/11/05 11:22 PM",
  },
];

export function AuditLogs() {
  return (
    <Card className="w-full">
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-semibold">Audit log</h1>
        <Button variant="outline">Export</Button>
      </div>

      <div className="flex items-center gap-2 border-b p-4">
        <Select>
          <SelectTrigger className="w-[160px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[160px]">
            <User className="mr-2 h-4 w-4" />
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {AUDIT_LOGS.map((log) => (
              <SelectItem key={log.id} value={log.user.email}>
                {log.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[160px]">
            <Activity className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="edit">Edit</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="create">Create</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="divide-y">
        {AUDIT_LOGS.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={log.user.avatar} />
                <AvatarFallback>{log.user.avatar}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{log.user.name}</span>
                  <span className="text-muted-foreground">{log.action}</span>
                  <span className="font-medium">{log.target}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {log.user.email}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{log.date}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
