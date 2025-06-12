import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Flag, MapPin, User } from "lucide-react";
import { Link } from "wouter";
import type { Talent } from "@shared/schema";

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

export default function PublicProfile() {
  const { talentId } = useParams();

  const { data: talent, isLoading, error } = useQuery<Talent>({
    queryKey: [`/api/talents/by-talent-id/${talentId}`],
  });

  const { data: navigation } = useQuery<{ previous?: Talent; next?: Talent }>({
    queryKey: [`/api/talents/${talent?.talentId}/navigation`],
    enabled: !!talent?.id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div className="bg-slate-200 h-48"></div>
          <div className="p-8">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Talent Not Found</h1>
          <p className="text-slate-600 mb-4">The requested talent profile could not be found.</p>
          <Link href="/">
            <Button>Back to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-blue-700 px-8 py-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{talent.fullName}</h1>
              <div className="flex items-center space-x-6 mt-4">
                {talent.nationality && (
                  <span className="flex items-center">
                    <Flag className="mr-2" size={16} />
                    <span>{talent.nationality}</span>
                  </span>
                )}
                {talent.location && (
                  <span className="flex items-center">
                    <MapPin className="mr-2" size={16} />
                    <span>{talent.location}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="text-3xl" size={48} />
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          {talent.externalLinks && talent.externalLinks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">External Links</h2>
              <div className="flex flex-wrap gap-4">
                {talent.externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                  >
                    <i className={`${getIconForLink(link.name)} text-xl mr-3`}></i>
                    <div>
                      <div className="font-medium">{link.name}</div>
                      <div className="text-sm text-slate-500">External Link</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="border-t border-slate-200 pt-6 flex justify-between">
            {navigation?.previous ? (
              <Link href={`/talents/${navigation.previous.talentId}`}>
                <Button variant="outline" className="flex items-center">
                  <ChevronLeft className="mr-2" size={16} />
                  Previous Talent
                </Button>
              </Link>
            ) : (
              <div></div>
            )}
            
            {navigation?.next ? (
              <Link href={`/talents/${navigation.next.talentId}`}>
                <Button variant="outline" className="flex items-center">
                  Next Talent
                  <ChevronRight className="ml-2" size={16} />
                </Button>
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
