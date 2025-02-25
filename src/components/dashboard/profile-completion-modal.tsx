"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subYears } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { logAnalyticsEvent } from "@/components/firebase-analytics-provider";

// This is the client component wrapper that will be used in the server component
export function ProfileCompletionWrapper({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    getUser();
  }, [userId]);

  if (!user) return null;

  return <ProfileCompletionModal user={user} onComplete={() => {}} />;
}

interface ProfileCompletionModalProps {
  user: User;
  onComplete: () => void;
}

export function ProfileCompletionModal({
  user,
  onComplete,
}: ProfileCompletionModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [calendarView, setCalendarView] = useState<
    "calendar" | "year" | "decade"
  >("calendar");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentDecade, setCurrentDecade] = useState(
    Math.floor(new Date().getFullYear() / 10) * 10
  );
  const [manualDateInput, setManualDateInput] = useState("");

  useEffect(() => {
    const checkProfileCompletion = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("birth_date, gender, country, city")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking profile:", error);
        return;
      }

      // Check if any required field is missing
      const incomplete =
        !data.birth_date || !data.gender || !data.country || !data.city;
      setIsProfileComplete(!incomplete);
      setOpen(incomplete);

      // Pre-fill existing data
      if (data.birth_date) {
        const date = new Date(data.birth_date);
        setBirthDate(date);
        setManualDateInput(format(date, "yyyy-MM-dd"));
        setCurrentYear(date.getFullYear());
        setCurrentDecade(Math.floor(date.getFullYear() / 10) * 10);
      } else {
        // Set a reasonable default decade for birth dates (1990s)
        setCurrentDecade(1990);
      }
      if (data.gender) setGender(data.gender);
      if (data.country) setCountry(data.country);
      if (data.city) setCity(data.city);
    };

    checkProfileCompletion();
  }, [user.id]);

  useEffect(() => {
    if (calendarView === "calendar" && currentYear) {
      // Force the calendar to show the selected year
      const yearDate = new Date();
      yearDate.setFullYear(currentYear);

      // Update the defaultMonth of the calendar
      const calendarInstance = document.querySelector(".rdp");
      if (calendarInstance) {
        // This is a hack to force the calendar to update
        calendarInstance.dispatchEvent(
          new CustomEvent("yearChange", {
            detail: { year: currentYear },
          })
        );
      }
    }
  }, [calendarView, currentYear]);

  const handleSubmit = async () => {
    let dateToSubmit = birthDate;

    // Try to parse manual date input if birthDate is not set
    if (!dateToSubmit && manualDateInput) {
      try {
        const parsedDate = new Date(manualDateInput);
        if (!isNaN(parsedDate.getTime())) {
          dateToSubmit = parsedDate;
        }
      } catch (e) {
        // Invalid date format
      }
    }

    if (!dateToSubmit || !gender || !country || !city) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          birth_date: dateToSubmit.toISOString().split("T")[0],
          gender,
          country,
          city,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setOpen(false);
      setIsProfileComplete(true);
      onComplete();

      // Log the profile completion event
      await logAnalyticsEvent("profile_completed", {
        user_id: user.id,
        has_birth_date: !!dateToSubmit,
        has_gender: !!gender,
        has_country: !!country,
        has_city: !!city,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualDateInput(e.target.value);
    try {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        setBirthDate(date);
      }
    } catch (e) {
      // Invalid date format
    }
  };

  const renderYearSelector = () => {
    const startYear = currentDecade;
    const years = [];
    for (let i = 0; i < 12; i++) {
      years.push(startYear + i);
    }

    return (
      <div className="p-2">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDecade(currentDecade - 10)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium">
            {startYear} - {startYear + 11}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDecade(currentDecade + 10)}
            disabled={currentDecade >= new Date().getFullYear() - 10}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant="outline"
              className={cn(
                "h-9 w-full",
                year === currentYear && "bg-primary text-primary-foreground"
              )}
              disabled={year > new Date().getFullYear()}
              onClick={() => {
                setCurrentYear(year);
                setCalendarView("calendar");

                // Create a new date object with the selected year
                const newDate = birthDate ? new Date(birthDate) : new Date();

                newDate.setFullYear(year);

                // Update the birth date and input
                setBirthDate(newDate);
                setManualDateInput(format(newDate, "yyyy-MM-dd"));

                // Force the calendar to update its view to the selected year
                const calendarElement = document.querySelector(".rdp-month");
                if (calendarElement) {
                  // This will force a re-render of the calendar
                  calendarElement.setAttribute("data-year", year.toString());
                }
              }}
            >
              {year}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[1950, 1970, 1990, 2000].map((year) => (
            <Button
              key={`quick-${year}`}
              variant="secondary"
              className="h-9 w-full"
              onClick={() => {
                setCurrentDecade(year);
                setCurrentYear(year);
              }}
            >
              {year}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => setCalendarView("calendar")}
        >
          Back to Calendar
        </Button>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        // Only allow closing if profile is complete
        if (isProfileComplete) {
          setOpen(value);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide the following information to continue using the app.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="birth_date">Date of Birth</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                id="birth_date"
                value={manualDateInput}
                onChange={handleManualDateChange}
                className="flex-1"
                max={new Date().toISOString().split("T")[0]}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  {calendarView === "calendar" ? (
                    <div>
                      <div className="flex justify-center p-2">
                        <Button
                          variant="ghost"
                          onClick={() => setCalendarView("year")}
                        >
                          {birthDate
                            ? format(birthDate, "yyyy")
                            : new Date().getFullYear()}
                        </Button>
                      </div>
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={(date) => {
                          setBirthDate(date);
                          if (date) {
                            setManualDateInput(format(date, "yyyy-MM-dd"));
                          }
                        }}
                        initialFocus
                        disabled={(date) => date > new Date()}
                        defaultMonth={
                          birthDate
                            ? new Date(birthDate)
                            : currentYear
                            ? new Date(currentYear, 0)
                            : subYears(new Date(), 20)
                        }
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </div>
                  ) : (
                    renderYearSelector()
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter your country"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
