import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSettingsSchema, type Settings } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm({
    resolver: zodResolver(insertSettingsSchema),
    defaultValues: {
      smtpHost: settings?.smtpHost || "",
      smtpPort: settings?.smtpPort || "587",
      smtpUsername: settings?.smtpUsername || "",
      smtpPassword: settings?.smtpPassword || "",
      smtpSecure: settings?.smtpSecure || false,
      emailSubject: settings?.emailSubject || "Hello {{name}}, we'd like to connect!",
      emailTemplate: settings?.emailTemplate || "Dear {{name}},\n\nWe came across your profile and would love to discuss opportunities...\n\nBest regards,\nThe Team",
      fromName: settings?.fromName || "",
      fromEmail: settings?.fromEmail || "",
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    saveSettingsMutation.mutate(data);
  };

  // Update form when settings data loads
  useState(() => {
    if (settings) {
      form.reset({
        smtpHost: settings.smtpHost || "",
        smtpPort: settings.smtpPort || "587",
        smtpUsername: settings.smtpUsername || "",
        smtpPassword: settings.smtpPassword || "",
        smtpSecure: settings.smtpSecure || false,
        emailSubject: settings.emailSubject || "Hello {{name}}, we'd like to connect!",
        emailTemplate: settings.emailTemplate || "Dear {{name}},\n\nWe came across your profile and would love to discuss opportunities...\n\nBest regards,\nThe Team",
        fromName: settings.fromName || "",
        fromEmail: settings.fromEmail || "",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* SMTP Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  SMTP Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input placeholder="587" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your-email@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="smtpSecure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Use TLS/SSL</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Email Template */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Email Template
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emailSubject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Line</FormLabel>
                        <FormControl>
                          <Input placeholder="Hello {{name}}, we'd like to connect!" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emailTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Body</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={8}
                            placeholder="Dear {{name}},&#10;&#10;We came across your profile and would love to discuss opportunities...&#10;&#10;Best regards,&#10;The Team"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium">Template Variables</p>
                      <p className="mt-1">Use <code className="bg-blue-100 px-1 rounded">{'{{name}}'}</code> to automatically insert the talent's full name into your email.</p>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Sender Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Sender Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fromEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="noreply@yourcompany.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={saveSettingsMutation.isPending}
                  className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <Save className="mr-2" size={16} />
                  {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
