# 🏗️ ARCHITECTURE RECOMMENDATION: Drop-In-Drop

> **Principe fondamental:** "Do the right thing, not do things right"  
> **Architecture:** Feature-Sliced Design + Vertical Slices + Clean Architecture

---

## 📊 ANALYSE DE L'ARCHITECTURE ACTUELLE

### ❌ Problèmes Identifiés

#### 1. **Séparation par Type, pas par Feature**

**Structure actuelle:**
```
src/
  components/     ← Tous les composants UI
  hooks/          ← Tous les hooks
  lib/            ← Toutes les librairies
www/
  route/          ← Toutes les routes API
  use-case/       ← Tous les use cases
  adapter/        ← Tous les adapters
  services/       ← Tous les services
```

**Problème:**  
Pour modifier la feature "Article", il faut toucher **6 dossiers différents**:
- `src/components/article/`
- `src/app/admin/articles/`
- `www/route/article/`
- `www/use-case/article/`
- `www/adapter/article.ts`
- `src/lib/article-utils.ts`

❌ **Viole le principe:** "Co-locate logic that change together"

---

#### 2. **Logique Business Dispersée**

**Exemple: Create Article**
```
www/route/article/create/index.ts      ← Route handler
www/use-case/article/create-article/   ← Use case (business logic)
www/adapter/article.ts                 ← Database adapter
src/app/admin/articles/new/page.tsx    ← UI
src/components/article/ArticleForm.tsx ← Form component
src/hooks/useArticle.ts                ← React hook
```

**Problème:**
- Logic éparpillée dans 6 fichiers
- Difficile de comprendre le flow complet
- Beaucoup de navigation pour une feature simple
- Coupling implicite entre les fichiers

❌ **Viole:** "Group code by feature, not by type"

---

#### 3. **Use-Cases Inutiles (Over-Engineering)**

**Fichier actuel:**
```typescript
// www/use-case/article/create-article/index.ts
export const createArticle = async (data) => {
  return await articleAdapter.create(data); // Just a pass-through!
}
```

**Problème:**
- Use-case ne fait rien (simple pass-through)
- Ajoute une couche inutile
- Complexité sans valeur ajoutée

❌ **Viole:** "Minimize places/number of changes to extend features"

---

#### 4. **Pas de Séparation UI / Logic / Data**

**Composant actuel:**
```tsx
// src/app/admin/articles/page.tsx
export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  
  useEffect(() => {
    fetch('/api/article/list')  ← Data fetching in UI
      .then(res => res.json())
      .then(setArticles);       ← State management in UI
  }, []);
  
  const handleDelete = async (id) => {  ← Business logic in UI
    await fetch(`/api/article/delete`, { /* ... */ });
    setArticles(prev => prev.filter(a => a.id !== id));
  };
  
  return (
    <div>
      {articles.map(article => (  ← Presentation logic
        <ArticleCard 
          article={article} 
          onDelete={handleDelete} 
        />
      ))}
    </div>
  );
}
```

**Problèmes:**
- UI + Logic + Data fetching dans 1 fichier
- Difficile à tester
- Difficile à réutiliser
- Coupling fort

❌ **Viole:** "Separate UI, logic, and data fetching"

---

#### 5. **Pas de Type-Safety End-to-End**

```typescript
// Côté server
export const createArticle = async (data: any) => { ... }

// Côté client
const createArticle = async (data: any) => { ... }
```

**Problème:**
- Types `any` partout
- Pas de validation automatique
- Si schema DB change, rien ne casse (mais ça plante en prod)

❌ **Viole:** "Typesafety across the whole stack"

---

#### 6. **Logique des Drops Non Claire**

**Règle business manquante:**
> "Un même article ne peut pas être dans un drop envoyé dans un même groupe le même jour"

**Implémentation actuelle:** ❌ Pas de validation pour ça

**Conséquence:** 
- Risque de spam
- Mauvaise expérience utilisateur
- Perte de crédibilité

---

## ✅ ARCHITECTURE RECOMMANDÉE

### 🎯 Principes Directeurs

1. **Feature-First Organization** - Grouper par feature, pas par type
2. **Vertical Slices** - Chaque feature = slice complète (UI → API → DB)
3. **Separation of Concerns** - UI / Logic / Data bien séparés
4. **Type-Safety** - Types partagés DB → Server → Client
5. **Pure Functions** - Facile à tester, pas d'effets de bord
6. **Clear Boundaries** - Interfaces claires, couplage minimal

