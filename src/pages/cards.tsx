import { useState } from "react";
import { useStore, type CreditCard, type CardIssuer, type CardNetwork } from "@/lib/store";
import { CreditCardDisplay } from "@/components/credit-card-display";
import { Button } from "@/components/ui/button";
import { Plus, Upload, CheckCircle2, ChevronRight, PieChart, CreditCard as CreditCardIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  issuer: z.enum(["Chase", "Capital One", "Amex", "Discover", "Citi", "Other"] as const),
  otherIssuer: z.string().optional(),
  network: z.enum(["Visa", "Mastercard", "Amex", "Discover"] as const),
  limit: z.coerce.number().min(1, "Required"),
  balance: z.coerce.number().min(0, "Required"),
  apr: z.coerce.number().min(0, "Required"),
  minPayment: z.coerce.number().min(0, "Required"),
  statementClose: z.coerce.number().min(1).max(31),
  paymentDue: z.coerce.number().min(1).max(31),
});

export default function Cards() {
  const { cards, addCard } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [isParsing, setIsParsing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      issuer: "Chase",
      otherIssuer: "",
      network: "Visa",
      limit: 0,
      balance: 0,
      apr: 0,
      minPayment: 0,
      statementClose: 1,
      paymentDue: 1,
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addCard({
      nickname: values.nickname,
      issuer: values.issuer === "Other" && values.otherIssuer ? (values.otherIssuer as CardIssuer) : values.issuer,
      network: values.network,
      limit: values.limit,
      balance: values.balance,
      apr: values.apr,
      minPayment: values.minPayment,
      statementClose: values.statementClose,
      paymentDue: values.paymentDue,
      status: "ACTIVE"
    });
    setSheetOpen(false);
    form.reset();
    toast.success("Card added successfully", { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> });
  };

  const handleParseStatement = () => {
    setIsParsing(true);
    setTimeout(() => {
      setIsParsing(false);
      form.setValue("issuer", "Amex");
      form.setValue("network", "Amex");
      form.setValue("limit", 15000);
      form.setValue("balance", 450);
      form.setValue("apr", 24.99);
      form.setValue("minPayment", 35);
      form.setValue("statementClose", 22);
      form.setValue("paymentDue", 15);
      form.setValue("nickname", "Amex Gold");
      setActiveTab("manual");
      toast("We filled in what we could — review and save.");
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-background min-h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Cards</h1>
          <p className="text-muted-foreground mt-1">Your wallet, organized.</p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-shadow">
              <Plus className="w-4 h-4" /> Add Card
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md w-full border-white/10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Add a Card</SheetTitle>
            </SheetHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="upload">Upload Statement</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Identity</h4>
                      <FormField
                        control={form.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Nickname</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Travel Rewards" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="issuer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank / Issuer</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select issuer" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Chase">Chase</SelectItem>
                                  <SelectItem value="Capital One">Capital One</SelectItem>
                                  <SelectItem value="Amex">Amex</SelectItem>
                                  <SelectItem value="Discover">Discover</SelectItem>
                                  <SelectItem value="Citi">Citi</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="network"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Network</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select network" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Visa">Visa</SelectItem>
                                  <SelectItem value="Mastercard">Mastercard</SelectItem>
                                  <SelectItem value="Amex">Amex</SelectItem>
                                  <SelectItem value="Discover">Discover</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Financial</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="balance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Balance ($)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="limit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Credit Limit ($)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="apr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>APR (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="minPayment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Payment ($)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Timing</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="statementClose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Statement Close Day</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} max={31} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="paymentDue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Due Day</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} max={31} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-background/95 pb-6">
                      <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={!form.formState.isValid}>Save Card</Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-6">
                <div className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Upload Statement</h3>
                  <p className="text-sm text-muted-foreground mb-4">PDF, PNG, or JPG up to 10MB</p>
                  <Button disabled={isParsing} onClick={handleParseStatement} className="w-full max-w-[200px]">
                    {isParsing ? "Reading..." : "Parse Statement"}
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button variant="link" onClick={() => setActiveTab("manual")} className="text-muted-foreground hover:text-white">
                    Skip and enter manually
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>

      {cards.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="border-2 border-dashed border-white/10 rounded-2xl w-full max-w-sm aspect-[1.58] flex flex-col items-center justify-center p-6 text-center">
            <CreditCardIcon className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No cards yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Add your credit cards to get a complete picture of your debt.</p>
            <Button onClick={() => setSheetOpen(true)} variant="outline">Add your first card</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {cards.map((card) => (
            <CreditCardDisplay 
              key={card.id} 
              card={card} 
              onClick={() => setSelectedCard(card)} 
            />
          ))}
        </div>
      )}

      {/* Card Details Drawer */}
      <Drawer open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DrawerContent className="bg-card border-t border-white/10">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle className="text-2xl">{selectedCard?.nickname}</DrawerTitle>
              <DrawerDescription>•••• {selectedCard?.last4} | {selectedCard?.issuer}</DrawerDescription>
            </DrawerHeader>
            
            {selectedCard && (
              <div className="p-4 pb-0 space-y-6">
                <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground text-sm">Balance</span>
                    <span className="text-white font-semibold text-lg">${selectedCard.balance.toLocaleString()}</span>
                  </div>
                  <Progress value={(selectedCard.balance / selectedCard.limit) * 100} className="h-2 mb-2 bg-white/10" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round((selectedCard.balance / selectedCard.limit) * 100)}% utilization</span>
                    <span>Limit: ${selectedCard.limit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">APR</span>
                    <span className="text-white font-medium text-lg">{selectedCard.apr}%</span>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Min Pay</span>
                    <span className="text-white font-medium text-lg">${selectedCard.minPayment}</span>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Due Date</span>
                    <span className="text-white font-medium text-lg">Day {selectedCard.paymentDue}</span>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Closes</span>
                    <span className="text-white font-medium text-lg">Day {selectedCard.statementClose}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2"><PieChart className="w-4 h-4 text-primary" /> View transaction history</span>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
            
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="ghost">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
