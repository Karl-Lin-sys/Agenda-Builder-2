/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UploadPanel } from './components/UploadPanel';
import { AgendaView } from './components/AgendaView';
import { AgendaResponse } from './types';

export default function App() {
  const [agendaData, setAgendaData] = useState<AgendaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAgendaData(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('/api/agenda', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate agenda');
      }

      const data: AgendaResponse = await response.json();
      setAgendaData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-neutral-50 overflow-hidden text-neutral-900 font-sans">
      {/* Left Panel: Upload */}
      <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-white shadow-sm z-10 flex flex-col h-full overflow-y-auto">
        <UploadPanel onUpload={handleUpload} isLoading={isLoading} error={error} />
      </div>

      {/* Main Content: Agenda Details */}
      <div className="flex-1 h-full overflow-y-auto bg-neutral-50 p-8">
        <div className="max-w-4xl mx-auto">
          {agendaData ? (
            <AgendaView data={agendaData} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-neutral-400">
              <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-300"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <line x1="10" x2="8" y1="9" y2="9" />
                </svg>
              </div>
              <p className="text-lg font-medium text-neutral-500 mb-1">No document uploaded</p>
              <p className="text-sm">Upload a document to generate your meeting agenda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