---

### 📁 Nouvelle Structure (Feature-Sliced Design)

```
src/
├── app/                          # Layer: App (routing, providers, config)
│   ├── layout.tsx
│   ├── providers.tsx
│   └── (routes)/
│       ├── page.tsx              # Home page
│       ├── admin/
│       │   └── layout.tsx        # Admin layout with auth
│       └── client/
│           └── layout.tsx        # Client layout
│
├── pages/                        # Layer: Pages (full pages)
│   ├── home/
│   │   ├── ui/
│   │   │   └── home-page.tsx
│   │   └── index.ts              # Public API
│   │
│   ├── admin-articles/
│   │   ├── ui/
│   │   │   ├── articles-page.tsx
│   │   │   └── new-article-page.tsx
│   │   ├── model/
│   │   │   └── use-articles.ts   # Page state
│   │   └── index.ts
│   │
│   ├── admin-drops/
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts
│   │
│   ├── article-view/             # Public article page
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts
│   │
│   └── client-orders/
│       ├── ui/
│       ├── model/
│       └── index.ts
│
├── widgets/                      # Layer: Widgets (complex UI blocks)
│   ├── article-list/
│   │   ├── ui/
│   │   │   └── article-list.tsx
│   │   ├── model/
│   │   │   └── use-article-list.ts
│   │   └── index.ts
│   │
│   ├── drop-creator/
│   │   ├── ui/
│   │   │   ├── drop-form.tsx
│   │   │   └── article-selector.tsx
│   │   ├── model/
│   │   │   ├── use-drop-form.ts
│   │   │   └── drop-validation.ts
│   │   ├── lib/
│   │   │   └── check-same-day-rule.ts  # Business rule
│   │   └── index.ts
│   │
│   ├── order-summary/
│   └── ticket-display/
│
├── features/                     # Layer: Features (user actions)
│   ├── article-create/
│   │   ├── ui/
│   │   │   └── create-article-form.tsx
│   │   ├── model/
│   │   │   └── use-create-article.ts
│   │   ├── api/
│   │   │   └── create-article.ts
│   │   └── index.ts
│   │
│   ├── article-delete/
│   │   ├── ui/
│   │   │   └── delete-button.tsx
│   │   ├── model/
│   │   │   └── use-delete-article.ts
│   │   ├── api/
│   │   │   └── delete-article.ts
│   │   └── index.ts
│   │
│   ├── drop-send/
│   │   ├── ui/
│   │   ├── model/
│   │   ├── api/
│   │   ├── lib/
│   │   │   ├── validate-drop-rules.ts
│   │   │   └── check-article-sent-today.ts
│   │   └── index.ts
│   │
│   ├── order-create/
│   ├── ticket-validate/
│   └── auth-login/
│
├── entities/                     # Layer: Entities (business objects)
│   ├── article/
│   │   ├── model/
│   │   │   ├── types.ts          # Article type
│   │   │   └── schema.ts         # Zod schema
│   │   ├── api/
│   │   │   └── article-api.ts    # API calls
│   │   ├── lib/
│   │   │   └── article-utils.ts  # Pure functions
│   │   ├── ui/
│   │   │   └── article-card.tsx  # Display component
│   │   └── index.ts
│   │
│   ├── drop/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── drop-schema.ts
│   │   ├── api/
│   │   ├── lib/
│   │   │   ├── drop-rules.ts     # Business rules
│   │   │   └── drop-validator.ts
│   │   └── index.ts
│   │
│   ├── order/
│   ├── customer/
│   ├── admin/
│   └── category/
│
└── shared/                       # Layer: Shared (reusable utilities)
    ├── ui/                       # Shared UI components
    │   ├── button/
    │   ├── input/
    │   ├── card/
    │   └── modal/
    │
    ├── api/                      # API client
    │   ├── client.ts             # HTTP client (fetch wrapper)
    │   ├── types.ts              # Shared API types
    │   └── query-client.ts       # React Query config
    │
    ├── lib/                      # Utilities
    │   ├── date.ts
    │   ├── format.ts
    │   └── validation.ts
    │
    ├── config/                   # Configuration
    │   ├── env.ts
    │   └── constants.ts
    │
    └── store/                    # Global state (Zustand)
        ├── auth-store.ts
        └── ui-store.ts

---

api/                              # Backend (Server-side)
└── [[...route]]/
    └── route.ts                  # Hono app (imports from features)
```

