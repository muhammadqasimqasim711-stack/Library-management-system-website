import { prisma } from "./prisma";
import { logAudit } from "./audit";

export interface IssueBookParams {
  memberId: string;
  copyBarcode?: string;
  copyId?: string;
  staffId?: string;
  staffName?: string;
}

export interface CheckEligibilityParams {
  memberId: string;
  bookId?: string;
}

export interface ReturnBookParams {
  copyBarcode: string;
  condition?: string; // NEW, GOOD, FAIR, POOR, DAMAGED
  staffId?: string;
  staffName?: string;
  notes?: string;
  isDamaged?: boolean;
  damageSeverity?: "MINOR" | "MODERATE" | "SEVERE" | "UNUSABLE";
  damageDescription?: string;
}

export interface RenewBookParams {
  loanId: string;
  userId?: string;
  actorName?: string;
}

/**
 * Evaluates full borrowing eligibility against university policy.
 */
export async function checkMemberEligibility({ memberId, bookId }: CheckEligibilityParams) {
  const member = await prisma.user.findFirst({
    where: {
      OR: [
        { memberId: memberId.trim() },
        { email: memberId.trim() },
        { id: memberId.trim() },
      ],
    },
    include: {
      department: true,
      loans: {
        where: { status: { in: ["ACTIVE", "OVERDUE"] } },
        include: {
          copy: {
            include: {
              book: true,
              shelf: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
      },
      fines: {
        where: { status: "PENDING" },
      },
      reservations: {
        where: { status: { in: ["PENDING", "ON_HOLD"] } },
        include: { book: true },
      },
    },
  });

  if (!member) {
    return {
      eligible: false,
      reasons: [`Member with ID/Email "${memberId}" not found in university directory.`],
      member: null,
    };
  }

  const reasons: string[] = [];

  if (member.status === "RESTRICTED" || member.status === "LOCKED" || member.status === "INACTIVE") {
    reasons.push(`Member account status is ${member.status}. Circulation services are suspended.`);
  }

  const policy = await prisma.borrowingPolicy.findUnique({
    where: { memberType: member.memberType },
  }) || {
    maxActiveLoans: 5,
    loanDurationDays: 14,
    maxRenewals: 2,
    reservationLimit: 3,
    dailyFineRate: 0.50,
    gracePeriodDays: 2,
    lostBookMultiplier: 1.5,
    allowRenewIfReserved: false,
  };

  const allowedLimit = member.borrowingLimitOverride || policy.maxActiveLoans;
  const activeLoansCount = member.loans.length;

  if (activeLoansCount >= allowedLimit) {
    reasons.push(
      `Borrowing limit reached: Member has ${activeLoansCount} active loan(s) (Maximum allowed: ${allowedLimit} for ${member.memberType}).`
    );
  }

  // Check overdue loans
  const now = new Date();
  const overdueLoans = member.loans.filter(
    (l) => l.status === "OVERDUE" || (l.dueDate && new Date(l.dueDate) < now)
  );
  if (overdueLoans.length > 0) {
    reasons.push(
      `Member has ${overdueLoans.length} overdue book(s) that must be returned before issuing new materials.`
    );
  }

  // Outstanding fines
  const totalPendingFines = member.fines.reduce(
    (acc, f) => acc + (f.amount - f.paidAmount),
    0
  );
  if (totalPendingFines > 10.0) {
    reasons.push(
      `Member has unpaid pending fines totaling $${totalPendingFines.toFixed(2)} (Policy fine limit is $10.00).`
    );
  }

  // If specific book is requested, verify duplicate loan restriction
  if (bookId) {
    const alreadyBorrowing = member.loans.some((l) => l.copy.bookId === bookId);
    if (alreadyBorrowing) {
      reasons.push(`Member already holds an active loan for another copy of this same title.`);
    }
  }

  const dueDate = new Date(now.getTime() + policy.loanDurationDays * 24 * 60 * 60 * 1000);

  return {
    eligible: reasons.length === 0,
    reasons,
    member: {
      id: member.id,
      memberId: member.memberId,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      memberType: member.memberType,
      status: member.status,
      department: member.department?.name || "General",
    },
    activeLoansCount,
    maxLoans: allowedLimit,
    overdueCount: overdueLoans.length,
    pendingFinesTotal: totalPendingFines,
    policy: {
      loanDurationDays: policy.loanDurationDays,
      maxActiveLoans: policy.maxActiveLoans,
      dailyFineRate: policy.dailyFineRate,
    },
    calculatedDueDate: dueDate.toISOString(),
    activeLoans: member.loans,
  };
}

/**
 * Unified Issue Workflow (Supports Book-Centered and Barcode-Centered Issuance)
 */
export async function issueBookCopy({
  memberId,
  copyBarcode,
  copyId,
  staffId,
  staffName = "Circulation Desk",
}: IssueBookParams) {
  if (!copyBarcode && !copyId) {
    throw new Error("A Copy Barcode or Copy ID must be specified.");
  }

  // 1. Find member
  const member = await prisma.user.findFirst({
    where: {
      OR: [
        { memberId: memberId.trim() },
        { email: memberId.trim() },
        { id: memberId.trim() },
      ],
    },
    include: {
      loans: { where: { status: "ACTIVE" } },
      fines: { where: { status: "PENDING" } },
    },
  });

  if (!member) {
    throw new Error(`Member with ID/Email "${memberId}" not found in university directory.`);
  }

  if (member.status === "RESTRICTED" || member.status === "LOCKED" || member.status === "INACTIVE") {
    throw new Error(`Member account is ${member.status}. Circulation services are suspended for this member.`);
  }

  // 2. Fetch Borrowing Policy
  const policy = await prisma.borrowingPolicy.findUnique({
    where: { memberType: member.memberType },
  }) || {
    maxActiveLoans: 5,
    loanDurationDays: 14,
    maxRenewals: 2,
    reservationLimit: 3,
    dailyFineRate: 0.50,
    gracePeriodDays: 2,
    lostBookMultiplier: 1.5,
  };

  const allowedLimit = member.borrowingLimitOverride || policy.maxActiveLoans;
  if (member.loans.length >= allowedLimit) {
    throw new Error(
      `Borrowing quota reached: Member currently has ${member.loans.length} active loans (limit is ${allowedLimit} for ${member.memberType}).`
    );
  }

  // 3. Find Physical Book Copy
  const copyWhere = copyId ? { id: copyId } : { barcode: copyBarcode!.trim() };
  const copy = await prisma.bookCopy.findUnique({
    where: copyWhere,
    include: {
      book: true,
      shelf: { include: { section: true } },
    },
  });

  if (!copy) {
    throw new Error(`No physical copy found with ${copyId ? `ID "${copyId}"` : `barcode "${copyBarcode}"`}.`);
  }

  if (copy.status === "BORROWED") {
    throw new Error(`This copy (${copy.barcode}) is currently borrowed by another member.`);
  }

  if (copy.status === "LOST" || copy.status === "WITHDRAWN" || copy.status === "UNDER_REPAIR" || copy.status === "DAMAGED") {
    throw new Error(`Copy cannot be issued because its status is ${copy.status}.`);
  }

  if (copy.status === "RESERVED" || copy.status === "ON_HOLD") {
    // Check if reserved for THIS member
    const activeHold = await prisma.reservation.findFirst({
      where: {
        copyId: copy.id,
        status: "ON_HOLD",
      },
    });

    if (activeHold && activeHold.userId !== member.id) {
      throw new Error(`This copy is currently held for another member in the reservation queue.`);
    }
  }

  // 4. Calculate Due Date
  const issuedAt = new Date();
  const dueDate = new Date(issuedAt.getTime() + policy.loanDurationDays * 24 * 60 * 60 * 1000);

  // 5. Atomic transaction with concurrency check
  const result = await prisma.$transaction(async (tx) => {
    // Concurrency verification: lock copy and ensure still available
    const liveCopy = await tx.bookCopy.findUnique({ where: { id: copy.id } });
    if (!liveCopy || (liveCopy.status !== "AVAILABLE" && liveCopy.status !== "ON_HOLD")) {
      throw new Error(`Physical copy ${copy.barcode} is no longer available for issuance (status: ${liveCopy?.status || "UNKNOWN"}).`);
    }

    // Update copy status
    const updatedCopy = await tx.bookCopy.update({
      where: { id: copy.id },
      data: { status: "BORROWED" },
    });

    // Create loan
    const newLoan = await tx.loan.create({
      data: {
        copyId: copy.id,
        userId: member.id,
        staffId: staffId || null,
        issuedAt,
        dueDate,
        status: "ACTIVE",
      },
    });

    // If reservation existed for this member and book, fulfill it
    await tx.reservation.updateMany({
      where: {
        bookId: copy.bookId,
        userId: member.id,
        status: { in: ["PENDING", "ON_HOLD"] },
      },
      data: {
        status: "FULFILLED",
      },
    });

    // Create notification for borrower
    await tx.notification.create({
      data: {
        userId: member.id,
        title: "Book Issued",
        message: `"${copy.book.title}" (${copy.barcode}) has been checked out to you. Due date: ${dueDate.toLocaleDateString()}.`,
        type: "GENERAL",
      },
    });

    return { loan: newLoan, copy: updatedCopy, member };
  }, { maxWait: 15000, timeout: 30000 });

  // Audit log
  await logAudit({
    actorId: staffId,
    actorName: staffName,
    action: "LOAN_ISSUE",
    entity: "Loan",
    entityId: result.loan.id,
    newValue: {
      copyBarcode: copy.barcode,
      bookTitle: copy.book.title,
      memberId: member.memberId,
      dueDate: dueDate.toISOString(),
    },
  });

  return {
    success: true,
    loan: result.loan,
    bookTitle: copy.book.title,
    copyBarcode: copy.barcode,
    memberName: member.fullName,
    dueDate,
  };
}

/**
 * High-Speed Return Workflow:
 * 1. Find active loan for copy barcode.
 * 2. Calculate overdue duration and fines based on policy.
 * 3. Inspect condition / assess damage penalties.
 * 4. Close loan atomically.
 * 5. Check reservation queue: if next in line, set copy ON_HOLD and notify, else AVAILABLE.
 */
export async function returnBookCopy({
  copyBarcode,
  condition,
  staffId,
  staffName = "Circulation Desk",
  notes,
  isDamaged = false,
  damageSeverity,
  damageDescription,
}: ReturnBookParams) {
  const copy = await prisma.bookCopy.findUnique({
    where: { barcode: copyBarcode.trim() },
    include: {
      book: true,
      loans: {
        where: { status: { in: ["ACTIVE", "OVERDUE"] } },
        include: { user: true },
        orderBy: { issuedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!copy) {
    throw new Error(`No physical copy found with barcode "${copyBarcode}".`);
  }

  const activeLoan = copy.loans[0];
  if (!activeLoan) {
    // If not currently borrowed, check if status can be reset to AVAILABLE
    if (copy.status !== "AVAILABLE") {
      await prisma.bookCopy.update({
        where: { id: copy.id },
        data: { status: "AVAILABLE", condition: condition || copy.condition },
      });
      return {
        success: true,
        message: `Copy ${copy.barcode} was not linked to an active loan. Status updated to AVAILABLE.`,
        copyBarcode: copy.barcode,
        bookTitle: copy.book.title,
      };
    }
    throw new Error(`Physical copy ${copy.barcode} has no active loan.`);
  }

  const borrower = activeLoan.user;
  const returnedAt = new Date();

  // Calculate Overdue & Fine
  const policy = await prisma.borrowingPolicy.findUnique({
    where: { memberType: borrower.memberType },
  }) || {
    dailyFineRate: 0.50,
    gracePeriodDays: 2,
    lostBookMultiplier: 1.5,
  };

  const diffTime = returnedAt.getTime() - activeLoan.dueDate.getTime();
  const rawOverdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const overdueDays = rawOverdueDays > 0 ? rawOverdueDays : 0;
  
  let overdueFineAmount = 0;
  if (overdueDays > policy.gracePeriodDays) {
    const billableDays = overdueDays - policy.gracePeriodDays;
    overdueFineAmount = parseFloat((billableDays * policy.dailyFineRate).toFixed(2));
  }

  // Calculate Damage Penalty
  let damagePenalty = 0;
  if (isDamaged && damageSeverity) {
    switch (damageSeverity) {
      case "MINOR":
        damagePenalty = 5.00;
        break;
      case "MODERATE":
        damagePenalty = 20.00;
        break;
      case "SEVERE":
        damagePenalty = 50.00;
        break;
      case "UNUSABLE":
        damagePenalty = parseFloat((copy.purchaseCost * (policy.lostBookMultiplier || 1.2)).toFixed(2)) || 75.00;
        break;
    }
  }

  // Check reservation queue for this book
  const nextReservation = await prisma.reservation.findFirst({
    where: {
      bookId: copy.bookId,
      status: "PENDING",
    },
    orderBy: { queuePosition: "asc" },
    include: { user: true },
  });

  const nextStatus = isDamaged && (damageSeverity === "SEVERE" || damageSeverity === "UNUSABLE")
    ? "UNDER_REPAIR"
    : nextReservation
    ? "ON_HOLD"
    : "AVAILABLE";

  const result = await prisma.$transaction(async (tx) => {
    // 1. Close loan
    const updatedLoan = await tx.loan.update({
      where: { id: activeLoan.id },
      data: {
        status: "RETURNED",
        returnedAt,
        notes: notes ? `${activeLoan.notes || ""} | Return Note: ${notes}` : activeLoan.notes,
      },
    });

    // 2. Create Overdue Fine if applicable
    let createdFine = null;
    if (overdueFineAmount > 0) {
      createdFine = await tx.fine.create({
        data: {
          loanId: activeLoan.id,
          userId: borrower.id,
          type: "OVERDUE",
          amount: overdueFineAmount,
          reason: `${overdueDays} days late on "${copy.book.title}" (${copy.barcode})`,
          status: "PENDING",
        },
      });

      // Notify borrower of fine
      await tx.notification.create({
        data: {
          userId: borrower.id,
          title: "Library Fine Incurred",
          message: `An overdue fine of $${overdueFineAmount.toFixed(2)} was generated for ${copy.book.title}.`,
          type: "FINE",
        },
      });
    }

    // 3. Create Damage Report & Fine if damaged
    if (isDamaged && damageSeverity) {
      await tx.damageReport.create({
        data: {
          copyId: copy.id,
          loanId: activeLoan.id,
          staffId: staffId || borrower.id,
          severity: damageSeverity,
          penaltyAmount: damagePenalty,
          description: damageDescription || "Book returned in damaged condition",
          status: "ASSESSED",
        },
      });

      if (damagePenalty > 0) {
        await tx.fine.create({
          data: {
            loanId: activeLoan.id,
            userId: borrower.id,
            type: "DAMAGE",
            amount: damagePenalty,
            reason: `Damage penalty (${damageSeverity}) assessed on "${copy.book.title}" (${copy.barcode})`,
            status: "PENDING",
          },
        });
      }
    }

    // 4. Update Copy
    await tx.bookCopy.update({
      where: { id: copy.id },
      data: {
        status: nextStatus,
        condition: condition || (isDamaged ? "DAMAGED" : copy.condition),
      },
    });

    // 5. If reserved, allocate to next reservation
    if (nextReservation && nextStatus === "ON_HOLD") {
      const holdExpiry = new Date(returnedAt.getTime() + 48 * 60 * 60 * 1000); // 48h hold
      await tx.reservation.update({
        where: { id: nextReservation.id },
        data: {
          status: "ON_HOLD",
          copyId: copy.id,
          notifiedAt: returnedAt,
          expiresAt: holdExpiry,
        },
      });

      await tx.notification.create({
        data: {
          userId: nextReservation.userId,
          title: "Reserved Book Ready for Pickup",
          message: `Your reserved book "${copy.book.title}" (${copy.barcode}) is ready at the Main Circulation Desk. Please collect before ${holdExpiry.toLocaleDateString()}.`,
          type: "RESERVATION_AVAILABLE",
        },
      });
    }

    return { updatedLoan, createdFine };
  }, { maxWait: 15000, timeout: 30000 });

  // Audit log
  await logAudit({
    actorId: staffId,
    actorName: staffName,
    action: "LOAN_RETURN",
    entity: "Loan",
    entityId: activeLoan.id,
    newValue: {
      copyBarcode: copy.barcode,
      overdueDays,
      overdueFineAmount,
      damagePenalty,
      nextStatus,
    },
  });

  return {
    success: true,
    copyBarcode: copy.barcode,
    bookTitle: copy.book.title,
    borrowerName: borrower.fullName,
    borrowerId: borrower.memberId,
    dueDate: activeLoan.dueDate,
    overdueDays,
    overdueFineAmount,
    damagePenalty,
    nextStatus,
    heldForMember: nextReservation ? nextReservation.user.fullName : null,
  };
}

/**
 * Renewal Workflow
 */
export async function renewLoan({ loanId, userId, actorName = "System" }: RenewBookParams) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      copy: { include: { book: true } },
      user: true,
    },
  });

  if (!loan) throw new Error("Loan not found.");
  if (loan.status !== "ACTIVE") throw new Error(`Cannot renew a loan with status ${loan.status}.`);

  const policy = await prisma.borrowingPolicy.findUnique({
    where: { memberType: loan.user.memberType },
  }) || { maxRenewals: 2, loanDurationDays: 14, allowRenewIfReserved: false };

  if (loan.renewCount >= policy.maxRenewals) {
    throw new Error(`Maximum renewals reached (${policy.maxRenewals} allowed).`);
  }

  // Check if reserved
  if (!policy.allowRenewIfReserved) {
    const reservationsCount = await prisma.reservation.count({
      where: {
        bookId: loan.copy.bookId,
        status: "PENDING",
      },
    });

    if (reservationsCount > 0) {
      throw new Error(`This book cannot be renewed because ${reservationsCount} member(s) have placed a reservation on it.`);
    }
  }

  // Extend due date
  const newDueDate = new Date(loan.dueDate.getTime() + policy.loanDurationDays * 24 * 60 * 60 * 1000);

  const updatedLoan = await prisma.loan.update({
    where: { id: loan.id },
    data: {
      dueDate: newDueDate,
      renewCount: loan.renewCount + 1,
    },
  });

  await logAudit({
    actorId: userId,
    actorName,
    action: "LOAN_RENEW",
    entity: "Loan",
    entityId: loan.id,
    oldValue: { dueDate: loan.dueDate },
    newValue: { dueDate: newDueDate, renewCount: loan.renewCount + 1 },
  });

  return {
    success: true,
    loan: updatedLoan,
    newDueDate,
    renewCount: loan.renewCount + 1,
  };
}
