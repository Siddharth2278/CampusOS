"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Department, FacultyAssignment, Student, Subject, Teacher } from "@/lib/types";

const SEMESTERS = [1,2,3,4,5,6];

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
  return <div className="space-y-6">
    {canCreate ? <Card title="Create department" description="Only the Principal can create departments.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Department name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <Input label="Department code" value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/>
        <Input label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      </div>
      {error?<p className="mt-3 text-sm text-brick">{error}</p>:null}
      <Button className="mt-4" onClick={create}>Create department</Button>
    </Card>:null}
    <Card title="Departments">
      {departments.length===0?<p className="text-sm text-slate">No departments created yet.</p>:
      <div className="space-y-2">{departments.map(d=><div key={d.id} className="flex items-center justify-between rounded-xl border p-4">
        <div><p className="font-medium">{d.name} · {d.code}</p><p className="text-xs text-slate">{d.description || "No description"}</p></div>
        <span className="text-xs text-slate">{d.hod ? `HOD: ${d.hod.firstName} ${d.hod.lastName}` : "HOD not assigned"}</span>
      </div>)}</div>}
    </Card>
  </div>;
}

function HodManagementTab({ departments, teachers, reload }: { departments: Department[]; teachers: Teacher[]; reload:()=>void }) {
  const [departmentId,setDepartmentId]=useState("");
  const [candidates,setCandidates]=useState<Teacher[]>([]);
  const [teacherId,setTeacherId]=useState("");
  const [error,setError]=useState("");
  const selected=departments.find(d=>String(d.id)===departmentId);
  useEffect(()=>{
    setCandidates([]);setTeacherId("");setError("");
    if(!departmentId || selected?.hod) return;
    api.getHodCandidates(Number(departmentId)).then(setCandidates).catch(e=>setError(e instanceof ApiError?e.message:"Unable to load HOD candidates."));
  },[departmentId, selected?.hod?.id]);
  async function assign(){
    if(!teacherId)return;
    setError("");
    try{await api.makeHod(Number(teacherId));reload();setTeacherId("");}
    catch(e){setError(e instanceof ApiError?e.message:"Unable to assign HOD.");}
  }
  return <div className="space-y-6">
    <Card title="Assign HOD" description="Only the Principal can assign a HOD. Each department can have exactly one HOD.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Department" value={departmentId} onChange={e=>setDepartmentId(e.target.value)}>
          <option value="">Select department</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name} · {d.code}</option>)}
        </Select>
        <Select label="Approved teacher" value={teacherId} disabled={!departmentId || !!selected?.hod || candidates.length===0} onChange={e=>setTeacherId(e.target.value)}>
          <option value="">{selected?.hod ? "HOD already assigned" : candidates.length ? "Select one teacher" : "No approved teacher available"}</option>
          {candidates.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName} · {t.teacherId}</option>)}
        </Select>
      </div>
      {selected?.hod?<p className="mt-3 text-sm text-gold">This department already has one HOD. A second HOD cannot be assigned.</p>:null}
      {error?<p className="mt-3 text-sm text-brick">{error}</p>:null}
      <Button className="mt-4" onClick={assign} disabled={!teacherId || !!selected?.hod}>Assign HOD</Button>
    </Card>
    <Card title="Current HODs">
      <div className="space-y-2">{departments.map(d=><div key={d.id} className="rounded-xl border p-4 text-sm">
        <span className="font-medium">{d.name}</span><span className="ml-3 text-slate">{d.hod ? `${d.hod.firstName} ${d.hod.lastName} · ${d.hod.email}` : "No HOD assigned"}</span>
      </div>)}</div>
    </Card>
  </div>;
}

function SubjectsTab({ subjects, departmentId, reload }: { subjects:Subject[]; departmentId:number; reload:()=>void }) {
  const [f,setF]=useState({name:"",code:"",semester:"1",academicYear:String(new Date().getFullYear())});
  const [error,setError]=useState("");
  async function save(){
    setError("");
    try{await api.createSubject({name:f.name,code:f.code,department:{id:departmentId},semester:Number(f.semester),academicYear:f.academicYear});setF({...f,name:"",code:""});reload();}
    catch(e){setError(e instanceof ApiError?e.message:"Unable to create subject.");}
  }
  return <div className="space-y-6">
    <Card title="Department subjects" description="Only the HOD can create subjects for this department.">
      <div className="grid gap-4 sm:grid-cols-4">
        <Input label="Subject name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
        <Input label="Subject code" value={f.code} onChange={e=>setF({...f,code:e.target.value})}/>
        <Select label="Semester" value={f.semester} onChange={e=>setF({...f,semester:e.target.value})}>{SEMESTERS.map(x=><option key={x}>{x}</option>)}</Select>
        <Input label="Academic year" value={f.academicYear} onChange={e=>setF({...f,academicYear:e.target.value})}/>
      </div>
      {error?<p className="mt-3 text-sm text-brick">{error}</p>:null}
      <Button className="mt-4" onClick={save}>Add subject</Button>
    </Card>
    <Card title="Subjects in my department">
      {subjects.length===0?<p className="text-sm text-slate">No subjects yet.</p>:
      <div className="space-y-2">{subjects.map(s=><div key={s.id} className="flex justify-between rounded-xl border p-4 text-sm"><span className="font-medium">{s.name} · {s.code}</span><span className="text-slate">Semester {s.semester} · {s.academicYear}</span></div>)}</div>}
    </Card>
  </div>;
}