---

### 🔄 Flow Exemple: Create Article

**1. UI Layer** (`features/article-create/ui/create-article-form.tsx`)
```tsx
"use client";

import { useCreateArticle } from "../model/use-create-article";
import { Button, Input } from "@/shared/ui";

export function CreateArticleForm() {
  const { form, handleSubmit, isLoading } = useCreateArticle();
  
  return (
    <form onSubmit={handleSubmit}>
      <Input 
        {...form.register("name")} 
        error={form.errors.name}
      />
      <Button loading={isLoading}>Create</Button>
    </form>
  );
}
```

**Responsabilité:** Présentation uniquement, pas de logic

---

**2. Model Layer** (`features/article-create/model/use-create-article.ts`)
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { articleSchema } from "@/entities/article";
import { createArticle } from "../api/create-article";

export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  const form = useForm({
    resolver: zodResolver(articleSchema)
  });
  
  const mutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      form.reset();
    }
  });
  
  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });
  
  return {
    form,
    handleSubmit,
    isLoading: mutation.isPending
  };
}
```

**Responsabilité:** Logique client (form, state, cache)

---

**3. API Layer** (`features/article-create/api/create-article.ts`)
```typescript
"use client";

import { apiClient } from "@/shared/api/client";
import type { Article, CreateArticleInput } from "@/entities/article";

export async function createArticle(
  data: CreateArticleInput
): Promise<Article> {
  return apiClient.post("/api/articles", data);
}
```

**Responsabilité:** Communication HTTP

---

**4. Server Route** (`src/app/api/[[...route]]/route.ts`)
```typescript
import { Hono } from "hono";
import { createArticleHandler } from "@/features/article-create/api/server";

const app = new Hono();

app.post("/articles", createArticleHandler);

export const POST = handle(app);
```

---

**5. Server Handler** (`features/article-create/api/server.ts`)
```typescript
import { zValidator } from "@hono/zod-validator";
import { articleSchema } from "@/entities/article";
import { createArticle } from "./create-article-service";

export const createArticleHandler = async (c) => {
  // Validation automatique via Zod
  const data = c.req.valid("json");
  
  // Business logic
  const article = await createArticle(data);
  
  return c.json(article, 201);
};

// Validate with Zod
export const createArticleValidator = zValidator("json", articleSchema);
```

---

**6. Service** (`features/article-create/api/create-article-service.ts`)
```typescript
import { db } from "@/shared/db";
import type { CreateArticleInput } from "@/entities/article";
import { generateArticleCode } from "@/entities/article/lib";

