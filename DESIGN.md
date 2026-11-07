# Rendr Lab — Design System & UI Specifications

This document outlines the visual standards, design tokens, interaction states, and user experience rules for **Rendr Lab**. Following these guidelines guarantees a cohesive, premium, high-fidelity experience that looks like a crafted product rather than a generic boilerplate.

---

## 1. Core Philosophy: "Aesthetic Edge & Studio Precision"

Rendr Lab is a studio-grade production environment for AI fashion, photography, and product design. The interface must feel:
*   **Minimal & High-Contrast**: Let the generated images and user content be the heroes. Focus on soft off-whites, neutral slate frames, and generous negative space.
*   **Tactile & Highly Interactive**: Every button, panel, and card should feel responsive. Active states must display physical elevation transitions, glowing indicators, or color shifts.
*   **Ultra-Clean Typography**: Use clean technical pairings to convey a modern, sophisticated feeling (Swiss neo-grotesque for controls, precise monospaced details for statistics and descriptors).

---

## 2. Color Palette (Tailwind Tokens)

| Token Name | Tailwind Utility | HEX Value | Purpose / Placement |
| :--- | :--- | :--- | :--- |
| **Pure Background** | `bg-white` | `#FFFFFF` | Primary container blocks, active modal panels, floating drawers. |
| **Canvas Background** | `bg-slate-50` | `#F8FAFC` | Main workspace backdrop, body background. |
| **Border Neutral** | `border-slate-100` | `#F1F5F9` | Default container separations and subtle borders. |
| **Border Active/Hover** | `border-slate-300` | `#CBD5E1` | Trigger outlines when hovered or focused. |
| **Typography Dark** | `text-slate-800` / `900` | `#1E293B` | Primary headings, titles, active selector labels. |
| **Typography Muted** | `text-slate-400` / `500` | `#64748B` | Labels, uppercase subheadings, icons, placeholders. |
| **Brand Primary** | `bg-brand-600` | `#4F46E5` | Active configuration chips, confirmation cues, CTA primary buttons. |
| **Brand Light Accent** | `bg-brand-50` | `#EEF2FF` | Active subtle highlights, auto-layout indicators. |

---

## 3. Typography Hierarchy & Sizing Rules

To preserve a premium, editor-level photographic tool layout, we restrict the font size array to only 5 clear levels:

| Type Category | Font & Weight | Size (Tailwind) | Letter Spacing | Purpose / Placement |
| :--- | :--- | :--- | :--- | :--- |
| **Editorial Brand** | `font-display` (Playfair Display) | `text-2xl` / `text-3xl` | Normal | Hero logotypes, premium layout titles, and creative headers. |
| **Section Separators** | `font-sans font-bold` | `text-[10px]` | `tracking-[0.2em]` (super wide) | Structural categories (e.g., "GÓC CHỤP", "KHUNG HÌNH"). |
| **Control Labels** | `font-sans font-black` | `text-[11px]` | `tracking-widest` | Selection chips, button states, active options. |
| **Body Metadata** | `font-sans font-medium` | `text-xs` / `text-sm` | `tracking-tight` | Parameter tags, system prompts, secondary options. |
| **Technical Specifications**| `font-mono font-medium` | `text-[9px]` or `text-[10px]` | `tracking-wide` | Size dimensions (e.g., `1024x1024`), process logs, counters. |

---

## 4. Packing, Spacing & Margin Standards (Rhythm & Layout)

To avoid a dense, unpolished look, all panels must adhere to the **Unified 4-Point Spacing Schema**:

### A. Component Enclosure Padding
*   **Main Configuration Sidebar**: Outer padding must be exactly `p-5` or `p-6` (`20px - 24px`) to protect whitespace margins.
*   **Floating Panel Trays**: Inner layout padding must be `p-4` or `p-5` (`16px - 20px`) with grouped sections segregated using `space-y-4` or `space-y-5`.
*   **Choice Selection Boards**: Container margins should be `mt-2` or `mt-3` to keep labels separate from active buttons.

### B. Option Buttons (Tactile Grid Chips)
*   **Action button padding**: Target exact values of `py-2 px-3` or `py-2.5 px-3`. This ensures the action chips are high-contrast and easy to touch without breaking button alignment or looking narrow.
*   **Gap Spacing**: Use `gap-1` or `gap-1.5` for selectors nested inside interactive groups. This provides just enough room for borders and active scale expansions (`scale-[1.02]`).
*   **Sub-Header Gap**: Always reserve `mb-2` or `mb-1.5` below section title badges.

---

## 5. Border Radius Standards (Quy chuẩn bo góc)

To establish a premium, soft physical aesthetic that mimics high-end photography apps (such as Apple Camera, VSCO, Capture One), we enforce a strict nested radius hierarchy. Standard default corners look mechanical; we rely on organic, progressive curves:

*   **Extreme Canvas / Outer Sheets (`rounded-3xl` or `rounded-[1.5rem]`)**:
    *   *Sizing*: `24px` radius.
    *   *Placement*: Outer floating drawers (such as the Camera Framing panel), central action popups, modals, and preview option boards.