function TeachersTab({ teachers, reload }: { teachers:Teacher[]; reload:()=>void }) {
  const [semester,setSemester]=useState("1"); const [error,setError]=useState("");
  async function assign(id:number){setError("");try{await api.assignClassTeacher(id,Number(semester));reload();}catch(e){setError(e instanceof ApiError?e.message:"Unable to assign Class Teacher.");}}
  return <Card title="Teachers & Class Teacher assignment" description="The HOD can assign one Class Teacher for each semester in the department.">
    {error?<p className="mb-3 text-sm text-brick">{error}</p>:null}
    <div className="space-y-2">{teachers.map(t=><div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
      <div><p className="font-medium">{t.firstName} {t.lastName}</p><p className="text-xs text-slate">{t.teacherId} · {t.email}</p></div>
      <div className="flex items-center gap-2">{t.hod?<Badge tone="indigo">HOD</Badge>:null}{t.classTeacher?<Badge tone="green">Class Teacher · Sem {t.classTeacherSemester}</Badge>:null}
        <Select label="Semester" value={semester} onChange={e=>setSemester(e.target.value)}>{SEMESTERS.map(x=><option key={x}>{x}</option>)}</Select>
        <Button variant="secondary" onClick={()=>assign(t.id)}>Assign Class Teacher</Button>
      </div>
    </div>)}</div>
  </Card>;
}

function FacultyAssignmentsTab({ assignments,teachers,subjects,reload }: { assignments:FacultyAssignment[];teachers:Teacher[];subjects:Subject[];reload:()=>void }) {
  const [teacherId,setTeacherId]=useState(""); const [subjectId,setSubjectId]=useState(""); const [editId,setEditId]=useState<number|null>(null); const [error,setError]=useState("");
  async function save(){setError("");try{
    const body={teacher:{id:Number(teacherId)},subject:{id:Number(subjectId)}};
    if(editId) await api.updateFacultyAssignment(editId,body); else await api.createFacultyAssignment(body);
    setTeacherId("");setSubjectId("");setEditId(null);reload();
  }catch(e){setError(e instanceof ApiError?e.message:"Unable to save assignment.");}}
  async function remove(id:number){try{await api.deleteFacultyAssignment(id);reload();}catch(e){setError(e instanceof ApiError?e.message:"Unable to delete assignment.");}}
  return <div className="space-y-6">
    <Card title="Assign subjects to teachers" description="HOD controls which subjects each teacher teaches. A teacher may teach multiple subjects.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Teacher" value={teacherId} onChange={e=>setTeacherId(e.target.value)}><option value="">Select teacher</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}</Select>
        <Select label="Subject" value={subjectId} onChange={e=>setSubjectId(e.target.value)}><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name} · Sem {s.semester}</option>)}</Select>
      </div>
      {error?<p className="mt-3 text-sm text-brick">{error}</p>:null}
      <Button className="mt-4" onClick={save} disabled={!teacherId||!subjectId}>{editId?"Update assignment":"Assign subject"}</Button>
    </Card>
    <Card title="Current faculty assignments">
      {assignments.length===0?<p className="text-sm text-slate">No subject assignments yet.</p>:
      <div className="space-y-2">{assignments.map(a=><div key={a.id} className="flex items-center justify-between rounded-xl border p-4 text-sm">
        <span>{a.teacher?.firstName} {a.teacher?.lastName}</span><span className="text-slate">{a.subject?.name} · Sem {a.subject?.semester}</span>
        <div className="flex gap-2"><Button variant="ghost" onClick={()=>{setEditId(a.id);setTeacherId(String(a.teacher?.id));setSubjectId(String(a.subject?.id));}}>Edit</Button><Button variant="ghost" onClick={()=>remove(a.id)}>Delete</Button></div>
      </div>)}</div>}
    </Card>
  </div>;
}

