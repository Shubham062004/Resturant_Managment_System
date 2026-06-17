import { MapPin, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../app/store';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from '../store/cartQueries';

const emptyForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  isDefault: false,
};

export const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: addresses = [], isLoading } = useAddresses(isAuthenticated);
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  if (!isAuthenticated) {
    navigate('/login', { state: { from: { pathname: '/addresses' } } });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddress.mutateAsync(form);
      toast.success('Address saved');
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await updateAddress.mutateAsync({ id, isDefault: true });
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update address');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress.mutateAsync(id);
      toast.success('Address removed');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  return (
    <>
      <SEO title="My Addresses" description="Manage delivery addresses." />
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <MapPin className="text-primary" size={22} />
            Saved Addresses
          </h1>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Address'}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="glass-card p-6 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Input
              label="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <Input
              label="Address line 1"
              className="sm:col-span-2"
              value={form.addressLine1}
              onChange={(e) =>
                setForm({ ...form, addressLine1: e.target.value })
              }
              required
            />
            <Input
              label="Address line 2"
              className="sm:col-span-2"
              value={form.addressLine2}
              onChange={(e) =>
                setForm({ ...form, addressLine2: e.target.value })
              }
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <Input
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
            />
            <Input
              label="Postal code"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              required
            />
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({ ...form, isDefault: e.target.checked })
                }
              />
              Set as default address
            </label>
            <Button
              type="submit"
              variant="primary"
              isLoading={createAddress.isPending}
            >
              Save Address
            </Button>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <ul className="space-y-4">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="glass-card p-4 rounded-xl border border-white/5 flex justify-between gap-4"
              >
                <div className="text-sm">
                  <p className="font-semibold text-white">
                    {addr.fullName}
                    {addr.isDefault && (
                      <span className="ml-2 text-xs text-primary">
                        (Default)
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                    <br />
                    {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                  </p>
                  <p className="text-muted-foreground">{addr.phone}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {!addr.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      Make default
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg self-end"
                    aria-label="Delete address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default AddressesPage;
