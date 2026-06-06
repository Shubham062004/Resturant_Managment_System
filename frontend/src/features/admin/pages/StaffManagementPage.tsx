import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { fetchAllStaff, updateStaffProfile, bulkUpdateStaff } from '../store/staffSlice';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Checkbox } from '../../../shared/components/ui/Checkbox';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { Badge } from '../../../shared/components/ui/Badge';
import { Alert } from '../../../shared/components/ui/Alert';

const STAFF_ROLES = [
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'KITCHEN_STAFF', label: 'Kitchen Staff' },
  { value: 'HEAD_CHEF', label: 'Head Chef' },
  { value: 'KITCHEN_MANAGER', label: 'Kitchen Manager' },
  { value: 'DELIVERY_PARTNER', label: 'Delivery Partner' },
  { value: 'DELIVERY_MANAGER', label: 'Delivery Manager' },
  { value: 'BRANCH_MANAGER', label: 'Branch Manager' },
  { value: 'OPERATIONS_MANAGER', label: 'Operations Manager' },
  { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
];

const CATEGORIES = [
  { value: 'Appetizers', label: 'Appetizers' },
  { value: 'Mains', label: 'Mains / Main Course' },
  { value: 'Desserts', label: 'Desserts' },
  { value: 'Beverages', label: 'Beverages' },
];