function StudentsTab({students}:{students:Student[]}) {
  const [q,setQ]=useState(""); const filtered=useMemo(()=>{const x=q.toLowerCase();return students.filter(s=>`${s.firstName} ${s.lastName} ${s.enrollmentNumber}`.toLowerCase().includes(x));},[q,students]);
  return <Card title="Students in my department"><Input label="Search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Name or enrollment"/><div className="mt-4 space-y-2">{filtered.map(s=><div key={s.id} className="rounded-xl border p-3 text-sm">{s.firstName} {s.lastName} · {s.enrollmentNumber} · Semester {s.semester}</div>)}</div></Card>;
}

export default function DirectoryPage(){
  const {session}=useAuth();
  const [tab,setTab]=useState("Departments");
  const [departments,setDepartments]=useState<Department[]>([]);
  const [teachers,setTeachers]=useState<Teacher[]>([]);
  const [students,setStudents]=useState<Student[]>([]);
  const [subjects,setSubjects]=useState<Subject[]>([]);
  const [assignments,setAssignments]=useState<FacultyAssignment[]>([]);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState("");

  async function reload(){
    setLoading(true);
    setLoadError("");
    try{
      if(session?.role==="PRINCIPAL"){
        const [d,t,st]=await Promise.all([api.getDepartments(),api.getTeachers(),api.getStudents()]);
        setDepartments(d);setTeachers(t);setStudents(st);setSubjects([]);setAssignments([]);
      } else if(session?.role==="HOD"){
        const [d,t,s,st,a]=await Promise.all([api.getDepartments(),api.getTeachers(),api.getSubjects(),api.getStudents(),api.getFacultyAssignments()]);
        setDepartments(d);setTeachers(t);setSubjects(s);setStudents(st);setAssignments(a);
      }
    } catch (e) { setLoadError(e instanceof ApiError ? e.message : "Unable to load directory data. Check that the backend is running and reachable."); }
    finally{setLoading(false);}
  }
  useEffect(()=>{reload()},[session?.role]);

  const tabs=session?.role==="PRINCIPAL"?["Departments","HOD Management"]:["Subjects","Teachers","Faculty Assignments","Students"];
  useEffect(()=>{ if (session?.role==="PRINCIPAL") setTab("Departments"); else if (session?.role==="HOD") setTab("Subjects"); },[session?.role]);

  if(!session || (session.role!=="PRINCIPAL" && session.role!=="HOD")) return <Card><p className="text-sm text-slate">This area is not available for your role.</p></Card>;
  const myTeachers=session.role==="HOD"&&session.departmentId?teachers.filter(t=>t.department?.id===session.departmentId):teachers;
  const myStudents=session.role==="HOD"&&session.departmentId?students.filter(s=>s.department?.id===session.departmentId):students;
  const mySubjects=session.role==="HOD"&&session.departmentId?subjects.filter(s=>s.department?.id===session.departmentId):[];
  const myAssignments=session.role==="HOD"&&session.departmentId?assignments.filter(a=>a.teacher?.department?.id===session.departmentId):[];

  if(loading)return <p className="text-sm text-slate">Loading...</p>;
  return <div className="space-y-6">
    <div><h1 className="font-display text-2xl font-semibold text-ink">{session.role==="PRINCIPAL"?"Administration":"Department management"}</h1><p className="mt-1 text-sm text-slate">{session.role==="PRINCIPAL"?"Create departments and assign the single HOD for each department.":"Manage only your department."}</p></div>
    {loadError ? <div className="rounded-xl border border-brick/30 bg-brick-tint p-4 text-sm text-brick">{loadError}</div> : null}
    <div className="flex flex-wrap gap-2 border-b pb-2">{tabs.map(x=><button key={x} onClick={()=>setTab(x)} className={tab===x?"rounded-lg bg-brass-tint px-3 py-1.5 text-sm font-medium text-brass":"rounded-lg px-3 py-1.5 text-sm text-ink-soft"}>{x}</button>)}</div>
    {session.role==="PRINCIPAL"&&tab==="Departments"?<DepartmentsTab departments={departments} canCreate reload={reload}/>:null}
    {session.role==="PRINCIPAL"&&tab==="HOD Management"?<HodManagementTab departments={departments} teachers={teachers} reload={reload}/>:null}
    {session.role==="HOD"&&tab==="Subjects"?<SubjectsTab subjects={mySubjects} departmentId={session.departmentId!} reload={reload}/>:null}
    {session.role==="HOD"&&tab==="Teachers"?<TeachersTab teachers={myTeachers} reload={reload}/>:null}
    {session.role==="HOD"&&tab==="Faculty Assignments"?<FacultyAssignmentsTab assignments={myAssignments} teachers={myTeachers} subjects={mySubjects} reload={reload}/>:null}
    {session.role==="HOD"&&tab==="Students"?<StudentsTab students={myStudents}/>:null}
  </div>;
}
