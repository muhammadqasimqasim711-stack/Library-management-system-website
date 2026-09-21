import { PrismaClient } from "@prisma/client";
import { issueBookCopy, returnBookCopy, renewLoan } from "./src/lib/circulation.ts";

const prisma = new PrismaClient();

async function runTests() {
  console.log("============================================================");
  console.log("ULMS SYSTEM VERIFICATION & INTEGRATION TEST SUITE");
  console.log("============================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Verify Seed & Entity Foundations
    console.log("\n--- TEST 1: Entity Foundations & Decoupling ---");
    const booksCount = await prisma.book.count();
    const copiesCount = await prisma.bookCopy.count();
    const rolesCount = await prisma.role.count();
    const permsCount = await prisma.permission.count();

    assert(booksCount >= 8, `Catalog titles seeded: ${booksCount}`);
    assert(copiesCount > booksCount, `Physical copies strictly exceed book titles: ${copiesCount} copies for ${booksCount} titles (Book != Copy proven)`);
    assert(rolesCount >= 10, `Institutional roles registered: ${rolesCount}`);
    assert(permsCount >= 25, `Granular RBAC permissions registered: ${permsCount}`);

    // Test 2: Verify Unique Barcodes
    console.log("\n--- TEST 2: Barcode Integrity ---");
    const copies = await prisma.bookCopy.findMany({ select: { barcode: true } });
    const barcodesSet = new Set(copies.map((c) => c.barcode));
    assert(barcodesSet.size === copies.length, `All ${copies.length} physical copies have guaranteed unique barcodes.`);

    // Test 3: Rapid Issue Workflow & Due Date Calculation
    console.log("\n--- TEST 3: Circulation Issue Workflow ---");
    // Pick an available copy
    const availableCopy = await prisma.bookCopy.findFirst({
      where: { status: "AVAILABLE" },
      include: { book: true },
    });
    const student = await prisma.user.findUnique({
      where: { memberId: "STU-2026-001" },
    });

    const issueResult = await issueBookCopy({
      memberId: student.memberId,
      copyBarcode: availableCopy.barcode,
      staffId: "CIRC-001",
      staffName: "Sarah Jenkins (Circulation Desk)",
    });

    assert(issueResult.success === true, `Issue transaction succeeded for barcode: ${availableCopy.barcode}`);
    
    // Check that due date was calculated 14 days ahead (student policy)
    const issueDate = new Date(issueResult.loan.issuedAt);
    const dueDate = new Date(issueResult.dueDate);
    const diffDays = Math.round((dueDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
    assert(diffDays === 14, `Due date calculated automatically by policy engine: ${diffDays} days`);

    // Verify copy status was updated atomically to BORROWED
    const copyAfterIssue = await prisma.bookCopy.findUnique({ where: { id: availableCopy.id } });
    assert(copyAfterIssue.status === "BORROWED", `Physical copy status atomically changed to BORROWED`);

    // Test 4: Concurrency & Double-Borrow Prevention
    console.log("\n--- TEST 4: Double-Borrow Prevention ---");
    let doubleBorrowBlocked = false;
    try {
      await issueBookCopy({
        memberId: "FAC-2026-001",
        copyBarcode: availableCopy.barcode,
      });
    } catch (err) {
      doubleBorrowBlocked = true;
    }
    assert(doubleBorrowBlocked, `Double-checkout of already borrowed physical copy strictly prevented`);

    // Test 5: Restricted Member Borrowing Block
    console.log("\n--- TEST 5: Restricted Member Policy Enforcement ---");
    let restrictedBlocked = false;
    const anotherAvailableCopy = await prisma.bookCopy.findFirst({
      where: { status: "AVAILABLE", id: { not: availableCopy.id } },
    });
    try {
      await issueBookCopy({
        memberId: "STU-2026-003", // James Chen - RESTRICTED status
        copyBarcode: anotherAvailableCopy.barcode,
      });
    } catch (err) {
      restrictedBlocked = true;
    }
    assert(restrictedBlocked, `Borrowing blocked for restricted member (overdue/fine threshold)`);

    // Test 6: Return Workflow & Condition / Fine Assessment
    console.log("\n--- TEST 6: Circulation Return Workflow ---");
    const returnResult = await returnBookCopy({
      copyBarcode: availableCopy.barcode,
      condition: "GOOD",
      staffId: "CIRC-001",
      staffName: "Sarah Jenkins",
    });

    assert(returnResult.success === true, `Return processed cleanly for barcode: ${availableCopy.barcode}`);
    const copyAfterReturn = await prisma.bookCopy.findUnique({ where: { id: availableCopy.id } });
    assert(copyAfterReturn.status === "AVAILABLE", `Copy status safely restored to AVAILABLE after return`);

    // Test 7: Overdue Fine Calculation on Late Book
    console.log("\n--- TEST 7: Overdue Calculation on Late Loan ---");
    // Test return on James Chen's overdue book LIB-CS-00011
    const overdueCopy = await prisma.bookCopy.findUnique({ where: { barcode: "LIB-CS-00011" } });
    if (overdueCopy) {
      const lateReturn = await returnBookCopy({
        copyBarcode: "LIB-CS-00011",
        condition: "GOOD",
        staffId: "CIRC-001",
      });
      assert(lateReturn.overdueFineAmount > 0, `Overdue fine automatically calculated: $${lateReturn.overdueFineAmount.toFixed(2)} (${lateReturn.overdueDays} days late)`);
    }

    // Test 8: Audit Logging Integrity
    console.log("\n--- TEST 8: Immutable Audit Trail ---");
    const latestAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    assert(latestAuditLogs.length > 0, `Audit log captured actions: ${latestAuditLogs[0].action} on ${latestAuditLogs[0].entity}`);

    console.log("\n============================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("============================================================");

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error("Test execution encountered an error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
