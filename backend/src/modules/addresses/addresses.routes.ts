import { Router } from 'express';
import { getAddresses, createAddress, updateAddress, deleteAddress } from './addresses.controller';
import { validate } from '../../middleware/validate';
import { createAddressSchema, updateAddressSchema } from './addresses.validation';
import { authGuard } from '../../middleware/authGuard';

const router = Router();

// All address routes require authentication
router.use(authGuard);

router.get('/', getAddresses);
router.post('/', validate(createAddressSchema), createAddress);
router.put('/:id', validate(updateAddressSchema), updateAddress);
router.delete('/:id', deleteAddress);

export default router;
