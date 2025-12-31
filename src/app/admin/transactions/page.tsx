export default function AdminTransactionsPage() {
  return (
    <div className="p-10 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-serif text-[#1F4D3E] mb-4">
        Transactions
      </h1>

      <p className="text-gray-500 max-w-xl leading-relaxed">
        The transactions module has been temporarily disabled while the
        admin system is being simplified and stabilised.
      </p>

      <div className="mt-8 p-6 rounded-2xl border border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          This area will later support:
        </p>
        <ul className="mt-3 text-sm text-gray-500 list-disc list-inside space-y-1">
          <li>Payments and billing history</li>
          <li>Vendor invoices</li>
          <li>Revenue intelligence</li>
          <li>Exports and reports</li>
        </ul>
      </div>
    </div>
  );
}
