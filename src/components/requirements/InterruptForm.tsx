"use client";

interface InterruptFormProps {
  projectId: string;
  question: string;
  inputCount: number;
  onSubmit: (responses: string) => void;
}

export default function InterruptForm({ projectId, question, inputCount, onSubmit }: InterruptFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const responses = Array.from({ length: inputCount }).map((_, index) => formData.get(`brief_description${index}`) as string);
    const responsesJson = JSON.stringify({
      project_id: projectId,
      brief_descriptions: responses,
    });
    console.log("Submitting responses:", responsesJson);
    onSubmit(responsesJson);
  };

  return (
    <div className="p-4 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        {question}
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {Array.from({ length: inputCount }).map((_, index) => (
          <div key={index}>
            <input
              type="text"
              name={`brief_description${index}`}
              placeholder={`Enter brief description ${index + 1}`}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
          </div>
        ))}
        <button
          type="submit"
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
