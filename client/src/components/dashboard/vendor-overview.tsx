import { useQuery } from "@tanstack/react-query";
import { Vendor } from "@shared/schema";
import { Link } from "wouter";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VendorOverview() {
  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  // Get vendor count and top vendors for display
  const vendorCount = vendors.length;
  const recentVendors = vendors.slice(0, 3);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-muted-foreground font-body">
          <span className="font-medium text-foreground">{vendorCount}</span> vendors booked
        </div>
        <Link href="/vendors">
          <Button size="icon" variant="ghost" className="text-primary-dark hover:text-primary transition duration-200">
            <PlusIcon className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {recentVendors.map((vendor) => (
          <div key={vendor.id} className="border border-gray-100 rounded-lg p-3">
            <div className="font-body font-medium">{vendor.name}</div>
            <div className="text-muted-foreground text-sm">{vendor.category}</div>
          </div>
        ))}
        
        {recentVendors.length === 0 && (
          <div className="text-center py-3 text-muted-foreground">
            No vendors added yet
          </div>
        )}
      </div>
      
      <Link href="/vendors">
        <a className="block text-center text-primary-dark hover:text-primary transition duration-200 mt-4 font-body">
          View all vendors
        </a>
      </Link>
    </div>
  );
}
