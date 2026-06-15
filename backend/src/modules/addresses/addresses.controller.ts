import { Response } from 'express';

import { AuthRequest } from '../../types/express';

import { AddressService } from './addresses.service';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const addresses = await AddressService.getAddresses(userId);

  res.status(200).json({
    success: true,
    data: addresses,
  });
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const address = await AddressService.createAddress(userId, req.body);

  res.status(201).json({
    success: true,
    data: address,
  });
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const addressId = req.params.id;
  const address = await AddressService.updateAddress(userId, addressId, req.body);

  res.status(200).json({
    success: true,
    data: address,
  });
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const addressId = req.params.id;

  await AddressService.deleteAddress(userId, addressId);

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
  });
};
