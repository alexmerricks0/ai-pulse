import { useState } from 'react';
import useSWR from 'swr';
import { fetchToday, fetchByDate, fetchHistory } from './api';
import type { DailyBriefing } from './api';
import { Header } from './components/Header';
import { Headline } from './components/Headline';
import { StoryCard } from './components/StoryCard';
import { PapersSection } from './components/PapersSection';
import { ReleasesSection } from './components/ReleasesSection';
import { Archive } from './components/Archive';
import { About } from './components/About';
import { Footer } from './components/Footer';

export type View = 'today' | 'archive' | 'about';

function App() {
  const [view, setView] = useState<View>('today');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const {
    data: todayData,
    error: todayError,
    isLoading: todayLoading,
  } = useSWR(
    view === 'today' && !selectedDate ? 'today' : null,
    fetchToday,
    { refreshInterval: 300000 },
  );

  const {
    data: dateData,
    error: dateError,
    isLoading: dateLoading,
  } = useSWR(
    selectedDate ? ['date', selectedDate] : null,
    () => fetchByDate(selectedDate!),
  );

  const {
    data: historyData,
    error: historyError,
    isLoading: historyLoading,
  } = useSWR(
    view === 'archive' ? 'history' : null,
    () => fetchHistory(30),
  );

  const activeData: DailyBriefing | undefined = selectedDate ? dateData : todayData;
  const isLoading = selectedDate ? dateLoading : todayLoading;
  const hasError = selectedDate ? dateError : todayError;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setView('today');
  };

  const handleNavClick = (newView: View) => {
    if (newView === 'today') {
      setSelectedDate(null);
    }
    setView(newView);
  };

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      <Header currentView={view} onNavigate={handleNavClick} selectedDate={selectedDate} />

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {view === 'about' && <About />}

        {view === 'archive' && (
          <Archive
            data={historyData?.data || []}
            loading={historyLoading}
            error={historyError}
            onDateSelect={handleDateSelect}
          />
        )}

        {view === 'today' && hasError && (
          <div className="text-center py-20">
            <h2 className="text-xl font-display font-bold text-red-400 mb-2">
              Connection Error
            </h2>
            <p className="text-text-secondary">Unable to fetch briefing data.</p>
          </div>
        )}

        {view === 'today' && !hasError && (
          <>
            <Headline
              headline={activeData?.briefing.headline}
              date={activeData?.date}
              trend={activeData?.briefing.trend}
              loading={isLoading}
            />

            <StoryCard
              stories={activeData?.briefing.stories || []}
              loading={isLoading}
            />

            <PapersSection
              papers={activeData?.briefing.papers || []}
              loading={isLoading}
            />

            <ReleasesSection
              releases={activeData?.briefing.releases || []}
              loading={isLoading}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
