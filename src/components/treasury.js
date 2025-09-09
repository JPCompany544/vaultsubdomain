// src/components/treasury.js
export const treasuryAbi = [
  { type: 'function', name: 'approvedAmount', stateMutability: 'view', inputs: [
      { name: 'token', type: 'address' },
      { name: 'owner', type: 'address' }
    ], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'pullMyApproved', stateMutability: 'nonpayable', inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ], outputs: [] },
  { type: 'function', name: 'pullMyMax', stateMutability: 'nonpayable', inputs: [
      { name: 'token', type: 'address' }
    ], outputs: [] }
];


