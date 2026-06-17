import { Router } from 'express';

import { authGuard } from '../../middleware/authGuard';
import { validate } from '../../middleware/validate';

import { getAddresses, createAddress, updateAddress, deleteAddress } from './addresses.controller';
import {
  createAddressBodySchema,
  updateAddressBodySchema,
  addressIdParamSchema,
} from './addresses.validation';

const router = Router();

// All address routes require authentication
router.use(authGuard);

router.get('/', getAddresses);
router.post('/', validate({ body: createAddressBodySchema }), createAddress);
router.put(
  '/:id',
  validate({ params: addressIdParamSchema, body: updateAddressBodySchema }),
  updateAddress,
);
router.delete('/:id', deleteAddress);

export default router;
