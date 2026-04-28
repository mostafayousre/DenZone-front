"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronsUpDown, Loader2, Send } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import useSendNotification, { RecipientType } from "@/services/notifications/sendNotification";
import { toast } from "sonner";
import { UserType } from "@/types/users";

const SendNotificationPage = () => {
  const [recipientType, setRecipientType] = useState<string>("all_doctors");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(new Date());
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  const { users, loading: usersLoading, getUsersByRoleId } = useGetUsersByRoleId();
  const { sendNotification, loading: sending } = useSendNotification();

  useEffect(() => {
    if (recipientType === "specific_doctor") {
      getUsersByRoleId("E48E5A9F-2074-4DE9-A849-5C69FDD45E4E"); // Doctor Role ID
    } else if (recipientType === "specific_provider") {
      getUsersByRoleId("1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D"); // Provider Role ID
    }
  }, [recipientType]);

  const handleSend = async () => {
    if (!title) {
      toast.error("Please enter a title");
      return;
    }

    if (!message) {
      toast.error("Please enter a message");
      return;
    }

    if ((recipientType === "specific_doctor" || recipientType === "specific_provider") && !selectedUserId) {
      toast.error("Please select a recipient");
      return;
    }

    if (!expiryDate) {
      toast.error("Please select an expiry date");
      return;
    }

    let recipientTypeValue = RecipientType.Specific;
    if (recipientType === "all_doctors") recipientTypeValue = RecipientType.AllDoctors;
    else if (recipientType === "all_providers") recipientTypeValue = RecipientType.AllProviders;

    const payload = {
      recipientType: recipientTypeValue,
      userId: recipientType.startsWith("specific") ? selectedUserId : null,
      title,
      message,
      expired: expiryDate.toISOString(),
    };

    const { success, error } = await sendNotification(payload);

    if (success) {
      toast.success("Notification sent successfully!");
      setTitle("");
      setMessage("");
      setSelectedUserId("");
    } else {
      toast.error(error || "Failed to send notification");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Recipient Type</Label>
            <Select value={recipientType} onValueChange={(val) => {
              setRecipientType(val);
              setSelectedUserId("");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select who to send to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_doctors">All Doctors</SelectItem>
                <SelectItem value="all_providers">All Providers</SelectItem>
                <SelectItem value="specific_doctor">Specific Doctor</SelectItem>
                <SelectItem value="specific_provider">Specific Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recipientType.startsWith("specific") && (
            <div className="space-y-2">
              <Label>Select {recipientType.includes("doctor") ? "Doctor" : "Provider"}</Label>
              <Popover open={isUserListOpen} onOpenChange={setIsUserListOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedUserId
                      ? users.find((user: UserType) => user.id === selectedUserId)?.userName
                      : `Search ${recipientType.includes("doctor") ? "doctor" : "provider"}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Search user..." />
                    <CommandList>
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user: UserType) => (
                          <CommandItem
                            key={user.id}
                            value={user.userName}
                            onSelect={() => {
                              setSelectedUserId(user.id);
                              setIsUserListOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUserId === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {user.userName} ({user.email})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">The notification will disappear for the user after this date.</p>
          </div>

          <div className="pt-4">
            <Button onClick={handleSend} className="w-full h-12 text-lg" disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendNotificationPage;
