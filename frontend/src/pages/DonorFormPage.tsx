import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { dateInputValue } from '../format'
import { PAYMENT_METHODS, PURPOSES, type DonorRegistration, type DonorWrite } from '../types'

const donorEmpty: DonorWrite = { fullName: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' }
const registrationEmpty: DonorRegistration = { ...donorEmpty, amount: 1100, donationDate: dateInputValue(), paymentMethod: 'UPI', purpose: 'Ganesh Utsav', notes: '' }

export default function DonorFormPage() {
  const { id } = useParams(); const navigate = useNavigate(); const isEdit = Boolean(id)
  const [form, setForm] = useState<DonorRegistration>(registrationEmpty)
  const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(isEdit); const [saving, setSaving] = useState(false)

  useEffect(() => { if (!id) return; api.donor(Number(id)).then((d) => setForm((f) => ({ ...f, fullName:d.fullName,email:d.email,phone:d.phone,address:d.address,city:d.city,state:d.state,pincode:d.pincode }))).catch((e:Error)=>setError(e.message)).finally(()=>setLoading(false)) }, [id])
  function update(field: keyof DonorRegistration, value: string | number) { setForm((c) => ({ ...c, [field]: value })) }
  async function onSubmit(e: FormEvent) { e.preventDefault(); setSaving(true); setError(null); try { if (isEdit && id) { const donor: DonorWrite = { fullName:form.fullName,email:form.email,phone:form.phone,address:form.address,city:form.city,state:form.state,pincode:form.pincode }; await api.updateDonor(Number(id), donor) } else { await api.registerDonorWithDonation({ ...form, amount:Number(form.amount), donationDate:new Date(form.donationDate).toISOString() }) } navigate('/donors') } catch(err){setError((err as Error).message)} finally{setSaving(false)} }
  if (loading) return <p className="text-[#7a5a4a]">Loading donor…</p>

  return <div className="mx-auto max-w-3xl">
    <h1 className="font-display text-3xl text-[#6b1d12]">{isEdit ? 'Update donor' : 'Add donor & donation'}</h1>
    <p className="mt-1 text-[#7a5a4a]">{isEdit ? 'Update the donor contact details.' : 'Enter donor details and the first chanda in one step.'}</p>
    {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>}
    <form onSubmit={onSubmit} className="mt-5 space-y-5 rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-5">
      <section><h2 className="font-display mb-3 text-xl text-[#6b1d12]">Donor details</h2>
        <Field label="Full name" required><input required value={form.fullName} onChange={e=>update('fullName',e.target.value)} className={inputClass}/></Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Email" required><input required type="email" value={form.email} onChange={e=>update('email',e.target.value)} className={inputClass}/></Field><Field label="Phone" required><input required value={form.phone} onChange={e=>update('phone',e.target.value)} className={inputClass}/></Field></div>
        <div className="mt-4"><Field label="Address"><input value={form.address} onChange={e=>update('address',e.target.value)} className={inputClass}/></Field></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3"><Field label="City"><input value={form.city} onChange={e=>update('city',e.target.value)} className={inputClass}/></Field><Field label="State"><input value={form.state} onChange={e=>update('state',e.target.value)} className={inputClass}/></Field><Field label="PIN code"><input value={form.pincode} onChange={e=>update('pincode',e.target.value)} className={inputClass}/></Field></div>
      </section>
      {!isEdit && <section className="border-t border-[#edd8b8] pt-5"><h2 className="font-display mb-3 text-xl text-[#6b1d12]">Donation details</h2>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Amount (₹)" required><input required type="number" min="1" value={form.amount} onChange={e=>update('amount',Number(e.target.value))} className={inputClass}/></Field><Field label="Donation date" required><input required type="date" value={form.donationDate} onChange={e=>update('donationDate',e.target.value)} className={inputClass}/></Field></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Payment method" required><select value={form.paymentMethod} onChange={e=>update('paymentMethod',e.target.value)} className={inputClass}>{PAYMENT_METHODS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Purpose" required><select value={form.purpose} onChange={e=>update('purpose',e.target.value)} className={inputClass}>{PURPOSES.map(x=><option key={x}>{x}</option>)}</select></Field></div>
        <div className="mt-4"><Field label="Notes"><textarea rows={3} value={form.notes} onChange={e=>update('notes',e.target.value)} className={inputClass}/></Field></div>
      </section>}
      <div className="flex gap-3 pt-2"><button type="submit" disabled={saving} className="rounded-full bg-[#6b1d12] px-5 py-2 font-semibold text-[#fff8ea] disabled:opacity-60">{saving?'Saving…':isEdit?'Save changes':'Save donor & donation'}</button><Link to="/donors" className="rounded-full px-5 py-2 text-[#6b1d12] no-underline">Cancel</Link></div>
    </form>
  </div>
}
const inputClass='mt-1 w-full rounded-xl border border-[#edd8b8] bg-white px-3 py-2 outline-none focus:border-[#e07a2f]'
function Field({label,required,children}:{label:string;required?:boolean;children:ReactNode}){return <label className="block text-sm font-semibold text-[#6b1d12]">{label}{required?' *':''}{children}</label>}
