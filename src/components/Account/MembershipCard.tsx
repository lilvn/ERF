'use client';

interface MembershipCardProps {
  type: 'ceramics' | 'studio';
  status: 'active' | 'expired';
  expiryDate: string | null;
}

export function MembershipCard({ type, status, expiryDate }: MembershipCardProps) {
  const isActive = status === 'active';
  
  const typeLabels = {
    ceramics: 'Ceramics Studio',
    studio: 'Studio Space',
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Ongoing';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${
      isActive 
        ? 'bg-green-50 border-green-500' 
        : 'bg-gray-50 border-gray-300'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-black">{typeLabels[type]}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isActive
            ? 'bg-green-500 text-white'
            : 'bg-gray-400 text-white'
        }`}>
          {isActive ? 'ACTIVE' : 'EXPIRED'}
        </span>
      </div>
      
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="font-medium text-black">{status.toUpperCase()}</span>
        </div>
        
        {expiryDate && (
          <div className="flex justify-between">
            <span className="text-gray-600">Expires:</span>
            <span className="font-medium text-black">{formatDate(expiryDate)}</span>
          </div>
        )}
        
        {!expiryDate && isActive && (
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-black">Recurring</span>
          </div>
        )}
      </div>
    </div>
  );
}