export async function createArticle(data: CreateArticleInput) {
  // Business logic
  const code = generateArticleCode();
  
  // Database operation
  const article = await db.article.create({
    data: {
      ...data,
      code,
      uniqueSlug: generateSlug()
    }
  });
  
  return article;
}
```

**Responsabilité:** Business logic + DB operations

---

### 📐 Layers & Dependencies

```
┌─────────────────────────────────────────┐
│  app          (routing, providers)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  pages        (full pages)              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  widgets      (complex UI blocks)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  features     (user actions)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  entities     (business objects)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  shared       (reusable utilities)      │
└─────────────────────────────────────────┘
```

**Règle:** Un layer peut SEULEMENT importer des layers en dessous

---

### 🎯 Exemple Complet: Drop Feature

#### Entities Layer

**`entities/drop/model/types.ts`**
```typescript
export interface Drop {
  id: string;
  name: string;
  articles: Article[];
  whatsappGroups: WhatsAppGroup[];
  status: "draft" | "scheduled" | "sent";
  scheduledFor?: Date;
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface CreateDropInput {
  name: string;
  articleIds: string[];
  whatsappGroupIds: string[];
  scheduledFor?: Date;
}
```

**`entities/drop/lib/drop-rules.ts`** ⭐ **BUSINESS RULES**
```typescript
/**
 * Vérifie si un article peut être envoyé dans un groupe aujourd'hui
 * 
 * Règle: Un article ne peut pas être envoyé dans le même groupe
 * le même jour, même dans des drops différents
 */
export async function canSendArticleToGroupToday(
  articleId: string,
  groupId: string,
  date: Date = new Date()
): Promise<boolean> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Check in DropHistory table
  const existingSend = await db.dropHistory.findFirst({
    where: {
      articleId,
      whatsappGroupId: groupId,
      sentAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
  
  return !existingSend;
}

/**
 * Filtre les articles qui peuvent être envoyés aujourd'hui
 */
export async function filterArticlesForToday(
  articleIds: string[],
  groupIds: string[],
  date: Date = new Date()
): Promise<Map<string, string[]>> {
  // groupId -> articleIds that CAN be sent
  const allowedArticles = new Map<string, string[]>();
  
  for (const groupId of groupIds) {
    const allowed: string[] = [];
    
    for (const articleId of articleIds) {
      const canSend = await canSendArticleToGroupToday(
        articleId, 
        groupId, 
        date
      );
      
      if (canSend) {
        allowed.push(articleId);
      }
    }
    
    allowedArticles.set(groupId, allowed);
  }
  
  return allowedArticles;
}

/**
 * Valide un drop avant envoi
 */
export function validateDrop(drop: CreateDropInput) {
  const errors: string[] = [];
  
  if (drop.articleIds.length === 0) {
    errors.push("Au moins un article est requis");
  }
  
  if (drop.articleIds.length > 20) {
    errors.push("Maximum 20 articles par drop");
  }
  
  if (drop.whatsappGroupIds.length === 0) {
    errors.push("Au moins un groupe est requis");
  }
  
  if (drop.whatsappGroupIds.length > 10) {
    errors.push("Maximum 10 groupes par envoi");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

#### Features Layer

**`features/drop-send/ui/send-drop-button.tsx`**
```tsx
"use client";

import { Button } from "@/shared/ui";
import { useSendDrop } from "../model/use-send-drop";

interface SendDropButtonProps {
  dropId: string;
}

export function SendDropButton({ dropId }: SendDropButtonProps) {
  const { sendDrop, isLoading, warnings } = useSendDrop(dropId);
  
  return (
    <div>
      {warnings.length > 0 && (
        <div className="warnings">
          <h4>⚠️ Avertissements:</h4>
          <ul>
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      
      <Button 
        onClick={sendDrop}
        loading={isLoading}
        disabled={warnings.some(w => w.includes("BLOQUÉ"))}
      >
        Envoyer le Drop
      </Button>
    </div>
  );
}
```

**`features/drop-send/model/use-send-drop.ts`**
```typescript
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { validateDropForToday } from "../api/validate-drop";
import { sendDrop as sendDropApi } from "../api/send-drop";

export function useSendDrop(dropId: string) {
  // Valider avant d'envoyer
  const { data: validation } = useQuery({
    queryKey: ["drop-validation", dropId],
    queryFn: () => validateDropForToday(dropId)
  });
  
  const sendMutation = useMutation({
    mutationFn: () => sendDropApi(dropId),
    onSuccess: () => {
      // Refresh drop list
    }
  });
  
  return {
    sendDrop: sendMutation.mutate,
    isLoading: sendMutation.isPending,
    warnings: validation?.warnings || []
  };
}
```

**`features/drop-send/api/validate-drop.ts`** (client)
```typescript
"use client";

import { apiClient } from "@/shared/api/client";

export async function validateDropForToday(dropId: string) {
  return apiClient.get(`/api/drops/${dropId}/validate`);
}
```

**`features/drop-send/api/server.ts`** (server)
```typescript
import { db } from "@/shared/db";
import { 
  canSendArticleToGroupToday, 
  filterArticlesForToday 
} from "@/entities/drop/lib/drop-rules";

export async function validateDropForToday(dropId: string) {
  const drop = await db.drop.findUnique({
    where: { id: dropId },
    include: { articles: true, whatsappGroups: true }
  });
  
  if (!drop) throw new Error("Drop not found");
  
  const articleIds = drop.articles.map(a => a.id);
  const groupIds = drop.whatsappGroups.map(g => g.id);
  
  // Check which articles can be sent to which groups
  const allowedArticles = await filterArticlesForToday(
    articleIds, 
    groupIds
  );
  
  const warnings: string[] = [];
  
  for (const [groupId, allowedIds] of allowedArticles.entries()) {
    const group = drop.whatsappGroups.find(g => g.id === groupId);
    const blocked = articleIds.filter(id => !allowedIds.includes(id));
    
    if (blocked.length > 0) {
      warnings.push(
        `⚠️ Groupe "${group?.name}": ${blocked.length} article(s) déjà envoyé(s) aujourd'hui`
      );
    }
    
    if (allowedIds.length === 0) {
      warnings.push(
        `🚫 BLOQUÉ: Groupe "${group?.name}" - Tous les articles déjà envoyés aujourd'hui`
      );
    }
  }
  
  return {
    canSend: !warnings.some(w => w.includes("BLOQUÉ")),
    warnings,
    allowedArticles: Object.fromEntries(allowedArticles)
  };
}

export async function sendDropToWhatsApp(dropId: string) {
  // 1. Validate
  const validation = await validateDropForToday(dropId);
  
  if (!validation.canSend) {
    throw new Error("Cannot send drop: " + validation.warnings.join(", "));
  }
  
  // 2. Send to each group
  const drop = await db.drop.findUnique({ /* ... */ });
  
  for (const group of drop.whatsappGroups) {
    const articlesToSend = validation.allowedArticles[group.id] || [];
    
    for (const articleId of articlesToSend) {
      // Send via WAHA
      await sendArticleToGroup(articleId, group.id);
      
      // Track in DropHistory
      await db.dropHistory.create({
        data: {
          dropId,
          articleId,
          whatsappGroupId: group.id,
          sentAt: new Date(),
          status: "sent"
        }
      });
    }
  }
  
  // 3. Update drop status
  await db.drop.update({
    where: { id: dropId },
    data: { 
      status: "sent",
      sentAt: new Date()
    }
  });
  
  return { success: true };
}
```

---

### 🔒 Type-Safety End-to-End

**Shared Types** (`entities/article/model/types.ts`)
```typescript
import { z } from "zod";

// Zod schema (single source of truth)
export const articleSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().optional(),
  images: z.array(z.string().url()).min(1).max(5),
  videos: z.array(z.string().url()).max(1)
});

