import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Save } from 'lucide-react';

export default function Settings() {
  const { businessDetails, updateBusinessDetails } = useStore();
  const [formData, setFormData] = useState(businessDetails);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessDetails(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Update your company details used on invoices.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900">Company Profile</h2>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900">Business Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900">GSTIN</label>
                <input type="text" required value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono uppercase" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900">State</label>
                <input type="text" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900">Logo URL</label>
                <input type="url" value={formData.logoUrl} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="https://..." />
              </div>
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium leading-6 text-slate-900">Business Address</label>
                <textarea rows={3} required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200">
            <h2 className="text-base font-semibold leading-7 text-slate-900">Contact Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900">Phone Number</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900">Email Address</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200">
            <h2 className="text-base font-semibold leading-7 text-slate-900">Payment Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium leading-6 text-slate-900">Bank Account Details</label>
                <textarea rows={2} value={formData.bankDetails} onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Bank Name, Account Number, IFSC Code" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900">UPI ID</label>
                <input type="text" value={formData.upiId} onChange={(e) => setFormData({ ...formData, upiId: e.target.value })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200">
            <h2 className="text-base font-semibold leading-7 text-slate-900">Invoice Preferences</h2>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium leading-6 text-slate-900">Footer Text / Terms & Conditions</label>
                <textarea rows={2} value={formData.footerText} onChange={(e) => setFormData({ ...formData, footerText: e.target.value })} className="mt-2 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>
            </div>
          </div>

        </div>
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-x-4 border-t border-slate-200">
          {isSaved && <span className="text-sm text-emerald-600 font-medium">Settings saved successfully!</span>}
          <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors">
            <Save className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
