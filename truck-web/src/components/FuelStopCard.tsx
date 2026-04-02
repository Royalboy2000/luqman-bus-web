import { Fuel, MapPin, DollarSign } from "lucide-react";

interface FuelStopCardProps {
  location: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  odometer?: number;
}

export function FuelStopCard({ location, liters, pricePerLiter, totalCost, odometer }: FuelStopCardProps) {
  const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2 });

  return (
    <div className="relative pl-10 pb-6 group">
      {/* Timeline indicator */}
      <div className="absolute left-[17px] top-0 bottom-0 w-px bg-slate-800 group-last:bottom-auto group-last:h-4"></div>
      <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-[#1E293B] border border-slate-700 flex items-center justify-center z-10 text-primary">
        <Fuel className="w-4 h-4" />
      </div>

      <div className="bg-[#1E293B]/50 border border-slate-800 rounded-lg p-4 transition-all hover:border-primary/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded text-primary">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fuel Stop</p>
              <h4 className="text-sm font-semibold text-white">{location || 'Station —'}</h4>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Liters</p>
              <p className="text-sm font-mono text-white">{liters.toLocaleString()} L</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Price/L</p>
              <p className="text-sm font-mono text-white">KSh {fmt(pricePerLiter)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Cost</p>
              <p className="text-sm font-mono text-primary font-bold">KSh {fmt(totalCost)}</p>
            </div>
          </div>
        </div>

        {odometer && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Odometer:</span>
            <span className="text-xs font-mono text-white">{odometer.toLocaleString()} km</span>
          </div>
        )}
      </div>
    </div>
  );
}
