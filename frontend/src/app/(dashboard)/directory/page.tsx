"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Department, FacultyAssignment, Student, Subject, Teacher } from "@/lib/types";

const SEMESTERS = [1, 2, 3, 4, 5, 6];

function DepartmentsTab({ departments, canCreate, canEdit, reload }: { departments: Department[]; canCreate: boolean; canEdit: boolean; reload: () => void }) {
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", code: "", description: "" });
  const [editError, setEditError] = useState("");
  
  async function create() {
    setError("");
    try {
      await api.createDepartment(form);
      setForm({ name: "", code: "", description: "" });
      reload();
    } catch (e) { setError(e instanceof ApiError ? e.message : "Unable to create department."); }
  }

  function startEdit(d: Department) {
    setEditingId(d.id);
    setEditForm({ name: d.name, code: d.code, description: d.description ?? "" });
    setEditError("");
  }
  async function saveEdit() {
    if (editingId == null) return;
    setEditError("");
    try {
      await api.updateDepartment(editingId, editForm);
      setEditingId(null);
      reload();
    } catch (e) { setEditError(e instanceof ApiError ? e.message : "Unable to update department."); }
  }
  async function removeDept(id: number) {
    if (!confirm("Delete this department? This cannot be undone. Remove HOD and ensure no teachers/students remain.")) return;
    setError("");
    try { await api.deleteDepartment(id); reload(); } catch (e) { setError(e instanceof ApiError ? e.message : "Unable to delete. Remove HOD/teachers first."); }
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
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Active Departments {canEdit ? <span className="text-xs font-normal text-slate">(Principal can edit/delete)</span> : null}</h2>
        {departments.length === 0 ? (
          <p className="text-sm font-medium text-slate text-center py-6">No departments created yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {departments.map(d => (
              <div key={d.id} className="flex flex-col gap-3 rounded-xl border border-hairline bg-paper/50 p-5 hover:border-slate-300 transition-colors">
                {editingId === d.id ? (
                  <div className="space-y-3">
                    <Input label="Name" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/>
                    <Input label="Code" value={editForm.code} onChange={e=>setEditForm({...editForm,code:e.target.value})}/>
                    <Input label="Description" value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})}/>
                    {editError ? <p className="text-xs font-medium text-brick bg-brick-tint p-2 rounded">{editError}</p> : null}
                    <div className="flex gap-2">
                      <Button className="bg-brass text-white text-xs px-4 py-2" onClick={saveEdit}>Save</Button>
                      <Button className="bg-white border border-hairline text-xs px-4 py-2" onClick={()=>setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-ink">{d.name} <span className="text-slate ml-1">({d.code})</span></p>
                      <p className="text-xs text-ink-soft mt-1">{d.description || "No description provided."}</p>
                    </div>
                    <div className="mt-2 pt-3 border-t border-hairline/60 flex items-center justify-between gap-2">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${d.hod ? "bg-brass-tint text-brass border border-brass/20" : "bg-slate-tint text-slate border border-slate/20"}`}>
                        {d.hod ? `HOD: ${d.hod.firstName} ${d.hod.lastName}` : "HOD Not Assigned"}
                      </span>
                      {canEdit ? (
                        <div className="flex gap-1.5">
                          <button onClick={()=>startEdit(d)} className="rounded-lg border border-hairline bg-white px-3 py-1 text-xs font-semibold text-ink hover:bg-slate-tint">Edit</button>
                          <button onClick={()=>removeDept(d.id)} className="rounded-lg border border-brick/20 bg-brick-tint px-3 py-1 text-xs font-semibold text-brick hover:bg-brick hover:text-white">Delete</button>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {error && departments.length>0 ? <p className="mt-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
      </div>
    </div>
  );
}

function HodManagementTab({ departments, teachers, reload }: { departments: Department[]; teachers: Teacher[]; reload:()=>void }) {
  const [departmentId, setDepartmentId] = useState("");
  const [candidates, setCandidates] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const selected = departments.find(d => String(d.id) === departmentId);
  
  useEffect(() => {
    setCandidates([]); setTeacherId(""); setError(""); setSuccess("");
    if(!departmentId) return;
    if(selected?.hod) return;
    api.getHodCandidates(Number(departmentId)).then(setCandidates).catch(e => setError(e instanceof ApiError ? e.message : "Unable to load HOD candidates."));
  }, [departmentId, selected?.hod?.id]);
  
  async function assign() {
    if(!teacherId) return;
    setError(""); setSuccess("");
    try { await api.makeHod(Number(teacherId)); setSuccess("HOD assigned successfully."); reload(); setTeacherId(""); }
    catch(e) { setError(e instanceof ApiError ? e.message : "Unable to assign HOD."); }
  }
  async function remove() {
    if(!departmentId) return;
    if(!confirm(`Remove HOD ${selected?.hod?.firstName} ${selected?.hod?.lastName} from ${selected?.name}? They will be reverted to Teacher.`)) return;
    setError(""); setSuccess("");
    try { await api.removeHod(Number(departmentId)); setSuccess("HOD removed. Department now has no HOD."); reload(); }
    catch(e) { setError(e instanceof ApiError ? e.message : "Unable to remove HOD."); }
  }
  
  return (
    <div className="space-y-6">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Assign Head of Department</h2>
        <p className="text-xs font-medium text-slate mb-4">Principal can assign one HOD per department and can also remove/replace HOD.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Department" value={departmentId} onChange={e=>setDepartmentId(e.target.value)}>
            <option value="">Select department</option>
            {departments.map(d=><option key={d.id} value={d.id}>{d.name} · {d.code} {d.hod ? `— HOD: ${d.hod.firstName}` : ""}</option>)}
          </Select>
          <Select label="Approved Teacher" value={teacherId} disabled={!departmentId || !!selected?.hod || candidates.length===0} onChange={e=>setTeacherId(e.target.value)}>
            <option value="">{selected?.hod ? "HOD already assigned — remove first" : candidates.length ? "Select a teacher" : "No approved teacher available"}</option>
            {candidates.map(t=><option key={t.id} value={t.id}>{t.firstName} {t.lastName} · {t.teacherId}</option>)}
          </Select>
        </div>
        {selected?.hod ? (
          <div className="mt-4 rounded-lg border border-brass/20 bg-brass-tint p-4">
            <p className="text-sm font-semibold text-ink">Current HOD: {selected.hod.firstName} {selected.hod.lastName} ({selected.hod.email})</p>
            <Button className="mt-3 bg-brick text-white hover:bg-brick/90 text-xs px-4 py-2" onClick={remove}>Remove HOD (Demote to Teacher)</Button>
          </div>
        ) : null}
        {error ? <p className="mt-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
        {success ? <p className="mt-4 text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{success}</p> : null}
        {!selected?.hod ? <Button className="mt-6 bg-brass text-white hover:bg-brass-light" onClick={assign} disabled={!teacherId}>Assign as HOD</Button> : null}
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
              {d.hod ? <span className="text-xs text-ink-soft">{d.hod.email}</span> : null}
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

function PrincipalTeachersTab({ teachers, departments, reload }: { teachers: Teacher[]; departments: Department[]; reload: () => void }) {
  const [filterDept, setFilterDept] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState({ firstName: "", lastName: "", phone: "", departmentId: "" });
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    let r = teachers;
    if (filterDept) r = r.filter(t => String(t.department?.id) === filterDept);
    if (q) { const x = q.toLowerCase(); r = r.filter(t => `${t.firstName} ${t.lastName} ${t.email} ${t.teacherId} ${t.phone ?? ""}`.toLowerCase().includes(x)); }
    return r;
  }, [teachers, filterDept, q]);

  function startEdit(t: Teacher) {
    setEditingId(t.id);
    setEdit({ firstName: t.firstName, lastName: t.lastName, phone: t.phone ?? "", departmentId: String(t.department?.id ?? "") });
    setError("");
  }
  async function saveEdit() {
    if (editingId == null) return;
    setError("");
    try {
      const body: any = { firstName: edit.firstName, lastName: edit.lastName, phone: edit.phone };
      if (edit.departmentId) body.department = { id: Number(edit.departmentId) };
      await api.updateTeacher(editingId, body);
      setEditingId(null); reload();
    } catch (e) { setError(e instanceof ApiError ? e.message : "Unable to update teacher."); }
  }
  async function del(id: number) {
    if (!confirm("Delete this teacher? This will also delete their User account.")) return;
    setError("");
    try { await api.deleteTeacher(id); reload(); } catch (e) { setError(e instanceof ApiError ? e.message : "Unable to delete teacher. Remove HOD/Class Teacher first."); }
  }

  return (
    <div className="campus-card p-6 lg:p-8 campus-reveal">
      <div className="mb-6 border-b border-hairline pb-4">
        <h2 className="text-xl font-semibold text-ink">All Teachers — Principal Edit</h2>
        <p className="mt-1 text-sm text-ink-soft">Principal can edit any teacher in college, move department, or delete (if not HOD/Class Teacher).</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Input label="Search" placeholder="Name / Email / Teacher ID" value={q} onChange={e=>setQ(e.target.value)} />
        <Select label="Filter by Department" value={filterDept} onChange={e=>setFilterDept(e.target.value)}><option value="">All Departments</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</Select>
      </div>
      {error ? <p className="mb-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
      <div className="space-y-4">
        {filtered.length===0 ? <p className="text-sm text-slate text-center py-6">No teachers found.</p> :
        filtered.map(t => (
          <div key={t.id} className="flex flex-col gap-3 rounded-xl border border-hairline bg-paper/50 p-5">
            {editingId === t.id ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input label="First Name" value={edit.firstName} onChange={e=>setEdit({...edit, firstName: e.target.value})}/>
                  <Input label="Last Name" value={edit.lastName} onChange={e=>setEdit({...edit, lastName: e.target.value})}/>
                  <Input label="Phone" value={edit.phone} onChange={e=>setEdit({...edit, phone: e.target.value})}/>
                </div>
                <Select label="Department" value={edit.departmentId} onChange={e=>setEdit({...edit, departmentId: e.target.value})}>
                  {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
                <div className="flex gap-2">
                  <Button className="bg-brass text-white text-xs px-4 py-1.5" onClick={saveEdit}>Save</Button>
                  <Button className="bg-white border border-hairline text-xs px-4 py-1.5" onClick={()=>setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-ink">{t.firstName} {t.lastName}</p>
                    {t.hod ? <span className="rounded-full bg-brass-tint border border-brass/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass">HOD</span> : null}
                    {t.classTeacher ? <span className="rounded-full bg-moss-tint border border-moss/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-moss">Class Teacher Sem {t.classTeacherSemester}</span> : null}
                  </div>
                  <p className="text-xs text-ink-soft">{t.teacherId} · {t.email} · {t.department?.name ?? "No Dept"} {t.phone ? `· ${t.phone}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>startEdit(t)} className="rounded-lg border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-ink hover:bg-slate-tint">Edit</button>
                  <button onClick={()=>del(t.id)} className="rounded-lg border border-brick/20 bg-brick-tint px-4 py-1.5 text-xs font-semibold text-brick hover:bg-brick hover:text-white">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeachersTab({ teachers, reload }: { teachers:Teacher[]; reload:()=>void }) {
  const [semester, setSemester] = useState("1"); 
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number|null>(null);
  const [edit, setEdit] = useState({firstName:"", lastName:"", phone:""});
  
  async function assign(id:number) {
    setError("");
    try { await api.assignClassTeacher(id, Number(semester)); reload(); }
    catch(e) { setError(e instanceof ApiError ? e.message : "Unable to assign Class Teacher."); }
  }
  async function removeCT(id:number){
    setError("");
    try { await api.removeClassTeacher(id); reload(); } catch(e){ setError(e instanceof ApiError ? e.message : "Unable to remove Class Teacher.");}
  }
  function startEdit(t:Teacher){ setEditingId(t.id); setEdit({firstName:t.firstName,lastName:t.lastName,phone:t.phone??""}); setError("");}
  async function save(){
    if(editingId==null) return;
    setError("");
    try { await api.updateTeacher(editingId, {firstName:edit.firstName,lastName:edit.lastName,phone:edit.phone}); setEditingId(null); reload(); } catch(e){ setError(e instanceof ApiError ? e.message : "Unable to update.");}
  }
  
  return (
    <div className="campus-card p-6 lg:p-8 campus-reveal">
      <div className="mb-6 border-b border-hairline pb-4">
        <h2 className="text-xl font-semibold text-ink">Teachers & Class Assignments</h2>
        <p className="mt-1 text-sm text-ink-soft">Assign one Class Teacher for each semester. HOD can edit teachers in own department.</p>
      </div>
      {error ? <p className="mb-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
      <div className="space-y-4">
        {teachers.map(t => (
          <div key={t.id} className="flex flex-col gap-3 rounded-xl border border-hairline bg-paper/50 p-5 hover:border-slate-300 transition-colors">
            {editingId===t.id ? (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-3">
                  <Input label="First Name" value={edit.firstName} onChange={e=>setEdit({...edit,firstName:e.target.value})}/>
                  <Input label="Last Name" value={edit.lastName} onChange={e=>setEdit({...edit,lastName:e.target.value})}/>
                  <Input label="Phone" value={edit.phone} onChange={e=>setEdit({...edit,phone:e.target.value})}/>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-brass text-white text-xs px-4 py-1.5" onClick={save}>Save</Button>
                  <Button className="bg-white border border-hairline text-xs px-4 py-1.5" onClick={()=>setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-ink">{t.firstName} {t.lastName}</p>
                    {t.hod ? <span className="rounded-full bg-brass-tint border border-brass/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass">HOD</span> : null}
                  </div>
                  <p className="text-xs text-ink-soft">{t.teacherId} · {t.email} {t.phone ? `· ${t.phone}` : ""}</p>
                  {t.classTeacher ? (
                    <span className="mt-1 inline-flex rounded-full bg-moss-tint border border-moss/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-moss">
                      Class Teacher · Sem {t.classTeacherSemester}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={()=>startEdit(t)} className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-slate-tint">Edit</button>
                  {t.classTeacher ? <button onClick={()=>removeCT(t.id)} className="rounded-lg border border-brick/20 bg-brick-tint px-3 py-1.5 text-xs font-semibold text-brick hover:bg-brick hover:text-white">Remove CT</button> : null}
                  <div className="flex items-end gap-2 bg-white p-2 rounded-lg border border-hairline">
                    <Select label="Semester" className="py-1.5 text-sm" value={semester} onChange={e=>setSemester(e.target.value)}>{SEMESTERS.map(x=><option key={x}>{x}</option>)}</Select>
                    <Button className="bg-slate-tint text-ink hover:bg-hairline text-sm px-4 py-1.5" onClick={()=>assign(t.id)}>Assign</Button>
                  </div>
                </div>
              </div>
            )}
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

function StudentsTab({ students, canUpgradeSemester, departmentId }: { students: Student[]; canUpgradeSemester: boolean; departmentId?: number }) {
  const [q, setQ] = useState("");
  const [semester, setSemester] = useState("1");
  const [upgradeSem, setUpgradeSem] = useState("1");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const filtered = useMemo(() => {
    const x = q.toLowerCase();
    return students
      .filter((s) => s.semester === Number(semester))
      .filter((s) => `${s.firstName} ${s.lastName} ${s.enrollmentNumber}`.toLowerCase().includes(x));
  }, [q, students, semester]);

  async function upgradeSemester() {
    if (!departmentId) return;
    setError(""); setMessage(""); setSubmitting(true);
    try {
      await api.upgradeSemester(departmentId, Number(upgradeSem));
      setMessage(`All Semester ${upgradeSem} students upgraded to Semester ${Number(upgradeSem) + 1}.`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to upgrade semester.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="campus-card p-6 lg:p-8 campus-reveal">
        <h2 className="text-xl font-semibold text-ink mb-6 pb-4 border-b border-hairline">Department Students</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Search Students" placeholder="Search by name or enrollment number..." value={q} onChange={e => setQ(e.target.value)} />
          <Select label="Filter by Semester" value={semester} onChange={e => setSemester(e.target.value)}>
            {SEMESTERS.map(x => <option key={x} value={x}>Semester {x}</option>)}
          </Select>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(s => (
            <div key={s.id} className="rounded-xl border border-hairline bg-paper/50 p-4">
              <p className="font-semibold text-ink">{s.firstName} {s.lastName}</p>
              <p className="text-xs font-medium text-slate mt-1">{s.enrollmentNumber} · Roll {s.rollNumber}</p>
              {s.phone && <p className="text-xs font-medium text-brass mt-1">Phone: {s.phone}</p>}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm font-medium text-slate text-center py-6 col-span-full">No students found for this semester.</p>}
        </div>
      </div>

      {canUpgradeSemester && (
        <div className="campus-card p-6 lg:p-8 campus-reveal">
          <div className="mb-6 border-b border-hairline pb-4">
            <h2 className="text-xl font-semibold text-ink">Semester Upgrade</h2>
            <p className="mt-1 text-sm text-ink-soft">Promote all students from one semester to the next. Subjects remain the same but become editable after upgrade.</p>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <Select label="Upgrade from Semester" value={upgradeSem} onChange={e => setUpgradeSem(e.target.value)}>
              {[1, 2, 3, 4, 5].map(x => <option key={x} value={x}>Semester {x} → {x + 1}</option>)}
            </Select>
            <Button className="bg-brass text-white hover:bg-brass-light px-6" onClick={upgradeSemester} disabled={submitting}>
              {submitting ? "Upgrading..." : "Upgrade All Students"}
            </Button>
          </div>
          {error ? <p className="mt-4 text-sm font-medium text-brick bg-brick-tint p-3 rounded-lg">{error}</p> : null}
          {message ? <p className="mt-4 text-sm font-medium text-moss bg-moss-tint p-3 rounded-lg">{message}</p> : null}
          <p className="mt-3 text-xs font-medium text-slate">Note: Students in the final semester (6) cannot be upgraded. Subjects from the old semester carry over and can be edited by the HOD.</p>
        </div>
      )}
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

  const tabs = session?.role === "PRINCIPAL" ? ["Departments", "HOD Management", "Teachers"] : ["Subjects", "Teachers", "Faculty Assignments", "Students"];
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
          {session.role === "PRINCIPAL" ? "Create departments, edit them, manage HODs and all teachers — all within your single college." : "Manage only your department structure."}
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
        {session.role === "PRINCIPAL" && tab === "Departments" ? <DepartmentsTab departments={departments} canCreate={true} canEdit={true} reload={reload}/> : null}
        {session.role === "PRINCIPAL" && tab === "HOD Management" ? <HodManagementTab departments={departments} teachers={teachers} reload={reload}/> : null}
        {session.role === "PRINCIPAL" && tab === "Teachers" ? <PrincipalTeachersTab teachers={teachers} departments={departments} reload={reload}/> : null}
        {session.role === "HOD" && tab === "Subjects" ? <SubjectsTab subjects={mySubjects} departmentId={session.departmentId!} reload={reload}/> : null}
        {session.role === "HOD" && tab === "Teachers" ? <TeachersTab teachers={myTeachers} reload={reload}/> : null}
        {session.role === "HOD" && tab === "Faculty Assignments" ? <FacultyAssignmentsTab assignments={myAssignments} teachers={myTeachers} subjects={mySubjects} reload={reload}/> : null}
        {session.role === "HOD" && tab === "Students" ? <StudentsTab students={myStudents} canUpgradeSemester={true} departmentId={session.departmentId} /> : null}
      </div>
    </div>
  );
}
