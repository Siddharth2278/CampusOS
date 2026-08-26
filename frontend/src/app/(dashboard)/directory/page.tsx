"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Department, FacultyAssignment, Student, Subject, Teacher } from "@/lib/types";

const SEMESTERS = [1, 2, 3, 4, 5, 6];

function DepartmentsTab({ departments, canCreate, reload }: { departments: Department[]; canCreate: boolean; reload: () => void }) {
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [error, setError] = useState("");
  
  async function create() {
    setError("");
    try {
      await api.createDepartment(form);
      setForm({ name: "", code: "", description: "" });
      reload();
    } catch (e) { setError(e instanceof ApiError ? e.message : "Unable to create department."); }
  }
  
  return (
    <div className="space-y-6">
      {canCreate ? (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Create Department</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <Input label="Department Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            <Input label="Department Code" value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/>
            <Input label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          </div>
          {error ? <p className="mt-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
          <Button className="mt-6 bg-brass text-white hover:bg-brass-light" onClick={create}>Create Department</Button>
        </div>
      ) : null}
      
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Active Departments</h2>
        {departments.length === 0 ? (
          <p className="text-sm font-medium text-slate text-center py-6">No departments created yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {departments.map(d => (
              <div key={d.id} className="flex flex-col gap-3 rounded-xl border border-hairline bg-paper/50 p-5 hover:border-slate-300 transition-colors">
                <div>
                  <p className="font-semibold text-ink">{d.name} <span className="text-slate ml-1">({d.code})</span></p>
                  <p className="text-xs text-ink-soft mt-1">{d.description || "No description provided."}</p>
                </div>
                <div className="mt-2 pt-3 border-t border-hairline/60">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${d.hod ? "bg-brass-tint text-brass border border-brass/20" : "bg-slate-tint text-slate border border-slate/20"}`}>
                    {d.hod ? `HOD: ${d.hod.firstName} ${d.hod.lastName}` : "HOD Not Assigned"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HodManagementTab({ departments, teachers, reload }: { departments: Department[]; teachers: Teacher[]; reload:()=>void }) {
  const [departmentId, setDepartmentId] = useState("");
  const [candidates, setCandidates] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");
  const selected = departments.find(d => String(d.id) === departmentId);
  
  useEffect(() => {
    setCandidates([]); setTeacherId(""); setError("");
    if(!departmentId || selected?.hod) return;
    api.getHodCandidates(Number(departmentId)).then(setCandidates).catch(e => setError(e instanceof ApiError ? e.message : "Unable to load HOD candidates."));
  }, [departmentId, selected?.hod?.id]);
  
  async function assign() {
    if(!teacherId) return;
    setError("");
    try { await api.makeHod(Number(teacherId)); reload(); setTeacherId(""); }
    catch(e) { setError(e instanceof ApiError ? e.message : "Unable to assign HOD."); }
  }
  
  return (
    <div className="space-y-6">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Assign Head of Department</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Department" value={departmentId} onChange={e=>setDepartmentId(e.target.value)}>
            <option value="">Select department</option>
            {departments.map(d=><option key={d.id} value={d.id}>{d.name} · {d.code}</option>)}
          </Select>
          <Select label="Approved Teacher" value={teacherId} disabled={!departmentId || !!selected?.hod || candidates.length===0} onChange={e=>setTeacherId(e.target.value)}>
            <option value="">{selected?.hod ? "HOD already assigned" : candidates.length ? "Select a teacher" : "No approved teacher available"}</option>
            {candidates.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName} · {t.teacherId}</option>)}
          </Select>
        </div>
        {selected?.hod ? <p className="mt-4 text-sm font-medium text-gold bg-gold-tint p-3 rounded-lg border border-gold/20">This department already has an assigned HOD.</p> : null}
        {error ? <p className="mt-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
        <Button className="mt-6 bg-brass text-white hover:bg-brass-light" onClick={assign} disabled={!teacherId || !!selected?.hod}>Assign as HOD</Button>
      </div>
      
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Current HOD Assignments</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {departments.map(d => (
            <div key={d.id} className="flex flex-col gap-2 rounded-xl border border-hairline bg-paper/50 p-5">
              <span className="font-semibold text-ink">{d.name}</span>
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${d.hod ? "bg-brass-tint text-brass border border-brass/20" : "bg-slate-tint text-slate border border-slate/20"}`}>
                {d.hod ? `${d.hod.firstName} ${d.hod.lastName}` : "No HOD assigned"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubjectsTab({ subjects, departmentId, reload }: { subjects:Subject[]; departmentId:number; reload:()=>void }) {
  const [f, setF] = useState({name:"", code:"", semester:"1", academicYear:String(new Date().getFullYear())});
  const [error, setError] = useState("");
  
  async function save() {
    setError("");
    try { await api.createSubject({name:f.name,code:f.code,department:{id:departmentId},semester:Number(f.semester),academicYear:f.academicYear}); setF({...f,name:"",code:""}); reload(); }
    catch(e) { setError(e instanceof ApiError ? e.message : "Unable to create subject."); }
  }
  
  return (
    <div className="space-y-6">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Create New Subject</h2>
        <div className="grid gap-5 sm:grid-cols-4">
          <Input label="Subject Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
          <Input label="Subject Code" value={f.code} onChange={e=>setF({...f,code:e.target.value})}/>
          <Select label="Semester" value={f.semester} onChange={e=>setF({...f,semester:e.target.value})}>{SEMESTERS.map(x=><option key={x}>{x}</option>)}</Select>
          <Input label="Academic Year" value={f.academicYear} onChange={e=>setF({...f,academicYear:e.target.value})}/>
        </div>
        {error ? <p className="mt-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
        <Button className="mt-6 bg-brass text-white hover:bg-brass-light" onClick={save}>Add Subject</Button>
      </div>
      
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Subjects in Department</h2>
        {subjects.length === 0 ? (
          <p className="text-sm font-medium text-slate text-center py-6">No subjects yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {subjects.map(s => (
              <div key={s.id} className="flex flex-col justify-between rounded-xl border border-hairline bg-paper/50 p-5 hover:border-slate-300 transition-colors">
                <span className="font-semibold text-ink">{s.name} <span className="text-slate ml-1">({s.code})</span></span>
                <span className="text-xs font-medium text-slate mt-2">Semester {s.semester} · {s.academicYear}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TeachersTab({ teachers, reload }: { teachers:Teacher[]; reload:()=>void }) {
  const [semester, setSemester] = useState("1"); 
  const [error, setError] = useState("");
  
  async function assign(id:number) {
    setError("");
    try { await api.assignClassTeacher(id, Number(semester)); reload(); }
    catch(e) { setError(e instanceof ApiError ? e.message : "Unable to assign Class Teacher."); }
  }
  
  return (
    <div className="campus-card p-6 lg:p-8 campus-reveal">
      <div className="mb-6 border-b border-hairline pb-4">
        <h2 className="text-xl font-semibold text-ink">Teachers & Class Assignments</h2>
        <p className="mt-1 text-sm text-ink-soft">Assign one Class Teacher for each semester.</p>
      </div>
      {error ? <p className="mb-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
      <div className="space-y-4">
        {teachers.map(t => (
          <div key={t.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-paper/50 p-5 hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-ink">{t.firstName} {t.lastName}</p>
                {t.hod ? <span className="rounded-full bg-brass-tint border border-brass/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass">HOD</span> : null}
              </div>
              <p className="text-xs text-ink-soft">{t.teacherId} · {t.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {t.classTeacher ? (
                <span className="rounded-full bg-moss-tint border border-moss/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-moss">
                  Class Teacher · Sem {t.classTeacherSemester}
                </span>
              ) : null}
              <div className="flex items-end gap-2 bg-white p-2 rounded-lg border border-hairline">
                <Select label="Semester" className="py-1.5 text-sm" value={semester} onChange={e=>setSemester(e.target.value)}>{SEMESTERS.map(x=><option key={x}>{x}</option>)}</Select>
                <Button className="bg-slate-tint text-ink hover:bg-hairline text-sm px-4 py-1.5" onClick={()=>assign(t.id)}>Assign</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FacultyAssignmentsTab({ assignments,teachers,subjects,reload }: { assignments:FacultyAssignment[];teachers:Teacher[];subjects:Subject[];reload:()=>void }) {
  const [teacherId, setTeacherId] = useState(""); 
  const [subjectId, setSubjectId] = useState(""); 
  const [editId, setEditId] = useState<number|null>(null); 
  const [error, setError] = useState("");
  
  async function save() {
    setError("");
    try {
      const body = {teacher:{id:Number(teacherId)},subject:{id:Number(subjectId)}};
      if(editId) await api.updateFacultyAssignment(editId, body); else await api.createFacultyAssignment(body);
      setTeacherId(""); setSubjectId(""); setEditId(null); reload();
    } catch(e) { setError(e instanceof ApiError ? e.message : "Unable to save assignment."); }
  }
  
  async function remove(id:number) {
    try { await api.deleteFacultyAssignment(id); reload(); }
    catch(e) { setError(e instanceof ApiError ? e.message : "Unable to delete assignment."); }
  }
  
  return (
    <div className="space-y-6">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Assign Subjects to Faculty</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Teacher" value={teacherId} onChange={e=>setTeacherId(e.target.value)}><option value="">Select teacher</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</Select>
          <Select label="Subject" value={subjectId} onChange={e=>setSubjectId(e.target.value)}><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name} · Sem {s.semester}</option>)}</Select>
        </div>
        {error ? <p className="mt-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
        <Button className="mt-6 bg-brass text-white hover:bg-brass-light" onClick={save} disabled={!teacherId||!subjectId}>{editId ? "Update Assignment" : "Assign Subject"}</Button>
      </div>
      
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Current Faculty Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-sm font-medium text-slate text-center py-6">No subject assignments yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {assignments.map(a => (
              <div key={a.id} className="flex flex-col gap-4 justify-between rounded-xl border border-hairline bg-paper/50 p-5 hover:border-slate-300 transition-colors">
                <div>
                  <span className="font-semibold text-ink block">{a.teacher?.firstName} {a.teacher?.lastName}</span>
                  <span className="text-xs font-medium text-slate block mt-1">{a.subject?.name} · Sem {a.subject?.semester}</span>
                </div>
                <div className="flex gap-2 border-t border-hairline/60 pt-3">
                  <Button className="bg-slate-tint text-ink hover:bg-hairline text-xs px-4" onClick={()=>{setEditId(a.id);setTeacherId(String(a.teacher?.id));setSubjectId(String(a.subject?.id));}}>Edit</Button>
                  <Button className="bg-brick-tint text-brick hover:bg-brick hover:text-white transition-colors text-xs px-4" onClick={()=>remove(a.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentsTab({students}:{students:Student[]}) {
  const [q, setQ] = useState(""); 
  const filtered = useMemo(() => {
    const x = q.toLowerCase(); 
    return students.filter(s => `${s.firstName} ${s.lastName} ${s.enrollmentNumber}`.toLowerCase().includes(x));
  }, [q,students]);
  
  return (
    <div className="campus-card p-6 lg:p-8 campus-reveal">
      <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Department Students</h2>
      <Input label="Search Students" placeholder="Search by name or enrollment number..." value={q} onChange={e=>setQ(e.target.value)} />
      <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map(s => (
          <div key={s.id} className="rounded-xl border border-hairline bg-paper/50 p-4">
            <p className="font-semibold text-ink">{s.firstName} {s.lastName}</p>
            <p className="text-xs font-medium text-slate mt-1">{s.enrollmentNumber} · Semester {s.semester}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  const {session} = useAuth();
  const [tab, setTab] = useState("Departments");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function reload() {
    setLoading(true); setLoadError("");
    try {
      if (session?.role === "PRINCIPAL") {
        const [d, t, st] = await Promise.all([api.getDepartments(), api.getTeachers(), api.getStudents()]);
        setDepartments(d); setTeachers(t); setStudents(st); setSubjects([]); setAssignments([]);
      } else if (session?.role === "HOD") {
        const [d, t, s, st, a] = await Promise.all([api.getDepartments(), api.getTeachers(), api.getSubjects(), api.getStudents(), api.getFacultyAssignments()]);
        setDepartments(d); setTeachers(t); setSubjects(s); setStudents(st); setAssignments(a);
      }
    } catch (e) { 
      setLoadError(e instanceof ApiError ? e.message : "Unable to load directory data. Check that the backend is running and reachable."); 
    } finally { setLoading(false); }
  }
  useEffect(() => { reload() }, [session?.role]);

  const tabs = session?.role === "PRINCIPAL" ? ["Departments", "HOD Management"] : ["Subjects", "Teachers", "Faculty Assignments", "Students"];
  useEffect(() => { 
    if (session?.role === "PRINCIPAL") setTab("Departments"); 
    else if (session?.role === "HOD") setTab("Subjects"); 
  }, [session?.role]);

  if (!session || (session.role !== "PRINCIPAL" && session.role !== "HOD")) return (
    <div className="campus-page max-w-5xl mx-auto py-6">
      <div className="campus-card bg-gold-tint border-gold/30 p-6 text-sm font-medium text-gold">This area is not available for your role.</div>
    </div>
  );

  const myTeachers = session.role === "HOD" && session.departmentId ? teachers.filter(t => t.department?.id === session.departmentId) : teachers;
  const myStudents = session.role === "HOD" && session.departmentId ? students.filter(s => s.department?.id === session.departmentId) : students;
  const mySubjects = session.role === "HOD" && session.departmentId ? subjects.filter(s => s.department?.id === session.departmentId) : [];
  const myAssignments = session.role === "HOD" && session.departmentId ? assignments.filter(a => a.teacher?.department?.id === session.departmentId) : [];

  if (loading) return (
    <div className="flex justify-center py-12">
       <div className="animate-breathe text-brass font-medium">Loading directory...</div>
    </div>
  );

  return (
    <div className="campus-page space-y-8 max-w-5xl mx-auto py-6">
      <header className="mb-6">
        <h1 className="campus-gradient-text pb-1">{session.role === "PRINCIPAL" ? "Administration" : "Department Management"}</h1>
        <p className="mt-2 text-ink-soft text-base">
          {session.role === "PRINCIPAL" ? "Create departments and assign the single HOD for each department." : "Manage only your department structure."}
        </p>
      </header>
      
      {loadError ? <div className="rounded-xl border border-brick/30 bg-brick-tint p-4 text-sm font-medium text-brick">{loadError}</div> : null}
      
      <div className="flex flex-wrap gap-2 border-b border-hairline pb-4">
        {tabs.map(x => (
          <button 
            key={x} 
            onClick={() => setTab(x)} 
            className={tab === x ? "rounded-lg bg-brass text-white px-5 py-2 text-sm font-semibold shadow-sm" : "rounded-lg bg-white border border-hairline px-5 py-2 text-sm font-medium text-slate hover:border-slate-300 hover:text-ink transition-colors"}
          >
            {x}
          </button>
        ))}
      </div>
      
      <div className="pt-2">
        {session.role === "PRINCIPAL" && tab === "Departments" ? <DepartmentsTab departments={departments} canCreate reload={reload}/> : null}
        {session.role === "PRINCIPAL" && tab === "HOD Management" ? <HodManagementTab departments={departments} teachers={teachers} reload={reload}/> : null}
        {session.role === "HOD" && tab === "Subjects" ? <SubjectsTab subjects={mySubjects} departmentId={session.departmentId!} reload={reload}/> : null}
        {session.role === "HOD" && tab === "Teachers" ? <TeachersTab teachers={myTeachers} reload={reload}/> : null}
        {session.role === "HOD" && tab === "Faculty Assignments" ? <FacultyAssignmentsTab assignments={myAssignments} teachers={myTeachers} subjects={mySubjects} reload={reload}/> : null}
        {session.role === "HOD" && tab === "Students" ? <StudentsTab students={myStudents}/> : null}
      </div>
    </div>
  );
}