interface ResultsPageProps {
  params: { id: string };
}

export default function ResultsPage({ params }: ResultsPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Results Page</h1>
      <p className="text-gray-600">
        Analysis ID: <span className="font-mono">{params.id}</span>
      </p>
      <p className="mt-4 text-lg text-gray-500">Work in progress 🚧</p>
    </div>
  );
}