// TypeScript type inferred from schema
export type Article = z.infer<typeof articleSchema>;
export type CreateArticleInput = z.infer<typeof articleSchema>;

// Prisma type (generated)
export type ArticleDB = Prisma.Article;
```

**Utilisation:**
```typescript
// Server - validation automatique
app.post("/articles", 
  zValidator("json", articleSchema),  // ← Auto-validate
  async (c) => {
    const data = c.req.valid("json"); // ← Type-safe
    // data is Article type
  }
);

// Client - form validation
const form = useForm<Article>({
  resolver: zodResolver(articleSchema)  // ← Same schema
});
```

**Avantages:**
✅ Une seule source de vérité  
✅ Validation client & server identique  
✅ Types partagés DB → API → Client  
✅ Si schema change, TypeScript détecte partout  

---

### 🧪 Testing Strategy

#### Pure Functions (Easy to Test)

```typescript
// entities/drop/lib/drop-rules.test.ts
import { validateDrop } from "./drop-rules";

describe("validateDrop", () => {
  it("should reject empty articles", () => {
    const result = validateDrop({
      name: "Test Drop",
      articleIds: [],  // Empty!
      whatsappGroupIds: ["group-1"]
    });
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Au moins un article est requis");
  });
  
  it("should reject more than 20 articles", () => {
    const result = validateDrop({
      name: "Test Drop",
      articleIds: Array(21).fill("article-id"),  // 21 articles
      whatsappGroupIds: ["group-1"]
    });
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Maximum 20 articles par drop");
  });
});
```

#### Components (with React Testing Library)

```typescript
// features/article-create/ui/create-article-form.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateArticleForm } from "./create-article-form";

describe("CreateArticleForm", () => {
  it("should show validation errors", async () => {
    render(<CreateArticleForm />);
    
    const submitButton = screen.getByText("Create");
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });
});
```

---

### 📦 State Management (Zustand)

**Auth Store** (`shared/store/auth-store.ts`)
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: Admin | null;
  token: string | null;
  
  // Actions
  login: (user: Admin, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token
    }),
    {
      name: "auth-storage"
    }
  )
);
```

