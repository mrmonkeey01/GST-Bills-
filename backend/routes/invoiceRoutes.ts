import { Router } from 'express';
import { getInvoices, createInvoice, getInvoiceById, updateInvoice, deleteInvoice } from '../controllers/invoiceController';

const router = Router();

router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
