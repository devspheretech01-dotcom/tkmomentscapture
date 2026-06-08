import { useEffect, useState } from "react";
import { Check, Lock, Palette, Percent, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@admin/components/ui/card";
import { Button } from "@admin/components/ui/button";
import { useSettings } from "@admin/services/SettingsContext";
import { useGetProfit, useUpdateProfit } from "@admin/services/api";
import { useToast } from "@shared/hooks/use-toast";

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        {description && <span className="mt-0.5 text-[11px] text-muted-foreground">{description}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"}`}
      >
        <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-card ${checked ? "translate-x-3" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function ColorCircle({ color, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${selected ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background" : "border border-black/10 shadow-sm hover:scale-110"}`}
      style={{ backgroundColor: color }}
    >
      {selected && <Check className="h-3 w-3 text-white mix-blend-difference drop-shadow-md" />}
    </button>
  );
}

export default function Settings() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { toast } = useToast();
  const { data: profitSetting, isLoading: isProfitLoading } = useGetProfit();
  const updateProfit = useUpdateProfit();
  const [profitPercentage, setProfitPercentage] = useState("");

  useEffect(() => {
    if (profitSetting?.profitPercentage !== undefined) {
      setProfitPercentage(String(profitSetting.profitPercentage));
    }
  }, [profitSetting]);

  const handleProfitSubmit = (event) => {
    event.preventDefault();
    const value = Number(profitPercentage);
    if (Number.isNaN(value) || value < 0) {
      toast({ title: "Invalid percentage", description: "Profit percentage must be 0 or higher." });
      return;
    }

    updateProfit.mutate(
      { profitPercentage: value },
      {
        onSuccess: () => toast({ title: "Profit updated", description: "New percentage will apply to estimates." }),
        onError: (err) => toast({ title: "Update failed", description: err.message }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 xl:grid-cols-2">
        <div className="space-y-4 sm:space-y-6">
          <Card className="overflow-hidden rounded-xl border-primary/20 bg-card/90 shadow-sm backdrop-blur-md">
            <CardHeader className="border-b border-border/50 px-5 pb-3 pt-5">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Palette className="h-4 w-4 text-primary" /> Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2.5">
                <label className="text-[13px] font-medium text-foreground">Theme Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSetting("themeMode", "light")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-2 transition-all ${settings.themeMode === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                  >
                    <div className="flex h-14 w-full overflow-hidden rounded border border-slate-200 bg-slate-100">
                      <div className="w-1/3 border-r border-slate-200 bg-white" />
                      <div className="w-2/3 bg-slate-50" />
                    </div>
                    <span className="text-[11px] font-medium text-foreground">Light Mode</span>
                  </button>
                  <button
                    onClick={() => updateSetting("themeMode", "dark")}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-2 transition-all ${settings.themeMode === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                  >
                    <div className="flex h-14 w-full overflow-hidden rounded border border-slate-800 bg-slate-900">
                      <div className="w-1/3 border-r border-slate-800 bg-slate-950" />
                      <div className="w-2/3 bg-slate-900" />
                    </div>
                    <span className="text-[11px] font-medium text-foreground">Dark Mode</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-foreground">Theme Colors</label>
                  {settings.themeMode === "dark" && (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Lock className="h-2.5 w-2.5" /> Dark Mode
                    </span>
                  )}
                </div>

                {settings.themeMode === "dark" ? (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/50 p-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Fixed blue accent is applied in Dark Mode. Switch to Light Mode to customize colors.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <ColorCircle color="#F4EBD0" selected={settings.themeColor === "#F4EBD0"} onClick={() => updateSetting("themeColor", "#F4EBD0")} />
                    <ColorCircle color="#D6AD60" selected={settings.themeColor === "#D6AD60"} onClick={() => updateSetting("themeColor", "#D6AD60")} />
                    <ColorCircle color="#122620" selected={settings.themeColor === "#122620"} onClick={() => updateSetting("themeColor", "#122620")} />
                    <div className="mx-1 h-6 w-px bg-border/60" />
                    <div className={`relative h-6 w-6 cursor-pointer overflow-hidden rounded-full shadow-sm transition-transform ${!["#F4EBD0", "#D6AD60", "#122620"].includes(settings.themeColor) ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background" : "border border-border hover:scale-110"}`}>
                      <input
                        type="color"
                        value={settings.themeColor}
                        onChange={(e) => updateSetting("themeColor", e.target.value)}
                        className="absolute -left-2 -top-2 h-10 w-10 cursor-pointer"
                        title="Pick Custom Theme Color"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-foreground">Sidebar Color</span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">Custom color for the sidebar background.</span>
                  </div>
                  {settings.themeMode === "dark" ? (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Lock className="h-2.5 w-2.5" /> Dark Mode
                    </span>
                  ) : (
                    <div className="flex items-center gap-3">
                      {settings.sidebarColor && (
                        <button onClick={() => updateSetting("sidebarColor", "")} className="text-[11px] text-muted-foreground underline transition-colors hover:text-foreground">
                          Reset
                        </button>
                      )}
                      <div className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border-2 border-border shadow-sm transition-transform hover:scale-110">
                        <input
                          type="color"
                          value={settings.sidebarColor || "#12261E"}
                          onChange={(e) => updateSetting("sidebarColor", e.target.value)}
                          className="absolute -left-2 -top-2 h-12 w-12 cursor-pointer"
                          title="Pick Custom Color"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Toggle
                  label="Collapse Sidebar"
                  description="Minimize sidebar to icons only."
                  checked={settings.collapseSidebar}
                  onChange={(val) => updateSetting("collapseSidebar", val)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="overflow-hidden rounded-xl border-primary/20 bg-card/90 shadow-sm backdrop-blur-md">
            <CardHeader className="border-b border-border/50 px-5 pb-3 pt-5">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Percent className="h-4 w-4 text-primary" /> Profit Percentage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleProfitSubmit} className="space-y-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Booking Profit</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={profitPercentage}
                        onChange={(e) => setProfitPercentage(e.target.value)}
                        disabled={isProfitLoading}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 pr-9 text-sm font-semibold text-foreground outline-none transition focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                        placeholder="25"
                        required
                      />
                      <Percent className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <Button type="submit" size="sm" disabled={updateProfit.isPending || isProfitLoading} className="h-10 rounded-xl text-xs">
                    <Save className="mr-1.5 h-3.5 w-3.5" /> {updateProfit.isPending ? "Saving" : "Save"}
                  </Button>
                </div>
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    Current backend value: <span className="font-semibold text-foreground">{profitSetting?.profitPercentage ?? "-"}%</span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Estimates are calculated as subtotal plus this percentage.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 mt-8 flex items-center justify-end gap-3 border-t border-border bg-background/90 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all sm:-mx-7">
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-border text-xs text-foreground transition-all hover:bg-muted"
          onClick={() => {
            if (window.confirm("Are you sure you want to reset all settings to default?")) {
              resetSettings();
              toast({ title: "Settings Reset", description: "All settings have been restored to defaults." });
            }
          }}
        >
          Reset Settings
        </Button>
      </div>
    </div>
  );
}
