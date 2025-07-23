const diseaseDescriptions: Record<string, string> = {
  diabetes:
    "Diabetes is a chronic (long-lasting) health condition that affects how your body turns food into energy.",
  heart:
    "Heart disease describes a range of conditions that affect your heart, including blood vessel diseases, heart rhythm problems, and more.",
  lung: "Lung disease refers to disorders that affect the lungs, making it hard to breathe.",
  parkinsons:
    "Parkinson's disease is a progressive nervous system disorder that affects movement.",
  liver:
    "Liver disease can be inherited (genetic) or caused by a variety of factors that damage the liver.",
};

export default function DiseaseInfo({ disease }: { disease: string }) {
  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold text-emerald-700 mb-4 capitalize">
        {disease} Information
      </h2>
      <p className="text-gray-700 mb-4">
        {diseaseDescriptions[disease] ||
          "Information about this disease will be available soon."}
      </p>
      <div className="text-gray-500">
        More details, prevention tips, and resources will be added here.
      </div>
    </div>
  );
}
