import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Cloud,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  ShieldCheck,
  Users,
  CheckCircle2,
  Database,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="w-full m-0 p-0 overflow-x-hidden bg-slate-50 text-slate-900">
      {/* ============ NAVBAR (Dashboard-style) ============ */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <nav className="w-full max-w-[1160px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[64px]">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-slate-900">CampusOS</span>
            <span className="hidden sm:inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold tracking-widest text-slate-600">
              SINGLE COLLEGE
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How it Works
            </Link>
            <Link href="#curriculum" className="hover:text-slate-900 transition-colors">
              Curriculum
            </Link>
            <Link href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-200 bg-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-900 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-slate-800 hover:shadow-md active:scale-[0.98] transition-all"
            >
              Create Account
            </Link>
          </div>
        </nav>
      </header>

      {/* ============ HERO (Trust-building, spacious) ============ */}
      <section className="w-full bg-white border-b border-slate-200">
        <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="w-full lg:max-w-[560px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold tracking-wide text-slate-600">Trusted by faculty & students • 6-semester ready</span>
              </div>

              <h1 className="mt-5 text-[32px] font-extrabold leading-[0.95] tracking-[-0.03em] text-slate-900 sm:text-[44px] md:text-[48px]">
                The Unified Dashboard for Our College.
              </h1>

              <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-[17px]">
                Seamlessly connecting the <span className="font-semibold text-slate-900">Principal, Teachers, and Students</span> across all{" "}
                <span className="font-semibold text-slate-900">6 semesters</span> in one secure cloud platform.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                >
                  Access Portal <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  Create Account
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> No setup fees
                </span>
                <span className="h-3 w-px bg-slate-200 hidden sm:block" />
                <span>Single Root Principal • One-time setup</span>
              </div>
            </div>

            {/* Preview — clean, dashboard-like */}
            <div className="w-full lg:max-w-[460px] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-3 py-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs font-medium text-slate-500">campusos.app/dashboard</span>
                  <span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
                  </span>
                </div>
                <div className="grid w-full grid-cols-12">
                  <div className="hidden sm:flex col-span-4 flex-col gap-1 border-r border-slate-200 bg-white p-3">
                    <div className="rounded-lg bg-slate-900 px-2.5 py-2 text-xs font-bold text-white">Overview</div>
                    <div className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500">Directory</div>
                    <div className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500">Approvals • 3</div>
                    <div className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500">Notices</div>
                    <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5 flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-slate-900" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Principal</p>
                        <p className="text-[11px] text-slate-500">Root access</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 sm:col-span-8 bg-white p-3 sm:p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { k: "Depts", v: "8" },
                        { k: "Teachers", v: "42" },
                        { k: "Students", v: "1,240" },
                      ].map((c) => (
                        <div key={c.k} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{c.k}</p>
                          <p className="mt-1 text-base font-bold text-slate-900">{c.v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-900">Semester progress</p>
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map((s) => (
                          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= 4 ? "bg-slate-900" : "bg-slate-200"}`} />
                        ))}
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">6-semester curriculum • 3-year tracking</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-xs font-medium text-slate-500">Dashboard preview — matches inner app exactly</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HIERARCHY GRID (How it Works) ============ */}
      <section id="how-it-works" className="w-full bg-slate-50 border-b border-slate-200">
        <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="w-full max-w-2xl">
            <p className="text-xs font-bold tracking-[0.14em] text-slate-500">HOW IT WORKS</p>
            <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">A clear chain of command.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Strict hierarchy — <span className="font-semibold text-slate-900">Principal → Teachers → Students</span>. Every action is scoped by role and department.
            </p>
          </div>

          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Building2 className="h-5 w-5" />
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold tracking-widest text-slate-600">STEP 01</span>
              </div>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight text-slate-900">The Principal — Root Access</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                One-time root registration. Once the Principal claims the college, the root role is securely locked. Manages the college overview, creates departments, and assigns the single HOD per department.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                <Lock className="h-3 w-3" /> One-time setup
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Users className="h-5 w-5" />
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold tracking-widest text-slate-600">STEP 02</span>
              </div>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight text-slate-900">The Teachers — Faculty & HODs</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Teachers manage notices, assignments, and attendance for their specific classes. HODs own one department — managing subjects, timetables, and faculty assignments.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">HOD</span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">Faculty</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold tracking-widest text-slate-600">STEP 03</span>
              </div>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight text-slate-900">The Students</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Students log in to view their 6-semester progress, download cloud-hosted assignments, and view timetables — only for their own department and semester.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> Dept + Semester isolated
              </div>
            </div>
          </div>

          <div className="mt-8 flex w-full justify-center">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 hover:shadow-md transition-all">
              Start with Principal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CURRICULUM STRIP (6-Semester) ============ */}
      <section id="curriculum" className="w-full bg-white border-b border-slate-200">
        <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="w-full flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-slate-500">CURRICULUM</p>
              <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Strict 6-Semester Structure</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
                Exclusively built for a 3-year / 6-semester curriculum. Every module — attendance, assignments, exams, timetable — is semester-aware. No 8-semester bloat.
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="flex h-12 w-12 sm:h-14 sm:w-14 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[11px] font-bold tracking-widest text-slate-500">SEM</span>
                  <span className="text-base font-bold text-slate-900">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">Semester-scoped subjects</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">Semester timetables</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
              <Database className="h-4 w-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">6-sem validation (1–6)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CORE MODULES (Bento Grid) ============ */}
      <section id="features" className="w-full bg-slate-50">
        <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="w-full max-w-2xl">
            <p className="text-xs font-bold tracking-[0.14em] text-slate-500">CORE MODULES</p>
            <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">Subtle cards. Serious capability.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">Four modules that feel native to the dashboard — same borders, same typography, same trust.</p>
          </div>

          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Layers className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight text-slate-900">6-Semester Curriculum Engine</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Tailored exclusively for 3-year / 6-semester degree tracking. Subjects, exams and timetables are created per semester — students see only their current semester’s data.</p>
              <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">Sem 1 → Sem 6</div>
            </div>

            <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Cloud className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight text-slate-900">Smart File Management</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                15-day automated cloud retention for assignments via Cloudinary <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-700">secure_url</code> — scheduled purge saves database space.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <FileText className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-medium text-slate-700">Assignment_QB.pdf → CDN</span>
                <span className="ml-auto text-xs font-bold text-emerald-600">✓ 15-day</span>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight text-slate-900">Role-Based Isolation</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Secure, dedicated dashboards per user type. Principal sees college-wide, HOD sees department, Faculty/Student see only assigned classes — row-level DeptId filtering.</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">Principal</span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">HOD</span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">Faculty</span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">Student</span>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Bell className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight text-slate-900">Real-Time Notices</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Instant college-wide broadcasts targeted by role + department + semester. One post → filtered delivery; students never see other departments’ notices.</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-xs font-semibold text-slate-900">Holiday — 15 Aug</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-xs font-semibold text-slate-900">Lab viva update</span>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <ClipboardCheck className="h-4 w-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">Attendance per lecture</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <CalendarDays className="h-4 w-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">Weekly timetable</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Lock className="h-4 w-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">JWT + scoped APIs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA (full-width, subtle gradient) ============ */}
      <section className="w-full bg-white border-y border-slate-200">
        <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="w-full rounded-[20px] border border-slate-200 bg-slate-900 px-6 py-8 sm:px-10 sm:py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between shadow-sm">
            <div className="w-full md:max-w-xl">
              <h2 className="text-[24px] font-bold leading-tight tracking-tight text-white sm:text-[28px]">Ready to streamline your college?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Launch your unified workspace — Principal setup takes under a minute. Departments, teachers and students follow instantly.</p>
            </div>
            <div className="flex w-full md:w-auto flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/register"
                className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-100 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                Create Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full md:w-auto items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/15 transition-all"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER (Application-style) ============ */}
      <footer className="w-full border-t border-slate-200 bg-white">
        <div className="w-full max-w-[1160px] mx-auto flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Building2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">CampusOS</p>
              <p className="text-xs text-slate-500">© {new Date().getFullYear()} CampusOS • Single institution</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">
            <Link href="#how-it-works" className="rounded-full px-3 py-1.5 hover:bg-slate-50 hover:text-slate-900 transition">
              How it Works
            </Link>
            <Link href="#curriculum" className="rounded-full px-3 py-1.5 hover:bg-slate-50 hover:text-slate-900 transition">
              Curriculum
            </Link>
            <Link href="#features" className="rounded-full px-3 py-1.5 hover:bg-slate-50 hover:text-slate-900 transition">
              Features
            </Link>
            <span className="hidden sm:inline h-3 w-px bg-slate-200" />
            <Link href="/login" className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition">
              Login
            </Link>
            <Link href="/register" className="rounded-full bg-slate-900 px-4 py-1.5 font-semibold text-white hover:bg-slate-800 transition">
              Create Account
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> System operational
            </span>
          </div>
        </div>
        <p className="w-full text-center text-[11px] font-mono tracking-wide text-slate-400 pb-6">Next.js 15 • Spring Boot • Supabase • Cloudinary • Render</p>
      </footer>
    </div>
  );
}
