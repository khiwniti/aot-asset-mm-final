import { useParams } from 'react-router-dom';
import Header from '../components/Header';

const PropertyDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen">
      <Header title="Property Details" subtitle={`Property #${id}`} />
      <div className="p-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700">Property Detail View</h2>
          <p className="text-gray-500 mt-2">Coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
