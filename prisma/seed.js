const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding University Library Management System database...");

  // 1. Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.facilityBooking.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.budgetAllocation.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.purchaseRequest.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.inventoryAuditItem.deleteMany({});
  await prisma.inventoryAudit.deleteMany({});
  await prisma.damageReport.deleteMany({});
  await prisma.fine.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.bookCopy.deleteMany({});
  await prisma.bookAuthor.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.author.deleteMany({});
  await prisma.publisher.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.shelf.deleteMany({});
  await prisma.librarySection.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.borrowingPolicy.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleaned old records.");

  // 2. Permissions
  const permissionsList = [
    { code: "BOOK_VIEW", displayName: "View Books", module: "CATALOG" },
    { code: "BOOK_CREATE", displayName: "Create Book Title", module: "CATALOG" },
    { code: "BOOK_UPDATE", displayName: "Update Book Title", module: "CATALOG" },
    { code: "BOOK_ARCHIVE", displayName: "Archive Book Title", module: "CATALOG" },
    { code: "COPY_VIEW", displayName: "View Physical Copies", module: "INVENTORY" },
    { code: "COPY_CREATE", displayName: "Create Physical Copy", module: "INVENTORY" },
    { code: "COPY_UPDATE", displayName: "Update Physical Copy", module: "INVENTORY" },
    { code: "COPY_STATUS_CHANGE", displayName: "Change Copy Status", module: "INVENTORY" },
    { code: "BARCODE_GENERATE", displayName: "Generate/Print Barcode", module: "BARCODE" },
    { code: "LOAN_VIEW", displayName: "View Loans", module: "CIRCULATION" },
    { code: "LOAN_ISSUE", displayName: "Issue Book Copy", module: "CIRCULATION" },
    { code: "LOAN_RETURN", displayName: "Return Book Copy", module: "CIRCULATION" },
    { code: "LOAN_RENEW", displayName: "Renew Book Copy", module: "CIRCULATION" },
    { code: "RESERVATION_VIEW", displayName: "View Reservations", module: "CIRCULATION" },
    { code: "RESERVATION_CREATE", displayName: "Place Reservation", module: "CIRCULATION" },
    { code: "RESERVATION_CANCEL", displayName: "Cancel Reservation", module: "CIRCULATION" },
    { code: "FINE_VIEW", displayName: "View Fines", module: "FINES" },
    { code: "FINE_MANAGE", displayName: "Assess & Collect Fines", module: "FINES" },
    { code: "FINE_WAIVE", displayName: "Waive Fines & Penalties", module: "FINES" },
    { code: "INVENTORY_VIEW", displayName: "View Shelf Inventory", module: "INVENTORY" },
    { code: "INVENTORY_AUDIT", displayName: "Perform Shelf Audits", module: "INVENTORY" },
    { code: "POLICY_VIEW", displayName: "View Policies", module: "ADMIN" },
    { code: "POLICY_MANAGE", displayName: "Manage Policies", module: "ADMIN" },
    { code: "STAFF_MANAGE", displayName: "Manage Library Staff", module: "ADMIN" },
    { code: "SECURITY_AUDIT_VIEW", displayName: "View Security Audit Logs", module: "SECURITY" },
    { code: "ACQUISITION_MANAGE", displayName: "Manage Acquisitions & Vendors", module: "ACQUISITIONS" },
    { code: "REPORTS_VIEW", displayName: "View Analytics & Reports", module: "REPORTS" },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.create({ data: perm });
  }

  // 3. Roles
  const rolesData = [
    {
      name: "SUPER_ADMIN",
      displayName: "Super Administrator",
      description: "Full system control, roles, permissions, and security settings",
      perms: permissionsList.map(p => p.code),
    },
    {
      name: "DIRECTOR",
      displayName: "Library Director",
      description: "Institutional oversight, policies, budgets, staff, audits, and reports",
      perms: permissionsList.map(p => p.code),
    },
    {
      name: "LIBRARIAN",
      displayName: "Librarian",
      description: "Catalog management, bibliographic curation, circulation, and member assistance",
      perms: [
        "BOOK_VIEW", "BOOK_CREATE", "BOOK_UPDATE", "BOOK_ARCHIVE",
        "COPY_VIEW", "COPY_CREATE", "COPY_UPDATE", "COPY_STATUS_CHANGE",
        "BARCODE_GENERATE", "LOAN_VIEW", "LOAN_ISSUE", "LOAN_RETURN", "LOAN_RENEW",
        "RESERVATION_VIEW", "RESERVATION_CREATE", "RESERVATION_CANCEL",
        "FINE_VIEW", "FINE_MANAGE", "INVENTORY_VIEW", "INVENTORY_AUDIT", "POLICY_VIEW", "REPORTS_VIEW"
      ],
    },
    {
      name: "CIRCULATION_STAFF",
      displayName: "Circulation Staff",
      description: "High-speed issue, return, barcode scanning, member verification, and fine collection",
      perms: [
        "BOOK_VIEW", "COPY_VIEW", "COPY_STATUS_CHANGE", "BARCODE_GENERATE",
        "LOAN_VIEW", "LOAN_ISSUE", "LOAN_RETURN", "LOAN_RENEW",
        "RESERVATION_VIEW", "RESERVATION_CREATE", "FINE_VIEW", "FINE_MANAGE", "REPORTS_VIEW"
      ],
    },
    {
      name: "CATALOGER",
      displayName: "Cataloging Staff",
      description: "Book records, classification numbers, physical copies, and barcode generation",
      perms: [
        "BOOK_VIEW", "BOOK_CREATE", "BOOK_UPDATE", "COPY_VIEW", "COPY_CREATE",
        "COPY_UPDATE", "BARCODE_GENERATE", "INVENTORY_VIEW"
      ],
    },
    {
      name: "INVENTORY_STAFF",
      displayName: "Inventory Staff",
      description: "Shelf auditing, missing items, damaged condition reviews, and location reassignments",
      perms: [
        "BOOK_VIEW", "COPY_VIEW", "COPY_UPDATE", "COPY_STATUS_CHANGE", "BARCODE_GENERATE",
        "INVENTORY_VIEW", "INVENTORY_AUDIT", "REPORTS_VIEW"
      ],
    },
    {
      name: "ACQUISITION_STAFF",
      displayName: "Acquisition Staff",
      description: "Purchase requests, vendor procurement, order receiving, and copy intake",
      perms: [
        "BOOK_VIEW", "COPY_VIEW", "COPY_CREATE", "ACQUISITION_MANAGE", "REPORTS_VIEW"
      ],
    },
    {
      name: "STUDENT",
      displayName: "Student",
      description: "University student borrowing books, placing reservations, reviewing fines",
      perms: [
        "BOOK_VIEW", "COPY_VIEW", "LOAN_RENEW", "RESERVATION_CREATE", "RESERVATION_CANCEL", "FINE_VIEW"
      ],
    },
    {
      name: "FACULTY",
      displayName: "Faculty Member",
      description: "University professor or lecturer with extended borrowing quotas and course reserves",
      perms: [
        "BOOK_VIEW", "COPY_VIEW", "LOAN_RENEW", "RESERVATION_CREATE", "RESERVATION_CANCEL", "FINE_VIEW"
      ],
    },
    {
      name: "RESEARCHER",
      displayName: "Researcher",
      description: "Postdoctoral fellow or research assistant with specialized reference privileges",
      perms: [
        "BOOK_VIEW", "COPY_VIEW", "LOAN_RENEW", "RESERVATION_CREATE", "RESERVATION_CANCEL", "FINE_VIEW"
      ],
    },
  ];

  const roleMap = {};
  for (const r of rolesData) {
    const roleRecord = await prisma.role.create({
      data: {
        name: r.name,
        displayName: r.displayName,
        description: r.description,
      },
    });
    roleMap[r.name] = roleRecord;

    // Attach permissions
    const perms = await prisma.permission.findMany({
      where: { code: { in: r.perms } }
    });
    for (const p of perms) {
      await prisma.rolePermission.create({
        data: { roleId: roleRecord.id, permissionId: p.id }
      });
    }
  }

  // 4. Borrowing Policies
  await prisma.borrowingPolicy.createMany({
    data: [
      {
        memberType: "STUDENT",
        maxActiveLoans: 5,
        loanDurationDays: 14,
        maxRenewals: 2,
        reservationLimit: 3,
        dailyFineRate: 0.50,
        gracePeriodDays: 2,
        lostBookMultiplier: 1.5,
        allowRenewIfReserved: false,
      },
      {
        memberType: "FACULTY",
        maxActiveLoans: 15,
        loanDurationDays: 45,
        maxRenewals: 4,
        reservationLimit: 8,
        dailyFineRate: 0.25,
        gracePeriodDays: 5,
        lostBookMultiplier: 1.2,
        allowRenewIfReserved: false,
      },
      {
        memberType: "RESEARCHER",
        maxActiveLoans: 10,
        loanDurationDays: 30,
        maxRenewals: 3,
        reservationLimit: 5,
        dailyFineRate: 0.35,
        gracePeriodDays: 3,
        lostBookMultiplier: 1.3,
        allowRenewIfReserved: false,
      },
      {
        memberType: "STAFF",
        maxActiveLoans: 8,
        loanDurationDays: 28,
        maxRenewals: 3,
        reservationLimit: 4,
        dailyFineRate: 0.25,
        gracePeriodDays: 3,
        lostBookMultiplier: 1.2,
        allowRenewIfReserved: false,
      },
    ],
  });

  // 5. Departments
  const deptData = [
    { code: "CS", name: "Computer Science & Engineering", building: "Turing Hall" },
    { code: "EE", name: "Electrical & Electronics Engineering", building: "Maxwell Complex" },
    { code: "MATH", name: "Department of Mathematics", building: "Euler Building" },
    { code: "PHYS", name: "Department of Physics", building: "Bohr Science Center" },
    { code: "MED", name: "School of Medicine & Health Sciences", building: "Fleming Hall" },
    { code: "LAW", name: "Faculty of Law & Jurisprudence", building: "Marshall Hall" },
    { code: "BIZ", name: "Business & Management School", building: "Hayek Pavilion" },
    { code: "HUM", name: "Humanities & Social Sciences", building: "Aristotle Hall" },
  ];
  const deptMap = {};
  for (const d of deptData) {
    const dept = await prisma.department.create({ data: d });
    deptMap[d.code] = dept;
  }

  // 6. Library Sections
  const secData = [
    { code: "SEC-CS", name: "Computer Science & Artificial Intelligence", building: "Main Library", floor: 2, description: "Software, algorithms, databases, machine learning" },
    { code: "SEC-ENG", name: "Electrical & Applied Engineering", building: "Main Library", floor: 2, description: "Circuits, robotics, signal processing" },
    { code: "SEC-SCI", name: "Natural Sciences & Mathematics", building: "Main Library", floor: 3, description: "Pure math, statistics, quantum mechanics, physics" },
    { code: "SEC-MED", name: "Biomedical & Clinical Sciences", building: "Main Library", floor: 3, description: "Medicine, anatomy, genetics, pharmacology" },
    { code: "SEC-LAW", name: "Law, Constitutional & Corporate Jurisprudence", building: "Main Library", floor: 4, description: "Case law, treaties, statutory compilations" },
    { code: "SEC-REF", name: "General Reference & University Archives", building: "Main Library", floor: 1, description: "Encyclopedias, dictionaries, historical records (Non-circulating)" },
  ];
  const secMap = {};
  for (const s of secData) {
    const sec = await prisma.librarySection.create({ data: s });
    secMap[s.code] = sec;
  }

  // 7. Shelves
  const shelfData = [
    { code: "CS-01", name: "Algorithms & Data Structures", sectionId: secMap["SEC-CS"].id, capacity: 120, rack: "Rack 1 - Bay A" },
    { code: "CS-02", name: "Databases & Distributed Systems", sectionId: secMap["SEC-CS"].id, capacity: 120, rack: "Rack 1 - Bay B" },
    { code: "CS-03", name: "Artificial Intelligence & Robotics", sectionId: secMap["SEC-CS"].id, capacity: 100, rack: "Rack 2 - Bay A" },
    { code: "CS-04", name: "Operating Systems & Networking", sectionId: secMap["SEC-CS"].id, capacity: 100, rack: "Rack 2 - Bay B" },
    { code: "SCI-01", name: "Pure Mathematics & Calculus", sectionId: secMap["SEC-SCI"].id, capacity: 150, rack: "Rack 3 - Bay A" },
    { code: "SCI-02", name: "Theoretical & Applied Physics", sectionId: secMap["SEC-SCI"].id, capacity: 150, rack: "Rack 3 - Bay B" },
    { code: "MED-01", name: "Clinical Medicine & Surgery", sectionId: secMap["SEC-MED"].id, capacity: 140, rack: "Rack 4 - Bay A" },
    { code: "LAW-01", name: "Constitutional & Civil Law", sectionId: secMap["SEC-LAW"].id, capacity: 130, rack: "Rack 5 - Bay A" },
    { code: "REF-01", name: "Special Collections & Rare Inscriptions", sectionId: secMap["SEC-REF"].id, capacity: 80, rack: "Secure Vault 1" },
  ];
  const shelfMap = {};
  for (const sh of shelfData) {
    const shelf = await prisma.shelf.create({ data: sh });
    shelfMap[sh.code] = shelf;
  }

  // 8. Categories
  const catData = [
    { name: "Computer Science", slug: "computer-science", description: "Computing paradigms, theory, and architecture" },
    { name: "Software Engineering", slug: "software-engineering", description: "Design patterns, agile methodology, testing, clean code" },
    { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Machine learning, neural networks, natural language processing" },
    { name: "Database Systems", slug: "database-systems", description: "Relational, NoSQL, query optimization, distributed storage" },
    { name: "Mathematics", slug: "mathematics", description: "Calculus, linear algebra, discrete math, statistics" },
    { name: "Medicine & Health", slug: "medicine", description: "Clinical practice, pathology, pharmacology, genetics" },
    { name: "Law & Jurisprudence", slug: "law", description: "Statutes, international law, case studies" },
    { name: "Physics", slug: "physics", description: "Quantum mechanics, thermodynamics, astrophysics" },
  ];
  const catMap = {};
  for (const c of catData) {
    const cat = await prisma.category.create({ data: c });
    catMap[c.slug] = cat;
  }

  // 9. Publishers
  const pubData = [
    { name: "McGraw-Hill Education", address: "1325 Avenue of the Americas, New York, NY", website: "https://www.mheducation.com" },
    { name: "Pearson Education", address: "80 Strand, London, WC2R 0RL, UK", website: "https://www.pearson.com" },
    { name: "The MIT Press", address: "One Rogers Street, Cambridge, MA", website: "https://mitpress.mit.edu" },
    { name: "O'Reilly Media", address: "1005 Gravenstein Highway North, Sebastopol, CA", website: "https://www.oreilly.com" },
    { name: "Cambridge University Press", address: "University Printing House, Cambridge, UK", website: "https://www.cambridge.org" },
    { name: "Elsevier Science", address: "Radarweg 29, 1043 NX Amsterdam, Netherlands", website: "https://www.elsevier.com" },
  ];
  const pubMap = {};
  for (const p of pubData) {
    const pub = await prisma.publisher.create({ data: p });
    pubMap[p.name] = pub;
  }

  // 10. Authors
  const authData = [
    { name: "Abraham Silberschatz", biography: "Sidney J. Weinberg Professor of Computer Science at Yale University." },
    { name: "Henry F. Korth", biography: "Professor of Computer Science and Engineering at Lehigh University." },
    { name: "S. Sudarshan", biography: "Professor of Computer Science at Indian Institute of Technology Bombay." },
    { name: "Robert C. Martin", biography: "Software craftsman, author of Clean Code and Clean Architecture." },
    { name: "Stuart Russell", biography: "Professor of Computer Science at University of California, Berkeley." },
    { name: "Peter Norvig", biography: "Director of Research at Google Inc., AAAI Fellow." },
    { name: "Andrew S. Tanenbaum", biography: "Emeritus Professor at Vrije Universiteit Amsterdam, creator of MINIX." },
    { name: "Thomas H. Cormen", biography: "Professor Emeritus of Computer Science at Dartmouth College." },
    { name: "Charles E. Leiserson", biography: "Professor of Computer Science and Engineering at MIT." },
    { name: "Martin Kleppmann", biography: "Researcher in distributed systems at University of Cambridge." },
    { name: "Donald E. Knuth", biography: "Professor Emeritus at Stanford, author of The Art of Computer Programming." },
    { name: "J. Dennis Kasper", biography: "William Ellery Channing Professor of Medicine at Harvard Medical School." },
  ];
  const authMap = {};
  for (const a of authData) {
    const auth = await prisma.author.create({ data: a });
    authMap[a.name] = auth;
  }

  // 11. Vendors
  const vendorData = [
    { name: "Pearson Academic Distribution", code: "VEND-PEARSON", email: "orders@pearson-dist.edu", phone: "+1 (800) 555-0199", address: "Boston, MA" },
    { name: "O'Reilly Direct Library Services", code: "VEND-OREILLY", email: "library@oreilly.com", phone: "+1 (800) 555-0144", address: "Sebastopol, CA" },
    { name: "McGraw-Hill Higher Ed Wholesale", code: "VEND-MCGRAW", email: "wholesale@mheducation.com", phone: "+1 (800) 555-0177", address: "New York, NY" },
  ];
  const vendorMap = {};
  for (const v of vendorData) {
    const ven = await prisma.vendor.create({ data: v });
    vendorMap[v.code] = ven;
  }

  // 12. Users
  // Simple deterministic password hash placeholder for demo/enterprise simulator
  const defaultHash = "pbkdf2_sha256$mock$salt$password123";

  const usersData = [
    {
      memberId: "ADMIN-001",
      email: "admin@university.edu",
      passwordHash: defaultHash,
      fullName: "Dr. Alexander Wright",
      phone: "+1 (555) 901-0001",
      memberType: "ADMIN",
      status: "ACTIVE",
      departmentId: deptMap["CS"].id,
      roles: ["SUPER_ADMIN"],
    },
    {
      memberId: "DIR-001",
      email: "director@university.edu",
      passwordHash: defaultHash,
      fullName: "Dr. Eleanor Vance",
      phone: "+1 (555) 901-0002",
      memberType: "STAFF",
      status: "ACTIVE",
      departmentId: deptMap["HUM"].id,
      roles: ["DIRECTOR"],
    },
    {
      memberId: "LIB-001",
      email: "librarian@university.edu",
      passwordHash: defaultHash,
      fullName: "Marcus Chen, MLIS",
      phone: "+1 (555) 901-0003",
      memberType: "STAFF",
      status: "ACTIVE",
      departmentId: deptMap["CS"].id,
      roles: ["LIBRARIAN"],
    },
    {
      memberId: "CIRC-001",
      email: "circ@university.edu",
      passwordHash: defaultHash,
      fullName: "Sarah Jenkins",
      phone: "+1 (555) 901-0004",
      memberType: "STAFF",
      status: "ACTIVE",
      departmentId: deptMap["CS"].id,
      roles: ["CIRCULATION_STAFF"],
    },
    {
      memberId: "INV-001",
      email: "inventory@university.edu",
      passwordHash: defaultHash,
      fullName: "David Miller",
      phone: "+1 (555) 901-0005",
      memberType: "STAFF",
      status: "ACTIVE",
      departmentId: deptMap["CS"].id,
      roles: ["INVENTORY_STAFF"],
    },
    {
      memberId: "CAT-001",
      email: "catalog@university.edu",
      passwordHash: defaultHash,
      fullName: "Priya Sharma",
      phone: "+1 (555) 901-0006",
      memberType: "STAFF",
      status: "ACTIVE",
      departmentId: deptMap["CS"].id,
      roles: ["CATALOGER"],
    },
    {
      memberId: "ACQ-001",
      email: "acq@university.edu",
      passwordHash: defaultHash,
      fullName: "Rachel Green",
      phone: "+1 (555) 901-0007",
      memberType: "STAFF",
      status: "ACTIVE",
      departmentId: deptMap["BIZ"].id,
      roles: ["ACQUISITION_STAFF"],
    },
    {
      memberId: "FAC-2026-001",
      email: "prof.turing@university.edu",
      passwordHash: defaultHash,
      fullName: "Prof. Alan Turing",
      phone: "+1 (555) 902-1001",
      memberType: "FACULTY",
      status: "ACTIVE",
      departmentId: deptMap["CS"].id,
      roles: ["FACULTY"],
    },
    {
      memberId: "FAC-2026-002",
      email: "prof.curie@university.edu",
      passwordHash: defaultHash,
      fullName: "Prof. Marie Curie",
      phone: "+1 (555) 902-1002",
      memberType: "FACULTY",
      status: "ACTIVE",
      departmentId: deptMap["PHYS"].id,
      roles: ["FACULTY"],
    },
    {
      memberId: "RES-2026-001",
      email: "dr.hopper@research.university.edu",
      passwordHash: defaultHash,
      fullName: "Dr. Grace Hopper",
      phone: "+1 (555) 902-1003",
      memberType: "RESEARCHER",
      status: "ACTIVE",
      departmentId: deptMap["CS"].id,
      roles: ["RESEARCHER"],
    },
    {
      memberId: "STU-2026-001",
      email: "ali.khan@student.university.edu",
      passwordHash: defaultHash,
      fullName: "Muhammad Ali",
      phone: "+1 (555) 903-2001",
      memberType: "STUDENT",
      status: "ACTIVE",
      departmentId: deptMap["CS"].id,
      roles: ["STUDENT"],
    },
    {
      memberId: "STU-2026-002",
      email: "emma.watson@student.university.edu",
      passwordHash: defaultHash,
      fullName: "Emma Watson",
      phone: "+1 (555) 903-2002",
      memberType: "STUDENT",
      status: "ACTIVE",
      departmentId: deptMap["LAW"].id,
      roles: ["STUDENT"],
    },
    {
      memberId: "STU-2026-003",
      email: "james.chen@student.university.edu",
      passwordHash: defaultHash,
      fullName: "James Chen",
      phone: "+1 (555) 903-2003",
      memberType: "STUDENT",
      status: "RESTRICTED", // Has unpaid overdue fine or past penalty
      departmentId: deptMap["MATH"].id,
      roles: ["STUDENT"],
    },
  ];

  const userMap = {};
  for (const u of usersData) {
    const { roles, ...userData } = u;
    const userRecord = await prisma.user.create({ data: userData });
    userMap[u.memberId] = userRecord;

    for (const rName of roles) {
      if (roleMap[rName]) {
        await prisma.userRole.create({
          data: { userId: userRecord.id, roleId: roleMap[rName].id }
        });
      }
    }
  }

  // 13. Master Books (Catalog Titles)
  const booksData = [
    {
      key: "db-concepts",
      title: "Database System Concepts",
      subtitle: "Seventh Edition",
      isbn: "978-0078022159",
      publicationYear: 2019,
      edition: "7th Edition",
      language: "English",
      description: "Presents the fundamental concepts of database management in an intuitive manner, geared toward allowing students to begin working with databases as quickly as possible.",
      subject: "Relational Algebra, SQL, Normalization, Query Processing, Concurrency",
      classificationNumber: "005.74 C827d",
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      tags: "databases,sql,distributed-systems,transactions",
      categoryId: catMap["database-systems"].id,
      publisherId: pubMap["McGraw-Hill Education"].id,
      departmentId: deptMap["CS"].id,
      sectionId: secMap["SEC-CS"].id,
      authors: ["Abraham Silberschatz", "Henry F. Korth", "S. Sudarshan"],
      copies: [
        { barcode: "LIB-CS-00001", shelf: "CS-02", rack: "Rack 1 - Bay B", condition: "NEW", status: "AVAILABLE", cost: 125.00 },
        { barcode: "LIB-CS-00002", shelf: "CS-02", rack: "Rack 1 - Bay B", condition: "GOOD", status: "AVAILABLE", cost: 125.00 },
        { barcode: "LIB-CS-00003", shelf: "CS-02", rack: "Rack 1 - Bay B", condition: "GOOD", status: "BORROWED", cost: 125.00 },
        { barcode: "LIB-CS-00004", shelf: "CS-02", rack: "Rack 1 - Bay B", condition: "FAIR", status: "AVAILABLE", cost: 125.00 },
        { barcode: "LIB-CS-00005", shelf: "CS-02", rack: "Rack 1 - Bay B", condition: "DAMAGED", status: "UNDER_REPAIR", cost: 125.00, notes: "Spine damaged by fluid spill, undergoing binding preservation" },
        { barcode: "LIB-CS-00006", shelf: "CS-02", rack: "Rack 1 - Bay B", condition: "POOR", status: "LOST", cost: 125.00, notes: "Declared lost in 2025 semester audit" },
      ]
    },
    {
      key: "clean-code",
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      subtitle: "Leading Guide to Writing Robust and Maintainable Code",
      isbn: "978-0132350884",
      publicationYear: 2008,
      edition: "1st Edition",
      language: "English",
      description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.",
      subject: "Object-Oriented Design, Refactoring, Code Smells, Unit Testing",
      classificationNumber: "005.1 M384c",
      coverUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
      tags: "clean code,software engineering,craftsmanship,best practices",
      categoryId: catMap["software-engineering"].id,
      publisherId: pubMap["Pearson Education"].id,
      departmentId: deptMap["CS"].id,
      sectionId: secMap["SEC-CS"].id,
      authors: ["Robert C. Martin"],
      copies: [
        { barcode: "LIB-CS-00010", shelf: "CS-01", rack: "Rack 1 - Bay A", condition: "GOOD", status: "AVAILABLE", cost: 48.00 },
        { barcode: "LIB-CS-00011", shelf: "CS-01", rack: "Rack 1 - Bay A", condition: "GOOD", status: "BORROWED", cost: 48.00 },
        { barcode: "LIB-CS-00012", shelf: "CS-01", rack: "Rack 1 - Bay A", condition: "NEW", status: "RESERVED", cost: 48.00 },
      ]
    },
    {
      key: "aima",
      title: "Artificial Intelligence: A Modern Approach",
      subtitle: "Global Edition",
      isbn: "978-1292153964",
      publicationYear: 2020,
      edition: "4th Edition",
      language: "English",
      description: "The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence. Used in over 1,500 universities across the world.",
      subject: "Intelligent Agents, Search Algorithms, Machine Learning, Deep Learning, NLP",
      classificationNumber: "006.3 R967a",
      coverUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
      tags: "ai,agents,machine-learning,robotics,heuristics",
      categoryId: catMap["artificial-intelligence"].id,
      publisherId: pubMap["Pearson Education"].id,
      departmentId: deptMap["CS"].id,
      sectionId: secMap["SEC-CS"].id,
      authors: ["Stuart Russell", "Peter Norvig"],
      copies: [
        { barcode: "LIB-CS-00020", shelf: "CS-03", rack: "Rack 2 - Bay A", condition: "NEW", status: "AVAILABLE", cost: 140.00 },
        { barcode: "LIB-CS-00021", shelf: "CS-03", rack: "Rack 2 - Bay A", condition: "GOOD", status: "AVAILABLE", cost: 140.00 },
        { barcode: "LIB-CS-00022", shelf: "CS-03", rack: "Rack 2 - Bay A", condition: "GOOD", status: "BORROWED", cost: 140.00 },
        { barcode: "LIB-CS-00023", shelf: "CS-03", rack: "Rack 2 - Bay A", condition: "NEW", status: "AVAILABLE", cost: 140.00 },
      ]
    },
    {
      key: "os-modern",
      title: "Modern Operating Systems",
      subtitle: "Incorporating Distributed Systems & Virtualization",
      isbn: "978-0133591620",
      publicationYear: 2014,
      edition: "4th Edition",
      language: "English",
      description: "Widely praised for its clear explanations of operating systems concepts including processes, threads, memory management, file systems, I/O, deadlocks, and security.",
      subject: "Kernel Architecture, Multiprocessing, Virtual Memory, Linux Internals",
      classificationNumber: "005.43 T161m",
      coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
      tags: "operating systems,kernel,concurrency,memory,file systems",
      categoryId: catMap["computer-science"].id,
      publisherId: pubMap["Pearson Education"].id,
      departmentId: deptMap["CS"].id,
      sectionId: secMap["SEC-CS"].id,
      authors: ["Andrew S. Tanenbaum"],
      copies: [
        { barcode: "LIB-CS-00030", shelf: "CS-04", rack: "Rack 2 - Bay B", condition: "GOOD", status: "AVAILABLE", cost: 110.00 },
        { barcode: "LIB-CS-00031", shelf: "CS-04", rack: "Rack 2 - Bay B", condition: "GOOD", status: "AVAILABLE", cost: 110.00 },
        { barcode: "LIB-CS-00032", shelf: "CS-04", rack: "Rack 2 - Bay B", condition: "FAIR", status: "AVAILABLE", cost: 110.00 },
      ]
    },
    {
      key: "clrs",
      title: "Introduction to Algorithms",
      subtitle: "Fourth Edition",
      isbn: "978-0262046305",
      publicationYear: 2022,
      edition: "4th Edition",
      language: "English",
      description: "A comprehensive update of the leading algorithms textbook, with new chapters on matchings in bipartite graphs, online algorithms, and machine learning algorithms.",
      subject: "Asymptotic Analysis, Dynamic Programming, Greedy Algorithms, Graph Theory",
      classificationNumber: "005.1 C814i",
      coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80",
      tags: "algorithms,data structures,graph theory,complexity",
      categoryId: catMap["computer-science"].id,
      publisherId: pubMap["The MIT Press"].id,
      departmentId: deptMap["CS"].id,
      sectionId: secMap["SEC-CS"].id,
      authors: ["Thomas H. Cormen", "Charles E. Leiserson"],
      copies: [
        { barcode: "LIB-CS-00040", shelf: "CS-01", rack: "Rack 1 - Bay A", condition: "NEW", status: "AVAILABLE", cost: 135.00 },
        { barcode: "LIB-CS-00041", shelf: "CS-01", rack: "Rack 1 - Bay A", condition: "GOOD", status: "AVAILABLE", cost: 135.00 },
        { barcode: "LIB-CS-00042", shelf: "CS-01", rack: "Rack 1 - Bay A", condition: "GOOD", status: "BORROWED", cost: 135.00 },
        { barcode: "LIB-CS-00043", shelf: "CS-01", rack: "Rack 1 - Bay A", condition: "GOOD", status: "AVAILABLE", cost: 135.00 },
      ]
    },
    {
      key: "ddia",
      title: "Designing Data-Intensive Applications",
      subtitle: "The Big Ideas Behind Reliable, Scalable, and Maintainable Systems",
      isbn: "978-1449373320",
      publicationYear: 2017,
      edition: "1st Edition",
      language: "English",
      description: "Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability.",
      subject: "Distributed Consensus, Replication, Partitioning, Batch Processing, Stream Processing",
      classificationNumber: "005.74 K64d",
      coverUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
      tags: "architecture,scaling,distributed systems,stream processing",
      categoryId: catMap["database-systems"].id,
      publisherId: pubMap["O'Reilly Media"].id,
      departmentId: deptMap["CS"].id,
      sectionId: secMap["SEC-CS"].id,
      authors: ["Martin Kleppmann"],
      copies: [
        { barcode: "LIB-CS-00050", shelf: "CS-02", rack: "Rack 1 - Bay B", condition: "NEW", status: "AVAILABLE", cost: 55.00 },
        { barcode: "LIB-CS-00051", shelf: "CS-02", rack: "Rack 1 - Bay B", condition: "GOOD", status: "AVAILABLE", cost: 55.00 },
        { barcode: "LIB-CS-00052", shelf: "CS-02", rack: "Rack 1 - Bay B", condition: "GOOD", status: "AVAILABLE", cost: 55.00 },
      ]
    },
    {
      key: "harrison-med",
      title: "Harrison's Principles of Internal Medicine",
      subtitle: "21st Edition (Vol 1 & 2)",
      isbn: "978-1264268504",
      publicationYear: 2022,
      edition: "21st Edition",
      language: "English",
      description: "The landmark guide to internal medicine, updated and expanded with essential breakthroughs in clinical practice, molecular biology, and healthcare delivery.",
      subject: "Cardiology, Oncology, Infectious Diseases, Endocrinology, Critical Care",
      classificationNumber: "616 H318p",
      coverUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
      tags: "medicine,internal medicine,clinical,pathology",
      categoryId: catMap["medicine"].id,
      publisherId: pubMap["McGraw-Hill Education"].id,
      departmentId: deptMap["MED"].id,
      sectionId: secMap["SEC-MED"].id,
      authors: ["J. Dennis Kasper"],
      copies: [
        { barcode: "LIB-MED-00001", shelf: "MED-01", rack: "Rack 4 - Bay A", condition: "NEW", status: "AVAILABLE", cost: 249.00 },
        { barcode: "LIB-MED-00002", shelf: "MED-01", rack: "Rack 4 - Bay A", condition: "GOOD", status: "AVAILABLE", cost: 249.00 },
        { barcode: "LIB-MED-00003", shelf: "MED-01", rack: "Rack 4 - Bay A", condition: "GOOD", status: "AVAILABLE", cost: 249.00 },
      ]
    },
    {
      key: "taocp",
      title: "The Art of Computer Programming, Vol 1: Fundamental Algorithms",
      subtitle: "Third Edition",
      isbn: "978-0201896831",
      publicationYear: 1997,
      edition: "3rd Edition",
      language: "English",
      description: "The bible of fundamental computer programming algorithms, widely regarded as one of the defining works of the 20th century in computer science.",
      subject: "Mathematical Induction, Information Structures, Tree Structures, Multilinked Structures",
      classificationNumber: "005.1 K74a",
      coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
      tags: "algorithms,classic,mathematics,knuth",
      categoryId: catMap["computer-science"].id,
      publisherId: pubMap["Pearson Education"].id,
      departmentId: deptMap["CS"].id,
      sectionId: secMap["SEC-REF"].id,
      authors: ["Donald E. Knuth"],
      copies: [
        { barcode: "LIB-REF-00001", shelf: "REF-01", rack: "Secure Vault 1", condition: "NEW", status: "AVAILABLE", cost: 95.00, notes: "Reference Special Archive - Library Use Only" },
        { barcode: "LIB-REF-00002", shelf: "REF-01", rack: "Secure Vault 1", condition: "GOOD", status: "AVAILABLE", cost: 95.00, notes: "Reference Special Archive - Library Use Only" },
      ]
    }
  ];

  const bookCopyMap = {};
  const bookMap = {};

  for (const b of booksData) {
    const { authors, copies, key, ...bData } = b;
    const bookRecord = await prisma.book.create({ data: bData });
    bookMap[key] = bookRecord;

    // Link authors
    for (const aName of authors) {
      if (authMap[aName]) {
        await prisma.bookAuthor.create({
          data: { bookId: bookRecord.id, authorId: authMap[aName].id }
        });
      }
    }

    // Create physical copies
    let copyNum = 1;
    for (const c of copies) {
      const copyRecord = await prisma.bookCopy.create({
        data: {
          bookId: bookRecord.id,
          barcode: c.barcode,
          copyNumber: copyNum++,
          shelfId: shelfMap[c.shelf] ? shelfMap[c.shelf].id : null,
          rack: c.rack,
          condition: c.condition,
          status: c.status,
          purchaseCost: c.cost,
          notes: c.notes || null,
          vendorId: vendorMap["VEND-PEARSON"].id,
        }
      });
      bookCopyMap[c.barcode] = copyRecord;
    }
  }

  // 14. Active & Overdue Loans
  const now = new Date();

  // Loan 1: Active loan for Muhammad Ali (Database Concepts LIB-CS-00003), due in 7 days
  const loan1Due = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const loan1 = await prisma.loan.create({
    data: {
      copyId: bookCopyMap["LIB-CS-00003"].id,
      userId: userMap["STU-2026-001"].id,
      staffId: userMap["CIRC-001"].id,
      issuedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      dueDate: loan1Due,
      renewCount: 0,
      status: "ACTIVE",
      notes: "Issued at Main Circulation Desk",
    }
  });

  // Loan 2: OVERDUE loan for James Chen (Clean Code LIB-CS-00011), was due 6 days ago!
  const loan2Due = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const loan2 = await prisma.loan.create({
    data: {
      copyId: bookCopyMap["LIB-CS-00011"].id,
      userId: userMap["STU-2026-003"].id,
      staffId: userMap["CIRC-001"].id,
      issuedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      dueDate: loan2Due,
      renewCount: 0,
      status: "OVERDUE",
      notes: "Overdue reminder notices dispatched",
    }
  });

  // Automatically record fine for overdue loan 2: 6 days overdue - 2 days grace = 4 billable days * $0.50 = $2.00
  await prisma.fine.create({
    data: {
      loanId: loan2.id,
      userId: userMap["STU-2026-003"].id,
      type: "OVERDUE",
      amount: 2.00,
      paidAmount: 0.0,
      status: "PENDING",
      reason: "4 billable days overdue on Clean Code (LIB-CS-00011)",
    }
  });

  // Loan 3: Active Faculty loan for Prof. Alan Turing (CLRS LIB-CS-00042), due in 35 days
  const loan3Due = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);
  await prisma.loan.create({
    data: {
      copyId: bookCopyMap["LIB-CS-00042"].id,
      userId: userMap["FAC-2026-001"].id,
      staffId: userMap["LIB-001"].id,
      issuedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      dueDate: loan3Due,
      renewCount: 0,
      status: "ACTIVE",
      notes: "Advanced Course Reserve: CS601",
    }
  });

  // Loan 4: Active loan for Dr. Grace Hopper (AIMA LIB-CS-00022), due in 20 days
  const loan4Due = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
  await prisma.loan.create({
    data: {
      copyId: bookCopyMap["LIB-CS-00022"].id,
      userId: userMap["RES-2026-001"].id,
      staffId: userMap["CIRC-001"].id,
      issuedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      dueDate: loan4Due,
      renewCount: 1,
      status: "ACTIVE",
    }
  });

  // 15. Historical Fine Waiver Example
  await prisma.fine.create({
    data: {
      userId: userMap["STU-2026-001"].id,
      type: "OVERDUE",
      amount: 4.50,
      paidAmount: 0.0,
      status: "WAIVED",
      reason: "Hospitalization medical waiver verified by Dean of Students",
      waivedById: userMap["DIR-001"].id,
      waivedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      waiveReason: "Approved under University Medical Hardship Policy Sec 4.2",
    }
  });

  // 16. Damage Report
  await prisma.damageReport.create({
    data: {
      copyId: bookCopyMap["LIB-CS-00005"].id,
      staffId: userMap["INV-001"].id,
      severity: "MODERATE",
      penaltyAmount: 35.00,
      description: "Severe spine loosening and liquid marks across chapters 3-4.",
      status: "ASSESSED",
    }
  });

  // 17. Reservations
  await prisma.reservation.create({
    data: {
      bookId: bookMap["clean-code"].id,
      userId: userMap["STU-2026-001"].id,
      copyId: bookCopyMap["LIB-CS-00012"].id,
      queuePosition: 1,
      status: "ON_HOLD",
      notifiedAt: now,
      expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 48 hr hold window
    }
  });

  // 18. Facilities
  const facilitiesData = [
    { code: "ROOM-LIB-201", name: "Ada Lovelace Collaborative Study Room", type: "GROUP_ROOM", location: "Floor 2, East Wing", capacity: 8, amenities: "4K Digital Whiteboard, HDMI Hub, Polycom Conference Mic" },
    { code: "ROOM-LIB-202", name: "Alan Turing Quiet Research Carrel", type: "RESEARCH_CARREL", location: "Floor 2, North Wing", capacity: 1, amenities: "Ergonomic Desk, Ultra-wide Monitor, Noise Dampening" },
    { code: "ROOM-LIB-305", name: "High-Performance Computing Lab", type: "COMPUTER_LAB", location: "Floor 3, West Wing", capacity: 30, amenities: "GPU Workstations, Dual Displays, Gigabit Fiber" },
    { code: "ROOM-LIB-401", name: "Executive Seminar & Defense Hall", type: "MEETING_ROOM", location: "Floor 4, Penthouse", capacity: 25, amenities: "Laser Projector, Motorized Shades, Audio Lectern" },
  ];
  for (const f of facilitiesData) {
    await prisma.facility.create({ data: f });
  }

  // 19. Budget Categories
  await prisma.budgetAllocation.createMany({
    data: [
      { category: "Book Acquisition & Print Subscriptions", allocated: 250000, committed: 84000, spent: 112500, fiscalYear: "2026-2027" },
      { category: "Digital Journals & Online Databases (IEEE/ACM)", allocated: 450000, committed: 300000, spent: 150000, fiscalYear: "2026-2027" },
      { category: "Library Technology & RFID Hardware", allocated: 120000, committed: 35000, spent: 54000, fiscalYear: "2026-2027" },
      { category: "Facilities & Study Space Upgrades", allocated: 80000, committed: 20000, spent: 48000, fiscalYear: "2026-2027" },
      { category: "Binding & Archive Preservation", allocated: 45000, committed: 12000, spent: 19500, fiscalYear: "2026-2027" },
    ]
  });

  // 20. Purchase Requests & Orders
  const pr1 = await prisma.purchaseRequest.create({
    data: {
      title: "Operating Systems: Three Easy Pieces (Hardcover Edition)",
      author: "Remzi H. Arpaci-Dusseau",
      isbn: "978-1985086593",
      publisher: "Arpaci-Dusseau Books",
      quantity: 15,
      estimatedCost: 675.00,
      requesterId: userMap["FAC-2026-001"].id,
      status: "APPROVED",
      reason: "Required textbook for newly accredited CS 330 Operating Systems section.",
    }
  });

  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-2026-084",
      requestId: pr1.id,
      vendorId: vendorMap["VEND-PEARSON"].id,
      totalAmount: 675.00,
      status: "ISSUED",
    }
  });

  // 21. Audit Logs (Sample immutable system history)
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: userMap["DIR-001"].id,
        actorName: "Dr. Eleanor Vance (Director)",
        action: "POLICY_UPDATE",
        entity: "BorrowingPolicy",
        entityId: "FACULTY",
        oldValue: JSON.stringify({ loanDurationDays: 30, maxActiveLoans: 10 }),
        newValue: JSON.stringify({ loanDurationDays: 45, maxActiveLoans: 15 }),
        result: "SUCCESS",
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: userMap["DIR-001"].id,
        actorName: "Dr. Eleanor Vance (Director)",
        action: "FINE_WAIVE",
        entity: "Fine",
        entityId: "WAIVE-9042",
        oldValue: JSON.stringify({ amount: 4.50, status: "PENDING" }),
        newValue: JSON.stringify({ amount: 4.50, status: "WAIVED", reason: "Medical exemption" }),
        result: "SUCCESS",
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: userMap["INV-001"].id,
        actorName: "David Miller (Inventory Staff)",
        action: "COPY_STATUS_CHANGE",
        entity: "BookCopy",
        entityId: bookCopyMap["LIB-CS-00005"].id,
        oldValue: JSON.stringify({ status: "AVAILABLE", condition: "GOOD" }),
        newValue: JSON.stringify({ status: "UNDER_REPAIR", condition: "DAMAGED" }),
        result: "SUCCESS",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: userMap["CIRC-001"].id,
        actorName: "Sarah Jenkins (Circulation Staff)",
        action: "LOAN_ISSUE",
        entity: "Loan",
        entityId: loan1.id,
        oldValue: null,
        newValue: JSON.stringify({ copyBarcode: "LIB-CS-00003", memberId: "STU-2026-001", dueDate: loan1Due }),
        result: "SUCCESS",
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      }
    ]
  });

  // 22. In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userMap["STU-2026-001"].id,
        title: "Reserved Book Ready for Pickup",
        message: "Clean Code (LIB-CS-00012) is now on hold for you at the Main Circulation Desk. Please collect within 48 hours.",
        type: "RESERVATION_AVAILABLE",
        read: false,
      },
      {
        userId: userMap["STU-2026-001"].id,
        title: "Upcoming Loan Due Date Reminder",
        message: "Database System Concepts (LIB-CS-00003) is due in 7 days on " + loan1Due.toLocaleDateString() + ".",
        type: "DUE_SOON",
        read: true,
      },
      {
        userId: userMap["STU-2026-003"].id,
        title: "URGENT: Overdue Book Notice & Fine Incurred",
        message: "Clean Code (LIB-CS-00011) is overdue by 6 days. A fine of $2.00 has been added to your account and checkout privileges are restricted.",
        type: "OVERDUE",
        read: false,
      }
    ]
  });

  console.log("Database seeded successfully with enterprise university records!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
