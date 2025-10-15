# Shadcn UI Component Examples

Mobile-first component usage for Drop-In-Drop.

---

## 📦 Installed Components

✅ **button** - Buttons with variants  
✅ **input** - Text inputs  
✅ **card** - Content containers  
✅ **badge** - Status indicators  
✅ **label** - Form labels  
✅ **form** - React Hook Form integration  
✅ **select** - Dropdowns  
✅ **dialog** - Modals  
✅ **dropdown-menu** - Action menus  
✅ **sonner** - Toast notifications  

---

## 🎨 Usage Examples

### Button Examples

```tsx
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";

// Primary button
<Button>Créer Article</Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Ajouter
</Button>

// Destructive (danger)
<Button variant="destructive">
  <Trash2 className="mr-2 h-4 w-4" />
  Supprimer
</Button>

// Outline (secondary)
<Button variant="outline">Annuler</Button>

// Ghost (tertiary)
<Button variant="ghost">Modifier</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Chargement...
</Button>

// Mobile-optimized (full width, large)
<Button size="lg" className="w-full">
  Commander Maintenant
</Button>

// Icon only
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

---

### Card Examples

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Article card (mobile-first)
<Card className="w-full">
  <CardHeader>
    <div className="flex items-start justify-between">
      <CardTitle>iPhone 15 Pro</CardTitle>
      <Badge>En stock</Badge>
    </div>
    <CardDescription>850,000 FCFA</CardDescription>
  </CardHeader>
  <CardContent>
    <img 
      src="/article-image.jpg" 
      alt="iPhone 15 Pro" 
      className="w-full h-48 object-cover rounded-md"
    />
    <p className="mt-4 text-sm text-muted-foreground">
      Stock: 15 unités disponibles
    </p>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button className="flex-1">Voir Détails</Button>
    <Button variant="outline" size="icon">
      <Share2 className="h-4 w-4" />
    </Button>
  </CardFooter>
</Card>

// Grid layout (mobile-first)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {articles.map(article => (
    <Card key={article.id}>...</Card>
  ))}
</div>
```

---

### Form Examples (React Hook Form + Zod)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createArticleSchema } from "@/entities/article";

export function ArticleForm() {
  const form = useForm({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      name: "",
      price: 0,
      categoryId: "",
    }
  });

  const onSubmit = async (data) => {
    console.log("Form data:", data);
    // API call here
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Text Input */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'article</FormLabel>
              <FormControl>
                <Input 
                  placeholder="iPhone 15 Pro" 
                  className="text-base md:text-sm"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number Input */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix (FCFA)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="850000"
                  className="text-base md:text-sm"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Select Dropdown */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-base md:text-sm">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cat1">Électronique</SelectItem>
                  <SelectItem value="cat2">Mode</SelectItem>
                  <SelectItem value="cat3">Maison</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Créer l'article
        </Button>
      </form>
    </Form>
  );
}
```

---

### Dialog (Modal) Examples

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Confirmation dialog
<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Supprimer</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogDescription>
        Êtes-vous sûr de vouloir supprimer cet article? Cette action est irréversible.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
      <Button variant="outline" className="w-full sm:w-auto">
        Annuler
      </Button>
      <Button variant="destructive" className="w-full sm:w-auto">
        Supprimer
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Form in dialog
<Dialog>
  <DialogTrigger asChild>
    <Button>Nouveau Drop</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Créer un nouveau Drop</DialogTitle>
      <DialogDescription>
        Sélectionnez les articles à envoyer aux groupes
      </DialogDescription>
    </DialogHeader>
    {/* Form component here */}
    <ArticleForm />
  </DialogContent>
</Dialog>
```

---

### Toast Notifications (Sonner)

```tsx
"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ToastDemo() {
  return (
    <div className="flex flex-col gap-2">
      {/* Success toast */}
      <Button onClick={() => 
        toast.success("Article créé", {
          description: "L'article a été créé avec succès",
        })
      }>
        Success Toast
      </Button>

      {/* Error toast */}
      <Button variant="destructive" onClick={() => 
        toast.error("Erreur", {
          description: "Impossible de créer l'article",
        })
      }>
        Error Toast
      </Button>

      {/* Loading toast */}
      <Button onClick={() => {
        const id = toast.loading("Création en cours...");
        setTimeout(() => {
          toast.success("Article créé!", { id });
        }, 2000);
      }}>
        Loading Toast
      </Button>

      {/* With action */}
      <Button onClick={() => 
        toast("Article supprimé", {
          action: {
            label: "Annuler",
            onClick: () => console.log("Undo"),
          },
        })
      }>
        Toast with Action
      </Button>
    </div>
  );
}

// Add to root layout (_app.tsx or layout.tsx)
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
```

---

### Dropdown Menu Examples

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, Copy } from "lucide-react";

// Actions menu
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <Edit className="mr-2 h-4 w-4" />
      Modifier
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Copy className="mr-2 h-4 w-4" />
      Dupliquer
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Supprimer
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Badge Examples

```tsx
import { Badge } from "@/components/ui/badge";

// Status badges
<Badge variant="default">En stock</Badge>
<Badge variant="secondary">Brouillon</Badge>
<Badge variant="destructive">Rupture</Badge>
<Badge variant="outline">Archivé</Badge>

// Custom colors with Tailwind
<Badge className="bg-green-500 hover:bg-green-600">
  Envoyé
</Badge>

// In card header
<CardHeader>
  <div className="flex items-center justify-between">
    <CardTitle>iPhone 15</CardTitle>
    <Badge variant="default">Nouveau</Badge>
  </div>
</CardHeader>
```

---

## 📱 Mobile-First Patterns

### Full-Width Buttons on Mobile

```tsx
// Stack buttons on mobile, row on desktop
<div className="flex flex-col sm:flex-row gap-2">
  <Button className="w-full sm:w-auto">Action 1</Button>
  <Button variant="outline" className="w-full sm:w-auto">
    Action 2
  </Button>
</div>
```

### Mobile Bottom Sheet

```tsx
// Dialog becomes bottom sheet on mobile
<Dialog>
  <DialogContent className="sm:max-w-[425px] bottom-0 top-auto translate-y-0 rounded-t-lg sm:rounded-lg">
    <DialogHeader>
      <DialogTitle>Mobile Bottom Sheet</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Touch-Friendly Inputs

```tsx
// 16px text prevents mobile zoom
<Input 
  type="email" 
  placeholder="email@example.com"
  className="text-base md:text-sm h-12 md:h-10"
/>
```

### Grid Layout (Responsive)

```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

---

## ✅ Integration Checklist

### 1. Add Toaster to Root Layout
```tsx
// pages/_app.tsx or app/layout.tsx
import { Toaster } from "@/components/ui/sonner";

<Toaster position="top-center" richColors />
```

### 2. Import Icons (Lucide)
```bash
pnpm add lucide-react
```

```tsx
import { Plus, Trash2, Edit, MoreVertical } from "lucide-react";
```

### 3. Use with Entity Schemas
```tsx
import { createArticleSchema } from "@/entities/article";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(createArticleSchema)
});
```

---

## 🎯 Next Steps

1. ✅ Components installed
2. ⏭️ Add Toaster to root layout
3. ⏭️ Create feature components
4. ⏭️ Test mobile viewport
5. ⏭️ Build article-list feature

---

## Summary

✅ 10 components ready  
✅ Mobile-first by default  
✅ French-friendly examples  
✅ React Hook Form integration  
✅ Zod validation ready  
✅ Sonner for toast notifications  

**Start building features!** 🚀