export default function StaffManagementPage() {
  const dispatch = useAppDispatch();
  const { list: staffList, status } = useAppSelector((state) => state.staff);

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Detail panel active staff selection
  const [activeStaffId, setActiveStaffId] = useState<string | null>(null);
  const activeStaff = staffList.find((s: any) => s.id === activeStaffId);

  // Edit states for the selected staff member
  const [editSalary, setEditSalary] = useState<string>('0');
  const [editAttendance, setEditAttendance] = useState<number>(0);
  const [editPerformance, setEditPerformance] = useState<number>(5.0);
  const [editCategory, setEditCategory] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  // Bulk edit states
  const [bulkRole, setBulkRole] = useState<string>('');
  const [bulkActive, setBulkActive] = useState<string>('');

  // Info alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    dispatch(fetchAllStaff());
  }, [dispatch]);

  // Sync edit form fields when active staff changes
  useEffect(() => {
    if (activeStaff) {
      setEditSalary(activeStaff.salary ? activeStaff.salary.toString() : '0');
      setEditAttendance(activeStaff.attendanceCount || 0);
      setEditPerformance(activeStaff.performanceScore !== undefined ? activeStaff.performanceScore : 5.0);
      setEditCategory(activeStaff.assignedCategory || '');
      setEditRole(activeStaff.role || '');
      setEditIsActive(activeStaff.isActive !== undefined ? activeStaff.isActive : true);
    }
  }, [activeStaff]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(staffList.map((s: any) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSaveProfile = async () => {
    if (!activeStaffId) return;
    try {
      await dispatch(
        updateStaffProfile({
          id: activeStaffId,
          data: {
            salary: parseFloat(editSalary),
            attendanceCount: editAttendance,
            performanceScore: editPerformance,
            assignedCategory: editCategory || null,
            role: editRole,
            isActive: editIsActive,
          },
        })
      ).unwrap();
      setAlertMsg({ type: 'success', text: 'Staff profile updated successfully.' });
      dispatch(fetchAllStaff());
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to update staff profile' });
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    try {
      const data: any = {};
      if (bulkRole) data.role = bulkRole;
      if (bulkActive !== '') data.isActive = bulkActive === 'true';

      await dispatch(bulkUpdateStaff({ ids: selectedIds, data })).unwrap();
      setAlertMsg({ type: 'success', text: `Successfully updated ${selectedIds.length} staff members.` });
      setSelectedIds([]);
      setBulkRole('');
      setBulkActive('');
      dispatch(fetchAllStaff());
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to perform bulk update' });
    }
  };

  // Helper bonus calculator: $150 bonus per performance point above 3.5
  const calculateBonus = (perf: number) => {
    if (perf <= 3.5) return 0;
    return Math.round((perf - 3.5) * 150);
  };

  const baseSalary = parseFloat(editSalary) || 0;
  const ratingBonus = calculateBonus(editPerformance);
  const totalPayout = baseSalary + ratingBonus;

  if (status === 'loading' && staffList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-500 animate-pulse">Loading staff directories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 mt-1">Configure compensation matrices, monitor shift logs, and manage organizational category roles.</p>
        </div>
        <Button variant="primary" className="shadow-lg hover:shadow-indigo-500/20">Add Staff Member</Button>
      </div>

      {alertMsg && (
        <Alert
          variant={alertMsg.type === 'success' ? 'success' : 'error'}
          onClose={() => setAlertMsg(null)}
          className="mb-4"
        >
          {alertMsg.text}
        </Alert>
      )}

      {/* Main Multi-grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Directory Table */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Bulk Update Controls Action Bar */}
          {selectedIds.length > 0 && (
            <Card className="p-4 bg-indigo-50/50 border-indigo-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-indigo-900">
                  {selectedIds.length} staff selected
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Bulk Set Role...</option>
                  {STAFF_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>

                <select
                  value={bulkActive}
                  onChange={(e) => setBulkActive(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Bulk Set Status...</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                <Button variant="primary" size="sm" onClick={handleBulkUpdate}>
                  Apply Actions
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Directory Grid */}
          <Card className="overflow-hidden shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <Checkbox
                        id="select-all-staff"
                        checked={selectedIds.length === staffList.length && staffList.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="p-4 font-semibold">Staff Identity</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Compensation Base</th>
                    <th className="p-4 font-semibold text-center">Efficiency Score</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {staffList.map((staff: any) => {
                    const isSelected = selectedIds.includes(staff.id);
                    const isActiveRow = activeStaffId === staff.id;
                    return (
                      <tr
                        key={staff.id}
                        onClick={() => setActiveStaffId(staff.id)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition ${isActiveRow ? 'bg-indigo-50/30 font-medium border-l-4 border-l-indigo-600' : ''}`}
                      >
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            id={`select-staff-${staff.id}`}
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(staff.id, e.target.checked)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="text-slate-900 font-semibold">{staff.firstName} {staff.lastName}</div>
                            <div className="text-slate-400 text-xs mt-0.5">{staff.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <Badge variant="indigo" className="text-xs uppercase">
                              {staff.role.replace('_', ' ')}
                            </Badge>
                            {staff.assignedCategory && (
                              <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                {staff.assignedCategory}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 font-mono">
                          ${staff.salary ? parseFloat(staff.salary).toLocaleString() : '0'} /mo
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            ★ {staff.performanceScore || '5.0'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-bold ${
                              staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {staff.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {staffList.length === 0 && (
              <div className="p-10 text-center text-slate-500">No organizational staff records returned from service registry.</div>
            )}
          </Card>
        </div>

        {/* Right Side: Double Panel Detail Editor */}
        <div className="lg:col-span-1">
          {activeStaff ? (
            <div className="space-y-6">
              
              {/* Profile details & Assignment panel */}
              <Card className="p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Configure Staff Profile</h3>
                  <Badge variant={editIsActive ? 'success' : 'error'}>
                    {editIsActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                    <div className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded border border-slate-200">
                      {activeStaff.firstName} {activeStaff.lastName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Staff Role</label>
                    <Select
                      id="edit-staff-role"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      options={STAFF_ROLES}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category Station Filter</label>
                    <Select
                      id="edit-staff-category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      options={[{ value: '', label: 'None (Unassigned)' }, ...CATEGORIES]}
                      className="w-full"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Limits kitchen queues and display monitor view to specified category foods.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-700 font-medium">Activate Profile Status</span>
                    <button
                      onClick={() => setEditIsActive(!editIsActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editIsActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Attendance Ledger Panel */}
              <Card className="p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">Attendance Shift Logs</h3>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {editAttendance} shifts logged
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditAttendance(Math.max(0, editAttendance - 1))}
                    >
                      - Deduct Shift
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditAttendance(editAttendance + 1)}
                    >
                      + Record Present
                    </Button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Manual Shift Count Override</label>
                    <Input
                      id="edit-staff-attendance"
                      type="number"
                      value={editAttendance}
                      onChange={(e) => setEditAttendance(parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="font-semibold text-slate-700">June 2026 Virtual Shift Sheet:</div>
                    <div className="grid grid-cols-7 gap-1 text-center mt-2">
                      {Array.from({ length: 14 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`p-1 rounded text-[10px] font-bold ${
                            idx < editAttendance ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          D{idx + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Salary & Payroll Editor */}
              <Card className="p-5 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Compensation Matrix & Payout</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monthly Base Salary ($)</label>
                    <Input
                      id="edit-staff-salary"
                      type="number"
                      value={editSalary}
                      onChange={(e) => setEditSalary(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase">Performance Rating (1.0 - 5.0)</label>
                      <span className="text-xs font-bold text-amber-600 font-mono">{editPerformance} Stars</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={editPerformance}
                      onChange={(e) => setEditPerformance(parseFloat(e.target.value) || 5.0)}
                      className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Calculated Breakdown Grid */}
                  <div className="bg-slate-900 text-white rounded-lg p-4 font-mono text-xs space-y-2 mt-4 shadow-inner">
                    <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 uppercase tracking-wider">Estimated Payout Slip</div>
                    <div className="flex justify-between">
                      <span>Base Contract Salary:</span>
                      <span>${baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-amber-400">
                      <span>Performance Bonus:</span>
                      <span>+${ratingBonus.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-emerald-400">
                      <span>Gross Estimated Payout:</span>
                      <span>${totalPayout.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="primary" className="w-full" onClick={handleSaveProfile}>
                    Commit & Sync Changes
                  </Button>
                </div>
              </Card>

            </div>
          ) : (
            <Card className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[350px]">
              <span className="text-4xl">📇</span>
              <h3 className="text-base font-bold text-slate-700 mt-3">Select Staff Member</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Click on any staff record in the directory to audit attendance ledgers, configure bonuses, and alter active categories.
              </p>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
