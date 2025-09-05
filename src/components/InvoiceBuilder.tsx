import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SERVICE_DATA = [
  { id: "walk30", name: "Dog Walk – 30 min", unitPrice: 18.0 },
  { id: "walk60", name: "Dog Walk – 60 min", unitPrice: 30.0 },
  { id: "dropin", name: "Drop-in Visit", unitPrice: 22.5 },
  { id: "boarding", name: "Overnight Boarding (per night)", unitPrice: 65.0 },
];

type LineItem = {
  id: number;
  serviceId: string;
  serviceName: string;
  unitPrice: number;
  quantity: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export default function InvoiceBuilder() {
  const [lineItems, setLineItems] = useState<LineItem[]>(() => {
    const saved = localStorage.getItem("invoice-items");
    return saved ? JSON.parse(saved) : [];
  });
  const [taxRate, setTaxRate] = useState(8);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    localStorage.setItem("invoice-items", JSON.stringify(lineItems));
  }, [lineItems]);

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), serviceId: "", serviceName: "", unitPrice: 0, quantity: 0 },
    ]);
  };

  const handleServiceChange = (id: number, serviceId: string) => {
    const service = SERVICE_DATA.find((s) => s.id === serviceId);
    setLineItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              serviceId,
              serviceName: service?.name ?? "",
              unitPrice: service?.unitPrice ?? 0,
            }
          : item
      )
    );
  };

  const handleChange = (id: number, field: keyof LineItem, value: string) => {
    setLineItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "unitPrice" || field === "quantity"
                  ? Math.max(0, Number(value) || 0)
                  : value,
            }
          : item
      )
    );
  };

  const handleRemove = (id: number) => {
    setLineItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const tax = subtotal * (taxRate / 100);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + tax - discountAmount;

  return (
    <Card className="max-w-5xl mx-auto mt-10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Invoice Builder</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Line Total</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Select
                    value={item.serviceId}
                    onValueChange={(val) => handleServiceChange(item.id, val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_DATA.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleChange(item.id, "unitPrice", e.target.value)
                    }
                    className="text-right"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) =>
                      handleChange(item.id, "quantity", e.target.value)
                    }
                    className="text-right"
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex justify-between">
          <Button onClick={handleAddItem}>+ Add Item</Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-end space-y-2">
        <div className="flex items-center space-x-2">
          <span>Tax Rate %:</span>
          <Input
            type="number"
            min={0}
            value={taxRate}
            onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value) || 0))}
            className="w-20 text-right"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span>Discount %:</span>
          <Input
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
            className="w-20 text-right"
          />
        </div>

        <div className="mt-4 space-y-1 text-right">
          <div>Subtotal: {formatCurrency(subtotal)}</div>
          <div>Tax ({taxRate}%): {formatCurrency(tax)}</div>
          <div>Discount: -{formatCurrency(discountAmount)}</div>
          <div className="font-bold text-lg">
            Total: {formatCurrency(total)}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
