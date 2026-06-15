import { pathToFileURL } from "node:url";

import { createClient } from "@supabase/supabase-js";

import { loadRuntimeEnv } from "./runtime-env.mjs";

const DEFAULT_PASSWORD = "ClubViry2026!";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function isLocalSupabaseUrl(value) {
  try {
    const url = new URL(value);
    return LOCAL_HOSTS.has(url.hostname) || url.hostname.endsWith(".localhost");
  } catch {
    return false;
  }
}

function ensureSafeTarget(supabaseUrl) {
  if (isLocalSupabaseUrl(supabaseUrl)) {
    return;
  }

  if (process.env.ALLOW_REMOTE_SEED === "1") {
    return;
  }

  throw new Error("Refusing to seed a non-local Supabase project. Set ALLOW_REMOTE_SEED=1 to override.");
}

async function findUserByEmail(supabase, email) {
  let page = 1;
  const perPage = 100;

  while (page < 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(`Unable to list auth users: ${error.message}`);
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

    if (match) {
      return match;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }

  throw new Error("Unable to scan auth users: pagination safety limit reached.");
}

async function upsertAuthUser(supabase, user, password) {
  const existing = await findUserByEmail(supabase, user.email);

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        first_name: user.firstName,
        last_name: user.lastName,
        display_name: user.displayName
      }
    });

    if (error) {
      throw new Error(`Unable to update ${user.email}: ${error.message}`);
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: user.firstName,
      last_name: user.lastName,
      display_name: user.displayName
    }
  });

  if (error || !data.user) {
    throw new Error(`Unable to create ${user.email}: ${error?.message ?? "missing auth user"}`);
  }

  return data.user;
}

function profileRow(authUser, user) {
  return {
    id: authUser.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    display_name: user.displayName,
    role: user.role,
    status: "ACTIVE",
    avatar_url: user.avatarUrl ?? null,
    public_profile: user.publicProfile ?? false,
    public_title: user.publicTitle ?? null,
    public_diploma: user.publicDiploma ?? null,
    public_joined_year: user.publicJoinedYear ?? null,
    public_diplomas: user.publicDiplomas ?? [],
    public_specialties: user.publicSpecialties ?? [],
    public_quote: user.publicQuote ?? null,
    public_bio: user.publicBio ?? null
  };
}

export const testUsers = [
  {
    email: "admin.test@club-viry.local",
    firstName: "Admin",
    lastName: "Viry",
    displayName: "Admin Test Viry",
    role: "SUPER_ADMIN",
    publicProfile: false
  },
  ...[
    ["Malik", "Benali", "Responsable U18", "UEFA B", ["Formation", "Projet de jeu", "Leadership"]],
    ["Sarah", "Nguyen", "Educatrice U15F", "BEF", ["Football feminin", "Technique", "Confiance"]],
    ["Ibrahim", "Toure", "Coach U14", "CFF3", ["Preformation", "Transitions", "Analyse video"]],
    ["Camille", "Roux", "Coach gardiens", "CFF Gardien", ["Gardiens", "Reflexes", "Relance"]],
    ["Awa", "Diop", "Educatrice U11", "CFF2", ["Ecole de foot", "Motricite", "Pedagogie"]],
    ["Thomas", "Leroy", "Preparateur physique", "BPJEPS", ["Performance", "Prevention", "Retour terrain"]],
    ["Karim", "Sow", "Coach Seniors", "BEF", ["Competition", "Management", "Standards club"]],
    ["Nadia", "Martin", "Responsable U13", "CFF3", ["Preformation", "Technique", "Culture club"]],
    ["Yanis", "Petit", "Analyste video", "Certificat analyste", ["Video", "Data match", "Feedback"]],
    ["Julie", "Moreau", "Coordinatrice ecole de foot", "BMF", ["Coordination", "Parents", "Progression"]]
  ].map(([firstName, lastName, publicTitle, publicDiploma, publicSpecialties], index) => ({
    email: `educateur${String(index + 1).padStart(2, "0")}@club-viry.local`,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    role: "EDUCATEUR",
    publicProfile: true,
    publicTitle,
    publicDiploma,
    publicJoinedYear: 2017 + index,
    publicDiplomas: [publicDiploma],
    publicSpecialties,
    publicQuote: "Former des joueurs autonomes, exigeants et attaches au collectif.",
    publicBio:
      "Profil de test publie pour valider l'annuaire, les cartes responsables et les pages detail du club."
  }))
];

export async function seedLocalTestUsers({ password = DEFAULT_PASSWORD } = {}) {
  loadRuntimeEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  ensureSafeTarget(supabaseUrl);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const rows = [];

  for (const user of testUsers) {
    const authUser = await upsertAuthUser(supabase, user, password);
    rows.push(profileRow(authUser, user));
  }

  const { error } = await supabase.from("profiles").upsert(rows, { onConflict: "id" });

  if (error) {
    throw new Error(`Unable to upsert profiles: ${error.message}`);
  }

  return {
    count: rows.length,
    password,
    adminEmail: testUsers[0].email,
    educatorEmails: testUsers.slice(1).map((user) => user.email)
  };
}

async function main() {
  const result = await seedLocalTestUsers({ password: process.env.SEED_TEST_PASSWORD ?? DEFAULT_PASSWORD });

  console.log(`Seeded ${result.count} local test users.`);
  console.log(`Admin: ${result.adminEmail}`);
  console.log(`Educators: ${result.educatorEmails.join(", ")}`);
  console.log(`Password: ${result.password}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
