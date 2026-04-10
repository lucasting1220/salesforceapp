import { useState } from "react";
import { Search, ShoppingBag, Star, Package, ChevronRight } from "lucide-react";
import { retailCustomers, type RetailCustomer } from "@/data/mockData";

interface Props {
  onClientDetected: (clientId: string | null) => void;
}

const CUSTOMERS = Object.values(retailCustomers);

const tierConfig = {
  Bronze:   { bg: "bg-[#f5e6d3]", text: "text-[#92400e]", dot: "bg-[#b45309]" },
  Silver:   { bg: "bg-[#f1f5f9]", text: "text-[#475569]", dot: "bg-[#64748b]" },
  Gold:     { bg: "bg-[#fef9c3]", text: "text-[#854d0e]", dot: "bg-[#ca8a04]" },
  Platinum: { bg: "bg-[#ede9fe]", text: "text-[#5b21b6]", dot: "bg-[#7c3aed]" },
};

const segmentConfig = {
  VIP:     { bg: "bg-[#ede9fe]", text: "text-[#5b21b6]" },
  Loyal:   { bg: "bg-[#e6f4ea]", text: "text-[#188038]" },
  "At Risk": { bg: "bg-[#fce8e6]", text: "text-[#d93025]" },
  New:     { bg: "bg-[#e8f0fe]", text: "text-[#1a73e8]" },
  Churned: { bg: "bg-secondary",  text: "text-muted-foreground" },
};

const orderStatusConfig: Record<string, { bg: string; text: string }> = {
  Delivered:  { bg: "bg-[#e6f4ea]", text: "text-[#188038]" },
  Processing: { bg: "bg-[#e8f0fe]", text: "text-[#1a73e8]" },
  Shipped:    { bg: "bg-[#fef7e0]", text: "text-[#e37400]" },
  Returned:   { bg: "bg-[#fce8e6]", text: "text-[#d93025]" },
  Cancelled:  { bg: "bg-secondary",  text: "text-muted-foreground" },
};

export default function SimulatedRetail({ onClientDetected }: Props) {
  const [selected, setSelected] = useState<RetailCustomer | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"customers" | "orders">("customers");

  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.segment.toLowerCase().includes(search.toLowerCase())
  );

  const allOrders = CUSTOMERS.flatMap(c => c.orders.map(o => ({ ...o, customer: c.name, customerId: c.id })))
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleSelect = (c: RetailCustomer) => {
    setSelected(c);
    onClientDetected(c.id);
  };

  const handleDeselect = () => {
    setSelected(null);
    onClientDetected(null);
  };

  return (
    <div className="h-full flex flex-col rounded-xl border border-border bg-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#7c3aed] flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Meridian Store</p>
            <p className="text-[10px] text-muted-foreground">Commerce & Customer Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span><span className="font-semibold text-foreground">$11,262</span> LTV tracked</span>
          <span><span className="font-semibold text-foreground">55</span> orders</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-2.5 pb-0 shrink-0 border-b border-border">
        {(["customers", "orders"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors capitalize ${
              tab === t ? "bg-card border border-b-0 border-border text-foreground -mb-px" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* List panel */}
        <div className="flex flex-col border-r border-border shrink-0" style={{ width: "340px" }}>
          <div className="px-3 py-2.5 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={tab === "customers" ? "Search customers…" : "Search orders…"}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "customers" ? (
              filtered.map(c => {
                const tier = tierConfig[c.loyaltyTier];
                const seg  = segmentConfig[c.segment];
                const isActive = selected?.id === c.id;
                return (
                  <button key={c.id} onClick={() => isActive ? handleDeselect() : handleSelect(c)}
                    className={`w-full text-left px-3 py-3 border-b border-border transition-colors ${
                      isActive ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-secondary/50"
                    }`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}>
                        {c.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-semibold text-foreground">{c.name}</p>
                          <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform ${isActive ? "rotate-90" : ""}`} />
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{c.email}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${tier.bg} ${tier.text}`}>
                            <Star className="h-2.5 w-2.5" />{c.loyaltyTier}
                          </span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${seg.bg} ${seg.text}`}>{c.segment}</span>
                          <span className="text-[9px] text-muted-foreground">LTV {c.lifetimeValue}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              allOrders.map((o, i) => {
                const status = orderStatusConfig[o.status];
                return (
                  <button key={i} onClick={() => {
                    const c = retailCustomers[o.customerId];
                    if (c) { setTab("customers"); handleSelect(c); }
                  }}
                    className="w-full text-left px-3 py-2.5 border-b border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-semibold text-foreground font-mono">{o.id}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${status.bg} ${status.text}`}>{o.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{o.customer} · {o.items}</p>
                    <div className="flex justify-between text-[10px] mt-0.5">
                      <span className="text-muted-foreground">{o.date}</span>
                      <span className="font-semibold text-foreground">{o.total}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Select a customer</p>
                <p className="text-xs text-muted-foreground mt-1">Click a customer to view their profile and surface insights in the Robin panel.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">

              {/* Customer header */}
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${tierConfig[selected.loyaltyTier].bg} ${tierConfig[selected.loyaltyTier].text}`}>
                    {selected.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-foreground">{selected.name}</h2>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${tierConfig[selected.loyaltyTier].bg} ${tierConfig[selected.loyaltyTier].text}`}>
                        <Star className="h-2.5 w-2.5" />{selected.loyaltyTier}
                      </span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${segmentConfig[selected.segment].bg} ${segmentConfig[selected.segment].text}`}>{selected.segment}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{selected.email} · Member since {selected.memberSince}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Lifetime Value", value: selected.lifetimeValue },
                    { label: "Total Orders",   value: String(selected.totalOrders) },
                    { label: "Avg Order",      value: selected.avgOrderValue },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p className="text-sm font-bold text-foreground">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent orders */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-3 py-2 bg-secondary/40 border-b border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Recent Orders</p>
                </div>
                {selected.orders.map((o, i) => {
                  const s = orderStatusConfig[o.status];
                  return (
                    <div key={i} className={`px-3 py-2.5 text-[11px] ${i < selected.orders.length - 1 ? "border-b border-border" : ""}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-foreground font-mono">{o.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{o.total}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>{o.status}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span className="truncate mr-2">{o.items}</span>
                        <span className="shrink-0">{o.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Loyalty */}
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Loyalty</p>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-foreground">{selected.loyaltyPoints.toLocaleString()} points</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${tierConfig[selected.loyaltyTier].bg} ${tierConfig[selected.loyaltyTier].text}`}>{selected.loyaltyTier}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-[#7c3aed]" style={{ width: `${Math.min((selected.loyaltyPoints / 5000) * 100, 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{Math.max(0, 5000 - selected.loyaltyPoints).toLocaleString()} pts to next reward</p>
              </div>

              {/* Tickets */}
              {selected.supportTickets.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-3 py-2 bg-secondary/40 border-b border-border">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Support Tickets</p>
                  </div>
                  {selected.supportTickets.map((t, i) => (
                    <div key={i} className={`px-3 py-2.5 text-[11px] ${i < selected.supportTickets.length - 1 ? "border-b border-border" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground truncate flex-1 mr-2">{t.subject}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                          t.status === "Open" ? "bg-[#fce8e6] text-[#d93025]" :
                          t.status === "Pending" ? "bg-[#fef7e0] text-[#e37400]" :
                          "bg-[#e6f4ea] text-[#188038]"
                        }`}>{t.status}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.id} · {t.date}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
