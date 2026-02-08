import { type BankProcessor } from '../models/bank-processor.js';
import { type components } from '../models/enablebanking-openapi.js';
import { type Transaction } from '../models/enablebanking.js';

export class FallbackBankProcessor implements BankProcessor {
  debug = true;
  name = 'FallbackBankProcessor';
  normalizeTransaction(t: components['schemas']['Transaction']): Transaction {
    const isDebtor = t.credit_debit_indicator === 'DBIT';

    const payeeObject = isDebtor ? t.creditor : t.debtor;

    const payeeName = payeeObject && payeeObject.name ? payeeObject.name : '';
    const amount = t.transaction_amount?.amount
      ? parseFloat(t.transaction_amount.amount) * (isDebtor ? -1 : 1)
      : 0;

    return {
      ...t,
      payeeObject,
      amount,
      // Add camelCase transactionAmount for compatibility with sync.ts
      transactionAmount: {
        amount,
        currency: t.transaction_amount?.currency ?? 'EUR',
      },
      payeeName,
      notes: t.remittance_information ? t.remittance_information.join('') : '',
      date: t.transaction_date ?? t.booking_date ?? t.value_date ?? '',
    };
  }
}
