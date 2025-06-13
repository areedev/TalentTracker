import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Flag, MapPin, ExternalLink, Mail, Save, Delete, Trash } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Talent } from "@shared/schema";

interface TalentCardProps {
  talent: Talent;
}

const getIconForLink = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('linkedin')) return 'fab fa-linkedin text-blue-600';
  if (lowerName.includes('github')) return 'fab fa-github text-gray-900';
  if (lowerName.includes('twitter')) return 'fab fa-twitter text-blue-400';
  if (lowerName.includes('dribbble')) return 'fab fa-dribbble text-pink-500';
  if (lowerName.includes('behance')) return 'fab fa-behance text-blue-500';
  if (lowerName.includes('instagram')) return 'fab fa-instagram text-pink-600';
  return 'fas fa-globe text-green-600';
};

export default function TalentCard({ talent }: TalentCardProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState(talent.email || "");
  const [note, setNote] = useState(talent.note || "");
  const [important, setImportant] = useState(talent.important || false);

  const updateTalentMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", `/api/talents/${talent.talentId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Talent updated",
        description: "Talent information has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/talents"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating talent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/talents/${talent.talentId}/send-email`);
    },
    onSuccess: () => {
      toast({
        title: "Email sent",
        description: "Email has been sent successfully to the talent.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTalentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/talents/${talent.talentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Talent deleted",
        description: "The talent has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/talents"] });
      // Optional: redirect or remove card from UI
    },
    onError: (error) => {
      toast({
        title: "Error deleting talent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateTalentMutation.mutate({
      email: email || null,
      note: note || null,
      important,
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this talent?")) {
      deleteTalentMutation.mutate();
    }
  }

  const handleSendEmail = () => {
    if (!email) {
      toast({
        title: "No email address",
        description: "Please add an email address before sending.",
        variant: "destructive",
      });
      return;
    }
    sendEmailMutation.mutate();
  };

  return (
    <div
      className={`rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow ${talent.email ? "bg-green-50" : "bg-white"
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900" id={talent.talentId}>{talent.fullName}</h3>
          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
            {talent.nationality && (
              <span className="flex items-center">
                <Flag className="text-xs mr-2" size={12} />
                <span>{talent.nationality}</span>
              </span>
            )}
            {talent.location && (
              <span className="flex items-center">
                <MapPin className="text-xs mr-2" size={12} />
                <span>{talent.location}</span>
              </span>
            )}
          </div>
        </div>
        <Link href={`/talents/${talent.talentId}`}>
          <Button
            variant="outline"
            size="sm"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="mr-2" size={14} />
            View Profile
          </Button>
        </Link>
      </div>

      {/* External Links */}
      {talent.externalLinks && talent.externalLinks.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {talent.externalLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-sm text-slate-700 transition-colors"
            >
              <i className={`${getIconForLink(link.name)} mr-2`}></i>
              {link.name}
            </a>
          ))}
        </div>
      )}

      {/* Editable Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor={`email-${talent.id}`} className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </Label>
          <Input
            id={`email-${talent.id}`}
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
        </div>
        <div>
          <Label htmlFor={`note-${talent.id}`} className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </Label>
          <Input
            id={`note-${talent.id}`}
            type="text"
            placeholder="Add notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <Checkbox
              checked={important}
              onCheckedChange={(checked) => setImportant(checked as boolean)}
              className="w-4 h-4 text-primary bg-white border-slate-300 rounded focus:ring-primary focus:ring-2"
            />
            <span className="ml-2 text-sm text-slate-700">Mark as Important</span>
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEmail}
            disabled={sendEmailMutation.isPending}
            className="px-4 py-2 text-primary hover:bg-primary hover:text-white border border-primary rounded-lg text-sm font-medium transition-colors"
          >
            <Mail className="mr-2" size={14} />
            {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateTalentMutation.isPending}
            className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="mr-2" size={14} />
            {updateTalentMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTalentMutation.isPending}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Trash className="mr-2" size={14} />
            {deleteTalentMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
