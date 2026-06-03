import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchAllStaff } from '../store/staffSlice';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

export default function StaffManagementPage() {
  const dispatch = useAppDispatch();
  const { list: staffList, status } = useAppSelector((state) => state.staff);

  useEffect(() => {
    dispatch(fetchAllStaff());
  }, [dispatch]);

  if (status === 'loading') {
    return <div className="p-6">Loading staff data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
        <Button variant="primary">Add New Staff</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-700">Name</th>
              <th className="p-4 font-semibold text-slate-700">Email</th>
              <th className="p-4 font-semibold text-slate-700">Role</th>
              <th className="p-4 font-semibold text-slate-700">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff: any) => (
              <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">
                  {staff.firstName} {staff.lastName}
                </td>
                <td className="p-4 text-slate-600">{staff.email}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-bold">
                    {staff.role}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-bold ${staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button variant="outline" size="sm">
                    Edit Role
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staffList.length === 0 && (
          <div className="p-6 text-center text-slate-500">No staff members found.</div>
        )}
      </Card>
    </div>
  );
}
