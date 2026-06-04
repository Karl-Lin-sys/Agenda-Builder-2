import React from 'react';
import { AgendaResponse } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ArrowRight } from 'lucide-react';

interface AgendaViewProps {
  data: AgendaResponse;
}

export function AgendaView({ data }: AgendaViewProps) {
  // Calculate running times
  let currentTime = 0;
  const itemsWithTime = data.agendaItems
    .sort((a, b) => a.order - b.order)
    .map(item => {
      const start = currentTime;
      currentTime += item.durationMinutes;
      const end = currentTime;
      return { ...item, start, end };
    });

  const totalDuration = currentTime;

  const formatMinutes = (m: number) => {
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    if (hours > 0) return `+${hours}h ${mins}m`;
    return `+${mins}m`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* Header Area */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 tracking-tight uppercase">
          Generated Agenda
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">{data.title || 'Meeting Agenda'}</h1>
        <p className="text-lg text-neutral-500 leading-relaxed max-w-3xl">
          {data.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Timeline */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <h2 className="text-xl font-medium tracking-tight text-neutral-900">Timeline & Topics</h2>
            <span className="text-sm font-medium text-neutral-500 flex items-center">
              <Clock className="w-4 h-4 mr-1.5" /> Total: {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
            </span>
          </div>

          <div className="relative border-l border-neutral-200 ml-3 space-y-8 pb-4">
            {itemsWithTime.map((item, index) => (
              <div key={index} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-blue-500 ring-4 ring-white" />
                
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline justify-between mb-2">
                  <h3 className="text-base font-semibold text-neutral-900">{item.topic}</h3>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-500">
                    <span className="inline-flex w-16 tabular-nums">{formatMinutes(item.start)}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-300" />
                    <span className="inline-flex w-16 tabular-nums text-neutral-900">{formatMinutes(item.end)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <div className="flex items-center text-blue-600 font-medium">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {item.durationMinutes} min
                  </div>
                  {item.speakers && item.speakers.length > 0 && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1.5 opacity-60" />
                      {item.speakers.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Stakeholders & Meta */}
        <div className="space-y-6">
          <Card className="shadow-sm border-neutral-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg items-center flex gap-2">
                <Users className="w-5 h-5 text-neutral-400" />
                Stakeholders
              </CardTitle>
              <CardDescription>Required participants for this meeting.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.stakeholders.map((person, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1 font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200">
                    {person}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
