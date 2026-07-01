"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  createMenuItem,
  deleteMenuItem,
  updateMenuItem,
} from "@/actions/food/orders";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
};

export function MenuManager({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      imageUrl: form.imageUrl,
    };

    startTransition(async () => {
      if (editingId) {
        const updated = await updateMenuItem(editingId, payload);
        setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, ...updated } : i)));
      } else {
        const created = await createMenuItem(payload);
        setItems((prev) => [...prev, created]);
      }
      resetForm();
    });
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      imageUrl: item.imageUrl,
    });
    setShowForm(true);
  };

  const handleToggle = (id: string, isAvailable: boolean) => {
    startTransition(async () => {
      const updated = await updateMenuItem(id, { isAvailable: !isAvailable });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    startTransition(async () => {
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Menu Items ({items.length})</h2>
        <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Item" : "New Menu Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Price (INR)</Label>
                <Input type="number" min="1" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className={!item.isAvailable ? "opacity-60" : undefined}>
            <CardContent className="flex gap-4 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500">{item.category}</p>
                    <p className="mt-1 text-sm font-medium text-orange-600">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(item)} className="rounded-lg p-2 hover:bg-slate-100">
                      <Pencil className="h-4 w-4 text-slate-500" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="rounded-lg p-2 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={item.isAvailable ? "secondary" : "default"}
                  className="mt-auto w-fit"
                  disabled={pending}
                  onClick={() => handleToggle(item.id, item.isAvailable)}
                >
                  {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
