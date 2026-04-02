# Design: Monthly Stats View for Dashboard

**Date:** 2026-04-02
**Feature:** View spending statistics filtered by selected month
**Status:** Approved

---

## 1. Overview

Allow users to navigate to any past or future month on the Dashboard and have all summary cards and charts adapt to the selected month — instead of being locked to the current month.

---

## 2. Month Picker Component

**File:** `src/components/expense/MonthPicker.tsx`

A presentational control with no internal state — fully controlled by parent via `value` + `onChange`.

```
<  Tháng 3/2026  >
```

- **Left/right chevron buttons** (Ant Design `Button` ghost, `ChevronLeft` / `ChevronRight` icons) navigate ±1 month on click.
- **Month label** (`Tháng M/YYYY`) is a tappable button that opens an Ant Design `DatePicker` in `picker="month"` mode (panel-only, no calendar).
- `onChange` fires a `Dayjs` representing the first day of the selected month.
- Layout: `flex-center`, gap-8px.

**Props:**
```typescript
interface MonthPickerProps {
  value: Dayjs;
  onChange: (month: Dayjs) => void;
}
```

---

## 3. Dashboard Changes

**File:** `src/pages/expense/Dashboard.tsx`

### State

```typescript
const [selectedMonth, setSelectedMonth] = useState(dayjs()); // default: current month
```

### Month anchored helpers

```typescript
const monthStart = selectedMonth.startOf('month');
const monthEnd   = selectedMonth.endOf('month');
```

### Stat computations (all anchored to `selectedMonth`)

| Stat | Filter |
|---|---|
| `dayTotal` | `expenseDate` = 1st of `selectedMonth` |
| `weekTotal` | Week containing the 1st of `selectedMonth` |
| `monthTotal` | `selectedMonth.startOf('month')` → `selectedMonth.endOf('month')` |
| `categoryStats` | Same month window |
| `dailyStats` | All days of selected month, one entry per day |
| `monthlyStats` | All days of selected month, daily amounts |

**No new API calls.** All computed client-side from Dexie, same as existing.

### MonthPicker placement

Add `<MonthPicker value={selectedMonth} onChange={setSelectedMonth} />` above `StatsSummary`.

---

## 4. Chart Adaptations

### ChartBarDaily.tsx

The bar chart receives a variable-length `data` array (28–31 entries for a full month vs. 7 for last 7 days).

**Change:** Add `overflow-x-auto` wrapper div so the chart scrolls horizontally when it overflows the viewport.

No changes to the SVG internals — bar widths are already dynamic.

### ChartLineMonthly.tsx

No structural changes. It already renders a `TDailyStats[]` per day. We pass all days of `selectedMonth`.

### ChartPieCategory.tsx

No changes.

---

## 5. Files Changed

| File | Action |
|---|---|
| `src/components/expense/MonthPicker.tsx` | **Create** |
| `src/pages/expense/Dashboard.tsx` | **Modify** |
| `src/components/expense/ChartBarDaily.tsx` | **Modify** (CSS only) |

No new dependencies. All existing: Ant Design, Dayjs, Dexie, existing chart components.

---

## 6. Success Criteria

- Dashboard opens on current month by default (no behavior change on first load)
- All 3 stat cards (day / week / month) update when navigating to a different month
- All 3 charts update when navigating to a different month
- Month picker chevrons navigate ±1 month correctly across year boundaries
- Tapping the month label opens a month picker that jumps to any month
- Bar chart scrolls horizontally when displaying a 30–31 day month
