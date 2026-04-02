import { RecordType } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { DashboardSummary, CategoryBreakdown, TrendDataPoint } from "../types";

/**
 * Computes the overall financial summary.
 * Aggregates total income, total expenses, and calculates net balance.
 *
 * @returns Dashboard summary with totalIncome, totalExpense, and netBalance
 */
export async function getSummary(): Promise<DashboardSummary> {
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.financeRecord.aggregate({
      where: { type: RecordType.INCOME },
      _sum: { amount: true },
    }),
    prisma.financeRecord.aggregate({
      where: { type: RecordType.EXPENSE },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = incomeResult._sum.amount
    ? Number(incomeResult._sum.amount)
    : 0;
  const totalExpense = expenseResult._sum.amount
    ? Number(expenseResult._sum.amount)
    : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
}

/**
 * Computes spending/income breakdown grouped by category.
 * Returns each category with its total amount and type.
 *
 * @returns Array of category breakdowns sorted by total descending
 */
export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const breakdown = await prisma.financeRecord.groupBy({
    by: ["category", "type"],
    _sum: { amount: true },
    orderBy: {
      _sum: { amount: "desc" },
    },
  });

  return breakdown.map((item) => ({
    category: item.category,
    type: item.type,
    total: item._sum.amount ? Number(item._sum.amount) : 0,
  }));
}

/**
 * Computes monthly financial trends for chart rendering.
 * Groups records by year-month and calculates income, expense, and net for each month.
 *
 * @returns Array of monthly trend data points sorted chronologically
 */
export async function getTrends(): Promise<TrendDataPoint[]> {
  const records = await prisma.financeRecord.findMany({
    select: {
      amount: true,
      type: true,
      date: true,
    },
    orderBy: { date: "asc" },
  });

  // Aggregate by month using a Map for O(n) processing
  const monthlyMap = new Map<
    string,
    { income: number; expense: number }
  >();

  for (const record of records) {
    const date = new Date(record.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const current = monthlyMap.get(monthKey) ?? { income: 0, expense: 0 };
    const amount = Number(record.amount);

    if (record.type === RecordType.INCOME) {
      current.income += amount;
    } else {
      current.expense += amount;
    }

    monthlyMap.set(monthKey, current);
  }

  // Convert map to sorted array of TrendDataPoint
  const trends: TrendDataPoint[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: Math.round(data.income * 100) / 100,
      expense: Math.round(data.expense * 100) / 100,
      net: Math.round((data.income - data.expense) * 100) / 100,
    }));

  return trends;
}
