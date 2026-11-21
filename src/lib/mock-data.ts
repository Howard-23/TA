export type OrgNode = {
  id: string;
  parent_id: number | string;
  title: string;
  subs?: OrgNode[];
};

export type Employee = {
  id: string;
  name: string;
  emp_code: string;
  organization_id: string;
  organization_name: string;
};

export const orgTreeData: OrgNode[] = [
  {
    id: "26442",
    parent_id: 0,
    title: "C.A.T GROUP",
    subs: [
      {
        id: "46128",
        parent_id: 26442,
        title: "QATAR REGION",
        subs: [
          {
            id: "26445",
            parent_id: 46128,
            title: "PLANT",
            subs: [
              { id: "48902", parent_id: 26445, title: "Plant Rental" },
              { id: "49093", parent_id: 26445, title: "Plant Staff" },
              { id: "49094", parent_id: 26445, title: "Plant Labor" },
            ],
          },
          {
            id: "26446",
            parent_id: 46128,
            title: "GTC-611",
            subs: [
              { id: "26453", parent_id: 26446, title: "GTC-611 Labor" },
              { id: "26454", parent_id: 26446, title: "GTC-611 Staff" },
            ],
          },
        ],
      },
      {
        id: "46129",
        parent_id: 26442,
        title: "KSA REGION",
        subs: [
          {
            id: "49262",
            parent_id: 46129,
            title: "Northern Area",
            subs: [
              { id: "47135", parent_id: 49262, title: "Package - 18" },
              { id: "47313", parent_id: 49262, title: "Jubail Camp" },
              { id: "50591", parent_id: 49262, title: "Shaybah" },
            ],
          },
          {
            id: "49263",
            parent_id: 46129,
            title: "Southern Area",
            subs: [
              { id: "46130", parent_id: 49263, title: "Haradh" },
              { id: "47307", parent_id: 49263, title: "Harmaliyah" },
            ],
          },
          {
            id: "49264",
            parent_id: 46129,
            title: "Admin Areas",
            subs: [
              { id: "47309", parent_id: 49264, title: "Halfmoon" },
              { id: "48295", parent_id: 49264, title: "Dammam" },
              { id: "50018", parent_id: 49264, title: "Dhahran" },
            ],
          },
        ],
      },
      {
        id: "68258",
        parent_id: 26442,
        title: "CAT UAE",
        subs: [
          { id: "70373", parent_id: 68258, title: "1-UAE - Admin" },
          { id: "70768", parent_id: 68258, title: "2-Dubai-COO Office" },
        ],
      },
    ],
  },
];

const firstNames = ["Ahmed", "Mohammed", "Ali", "Omar", "Khalid", "Saeed", "Youssef", "Hassan", "Ibrahim", "Fatima"];
const lastNames = ["Al-Harbi", "Al-Qahtani", "Al-Mutairi", "Al-Ghamdi", "Al-Shehri", "Khan", "Singh", "Patel"];

function generateEmployees(): Employee[] {
  const employees: Employee[] = [];
  let counter = 1000;
  function walk(nodes: OrgNode[]) {
    for (const node of nodes) {
      if (!node.subs || node.subs.length === 0) {
        const count = 3 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
          const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
          const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
          employees.push({
            id: String(counter++),
            name: `${fn} ${ln}`,
            emp_code: `EMP${String(counter).padStart(5, "0")}`,
            organization_id: node.id,
            organization_name: node.title,
          });
        }
      } else {
        walk(node.subs);
      }
    }
  }
  walk(orgTreeData);
  return employees;
}

export const allEmployees = generateEmployees();

export function getEmployeesByOrgIds(orgIds: string[]): Employee[] {
  if (!orgIds.length) return [];
  const set = new Set(orgIds);
  return allEmployees.filter((e) => set.has(e.organization_id));
}

export type ChunkDetail = {
  chunk_index: number;
  completed_at: string;
  employees_processed: number;
  records_saved: number;
  missing_punches: { in: number; out: number; both: number };
  overtime: number;
  restricted_punches: number;
  people365_sync: { synced: number; failed: number };
};

export type SyncBatch = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  total_chunks: number;
  completed_chunks: number;
  total_records: number;
  total_employees: number;
  error_message?: string;
  chunk_details: ChunkDetail[];
  created_at: number;
  org_ids: string;
  emp_ids: string;
  start_date: string;
  end_date: string;
};

const batches = new Map<string, SyncBatch>();

export function createBatch(params: {
  org_ids: string;
  emp_ids: string;
  start_date: string;
  end_date: string;
  total_employees: number;
}): SyncBatch {
  const id = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const total_chunks = Math.max(1, Math.ceil(params.total_employees / 25));
  const batch: SyncBatch = {
    id,
    status: "processing",
    progress: 0,
    total_chunks,
    completed_chunks: 0,
    total_records: 0,
    total_employees: params.total_employees,
    chunk_details: [],
    created_at: Date.now(),
    ...params,
  };
  batches.set(id, batch);
  simulateProcessing(id);
  return batch;
}

function simulateProcessing(batchId: string) {
  const batch = batches.get(batchId);
  if (!batch) return;
  let chunk = 0;
  const interval = setInterval(() => {
    const b = batches.get(batchId);
    if (!b || b.status === "failed") {
      clearInterval(interval);
      return;
    }
    chunk++;
    const employeesInChunk = Math.min(25, b.total_employees - (chunk - 1) * 25);
    const records = employeesInChunk * (3 + Math.floor(Math.random() * 5));
    const detail: ChunkDetail = {
      chunk_index: chunk,
      completed_at: new Date().toLocaleString(),
      employees_processed: employeesInChunk,
      records_saved: records,
      missing_punches: {
        in: Math.floor(Math.random() * 3),
        out: Math.floor(Math.random() * 3),
        both: Math.floor(Math.random() * 2),
      },
      overtime: Math.floor(Math.random() * 8),
      restricted_punches: Math.floor(Math.random() * 2),
      people365_sync: {
        synced: Math.floor(records * 0.9),
        failed: Math.floor(records * 0.1),
      },
    };
    b.chunk_details.push(detail);
    b.completed_chunks = chunk;
    b.total_records += records;
    b.progress = Math.round((chunk / b.total_chunks) * 100);
    if (chunk >= b.total_chunks) {
      b.status = "completed";
      b.progress = 100;
      clearInterval(interval);
    }
  }, 1800 + Math.random() * 1200);
}

export function getBatch(id: string): SyncBatch | undefined {
  return batches.get(id);
}
