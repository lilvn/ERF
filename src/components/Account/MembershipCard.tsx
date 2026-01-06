'use client';

interface MembershipCardProps {
  type: 'ceramics' | 'studio';
  isActive: boolean;
  expiryDate: string | null;
}

export function MembershipCard({ type, isActive, expiryDate }: MembershipCardProps) {
  const typeLabels = {
    ceramics: 'Ceramics Studio',
    studio: 'Studio Space',
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
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
        : 'bg-red-50 border-red-500'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-black">{typeLabels[type]}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isActive
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>
      
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="font-medium text-black">{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Valid Till:</span>
          <span className="font-medium text-black">{formatDate(expiryDate)}</span>
        </div>
      </div>
    </div>
  );
}

