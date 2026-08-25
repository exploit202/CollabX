import React,{useEffect,useState}from'react';
import{Card}from'../../components/common/Card';
import{Badge}from'../../components/common/Badge';
import{getAdminReports,updateAdminReportStatus}from'../../lib/api';
import{useApp}from'../../context/AppContext';

export const AdminReports:React.FC=()=>{
 const{addToast}=useApp();
 const[r,setR]=useState<any[]>([]);
 const[selected,setSelected]=useState<any|null>(null);
 const[loading,setLoading]=useState(false);
 const load=async()=>{try{setR((await getAdminReports()).data.reports)}catch(e:any){addToast('error','Reports load failed',e.message)}};
 useEffect(()=>{load()},[]);
 const up=async(id:string,status:string,open=false)=>{try{setLoading(true);await updateAdminReportStatus(id,status);addToast('success',status==='mediation'?'Mediation opened':'Report updated');await load();if(open){const updated=r.find(x=>x._id===id);if(updated)setSelected({...updated,status})}}catch(e:any){addToast('error','Update failed',e.message)}finally{setLoading(false)}};
 const user=(u:any)=>u?`${u.fullName||'Unknown'} (${u.role||'user'})`:'Not available';
 return <div className="space-y-6">
  <div><h1 className="text-2xl font-black">Platform Audit & Security Disputes</h1><p className="text-xs text-slate-500">Creator ↔ Brand reports from the database.</p></div>
  {r.map(x=><Card key={x._id}className="p-5 space-y-3"><div className="flex justify-between"><b className="text-amber-600">{x.reason}</b><Badge variant={x.status==='resolved'?'emerald':x.status==='dismissed'?'slate':x.status==='mediation'?'purple':'amber'}>{x.status}</Badge></div>
   <p className="text-xs">{user(x.reportedBy)} reported {user(x.reportedAgainst)}.</p><p className="text-xs text-slate-500">{x.description}</p>
   <div className="flex justify-end gap-2 flex-wrap">
    <button onClick={()=>setSelected(x)} className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold">View Details</button>
    <button disabled={loading} onClick={()=>up(x._id,'dismissed')}className="px-3 py-1 bg-slate-100 rounded text-xs font-bold">Dismiss</button>
    <button disabled={loading} onClick={()=>up(x._id,'mediation',true)}className="px-3 py-1 bg-amber-500 text-white rounded text-xs font-bold">Open Mediation</button>
    <button disabled={loading} onClick={()=>up(x._id,'resolved')}className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold">Resolve</button>
   </div>
  </Card>)}
  {!r.length&&<Card className="p-8 text-center text-xs text-slate-400">No reports found.</Card>}
  {selected&&<div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={()=>setSelected(null)}><div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 space-y-5" onClick={e=>e.stopPropagation()}>
   <div className="flex items-start justify-between"><div><h2 className="text-lg font-black text-slate-900">Report Details</h2><p className="text-xs text-slate-500">Review both sides of this Creator ↔ Brand dispute.</p></div><button onClick={()=>setSelected(null)} className="text-slate-400 text-xl">×</button></div>
   <div className="grid md:grid-cols-2 gap-4">
    <div className="rounded-xl border border-slate-200 p-4"><p className="text-[10px] font-black uppercase text-slate-400 mb-2">Reported By</p><p className="font-bold text-slate-900">{selected.reportedBy?.fullName||'Unknown'}</p><p className="text-xs text-slate-500">{selected.reportedBy?.role||'User'}</p><p className="text-xs text-slate-500 mt-1">{selected.reportedBy?.email||'No email available'}</p></div>
    <div className="rounded-xl border border-slate-200 p-4"><p className="text-[10px] font-black uppercase text-slate-400 mb-2">Reported Against</p><p className="font-bold text-slate-900">{selected.reportedAgainst?.fullName||'Unknown'}</p><p className="text-xs text-slate-500">{selected.reportedAgainst?.role||'User'}</p><p className="text-xs text-slate-500 mt-1">{selected.reportedAgainst?.email||'No email available'}</p></div>
   </div>
   <div className="rounded-xl bg-slate-50 p-4 space-y-2"><p className="text-[10px] font-black uppercase text-slate-400">Report</p><p className="font-bold text-slate-900">{selected.reason}</p><p className="text-sm text-slate-600">{selected.description||'No additional description provided.'}</p><p className="text-xs text-slate-500">Status: <b>{selected.status}</b></p></div>
   <div className="flex justify-end gap-2"><button onClick={()=>setSelected(null)} className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold">Close</button>{selected.status==='pending'&&<button disabled={loading} onClick={()=>up(selected._id,'mediation',true)} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold">Open Mediation</button>}{selected.status!=='resolved'&&selected.status!=='dismissed'&&<button disabled={loading} onClick={()=>{up(selected._id,'resolved');setSelected(null)}} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">Resolve</button>}</div>
  </div></div>}
 </div>;
};
