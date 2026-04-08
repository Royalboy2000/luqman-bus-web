import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fuel, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FuelEntryFormProps {
  trucks: { id: string; registration: string }[];
  onSave: (entry: any) => void;
}

export function FuelEntryForm({ trucks, onSave }: FuelEntryFormProps) {
  const [truckId, setTruckId] = useState("");
  const [stationName, setStationName] = useState("");
  const [liters, setLiters] = useState("");
  const [price, setPrice] = useState("");
  const [odometer, setOdometer] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTrucks = trucks.filter((t) =>
    t.registration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      truckId,
      stationName,
      liters: Number(liters),
      price: Number(price),
      odometer: Number(odometer),
      date: new Date().toISOString().split("T")[0],
    });
    // Reset form
    setTruckId("");
    setStationName("");
    setLiters("");
    setPrice("");
    setOdometer("");
  };

  return (
    <div className="stat-card bg-[#1E293B]/50 border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Fuel className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Fuel Add</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Truck</label>
            <Select value={truckId} onValueChange={setTruckId}>
              <SelectTrigger className="bg-transparent border-slate-800">
                <SelectValue placeholder="All trucks" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-slate-800">
                <div className="flex items-center px-3 pb-2 pt-1 border-b border-slate-800 mb-1">
                  <Search className="w-3.5 h-3.5 text-muted-foreground mr-2" />
                  <input
                    className="bg-transparent text-sm outline-none w-full"
                    placeholder="Search truck..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {filteredTrucks.map((truck) => (
                  <SelectItem key={truck.id} value={truck.id}>
                    {truck.registration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Station Name</label>
            <Input
              placeholder="e.g. Shell"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="bg-transparent border-slate-800"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Liters</label>
            <Input
              type="number"
              placeholder="0.00"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              className="bg-transparent border-slate-800"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Fuel Price (KSh)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-transparent border-slate-800"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Current Odometer</label>
            <Input
              type="number"
              placeholder="0"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className="bg-transparent border-slate-800"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm" className="bg-primary hover:bg-[#ED8936] text-slate-900 font-bold">
            Add Fuel Entry
          </Button>
        </div>
      </form>
    </div>
  );
}
