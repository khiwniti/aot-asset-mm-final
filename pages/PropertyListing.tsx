import Header from '../components/Header';

const PropertyListing = () => {
  return (
    <div className="min-h-screen">
      <Header title="Properties" subtitle="Manage your property portfolio" />
      <div className="p-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700">Property Listing</h2>
          <p className="text-gray-500 mt-2">Coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyListing;