**Usage:**
```tsx
function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated()) return <LoginButton />;
  
  return (
    <div>
      Welcome {user.name}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

### 🚀 Benefits of New Architecture

#### 1. **Colocation**
✅ Feature "Article" = 1 dossier  
✅ Facile de trouver tout le code lié  
✅ Facile de supprimer une feature (delete folder)  

#### 2. **Separation of Concerns**
✅ UI = présentation seulement  
✅ Model = logique client  
✅ API = communication HTTP  
✅ Lib = business rules (pure functions)  

#### 3. **Type-Safety**
✅ Types partagés DB → Server → Client  
✅ Validation automatique avec Zod  
✅ Si schema change, TypeScript alerte  

#### 4. **Testability**
✅ Pure functions faciles à tester  
✅ Components isolés  
✅ Mocks simples  

#### 5. **Scalability**
✅ Ajouter une feature = créer un dossier  
✅ Pas de fichiers géants  
✅ Clear boundaries  

#### 6. **Developer Experience**
✅ Facile de comprendre le flow  
✅ Moins de navigation entre fichiers  
✅ Conventions claires  

---

## 🎯 Migration Plan

### Phase 1: Setup (Week 1)

1. **Install dependencies**
   ```bash
   pnpm add zustand @tanstack/react-query zod @hono/zod-validator
   ```

2. **Create folder structure**
   ```bash
   mkdir -p src/{pages,widgets,features,entities,shared}
   ```

3. **Setup shared layer**
   - `shared/api/client.ts` - HTTP client
   - `shared/api/query-client.ts` - React Query setup
   - `shared/ui/` - UI components
   - `shared/store/` - Zustand stores

### Phase 2: Migrate Entities (Week 2)

1. **Extract types**
   - Move Prisma types to `entities/*/model/types.ts`
   - Create Zod schemas
   - Export from `index.ts`

2. **Extract business rules**
   - Pure functions in `entities/*/lib/`
   - Drop rules, article utils, etc.

3. **Create entity APIs**
   - Client API calls in `entities/*/api/`

### Phase 3: Migrate Features (Week 3-4)

1. **Start with simplest feature** (e.g., article-delete)
   - Create `features/article-delete/`
   - Move UI, model, API
   - Update imports

2. **Continue with other features**
   - article-create
   - article-update
   - drop-create
   - drop-send
   - order-create

### Phase 4: Migrate Pages (Week 5)

1. **Extract page logic**
   - Move from `src/app/` to `src/pages/`
   - Use widgets and features
   - Clean up page components

### Phase 5: Testing & Refinement (Week 6)

1. **Add tests**
   - Unit tests for pure functions
   - Component tests
   - Integration tests

2. **Documentation**
   - Update README
   - Add architecture docs
   - Create migration guide

---

## 📚 Key Files to Create

### 1. `shared/api/client.ts`
```typescript
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  
  async request<T>(
    method: string,
    url: string,
    data?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: data ? JSON.stringify(data) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  get<T>(url: string) {
    return this.request<T>("GET", url);
  }
  
  post<T>(url: string, data: unknown) {
    return this.request<T>("POST", url, data);
  }
  
  put<T>(url: string, data: unknown) {
    return this.request<T>("PUT", url, data);
  }
  
  delete<T>(url: string) {
    return this.request<T>("DELETE", url);
  }
}

export const apiClient = new ApiClient();
```

### 2. `shared/api/query-client.ts`
```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1
    }
  }
});
```

### 3. `entities/article/index.ts` (Public API)
```typescript
// Types
export type { Article, CreateArticleInput } from "./model/types";
export { articleSchema } from "./model/types";

// API
export { 
  getArticles, 
  getArticle, 
  createArticle,
  updateArticle,
  deleteArticle 
} from "./api/article-api";

// Utils
export { 
  formatPrice, 
  isLowStock,
  generateArticleCode 
} from "./lib/article-utils";

// UI
export { ArticleCard } from "./ui/article-card";
```

---

## 🎓 Learning Resources

1. **Feature-Sliced Design**
   - https://feature-sliced.design/
   - Best practices for front-end architecture

2. **Vertical Slice Architecture**
   - https://www.jimmybogard.com/vertical-slice-architecture/
   - Alternative to layered architecture

3. **Clean Architecture**
   - https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
   - Separation of concerns

4. **React Query**
   - https://tanstack.com/query/latest
   - Server state management

5. **Zustand**
   - https://github.com/pmndrs/zustand
   - Simple state management

---

## ✅ Checklist

- [ ] Install dependencies
- [ ] Create folder structure
- [ ] Setup shared layer (API client, Query client)
- [ ] Migrate entities (types, schemas, utils)
- [ ] Migrate features (one by one)
- [ ] Migrate pages
- [ ] Add tests
- [ ] Update documentation
- [ ] Remove old structure
- [ ] Deploy

---

## 🤝 Next Steps

1. **Review this document** with the team
2. **Discuss and adjust** if needed
3. **Start with Phase 1** (setup)
4. **Migrate incrementally** (feature by feature)
5. **Test continuously**

**Remember:** "Do the right thing, not do things right" 🚀
