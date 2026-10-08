type HasAmount = { amount: number };

export const amountPaid = (payments: readonly HasAmount[]): number =>
  payments.reduce((sum, p) => sum + Number(p.amount), 0);

/**
 * Agreed total minus everything received. Negative means a refund is owed;
 * null means no total has been agreed yet, so there's nothing to compare to.
 */
export const balanceDue = (
  total: number | null,
  payments: readonly HasAmount[]
): number | null => (total == null ? null : Number(total) - amountPaid(payments));
