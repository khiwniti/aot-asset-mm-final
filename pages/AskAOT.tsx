import ChatInterface from '../components/ChatInterface';
import Header from '../components/Header';

const AskAOT = () => {
  return (
    <div className="flex flex-col h-screen bg-[#f8f9fc]">
      <Header 
        title="Ask AOT" 
        subtitle="Your AI assistant for real estate asset management and analytics." 
      />
      <main className="flex-1 overflow-hidden w-full p-6">
        <div className="w-full h-full overflow-hidden relative flex flex-col">
          <ChatInterface isFullPage={true} />
        </div>
      </main>
    </div>
  );
};

export default AskAOT;