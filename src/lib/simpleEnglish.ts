/**
 * Central Simple English Language & Translation System for ULMS
 * Provides simple, everyday English terms suitable for learners
 * and users with limited English education.
 */

export const SimpleEnglish = {
  // Common terms and translations
  terms: {
    // Actions
    issueBook: "Give Book",
    issueThisBook: "Give This Book",
    returnBook: "Take Back Book",
    renewBook: "Keep Book Longer",
    saveBook: "Save Book",
    cancel: "Cancel",
    confirm: "Yes, Confirm",
    search: "Search",
    filter: "Filter",
    refresh: "Refresh / Update",
    edit: "Change",
    delete: "Remove",
    archive: "Put Away / Archive",
    save: "Save",
    back: "Go Back",
    close: "Close",
    print: "Print",
    check: "Check",
    select: "Choose",

    // Roles & People
    borrower: "Person with Book",
    member: "Student / Teacher / Staff",
    members: "Students & Teachers",
    student: "Student",
    faculty: "Teacher",
    researcher: "Researcher",
    staff: "Library Worker",
    librarian: "Librarian",
    director: "Library Boss",
    admin: "Library Manager",

    // Book Holdings & Status
    catalog: "All Books List",
    books: "Books",
    bookTitle: "Book Name",
    bookCopy: "Book Copy",
    bookCopies: "Book Copies",
    author: "Book Writer",
    authors: "Book Writers",
    publisher: "Book Publisher",
    isbn: "Book ISBN Number",
    callNumber: "Shelf Number",
    classification: "Topic Number",
    subject: "Subject / Topic",
    category: "Book Type / Category",
    section: "Floor & Room",
    shelf: "Shelf",
    rack: "Shelf Row",
    condition: "Book Condition",
    availability: "Is the Book Ready?",
    available: "Ready to Borrow",
    borrowed: "Taken Out",
    overdue: "Late",
    returned: "Returned",
    lost: "Lost",
    damaged: "Damaged / Broken",
    underRepair: "Being Fixed",
    reserved: "Saved for Someone",
    onHold: "Ready to Pick Up",
    totalCopies: "Total Copies",
    availableCopies: "Copies Ready on Shelf",
    borrowedCopies: "Copies Taken Out",

    // Circulation & Loans
    circulation: "Give & Take Back Books",
    loan: "Book Loan",
    loans: "Books Taken Out",
    activeLoans: "Books You Have Now",
    allActiveLoans: "All Books Out Now",
    loanDuration: "How Many Days You Can Keep It",
    issueDate: "Date Given Out",
    dueDate: "Last Date to Return",
    returnedDate: "Date Taken Back",
    renewCount: "Times Kept Longer",
    borrowingHistory: "Books Taken Before",
    reservations: "Saved Books (Waiting List)",

    // Fines & Money
    fine: "Late Fee",
    fines: "Late Fees",
    pendingFine: "Unpaid Late Fee",
    paidFine: "Paid Late Fee",
    waivedFine: "Forgiven Late Fee",
    damagePenalty: "Money for Broken Book",
    purchaseCost: "Book Price",

    // Places & System
    facilities: "Study Rooms",
    studyRooms: "Study Rooms",
    acquisitions: "Buying New Books",
    inventory: "Check All Books on Shelves",
    policies: "Library Rules",
    security: "Staff Permissions",
    auditLogs: "Activity History",
    dashboard: "Library Overview",
    reports: "Reports & Numbers",
    notifications: "Messages & Alerts",

    // Standing
    eligible: "Allowed to Borrow",
    ineligible: "Not Allowed to Borrow",
    activeStanding: "Good Standing",
    restricted: "Blocked / Not Allowed",
    locked: "Locked Account",
  },

  // Status mapping for badges
  statusLabels: {
    AVAILABLE: "Ready to Borrow",
    BORROWED: "Taken Out",
    OVERDUE: "Late",
    RESERVED: "Saved for Someone",
    ON_HOLD: "Ready to Pick Up",
    LOST: "Lost",
    DAMAGED: "Damaged / Broken",
    UNDER_REPAIR: "Being Fixed",
    MISSING: "Can't Find",
    WITHDRAWN: "Removed from Library",
    ACTIVE: "Active / Good Standing",
    INACTIVE: "Not Active",
    RESTRICTED: "Blocked",
    LOCKED: "Locked",
    PAID: "Paid",
    PARTIAL: "Partly Paid",
    PENDING: "Waiting",
    WAIVED: "Forgiven (No Fee)",
    IN_PROGRESS: "Working on It",
    COMPLETED: "Finished",
    CONFIRMED: "Confirmed",
  } as Record<string, string>,

  // Member types
  memberTypeLabels: {
    STUDENT: "Student",
    FACULTY: "Teacher",
    RESEARCHER: "Researcher",
    STAFF: "Library Staff",
    ADMIN: "Library Manager",
  } as Record<string, string>,

  // Friendly error and help messages
  messages: {
    allCopiesUnavailable: "All copies of this book are taken right now.",
    noAvailableCopiesHelp: "You can save this book so you get it when someone brings it back.",
    bookIssuedSuccess: "Book given out successfully!",
    bookReturnedSuccess: "Book taken back successfully!",
    loanRenewedSuccess: "You can keep this book longer now!",
    quotaReached: "This person already has the maximum number of books allowed.",
    hasOverdueBooks: "This person has late books that must be returned first.",
    hasUnpaidFines: "This person has unpaid late fees that must be paid first.",
    accountRestricted: "This account is blocked from borrowing books.",
    noBooksFound: "No books found. Try searching with different words.",
    noMembersFound: "No students or teachers found.",
    noLoansFound: "No books are currently checked out.",
    noFinesFound: "Great news! No unpaid late fees.",
    noReservationsFound: "No saved books waiting right now.",
    noHistoryFound: "No past book records found.",
  },
};

/**
 * Returns simple English label for any entity status code
 */
export function getSimpleStatus(status: string | null | undefined): string {
  if (!status) return "Unknown";
  const upper = String(status).toUpperCase();
  return SimpleEnglish.statusLabels[upper] || status;
}

/**
 * Returns simple English label for member types
 */
export function getSimpleMemberType(type: string | null | undefined): string {
  if (!type) return "Member";
  const upper = String(type).toUpperCase();
  return SimpleEnglish.memberTypeLabels[upper] || type;
}

export default SimpleEnglish;
