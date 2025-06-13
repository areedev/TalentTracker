import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TalentCard from "@/components/talent-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Talent } from "@shared/schema";
import { Dialog } from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  const searchParams = new URLSearchParams(window.location.search);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const [currentPage, setCurrentPage] = useState(page);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [emailOnly, setEmailOnly] = useState(false);
  const [filters, setFilters] = useState<{ keyword?: string; emailOnly?: boolean }>({});

  const { data, isLoading, error } = useQuery<{ talents: Talent[]; total: number }>({
    queryKey: [`/api/talents?page=${currentPage}&limit=${limit}&keyword=${filters.keyword || ""}&emailOnly=${filters.emailOnly || false}`],
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  useEffect(() => {
    window.history.pushState(null, "", `?page=${currentPage}&limit=${limit}`);
  }, [currentPage]);

  const Pagination = () => {
    return (<nav className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }

        return (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(pageNum)}
          >
            {pageNum}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">
          Error loading talents: {error.message}
        </div>
      </div>
    );
  }

  if (!data || data.talents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No Talents Found</h2>
          <p className="text-slate-600">No talent profiles are currently available.</p>
        </div>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, data.total);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">Filter Talents</Dialog.Title>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Search keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <label className="flex items-center space-x-2">
                <Checkbox checked={emailOnly} onCheckedChange={(checked) => setEmailOnly(!!checked)} />
                <span>Has Email</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  setFilters({ keyword, emailOnly });
                  setCurrentPage(1); // reset pagination
                  setIsModalOpen(false);
                }}
              >
                Confirm
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Talent Directory</h2>
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination />
          </div>
        )}
        <Button onClick={() => setIsModalOpen(true)} className="">Filter</Button>
        <div className="text-sm text-slate-600">
          Showing {startIndex}-{endIndex} of {data.total} talents
        </div>
      </div>

      <div className="space-y-6">
        {data.talents.map((talent) => (
          <TalentCard key={talent.talentId} talent={talent} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination />
        </div>
      )}
    </div>
  );
}
