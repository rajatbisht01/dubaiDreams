"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"; 

export default function MessageTable() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error("fetchMessages error:", err);
    }
    setLoading(false);
  };

  const deleteMessage = async (id) => {
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <p>Loading messages...</p>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>

        <TableBody>
          {messages.map((msg) => (
            <TableRow key={msg.id}>
              <TableCell className="font-medium">{msg.name}</TableCell>
              <TableCell>{msg.email}</TableCell>
              <TableCell className="max-w-[400px] truncate">{msg.message}</TableCell>
              <TableCell>
                {new Date(msg.created_at).toLocaleDateString()}
              </TableCell>
              {/* <TableCell className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMessage(msg.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
