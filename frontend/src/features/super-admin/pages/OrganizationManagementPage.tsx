import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { fetchOrganizations } from '../store/organizationSlice';

export default function OrganizationManagementPage() {
  const dispatch = useAppDispatch();
  const { list: orgs, status } = useAppSelector((state) => state.organizations);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  if (status === 'loading') {
    return <div className="p-6 text-slate-300">Loading organizations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Organizations</h2>
        <Button variant="primary">Onboard Organization</Button>
      </div>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700">
              <th className="p-4 font-semibold text-slate-300">Name</th>
              <th className="p-4 font-semibold text-slate-300">Slug</th>
              <th className="p-4 font-semibold text-slate-300 text-center">
                Branches
              </th>
              <th className="p-4 font-semibold text-slate-300 text-center">
                Users
              </th>
              <th className="p-4 font-semibold text-slate-300">Status</th>
              <th className="p-4 font-semibold text-slate-300 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org: any) => (
              <tr
                key={org.id}
                className="border-b border-slate-700 hover:bg-slate-700/50"
              >
                <td className="p-4 font-medium text-white">{org.name}</td>
                <td className="p-4 text-slate-400">{org.slug}</td>
                <td className="p-4 text-center text-slate-300">
                  {org._count?.branches || 0}
                </td>
                <td className="p-4 text-center text-slate-300">
                  {org._count?.users || 0}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-bold ${org.status === 'ACTIVE' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}
                  >
                    {org.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orgs.length === 0 && (
          <div className="p-6 text-center text-slate-500">
            No organizations found on the platform.
          </div>
        )}
      </Card>
    </div>
  );
}
