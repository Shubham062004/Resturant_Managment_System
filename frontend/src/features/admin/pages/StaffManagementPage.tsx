import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Alert } from '../../../shared/components/ui/Alert';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Checkbox } from '../../../shared/components/ui/Checkbox';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import {
  fetchAllStaff,
  updateStaffProfile,
  bulkUpdateStaff,
} from '../store/staffSlice';

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
  const [alertMsg, setAlertMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchAllStaff());
  }, [dispatch]);

  // Sync edit form fields when active staff changes
  useEffect(() => {
    if (activeStaff) {
      setEditSalary(activeStaff.salary ? activeStaff.salary.toString() : '0');
      setEditAttendance(activeStaff.attendanceCount || 0);
      setEditPerformance(
        activeStaff.performanceScore !== undefined
          ? activeStaff.performanceScore
          : 5.0
      );
      setEditCategory(activeStaff.assignedCategory || '');
      setEditRole(activeStaff.role || '');
      setEditIsActive(
        activeStaff.isActive !== undefined ? activeStaff.isActive : true
      );
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
      setAlertMsg({
        type: 'success',
        text: 'Staff profile updated successfully.',
      });
      dispatch(fetchAllStaff());
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.message || 'Failed to update staff profile',
      });
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    try {
      const data: any = {};
      if (bulkRole) data.role = bulkRole;
      if (bulkActive !== '') data.isActive = bulkActive === 'true';

      await dispatch(bulkUpdateStaff({ ids: selectedIds, data })).unwrap();
      setAlertMsg({
        type: 'success',
        text: `Successfully updated ${selectedIds.length} staff members.`,
      });
      setSelectedIds([]);
      setBulkRole('');
      setBulkActive('');
      dispatch(fetchAllStaff());
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.message || 'Failed to perform bulk update',
      });
    }
  };

  // Helper bonus calculator: ₹150 bonus per performance point above 3.5
  const calculateBonus = (perf: number) => {
    if (perf <= 3.5) return 0;
    return Math.round((perf - 3.5) * 150);
  };

  const baseSalary = parseFloat(editSalary) || 0;
  const ratingBonus = calculateBonus(editPerformance);
  const totalPayout = baseSalary + ratingBonus;

  const headcount = staffList.length;
  const totalPayroll = staffList.reduce(
    (sum: number, s: any) => sum + (parseFloat(s.salary) || 0),
    0
  );
  const avgPerformance =
    staffList.length > 0
      ? (
          staffList.reduce(
            (sum: number, s: any) => sum + (s.performanceScore || 5.0),
            0
          ) / staffList.length
        ).toFixed(1)
      : '5.0';

  if (status === 'loading' && staffList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#0F172A] text-white">
        <div className="text-lg text-slate-400 animate-pulse">
          Loading staff directories...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 text-[#F8FAFC] bg-[#0F172A] min-h-screen font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Staff Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure compensation matrices, monitor shift logs, and manage
            organizational category roles.
          </p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-[#2563EB]/95 text-white shadow-lg">
          Add Staff Member
        </Button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 bg-[#111827] border-slate-800 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Headcount
          </p>
          <p className="text-3xl font-bold font-display mt-2 text-white">
            {headcount}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Registered operators
          </span>
        </Card>

        <Card className="p-6 bg-[#111827] border-slate-800 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Salary Overheads
          </p>
          <p className="text-3xl font-bold font-display mt-2 text-[#16A34A]">
            ₹{totalPayroll.toLocaleString()} /mo
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Est. gross monthly payroll
          </span>
        </Card>

        <Card className="p-6 bg-[#111827] border-slate-800 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Avg Efficiency Score
          </p>
          <p className="text-3xl font-bold font-display mt-2 text-[#F59E0B]">
            ★ {avgPerformance}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Performance rating average
          </span>
        </Card>
      </div>

      {alertMsg && (
        <div
          className={`p-4 mb-4 rounded-xl border flex justify-between items-center text-sm ${
            alertMsg.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-400'
              : 'bg-rose-950/20 border-rose-800/30 text-rose-400'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button
            onClick={() => setAlertMsg(null)}
            className="text-slate-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Multi-grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Directory Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bulk Update Controls Action Bar */}
          {selectedIds.length > 0 && (
            <Card className="p-4 bg-indigo-950/20 border border-[#2563EB]/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-indigo-400">
                  {selectedIds.length} staff selected
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-350 text-sm rounded-lg p-2 focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                >
                  <option value="">Bulk Set Role...</option>
                  {STAFF_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                <select
                  value={bulkActive}
                  onChange={(e) => setBulkActive(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-350 text-sm rounded-lg p-2 focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
                >
                  <option value="">Bulk Set Status...</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                <Button
                  className="bg-[#2563EB] hover:bg-[#2563EB]/95 text-white"
                  size="sm"
                  onClick={handleBulkUpdate}
                >
                  Apply Actions
                </Button>
                <Button
                  className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Directory Grid */}
          <Card className="overflow-hidden border border-slate-800 bg-[#111827] shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800/80 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <Checkbox
                        id="select-all-staff"
                        checked={
                          selectedIds.length === staffList.length &&
                          staffList.length > 0
                        }
                        onChange={(checked) => handleSelectAll(checked)}
                      />
                    </th>
                    <th className="p-4 font-semibold">Staff Identity</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Compensation Base</th>
                    <th className="p-4 font-semibold text-center">
                      Efficiency Score
                    </th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {staffList.map((staff: any) => {
                    const isSelected = selectedIds.includes(staff.id);
                    const isActiveRow = activeStaffId === staff.id;
                    return (
                      <tr
                        key={staff.id}
                        onClick={() => setActiveStaffId(staff.id)}
                        className={`hover:bg-slate-800/20 cursor-pointer transition ${isActiveRow ? 'bg-slate-900/60 font-medium border-l-4 border-l-[#2563EB]' : ''}`}
                      >
                        <td
                          className="p-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            id={`select-staff-${staff.id}`}
                            checked={isSelected}
                            onChange={(checked) =>
                              handleSelectOne(staff.id, checked)
                            }
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="text-white font-semibold">
                              {staff.firstName} {staff.lastName}
                            </div>
                            <div className="text-slate-500 text-xs mt-0.5">
                              {staff.email}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <Badge
                              variant="info"
                              className="text-xs uppercase bg-[#2563EB]/10 text-white border border-[#2563EB]/20"
                            >
                              {staff.role.replace('_', ' ')}
                            </Badge>
                            {staff.assignedCategory && (
                              <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block"></span>
                                {staff.assignedCategory}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 font-mono">
                          ₹
                          {staff.salary
                            ? parseFloat(staff.salary).toLocaleString()
                            : '0'}{' '}
                          /mo
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ★ {staff.performanceScore || '5.0'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-bold ${
                              staff.isActive
                                ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
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
              <div className="p-10 text-center text-slate-500">
                No organizational staff records returned from service registry.
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Double Panel Detail Editor */}
        <div className="lg:col-span-1">
          {activeStaff ? (
            <div className="space-y-6">
              {/* Profile details & Assignment panel */}
              <Card className="p-5 border border-slate-800 bg-[#111827] shadow-lg space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    Configure Staff Profile
                  </h3>
                  <Badge
                    variant={editIsActive ? 'success' : 'error'}
                    className={
                      editIsActive
                        ? 'bg-[#16A34A]/10 text-[#16A34A]'
                        : 'bg-red-500/10 text-red-400'
                    }
                  >
                    {editIsActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Full Name
                    </label>
                    <div className="text-slate-300 font-medium bg-slate-950 p-2.5 rounded border border-slate-800">
                      {activeStaff.firstName} {activeStaff.lastName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Current Staff Role
                    </label>
                    <select
                      id="edit-staff-role"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      {STAFF_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Category Station Filter
                    </label>
                    <select
                      id="edit-staff-category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="">None (Unassigned)</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Limits kitchen queues and display monitor view to
                      specified category foods.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-300 font-medium">
                      Activate Profile Status
                    </span>
                    <button
                      onClick={() => setEditIsActive(!editIsActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editIsActive ? 'bg-[#2563EB]' : 'bg-slate-800'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsActive ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Attendance Ledger Panel */}
              <Card className="p-5 border border-slate-800 bg-[#111827] shadow-lg space-y-4 text-white">
                <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                  <h3 className="text-base font-bold text-white">
                    Attendance Shift Logs
                  </h3>
                  <span className="text-xs font-mono font-bold bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
                    {editAttendance} shifts logged
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800"
                      onClick={() =>
                        setEditAttendance(Math.max(0, editAttendance - 1))
                      }
                    >
                      - Deduct Shift
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800"
                      onClick={() => setEditAttendance(editAttendance + 1)}
                    >
                      + Record Present
                    </Button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Manual Shift Count Override
                    </label>
                    <Input
                      id="edit-staff-attendance"
                      type="number"
                      value={editAttendance}
                      onChange={(e) =>
                        setEditAttendance(parseInt(e.target.value) || 0)
                      }
                      className="w-full bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xs text-slate-500 space-y-1">
                    <div className="font-semibold text-slate-450">
                      June 2026 Virtual Shift Sheet:
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mt-2">
                      {Array.from({ length: 14 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`p-1 rounded text-[10px] font-bold ${
                            idx < editAttendance
                              ? 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/20'
                              : 'bg-slate-900 text-slate-650 border border-slate-800/40'
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
              <Card className="p-5 border border-slate-800 bg-[#111827] shadow-lg space-y-4 text-white">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                  Compensation Matrix & Payout
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Monthly Base Salary (₹)
                    </label>
                    <Input
                      id="edit-staff-salary"
                      type="number"
                      value={editSalary}
                      onChange={(e) => setEditSalary(e.target.value)}
                      className="w-full bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">
                        Performance Rating (1.0 - 5.0)
                      </label>
                      <span className="text-xs font-bold text-amber-500 font-mono">
                        {editPerformance} Stars
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={editPerformance}
                      onChange={(e) =>
                        setEditPerformance(parseFloat(e.target.value) || 5.0)
                      }
                      className="w-full accent-amber-500 h-2 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Calculated Breakdown Grid */}
                  <div className="bg-slate-950 text-white rounded-lg p-4 font-mono text-xs space-y-2 mt-4 border border-slate-850 shadow-inner">
                    <div className="text-slate-400 font-bold border-b border-slate-850 pb-1 uppercase tracking-wider">
                      Estimated Payout Slip
                    </div>
                    <div className="flex justify-between">
                      <span>Base Contract Salary:</span>
                      <span>₹{baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-amber-500">
                      <span>Performance Bonus:</span>
                      <span>+₹{ratingBonus.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-850 pt-2 flex justify-between font-bold text-sm text-[#16A34A]">
                      <span>Gross Estimated Payout:</span>
                      <span>₹{totalPayout.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold"
                    onClick={handleSaveProfile}
                  >
                    Commit & Sync Changes
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-800 bg-[#111827] flex flex-col items-center justify-center min-h-[350px]">
              <span className="text-4xl">📇</span>
              <h3 className="text-base font-bold text-slate-400 mt-3">
                Select Staff Member
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Click on any staff record in the directory to audit attendance
                ledgers, configure bonuses, and alter active categories.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
