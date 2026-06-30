import "server-only";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanId } from "@/lib/plans";

const MRR_BY_PLAN: Record<string, number> = {
  creator: 19,
  pro: 39,
  agency: 99,
};

// ─── Overview ──────────────────────────────────────────────────────────────────

export interface AdminOverview {
  totalUsers: number;
  newUsersThisMonth: number;
  paidUsers: number;
  freeUsers: number;
  activeSubscriptions: number;
  totalGenerations: number;
  generationsThisMonth: number;
  estimatedMrr: number;
  planBreakdown: { plan: string; count: number }[];
  recentUsers: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    createdAt: Date;
  }[];
  recentGenerations: {
    id: string;
    title: string;
    tone: string;
    createdAt: Date;
    user: { email: string };
  }[];
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [
    totalUsers,
    newUsersThisMonth,
    usersByPlan,
    activeSubscriptions,
    totalGenerations,
    generationsThisMonth,
    recentUsers,
    recentGenerations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.groupBy({ by: ["plan"], _count: { plan: true } }),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.generation.count(),
    prisma.usage.aggregate({
      _sum: { generationCount: true },
      where: { month: monthStr },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, name: true, plan: true, createdAt: true },
    }),
    prisma.generation.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        tone: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
  ]);

  const planCounts = Object.fromEntries(
    usersByPlan.map((g) => [g.plan, g._count.plan])
  ) as Record<string, number>;

  const paidUsers =
    (planCounts["creator"] ?? 0) +
    (planCounts["pro"] ?? 0) +
    (planCounts["agency"] ?? 0);

  const estimatedMrr =
    (planCounts["creator"] ?? 0) * MRR_BY_PLAN.creator +
    (planCounts["pro"] ?? 0) * MRR_BY_PLAN.pro +
    (planCounts["agency"] ?? 0) * MRR_BY_PLAN.agency;

  const planBreakdown = (["free", "creator", "pro", "agency"] as PlanId[]).map(
    (p) => ({ plan: PLANS[p].name, count: planCounts[p] ?? 0 })
  );

  return {
    totalUsers,
    newUsersThisMonth,
    paidUsers,
    freeUsers: planCounts["free"] ?? 0,
    activeSubscriptions,
    totalGenerations,
    generationsThisMonth: generationsThisMonth._sum.generationCount ?? 0,
    estimatedMrr,
    planBreakdown,
    recentUsers,
    recentGenerations,
  };
}

// ─── Users list ────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  role: string;
  createdAt: Date;
  generationsCount: number;
  subscriptionStatus: string | null;
}

export async function getAdminUsersPage(opts: {
  query?: string;
  plan?: string;
}): Promise<AdminUserRow[]> {
  const { query = "", plan = "" } = opts;

  const where = {
    ...(query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" as const } },
            { name: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(plan ? { plan: plan as PlanId } : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      role: true,
      createdAt: true,
      _count: { select: { generations: true } },
      subscriptions: {
        orderBy: { createdAt: "desc" as const },
        take: 1,
        select: { status: true },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    plan: u.plan,
    role: u.role,
    createdAt: u.createdAt,
    generationsCount: u._count.generations,
    subscriptionStatus: u.subscriptions[0]?.status ?? null,
  }));
}

// ─── User detail ───────────────────────────────────────────────────────────────

export interface AdminUserDetail {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  role: string;
  createdAt: Date;
  stripeCustomerId: string | null;
  generationsCount: number;
  subscription: {
    stripeSubscriptionId: string;
    status: string;
    currentPeriodEnd: Date | null;
  } | null;
  currentMonthUsage: number | null;
  recentGenerations: {
    id: string;
    title: string;
    tone: string;
    platforms: string[];
    createdAt: Date;
  }[];
}

export async function getAdminUserById(
  id: string
): Promise<AdminUserDetail | null> {
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [user, recentGens, usage] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { generations: true } },
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.generation.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, tone: true, platforms: true, createdAt: true },
    }),
    prisma.usage.findUnique({
      where: { userId_month: { userId: id, month: monthStr } },
    }),
  ]);

  if (!user) return null;

  const sub = user.subscriptions[0] ?? null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    role: user.role,
    createdAt: user.createdAt,
    stripeCustomerId: user.stripeCustomerId,
    generationsCount: user._count.generations,
    subscription: sub
      ? {
          stripeSubscriptionId: sub.stripeSubscriptionId,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd,
        }
      : null,
    currentMonthUsage: usage?.generationCount ?? null,
    recentGenerations: recentGens,
  };
}