*   **Intermediate Blocks & Cards (`rounded-2xl` or `rounded-[1.25rem]`)**:
    *   *Sizing*: `20px` radius.
    *   *Placement*: Inner layout sections (Scene Mode selectors, Model list cards), multi-choice containers, drag-and-drop uploads, and prompt textareas.
*   **Tactile Chips & Choice Inputs (`rounded-xl` or `rounded-[0.75rem]`)**:
    *   *Sizing*: `12px` radius.
    *   *Placement*: Grid selection chips (Góc Chụp, Khung Hình, Tỷ Lệ, Độ Phân Giải), regular action buttons, and individual vibe triggers.
*   **Micro Badges & Toggles (`rounded-lg` / `rounded-md`)**:
    *   *Sizing*: `8px / 6px` radius.
    *   *Placement*: Label badges (e.g. "AI Auto-Layout"), absolute status tags, and miniature configuration elements.

---

## 6. Rich Interaction States & Transitions

### A. Selected/Active Selection States
Do not use low-contrast or half-baked outlines to signal active choices. Active buttons must stand out clearly with active confidence styling:
*   **Primary Active State**:
    *   `bg-brand-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] scale-[1.02] border-brand-600`
    *   *Purpose*: Signals a chosen parameter with a vibrant color, modern shadow elevation, and interactive scale expansion.
*   **Default Inactive State**:
    *   `border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/50 bg-transparent`
    *   *Purpose*: Blends into the ambient panel canvas, coming alive only upon hover.

### B. Dynamic Click-Outside Dismissals
*   Any context-sensitive drop-up panel or dropdown component (e.g., Aspect Ratio, Camera Angle, Lens Framing) **MUST** support clicking outside to close.
*   Use standard React `ref` handlers mapping over document events (`mousedown`) to dismiss panels automatically without forcing users to manually click triggers twice.

### C. Motion & Animation Rules (Using `motion/react` or Tailwind CSS)
*   **Entrance Speed**: Under `300ms` for immediate visual feedback.
*   **Class list**: `animate-in fade-in slide-in-from-bottom-2 duration-300` for panels.
*   **Spring animations**: If using framer-motion/motion, use moderate-stiffness spring configurations (`stiffness: 300, damping: 25`) to mimic real-world elastic motion.

---

## 7. Responsive Adaptive UI (Desktop-first Mobile-fluid)

*   **Sidebars (Desktop)**: Stationary, fixed height panels at `w-[420px]` with internal scroll areas (`overflow-y-auto custom-scrollbar`). This anchors the tool configurations on the left or right, leaving the large display grid entirely free for generations.
*   **Bottom Bars & Sliders (Desktop)**: Fixed elements (`flex-shrink-0 z-40 bg-white/95 backdrop-blur-md`) anchored cleanly below configuration views, housing crucial triggers like **Resolution Toggle**, and the Primary CTA **"Shoot Model"**.
*   **Mobile Screens**: Dropdowns and configuration trays map fluidly, collapsing under compact action headers or tabs, replacing stationary columns with dynamic pop-up sheets.

---

## 8. Button Standards & Interactive States (Hệ thống nút & Trạng thái tương tác)

To make interactions tactile and cohesive, we define 4 core button variants with precise styling rules:

### A. Primary Button (Nút Hành Động Chính)
Used for critical execution flows (e.g., "Shoot Model", "Shoot Studio", "Edit Image" or generation submissions).
*   **Classes**: `bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-200/50 hover:shadow-brand-300/60 rounded-2xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]`
*   **Tactile Feedback**: On press/active, applies slight scale reduction (`scale-98`) to give solid mechanical feedback. On hover, extends shadow opacity and scales up slightly (`scale-[1.01]`).
*   **Disabled State**: `bg-slate-100 text-slate-400 border-none shadow-none pointer-events-none opacity-50`

### B. Secondary / Outline Button (Nút Hành Động Phụ)
Used for trigger menus, draft controls, uploads, and exit interactions.
*   **Classes**: `bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 font-bold text-[11px] uppercase tracking-[0.15em] shadow-sm rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]`
*   **Usage**: Perfect for toggles and configuration triggers surrounding the primary canvas.

### C. Tactile Selector Chips (Nút Lựa Chọn Thông Số)
High-density selectors used in grid systems (Góc Chụp, Khung Hình, Tỷ Lệ, Độ Phân Giải).
*   **Active Choice**: `bg-brand-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] scale-[1.02] border-brand-600`
*   **Inactive Default**: `bg-slate-50 border-transparent text-slate-600 hover:text-slate-900 hover:bg-white hover:border-slate-200`
*   **Base style**: `rounded-xl transition-all duration-200 font-black text-[10px] uppercase tracking-wider py-2 px-3 text-center flex items-center justify-center`

### D. Danger / Utility Button (Nút Nguy Hiểm & Hủy Bỏ)
*   **Classes**: `bg-rose-50 border border-rose-100/30 text-rose-600 hover:bg-rose-100/50 hover:border-rose-200 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all duration-200 active:scale-[0.98]`

